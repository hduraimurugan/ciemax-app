import { create } from 'zustand';
import { notificationService } from '@services/notificationService';
import { mapNotification } from '@services/mappers';
import type { Notification } from '@ctypes/models';

const PAGE_SIZE = 20;

interface NotificationState {
  items: Notification[];
  unreadCount: number;
  loading: boolean;
  page: number;
  hasMore: boolean;
  /** Last-registered FCM token — kept here (not persisted) so logout can unregister it. */
  pushToken: string | null;
  pushEnabled: boolean;

  fetchUnreadCount: () => Promise<void>;
  fetchList: () => Promise<void>;
  loadMore: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  setPushToken: (token: string | null) => void;
  reset: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  items: [],
  unreadCount: 0,
  loading: false,
  page: 1,
  hasMore: true,
  pushToken: null,
  pushEnabled: false,

  fetchUnreadCount: async () => {
    try {
      const { count } = await notificationService.unreadCount();
      set({ unreadCount: count });
    } catch {
      // Non-fatal — the badge just doesn't update this cycle.
    }
  },

  fetchList: async () => {
    set({ loading: true });
    try {
      const { notifications } = await notificationService.list(1, PAGE_SIZE);
      set({
        items: notifications.map(mapNotification),
        page: 1,
        hasMore: notifications.length === PAGE_SIZE,
        loading: false,
      });
    } catch {
      set({ loading: false });
    }
  },

  loadMore: async () => {
    const { page, hasMore, loading, items } = get();
    if (!hasMore || loading) return;
    set({ loading: true });
    try {
      const { notifications } = await notificationService.list(page + 1, PAGE_SIZE);
      set({
        items: [...items, ...notifications.map(mapNotification)],
        page: page + 1,
        hasMore: notifications.length === PAGE_SIZE,
        loading: false,
      });
    } catch {
      set({ loading: false });
    }
  },

  markRead: async (id: string) => {
    const alreadyRead = get().items.find(n => n.id === id)?.readAt;
    if (alreadyRead) return;
    set(s => ({
      items: s.items.map(n => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)),
      unreadCount: Math.max(0, s.unreadCount - 1),
    }));
    try {
      await notificationService.markRead(id);
    } catch {
      // Non-fatal — next fetchList/fetchUnreadCount reconciles.
    }
  },

  markAllRead: async () => {
    set(s => ({
      items: s.items.map(n => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })),
      unreadCount: 0,
    }));
    try {
      await notificationService.markAllRead();
    } catch {
      // Non-fatal
    }
  },

  setPushToken: (token: string | null) => set({ pushToken: token, pushEnabled: !!token }),

  reset: () =>
    set({
      items: [],
      unreadCount: 0,
      loading: false,
      page: 1,
      hasMore: true,
      pushToken: null,
      pushEnabled: false,
    }),
}));
