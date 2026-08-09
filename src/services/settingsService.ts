import { httpClient } from './httpClient';
import { cachedFetch, getCached, CacheTTL } from './queryCache';
import type { ApiSettings } from '@ctypes/api';

const DEFAULTS: ApiSettings = { convenience_fee_per_ticket: 15, gst_percentage: 18 };
const SETTINGS_KEY = 'settings';

/** Falls back to the server's own defaults if the endpoint is unreachable — never blocks checkout. */
export async function getSettings(): Promise<ApiSettings> {
  try {
    const { cached, promise } = cachedFetch(
      SETTINGS_KEY,
      () => httpClient.get<ApiSettings>('/api/settings', { skipAuth: true }),
      CacheTTL.settings,
    );
    if (cached) {
      promise.catch(() => {});
      return cached;
    }
    return await promise;
  } catch {
    return DEFAULTS;
  }
}

/** Synchronous cache peek — lets CheckoutScreen seed its price rows without waiting. */
export function getCachedSettings(): ApiSettings | undefined {
  return getCached<ApiSettings>(SETTINGS_KEY, CacheTTL.settings);
}
