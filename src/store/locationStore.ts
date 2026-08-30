import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, PermissionsAndroid } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { authService } from '@services/authService';
import { useAuthStore } from './authStore';

// Mirrors the web app's localStorage['user_location'] 24h cache — avoids
// re-requesting GPS/reverse-geocoding on every cold start.
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export type DetectFailureReason =
  | 'denied'
  | 'blocked'
  | 'services-off'
  | 'timeout'
  | 'geocode-failed'
  | 'error';

export type DetectResult = { ok: true } | { ok: false; reason: DetectFailureReason };

interface LocationState {
  district: string | null;
  state: string | null;
  loading: boolean;
  lastUpdatedAt: number | null;

  /** Detects via GPS + reverse geocoding, respecting the 24h cache. Reports success or why it failed. */
  detect: () => Promise<DetectResult>;
  setManually: (district: string, state: string) => Promise<void>;
  clear: () => void;
}

type PermissionResult = 'granted' | 'denied' | 'blocked';

async function requestPermission(): Promise<PermissionResult> {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location access',
        message: 'CineHall uses your location to show movies and showtimes playing near you.',
        buttonPositive: 'Allow',
        buttonNegative: 'Deny',
        buttonNeutral: 'Ask later',
      },
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) return 'granted';
    if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) return 'blocked';
    return 'denied';
  }
  return new Promise(resolve => {
    Geolocation.requestAuthorization(
      () => resolve('granted'),
      () => resolve('denied'),
    );
  });
}

function getCurrentCoords(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      pos => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      err => reject(err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  });
}

/** Same reverse-geocoding provider the web app uses — free, no API key. */
async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<{ district: string; state: string } | null> {
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}`,
    );
    const data = await res.json();
    if (!data?.principalSubdivision) return null;
    return {
      state: data.principalSubdivision,
      district: data.city || data.locality || data.principalSubdivision,
    };
  } catch {
    return null;
  }
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set, get) => ({
      district: null,
      state: null,
      loading: false,
      lastUpdatedAt: null,

      detect: async () => {
        const cached = get();
        if (
          cached.district &&
          cached.state &&
          cached.lastUpdatedAt &&
          Date.now() - cached.lastUpdatedAt < CACHE_TTL_MS
        ) {
          return { ok: true };
        }

        set({ loading: true });
        try {
          const permission = await requestPermission();
          if (permission !== 'granted') {
            set({ loading: false });
            return { ok: false, reason: permission === 'blocked' ? 'blocked' : 'denied' };
          }
          const coords = await getCurrentCoords().catch(err => {
            // Geolocation error codes: 1 = PERMISSION_DENIED, 2 = POSITION_UNAVAILABLE
            // (typically means device location/GPS services are off), 3 = TIMEOUT.
            throw err?.code === 2 ? 'services-off' : err?.code === 3 ? 'timeout' : 'error';
          });
          const geo = await reverseGeocode(coords.latitude, coords.longitude);
          if (!geo) {
            set({ loading: false });
            return { ok: false, reason: 'geocode-failed' };
          }
          set({ district: geo.district, state: geo.state, lastUpdatedAt: Date.now(), loading: false });
          // Keep the server-side profile in sync for logged-in customers,
          // matching the web app's updateProfileWithLocation(). Best-effort.
          if (useAuthStore.getState().accessToken) {
            authService.update({ district: geo.district, state: geo.state }).catch(() => {});
          }
          return { ok: true };
        } catch (err) {
          set({ loading: false });
          const reason: DetectFailureReason =
            err === 'services-off' || err === 'timeout' ? err : 'error';
          if (reason === 'error') console.warn('[locationStore] detect() failed', err);
          return { ok: false, reason };
        }
      },

      setManually: async (district, state) => {
        set({ district, state, lastUpdatedAt: Date.now() });
        if (useAuthStore.getState().accessToken) {
          try {
            await authService.update({ district, state });
          } catch {
            // Non-fatal — the local selection still applies.
          }
        }
      },

      clear: () => set({ district: null, state: null, lastUpdatedAt: null }),
    }),
    {
      name: 'cinehall-location',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        district: state.district,
        state: state.state,
        lastUpdatedAt: state.lastUpdatedAt,
      }),
    },
  ),
);
