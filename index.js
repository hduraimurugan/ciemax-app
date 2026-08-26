/**
 * @format
 */

import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import { getApp } from '@react-native-firebase/app';
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';

// Must be registered here, at module scope, before AppRegistry.registerComponent —
// this is what lets FCM wake the JS engine to run app code for a backgrounded/
// killed-app message (headless JS task). The system tray notification itself
// displays automatically (the backend's push payload includes a `notification`
// block, which Android's FCM SDK auto-renders independent of this handler) —
// this only matters for custom data-processing and for reliably enabling
// onNotificationOpenedApp()/getInitialNotification() on some OEM Android builds.
setBackgroundMessageHandler(getMessaging(getApp()), async () => {
  // Intentionally minimal — no store/UI access from here (no component tree
  // mounted). Real state sync happens via the AppState listener on foreground
  // (see src/hooks/usePushNotifications.ts).
});

AppRegistry.registerComponent(appName, () => App);
