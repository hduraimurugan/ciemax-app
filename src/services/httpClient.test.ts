import { httpClient, configureHttpClientAuth, isApiError } from './httpClient';

function jsonResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: () => Promise.resolve(JSON.stringify(body)),
  } as unknown as Response;
}

describe('httpClient', () => {
  let fetchMock: jest.Mock;

  beforeEach(() => {
    fetchMock = jest.fn();
    // @ts-expect-error test double
    global.fetch = fetchMock;
    configureHttpClientAuth({
      getAccessToken: () => 'access-token',
      getRefreshToken: () => 'refresh-token',
      refreshTokens: jest.fn().mockResolvedValue('new-access-token'),
      onSessionExpired: jest.fn(),
    });
  });

  describe('error normalization', () => {
    it('extracts message from {error} envelope', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse(400, { error: 'Bad request' }));
      await expect(httpClient.get('/x', { skipAuth: true })).rejects.toMatchObject({
        status: 400,
        message: 'Bad request',
      });
    });

    it('extracts message from {message} envelope', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse(401, { message: 'Access token missing' }));
      await expect(httpClient.get('/x', { skipAuth: true })).rejects.toMatchObject({
        status: 401,
        message: 'Access token missing',
      });
    });

    it('extracts message from {success:false, message} envelope', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse(500, { success: false, message: 'Internal error' }));
      await expect(httpClient.get('/x', { skipAuth: true })).rejects.toMatchObject({
        status: 500,
        message: 'Internal error',
      });
    });

    it('extracts message from {success:false, error} envelope', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse(409, { success: false, error: 'Conflict' }));
      await expect(httpClient.get('/x', { skipAuth: true })).rejects.toMatchObject({
        status: 409,
        message: 'Conflict',
      });
    });

    it('preserves coded variants (ACCOUNT_LOCKED, results[], hint, lockedUntil)', async () => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse(423, {
          code: 'ACCOUNT_LOCKED',
          error: 'Account locked',
          lockedUntil: '2026-01-01T00:00:00Z',
          hint: '2 attempts remaining',
        }),
      );
      try {
        await httpClient.get('/x', { skipAuth: true });
        fail('expected rejection');
      } catch (err) {
        expect(isApiError(err)).toBe(true);
        if (isApiError(err)) {
          expect(err.code).toBe('ACCOUNT_LOCKED');
          expect(err.lockedUntil).toBe('2026-01-01T00:00:00Z');
          expect(err.hint).toBe('2 attempts remaining');
        }
      }
    });

    it('preserves the 409 hold-conflict results array', async () => {
      const results = [{ seat_id: 'A1', status: 'unavailable' }];
      fetchMock.mockResolvedValueOnce(jsonResponse(409, { success: false, message: 'taken', results }));
      try {
        await httpClient.post('/x', {}, { skipAuth: true });
        fail('expected rejection');
      } catch (err) {
        expect(isApiError(err) && err.results).toEqual(results);
      }
    });

    it('falls back to a generic message when the body has none', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse(500, {}));
      await expect(httpClient.get('/x', { skipAuth: true })).rejects.toMatchObject({
        message: 'Something went wrong. Please try again.',
      });
    });
  });

  describe('refresh-and-retry', () => {
    it('refreshes and retries on 401 (missing/invalid token), not just 403', async () => {
      fetchMock
        .mockResolvedValueOnce(jsonResponse(401, { message: 'missing' }))
        .mockResolvedValueOnce(jsonResponse(200, { ok: true }));
      const result = await httpClient.get('/protected');
      expect(result).toEqual({ ok: true });
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('refreshes and retries on 403 (expired/invalid token) — the API uses 403 for this, not just 401', async () => {
      fetchMock
        .mockResolvedValueOnce(jsonResponse(403, { message: 'Invalid or expired customer access token' }))
        .mockResolvedValueOnce(jsonResponse(200, { ok: true }));
      const result = await httpClient.get('/protected');
      expect(result).toEqual({ ok: true });
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('does not attempt refresh for skipAuth requests', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse(401, { message: 'missing' }));
      await expect(httpClient.get('/public', { skipAuth: true })).rejects.toMatchObject({ status: 401 });
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('gives up and throws the original error if refresh itself fails', async () => {
      const onSessionExpired = jest.fn();
      configureHttpClientAuth({
        getAccessToken: () => 'access-token',
        getRefreshToken: () => 'refresh-token',
        refreshTokens: jest.fn().mockResolvedValue(null),
        onSessionExpired,
      });
      fetchMock.mockResolvedValueOnce(jsonResponse(403, { message: 'expired' }));
      await expect(httpClient.get('/protected')).rejects.toMatchObject({ status: 403 });
      expect(onSessionExpired).toHaveBeenCalled();
      expect(fetchMock).toHaveBeenCalledTimes(1); // no retry once refresh fails
    });

    it('does not retry more than once even if the retried request also 403s', async () => {
      fetchMock
        .mockResolvedValueOnce(jsonResponse(403, { message: 'expired' }))
        .mockResolvedValueOnce(jsonResponse(403, { message: 'still expired' }));
      await expect(httpClient.get('/protected')).rejects.toMatchObject({ status: 403 });
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('single-flights concurrent refreshes — two 401s in flight only trigger one refreshTokens() call', async () => {
      const refreshTokens = jest.fn().mockResolvedValue('new-token');
      configureHttpClientAuth({
        getAccessToken: () => 'access-token',
        getRefreshToken: () => 'refresh-token',
        refreshTokens,
        onSessionExpired: jest.fn(),
      });
      fetchMock
        .mockResolvedValueOnce(jsonResponse(401, {}))
        .mockResolvedValueOnce(jsonResponse(401, {}))
        .mockResolvedValueOnce(jsonResponse(200, { a: 1 }))
        .mockResolvedValueOnce(jsonResponse(200, { b: 2 }));

      await Promise.all([httpClient.get('/one'), httpClient.get('/two')]);
      expect(refreshTokens).toHaveBeenCalledTimes(1);
    });
  });

  describe('successful requests', () => {
    it('attaches the Authorization header from the configured access token', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse(200, { ok: true }));
      await httpClient.get('/x');
      const [, options] = fetchMock.mock.calls[0];
      expect(options.headers.Authorization).toBe('Bearer access-token');
    });

    it('omits the Authorization header for skipAuth requests', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse(200, { ok: true }));
      await httpClient.get('/x', { skipAuth: true });
      const [, options] = fetchMock.mock.calls[0];
      expect(options.headers.Authorization).toBeUndefined();
    });
  });
});
