import RNConfig from 'react-native-config';

/**
 * Typed, validated wrapper around react-native-config. Every value comes
 * from .env / .env.staging / .env.production (see .env.example) — nothing
 * here is hardcoded per-environment. Throws loudly on boot if a required
 * key is missing, rather than letting `undefined` silently reach fetch().
 */
function required(key: string): string {
  const value = RNConfig[key];
  if (!value) {
    throw new Error(
      `[env] Missing required config key "${key}". Did you create a .env file from .env.example?`,
    );
  }
  return value;
}

function bool(key: string, fallback: boolean): boolean {
  const value = RNConfig[key];
  if (value === undefined) return fallback;
  return value === 'true' || value === '1';
}

export const Env = {
  API_BASE_URL: required('API_BASE_URL').replace(/\/+$/, ''),
  GOOGLE_WEB_CLIENT_ID: RNConfig.GOOGLE_WEB_CLIENT_ID ?? '',
  GOOGLE_IOS_CLIENT_ID: RNConfig.GOOGLE_IOS_CLIENT_ID ?? '',
  ENABLE_CLEARTEXT: bool('ENABLE_CLEARTEXT', true),
  // Falls back to the mock services when no backend is configured/reachable,
  // so UI work can continue without cinema-hall-api running.
  USE_MOCKS: bool('USE_MOCKS', false),
} as const;
