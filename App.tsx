/**
 * CineHall — Cinema Ticket Booking App
 * Root entry point: providers only, no UI logic here.
 */

import React from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/app/navigation';
import { useTheme } from './src/hooks/useTheme';

export default function App() {
  const { colors, mode } = useTheme();
  return (
    // Required by react-native-gesture-handler's Gesture.Pinch()/Gesture.Pan()
    // (used by the seat map's pinch-to-zoom) — must wrap the whole tree.
    <GestureHandlerRootView style={styles.fill}>
      <SafeAreaProvider>
        <StatusBar
          barStyle={mode === 'dark' ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
        />
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({ fill: { flex: 1 } });
