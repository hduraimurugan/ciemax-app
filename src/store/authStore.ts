import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService, SignupPayload } from '@services/authService';
import { mapCustomer } from '@services/mappers';
import { configureHttpClientAuth, isApiError } from '@services/httpClient';
import { clearCache } from '@services/queryCache';
import type { User } from '@ctypes/models';
import type { ApiError } from '@ctypes/api';

export type AuthStatus = 'loading' | 'authed' | 'guest';

export interface AuthActionResult {
  success: boolean;
  error?: ApiError;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  customer: User | null;
  /**
   * 'loading' until the persisted token (if any) has been verified against
   * GET /me — RootNavigator shows Splash for this state so a stale/garbage
   * token doesn't flash the signed-in UI before falling back to guest.
   */
  status: AuthStatus;

  bootstrap: () => Promise<void>;
  login: (email: string, password: string) => Promise<AuthActionResult>;
  signup: (payload: SignupPayload) => Promise<AuthActionResult>;
  googleLogin: (idToken: string) => Promise<AuthActionResult>;
  logout: () => Promise<void>;
  refreshCustomer: () => Promise<void>;
  updateCustomer: (patch: Partial<User>) => void;
}

function asApiError(err: unknown): ApiError | undefined {
  return isApiError(err) ? err : undefined;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      customer: null,
      status: 'loading',

      bootstrap: async () => {
        const { accessToken } = get();
        if (!accessToken) {
          set({ status: 'guest' });
          return;
        }
        try {
          const { customer } = await authService.me();
          set({ customer: mapCustomer(customer), status: 'authed' });
        } catch {
          // Token invalid/expired and refresh (via httpClient) also failed.
          set({ accessToken: null, refreshToken: null, customer: null, status: 'guest' });
        }
      },

      login: async (email, password) => {
        try {
          const res = await authService.login(email, password);
          set({
            accessToken: res.accessToken,
            refreshToken: res.refreshToken,
            customer: mapCustomer(res.customer),
            status: 'authed',
          });
          return { success: true };
        } catch (err) {
          return { success: false, error: asApiError(err) };
        }
      },

      signup: async payload => {
        try {
          await authService.signup(payload);
          // Deliberately does not log in — signup requires OTP verification
          // first (matches the web flow); the screen calls login() after
          // verifyOtp() succeeds.
          return { success: true };
        } catch (err) {
          return { success: false, error: asApiError(err) };
        }
      },

      googleLogin: async idToken => {
        try {
          const res = await authService.googleLogin(idToken);
          set({
            accessToken: res.accessToken,
            refreshToken: res.refreshToken,
            customer: mapCustomer(res.customer),
            status: 'authed',
          });
          return { success: true };
        } catch (err) {
          return { success: false, error: asApiError(err) };
        }
      },

      logout: async () => {
        const { refreshToken } = get();
        set({ accessToken: null, refreshToken: null, customer: null, status: 'guest' });
        clearCache(); // don't let the next signed-in user see this user's cached bookings/offers
        try {
          await authService.logout(refreshToken);
        } catch {
          // Best-effort — the local session is already cleared either way.
        }
      },

      refreshCustomer: async () => {
        try {
          const { customer } = await authService.me();
          set({ customer: mapCustomer(customer) });
        } catch {
          // Ignore — the caller (e.g. pull-to-refresh) can retry.
        }
      },

      updateCustomer: patch =>
        set(state => ({
          customer: state.customer ? { ...state.customer, ...patch } : state.customer,
        })),
    }),
    {
      name: 'cinehall-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        customer: state.customer,
      }),
      onRehydrateStorage: () => state => {
        if (state) state.status = 'loading';
        // Verify the rehydrated token is still valid server-side. Deferred
        // to a microtask so `useAuthStore` (referenced below, defined by
        // the time this fires) is fully initialized first.
        Promise.resolve().then(() => useAuthStore.getState().bootstrap());
      },
    },
  ),
);

// Wires httpClient's refresh-and-retry flow into this store, once, at
// module load — see httpClient.ts's header comment for why this is
// injected rather than imported the other way around.
configureHttpClientAuth({
  getAccessToken: () => useAuthStore.getState().accessToken,
  getRefreshToken: () => useAuthStore.getState().refreshToken,
  refreshTokens: async () => {
    const { refreshToken } = useAuthStore.getState();
    if (!refreshToken) return null;
    try {
      const res = await authService.refresh(refreshToken);
      useAuthStore.setState({ accessToken: res.accessToken });
      return res.accessToken;
    } catch {
      return null;
    }
  },
  onSessionExpired: () => {
    useAuthStore.setState({
      accessToken: null,
      refreshToken: null,
      customer: null,
      status: 'guest',
    });
    clearCache();
  },
});
