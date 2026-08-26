import { createNavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from '@ctypes/navigation';

/**
 * A stable ref so code outside the component tree (push-notification tap
 * handlers, which fire before/independent of any screen being focused) can
 * navigate. Passed to <NavigationContainer ref={navigationRef}> in App.tsx.
 */
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigateToNotifications(): void {
  if (navigationRef.isReady()) {
    navigationRef.navigate('Notifications');
  }
}
