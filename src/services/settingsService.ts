import { httpClient } from './httpClient';
import type { ApiSettings } from '@ctypes/api';

const DEFAULTS: ApiSettings = { convenience_fee_per_ticket: 15, gst_percentage: 18 };

/** Falls back to the server's own defaults if the endpoint is unreachable — never blocks checkout. */
export async function getSettings(): Promise<ApiSettings> {
  try {
    return await httpClient.get<ApiSettings>('/api/settings', { skipAuth: true });
  } catch {
    return DEFAULTS;
  }
}
