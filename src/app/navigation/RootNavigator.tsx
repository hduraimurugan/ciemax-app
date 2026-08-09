import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '@hooks/useTheme';
import { RootStackParamList } from '@ctypes/navigation';

import { TabNavigator } from './TabNavigator';

// Feature screens
import { SplashScreen, OnboardingScreen } from '@features/onboarding';
import { LoginScreen, OtpScreen, RegisterScreen, ForgotPasswordScreen } from '@features/auth';
import { MovieDetailScreen } from '@features/movies';
import { ShowtimesScreen, TheatresScreen } from '@features/theatres';
import { SeatSelectionScreen } from '@features/seats';
import {
  CheckoutScreen,
  PaymentScreen,
  RazorpayWebViewScreen,
  BookingSuccessScreen,
  BookingFailureScreen,
} from '@features/booking';
import { TicketDetailScreen, ChangePasswordScreen, SetPasswordScreen } from '@features/profile';
import { OffersScreen } from '@features/offers';

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
      {/* Onboarding */}
      <Stack.Screen name="Splash" component={SplashScreen} options={{ animation: 'fade' }} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />

      {/* Root — tabs (browsing is public; auth only gates specific actions) */}
      <Stack.Screen name="MainTabs" component={TabNavigator} />

      {/* Auth — pushed as modals from useRequireAuth or explicit nav, not the app's entry point */}
      <Stack.Screen name="Login" component={LoginScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="Otp" component={OtpScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{ presentation: 'modal' }}
      />

      {/* Browse */}
      <Stack.Screen name="MovieDetail" component={MovieDetailScreen} />
      <Stack.Screen name="Showtimes" component={ShowtimesScreen} />
      <Stack.Screen name="Theatres" component={TheatresScreen} />
      <Stack.Screen name="Offers" component={OffersScreen} />

      {/* Booking flow */}
      <Stack.Screen name="SeatSelection" component={SeatSelectionScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen
        name="Payment"
        component={PaymentScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="RazorpayWebView"
        component={RazorpayWebViewScreen}
        options={{ presentation: 'fullScreenModal', gestureEnabled: false }}
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

      {/* Bookings / profile detail */}
      <Stack.Screen name="TicketDetail" component={TicketDetailScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="SetPassword" component={SetPasswordScreen} options={{ presentation: 'modal' }} />
    </Stack.Navigator>
  );
}
