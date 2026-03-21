import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Colors } from '@constants/theme';
import { RootStackParamList } from '@ctypes/navigation';

import { TabNavigator } from './TabNavigator';

// Feature screens
import { MovieDetailScreen } from '@features/movies';
import { TheatresScreen, ShowSelectionScreen } from '@features/theatres';
import { SeatSelectionScreen } from '@features/seats';
import {
  OrderSummaryScreen,
  PaymentScreen,
  BookingSuccessScreen,
  BookingFailureScreen,
} from '@features/booking';
import { ProfileScreen } from '@features/profile';
import { LoginScreen, RegisterScreen } from '@features/auth';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
        animation: 'slide_from_right',
      }}>
      {/* Root — tabs */}
      <Stack.Screen name="MainTabs" component={TabNavigator} />

      {/* Booking flow */}
      <Stack.Screen name="MovieDetail" component={MovieDetailScreen} />
      <Stack.Screen name="Theatres" component={TheatresScreen} />
      <Stack.Screen name="ShowSelection" component={ShowSelectionScreen} />
      <Stack.Screen name="SeatSelection" component={SeatSelectionScreen} />
      <Stack.Screen name="OrderSummary" component={OrderSummaryScreen} />
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

      {/* Profile */}
      <Stack.Screen name="Profile" component={ProfileScreen} />

      {/* Auth */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}
