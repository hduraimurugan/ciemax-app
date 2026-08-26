import { useEffect } from 'react';
import { AppState } from 'react-native';
import { getApp } from '@react-native-firebase/app';
import {
  getMessaging,
  onMessage,
  onNotificationOpenedApp,
  getInitialNotification,
  onTokenRefresh,
} from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import { navigateToNotifications } from '@app/navigation';
import { useNotificationStore } from '@store/notificationStore';
import { useAuthStore } from '@store/authStore';
import { notificationService } from '@services/notificationService';
import { syncPushStateOnLaunch } from '@services/pushService';

const CHANNEL_ID = 'default';

/**
 * Mounted once (in App.tsx). Wires:
 *  - foreground FCM messages -> a notifee banner (FCM shows nothing on its
 *    own while the app is open; background/killed delivery is automatic and
 *    needs no JS, see index.js's setBackgroundMessageHandler comment)
 *  - tap-to-open (backgrounded tap, killed-app launch, foreground banner tap)
 *    -> navigate to the Notifications screen (v1 always lands on the list,
 *    not a specific booking — see the plan's deep-linking scope note)
 *  - token rotation -> silent re-registration
 *  - AppState transitions -> refresh the unread badge, the RN equivalent of
 *    the web's page-visibility polling (no setInterval — see notificationStore)
 */
export function usePushNotifications(): void {
  useEffect(() => {
    const messaging = getMessaging(getApp());

    notifee.createChannel({ id: CHANNEL_ID, name: 'General', importance: AndroidImportance.HIGH });

    const unsubOnMessage = onMessage(messaging, async remoteMessage => {
      await notifee.displayNotification({
        title: remoteMessage.notification?.title,
        body: remoteMessage.notification?.body,
        data: remoteMessage.data,
        android: { channelId: CHANNEL_ID, smallIcon: 'ic_notification', pressAction: { id: 'default' } },
      });
      useNotificationStore.getState().fetchUnreadCount();
    });

    const unsubOpenedApp = onNotificationOpenedApp(messaging, () => {
      navigateToNotifications();
    });

    getInitialNotification(messaging).then(remoteMessage => {
      if (remoteMessage) navigateToNotifications();
    });

    const unsubForegroundEvent = notifee.onForegroundEvent(({ type }) => {
      if (type === EventType.PRESS) navigateToNotifications();
    });

    const unsubTokenRefresh = onTokenRefresh(messaging, async newToken => {
      if (!useNotificationStore.getState().pushEnabled) return;
      try {
        await notificationService.registerDeviceToken(newToken);
        useNotificationStore.getState().setPushToken(newToken);
      } catch {
        // Non-fatal — next app open retries.
      }
    });

    return () => {
      unsubOnMessage();
      unsubOpenedApp();
      unsubForegroundEvent();
      unsubTokenRefresh();
    };
  }, []);

  const authStatus = useAuthStore(s => s.status);

  // Once auth resolves to 'authed' (cold start, after bootstrap()'s GET /me
  // check succeeds), pick up the unread badge and re-register a token if the
  // OS permission is still granted from a previous session.
  useEffect(() => {
    if (authStatus === 'authed') {
      useNotificationStore.getState().fetchUnreadCount();
      syncPushStateOnLaunch();
    }
  }, [authStatus]);

  // RN equivalent of the web's page-visibility polling — refresh the badge
  // whenever the app comes back to the foreground, no setInterval needed.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextState => {
      if (nextState === 'active' && useAuthStore.getState().status === 'authed') {
        useNotificationStore.getState().fetchUnreadCount();
      }
    });
    return () => subscription.remove();
  }, []);
}
