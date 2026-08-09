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

interface LocationState {
  district: string | null;
  state: string | null;
  loading: boolean;
  lastUpdatedAt: number | null;

  /** Detects via GPS + reverse geocoding, respecting the 24h cache. Returns whether a location is now set. */
  detect: () => Promise<boolean>;
  setManually: (district: string, state: string) => Promise<void>;
  clear: () => void;
}

async function requestPermission(): Promise<boolean> {
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
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  return new Promise(resolve => {
    Geolocation.requestAuthorization(
      () => resolve(true),
      () => resolve(false),
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
          return true;
        }

        set({ loading: true });
        try {
          const allowed = await requestPermission();
          if (!allowed) {
            set({ loading: false });
            return false;
          }
          const coords = await getCurrentCoords();
          const geo = await reverseGeocode(coords.latitude, coords.longitude);
          if (!geo) {
            set({ loading: false });
            return false;
          }
          set({ district: geo.district, state: geo.state, lastUpdatedAt: Date.now(), loading: false });
          // Keep the server-side profile in sync for logged-in customers,
          // matching the web app's updateProfileWithLocation(). Best-effort.
          if (useAuthStore.getState().accessToken) {
            authService.update({ district: geo.district, state: geo.state }).catch(() => {});
          }
          return true;
        } catch {
          set({ loading: false });
          return false;
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
