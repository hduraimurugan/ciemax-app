import { httpClient } from './httpClient';
import type {
  LoginResponse,
  SignupResponse,
  MeResponse,
  RefreshResponse,
  ApiCustomer,
} from '@ctypes/api';

const BASE = '/api/customer';

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  district?: string;
  state?: string;
}

export const authService = {
  signup: (payload: SignupPayload) =>
    httpClient.post<SignupResponse>(`${BASE}/signup`, payload, { skipAuth: true }),

  login: (email: string, password: string) =>
    httpClient.post<LoginResponse>(`${BASE}/login`, { email, password }, { skipAuth: true }),

  logout: (refreshToken: string | null) =>
    httpClient.post<{ message: string }>(
      `${BASE}/logout`,
      refreshToken ? { refreshToken } : undefined,
      { skipAuth: true },
    ),

  me: () => httpClient.get<MeResponse>(`${BASE}/me`),

  update: (payload: Partial<Pick<ApiCustomer, 'name' | 'phone' | 'district' | 'state'>>) =>
    httpClient.put<{ message: string; customer: ApiCustomer }>(`${BASE}/update`, payload),

  /** Called by httpClient's refresh-and-retry flow — must skip the normal auth header. */
  refresh: (refreshToken: string) =>
    httpClient.post<RefreshResponse>(`${BASE}/refresh`, { refreshToken }, { skipAuth: true }),

  changePassword: (currentPassword: string, newPassword: string) =>
    httpClient.post<{ message: string }>(`${BASE}/change-password`, {
      currentPassword,
      newPassword,
    }),

  forgotPassword: (email: string) =>
    httpClient.post<{ message: string }>(`${BASE}/forgot-password`, { email }, { skipAuth: true }),

  resetPassword: (email: string, otp: string, newPassword: string) =>
    httpClient.post<{ message: string }>(
      `${BASE}/reset-password`,
      { email, otp, newPassword },
      { skipAuth: true },
    ),

  googleLogin: (idToken: string) =>
    httpClient.post<LoginResponse>(`${BASE}/google-login`, { idToken }, { skipAuth: true }),

  linkProvider: (provider: 'google', idToken: string) =>
    httpClient.post<{ message: string; auth_providers: string[] }>(`${BASE}/link-provider`, {
      provider,
      idToken,
    }),

  unlinkProvider: (provider: 'google') =>
    httpClient.post<{ message: string; auth_providers: string[] }>(`${BASE}/unlink-provider`, {
      provider,
    }),

  setPassword: (newPassword: string) =>
    httpClient.post<{ message: string; auth_providers: string[] }>(`${BASE}/set-password`, {
      newPassword,
    }),

  sendOtp: (email: string, type: 'signup' | 'password_reset' = 'signup') =>
    httpClient.post<{ message: string }>('/api/otp/send', { email, type }, { skipAuth: true }),

  verifyOtp: (email: string, otp: string, type: 'signup' | 'password_reset' = 'signup') =>
    httpClient.post<{ message: string }>('/api/otp/verify', { email, otp, type }, { skipAuth: true }),
};
