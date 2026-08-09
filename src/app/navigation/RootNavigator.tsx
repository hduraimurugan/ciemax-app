import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '@hooks/useTheme';
import { RootStackParamList } from '@ctypes/navigation';

import { TabNavigator } from './TabNavigator';

// Feature screens
import { SplashScreen, OnboardingScreen } from '@features/onboarding';
import { LoginScreen, OtpScreen } from '@features/auth';
import { MovieDetailScreen } from '@features/movies';
import { ShowtimesScreen } from '@features/theatres';
import { SeatSelectionScreen } from '@features/seats';
import {
  CheckoutScreen,
  PaymentScreen,
  BookingSuccessScreen,
  BookingFailureScreen,
} from '@features/booking';
import { TicketDetailScreen } from '@features/profile';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { colors } = useTheme();
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}>
      {/* Onboarding / auth */}
      <Stack.Screen name="Splash" component={SplashScreen} options={{ animation: 'fade' }} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Otp" component={OtpScreen} />

      {/* Root — tabs */}
      <Stack.Screen name="MainTabs" component={TabNavigator} />

      {/* Booking flow */}
      <Stack.Screen name="MovieDetail" component={MovieDetailScreen} />
      <Stack.Screen name="Showtimes" component={ShowtimesScreen} />
      <Stack.Screen name="SeatSelection" component={SeatSelectionScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen
        name="Payment"
        component={PaymentScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="BookingSuccess"
        component={BookingSuccessScreen}
        options={{ animation: 'fade', gestureEnabled: false }}
      />
      <Stack.Screen
        name="BookingFailure"
        component={BookingFailureScreen}
        options={{ animation: 'fade', gestureEnabled: false }}
      />

      {/* Bookings detail */}
      <Stack.Screen name="TicketDetail" component={TicketDetailScreen} />
    </Stack.Navigator>
  );
}
