import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@ctypes/navigation';
import { useAuthStore } from '@store/authStore';

type Nav = NativeStackNavigationProp<RootStackParamList>;

// Navigation params can't carry a function, so a pending "run this once
// logged in" callback is queued here and flushed by LoginScreen /
// OtpScreen after a successful sign-in.
const pendingCallbacks: Array<() => void> = [];

export function flushPendingAuthCallbacks(): void {
  const callbacks = pendingCallbacks.splice(0, pendingCallbacks.length);
  callbacks.forEach(cb => cb());
}

export function clearPendingAuthCallbacks(): void {
  pendingCallbacks.length = 0;
}

/**
 * Guards an action behind login — mirrors the web app's pattern of
 * browsing publicly and only prompting for auth at Proceed-to-pay,
 * My Bookings, and Profile. Usage:
 *
 *   const requireAuth = useRequireAuth();
 *   <Button onPress={() => requireAuth(() => doTheThing())} />
 */
export function useRequireAuth() {
  const navigation = useNavigation<Nav>();
  const status = useAuthStore(s => s.status);

  return useCallback(
    (onAuthed: () => void) => {
      if (status === 'authed') {
        onAuthed();
        return;
      }
      pendingCallbacks.push(onAuthed);
      navigation.navigate('Login', {});
    },
    [navigation, status],
  );
}
