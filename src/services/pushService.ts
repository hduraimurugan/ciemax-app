import { Platform, PermissionsAndroid } from 'react-native';
import { getApp } from '@react-native-firebase/app';
import { getMessaging, getToken, deleteToken } from '@react-native-firebase/messaging';
import { notificationService } from './notificationService';
import { useNotificationStore } from '@store/notificationStore';

// @react-native-firebase v26 uses the "modular" API (mirroring the Firebase
// web SDK v9+ style) — every call takes a `messaging` instance as its first
// argument, rather than the older `messaging().getToken()` namespaced form.
export const messagingInstance = getMessaging(getApp());

/**
 * Requests the Android 13+ (API 33+) runtime notification permission (a
 * no-op, auto-resolves granted, on older devices), then registers this
 * device's FCM token with the backend. Returns whether push is now enabled.
 * Only ever called from an explicit user action (the Profile screen toggle)
 * — never an unsolicited prompt on app load, matching the web app's
 * precedent.
 */
export async function enablePush(): Promise<boolean> {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      {
        title: 'Enable notifications',
        message: 'Get notified about your bookings, showtime reminders, and refunds.',
        buttonPositive: 'Allow',
        buttonNegative: 'Not now',
      },
    );
    if (granted !== PermissionsAndroid.RESULTS.GRANTED) return false;
  }

  try {
    const token = await getToken(messagingInstance);
    await notificationService.registerDeviceToken(token);
    useNotificationStore.getState().setPushToken(token);
    return true;
  } catch {
    return false;
  }
}

/** Unregisters the current device token server-side and clears local state. */
export async function disablePush(): Promise<void> {
  const { pushToken } = useNotificationStore.getState();
  if (pushToken) {
    await notificationService.unregisterDeviceToken(pushToken).catch(() => {});
    await deleteToken(messagingInstance).catch(() => {});
  }
  useNotificationStore.getState().setPushToken(null);
  // Note: this only unregisters server-side and deletes the local FCM token
  // — it does not revoke the OS-level POST_NOTIFICATIONS grant (there's no
  // Android API for an app to do that to itself). Toggling back on just
  // re-registers without a re-prompt.
}

/**
 * Call once on cold start. `notificationStore.pushEnabled` isn't persisted
 * (it's derived state, not a settings flag — see notificationStore's header
 * comment), so on a fresh launch it's always false even if the user opted in
 * during a previous session. Instead of trusting a remembered flag that could
 * desync from reality (e.g. the user revoked the permission via system
 * Settings), this checks the actual OS-level grant and only silently
 * re-registers if it's genuinely still granted.
 */
export async function syncPushStateOnLaunch(): Promise<void> {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const granted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
    if (!granted) return;
  }
  // On Android <33 there's no queryable runtime grant — notifications are
  // enabled by default unless the user disabled them for the app, which
  // isn't something PermissionsAndroid can check. Treat as granted; the
  // token registration below is itself harmless if it turns out the user
  // doesn't want push (no notification content is ever revealed by having
  // a token registered — it just means a send attempt is made).
  try {
    const token = await getToken(messagingInstance);
    await notificationService.registerDeviceToken(token);
    useNotificationStore.getState().setPushToken(token);
  } catch {
    // Non-fatal — the Profile toggle will show as off; user can re-enable.
  }
}
