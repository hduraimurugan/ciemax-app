import { httpClient } from './httpClient';
import type {
  ListNotificationsResponse,
  UnreadCountResponse,
  NotificationPreferences,
} from '@ctypes/api';

const BASE = '/api/notifications';

export const notificationService = {
  list: (page = 1, limit = 20) =>
    httpClient.get<ListNotificationsResponse>(BASE, { query: { page, limit } }),

  unreadCount: () => httpClient.get<UnreadCountResponse>(`${BASE}/unread-count`),

  markRead: (id: string) => httpClient.patch<{ updated: boolean }>(`${BASE}/${id}/read`),

  markAllRead: () => httpClient.patch<{ updated: number }>(`${BASE}/read-all`),

  getPreferences: () =>
    httpClient.get<{ preferences: NotificationPreferences }>(`${BASE}/preferences`),

  updatePreferences: (patch: Partial<NotificationPreferences>) =>
    httpClient.patch<{ preferences: NotificationPreferences }>(`${BASE}/preferences`, { patch }),

  registerDeviceToken: (token: string) =>
    httpClient.post<{ registered: boolean }>(`${BASE}/device-token`, {
      token,
      platform: 'android',
    }),

  unregisterDeviceToken: (token: string) =>
    httpClient.del<{ unregistered: boolean }>(`${BASE}/device-token`, { token }),
};
