import { Env } from '@constants/env';
import type { ApiError } from '@ctypes/api';

/**
 * Thin fetch wrapper for cinema-hall-api. Auth token access/refresh is
 * injected rather than imported directly from the auth store, so this file
 * has no dependency on Zustand or AsyncStorage — `authStore.ts` wires itself
 * in once at module load via `configureHttpClientAuth`, avoiding an import
 * cycle (authStore needs httpClient to call the API; httpClient needs
 * authStore's tokens).
 */
interface AuthHandlers {
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  /** Performs the refresh call and updates the store; returns the new access token or null on failure. */
  refreshTokens: () => Promise<string | null>;
  /** Called when a refresh attempt fails — clears the session locally. */
  onSessionExpired: () => void;
}

let authHandlers: AuthHandlers | null = null;

export function configureHttpClientAuth(handlers: AuthHandlers): void {
  authHandlers = handlers;
}

const TIMEOUT_MS = 15000;

type QueryValue = string | number | boolean | undefined | null | Array<string | number>;

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: unknown;
  query?: Record<string, QueryValue>;
  /** Skip attaching the Authorization header and skip the refresh-and-retry flow. */
  skipAuth?: boolean;
  /** @internal set on the retried request to stop infinite refresh loops */
  _isRetry?: boolean;
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const base = path.startsWith('http') ? path : `${Env.API_BASE_URL}${path}`;
  const url = new URL(base);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) continue;
      if (Array.isArray(value)) {
        value.forEach(v => url.searchParams.append(key, String(v)));
      } else {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

/**
 * Normalizes the API's four error envelopes — {error}, {message},
 * {success:false,message}, {success:false,error} — plus coded variants
 * (ACCOUNT_LOCKED, OTP_EXPIRED, ...) into one shape callers can rely on.
 */
function normalizeError(status: number, body: any): ApiError {
  const message =
    (body && (body.error ?? body.message)) ??
    (typeof body === 'string' && body ? body : null) ??
    'Something went wrong. Please try again.';
  return {
    status,
    message,
    code: body?.code,
    lockedUntil: body?.lockedUntil,
    hint: body?.hint,
    results: body?.results,
    raw: body,
  };
}

async function parseBody(response: Response): Promise<any> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// Single-flight refresh: concurrent 401/403s all await the same promise
// instead of each firing their own refresh call.
let refreshInFlight: Promise<string | null> | null = null;

async function attemptRefresh(): Promise<string | null> {
  if (!authHandlers) return null;
  if (!refreshInFlight) {
    refreshInFlight = authHandlers
      .refreshTokens()
      .catch(() => null)
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, query, skipAuth, _isRetry } = options;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (!skipAuth) {
    const token = authHandlers?.getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeout);
    const isAbort = err instanceof Error && err.name === 'AbortError';
    throw normalizeError(0, {
      message: isAbort
        ? 'Request timed out. Check your connection and try again.'
        : 'Network error. Please check your connection and that the API server is reachable.',
    });
  }
  clearTimeout(timeout);

  const responseBody = await parseBody(response);

  if (response.ok) {
    return responseBody as T;
  }

  // The API returns 403 for an *expired/invalid* token and 401 only for a
  // *missing* one — refreshing on 401 alone would silently drop sessions
  // after the 24h access-token lifetime. Retry the original request once
  // after a successful refresh.
  const canRetry =
    (response.status === 401 || response.status === 403) &&
    !skipAuth &&
    !_isRetry &&
    !!authHandlers?.getRefreshToken();

  if (canRetry) {
    const newToken = await attemptRefresh();
    if (newToken) {
      return request<T>(path, { ...options, _isRetry: true });
    }
    authHandlers?.onSessionExpired();
  }

  throw normalizeError(response.status, responseBody);
}

export const httpClient = {
  get: <T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'POST', body }),
  put: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'PATCH', body }),
  del: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'DELETE', body }),
};

export function isApiError(err: unknown): err is ApiError {
  return typeof err === 'object' && err !== null && 'status' in err && 'message' in err;
}

/** Friendly message extraction for toasts/alerts — falls back for non-ApiError throwables. */
export function errorMessage(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (isApiError(err)) return err.message;
  if (err instanceof Error) return err.message;
  return fallback;
}

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

/**
 * Movie posters/backdrops/cast photos may arrive as either a full URL or a
 * bare TMDB path (e.g. "/abc123.jpg"). The web app proxies these through
 * `/api/movies/proxy-image` to dodge a CORS issue that doesn't apply to a
 * native client, so we resolve straight to TMDB's CDN here.
 */
export function resolveImageUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${TMDB_IMAGE_BASE}${path.startsWith('/') ? path : `/${path}`}`;
}
