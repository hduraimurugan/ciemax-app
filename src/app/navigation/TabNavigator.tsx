import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, FontFamily, FontSize, Spacing } from '@constants/theme';
import { TabParamList } from '@ctypes/navigation';

// Screens
import { MoviesScreen } from '@features/movies';
import { AllTheatresScreen } from '@features/theatres';
import { MyBookingsScreen } from '@features/profile';
import { OffersScreen } from '@features/offers';

const Tab = createBottomTabNavigator<TabParamList>();

function TabIcon({ icon, focused }: { icon: string; focused: boolean }) {
  return (
    <View style={styles.iconWrapper}>
      <Text style={[styles.icon, focused && styles.iconFocused]}>{icon}</Text>
    </View>
  );
}

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
      }}>
      <Tab.Screen
        name="Home"
        component={MoviesScreen}
        options={{
          tabBarLabel: 'Movies',
          tabBarIcon: ({ focused }) => <TabIcon icon="🎬" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="TheatresTab"
        component={AllTheatresScreen}
        options={{
          tabBarLabel: 'Theatres',
          tabBarIcon: ({ focused }) => <TabIcon icon="🎭" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="OffersTab"
        component={OffersScreen}
        options={{
          tabBarLabel: 'Offers',
          tabBarIcon: ({ focused }) => <TabIcon icon="🏷" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Bookings"
        component={MyBookingsScreen}
        options={{
          tabBarLabel: 'Bookings',
          tabBarIcon: ({ focused }) => <TabIcon icon="🎟" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.surface,
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xs,
    height: Spacing.tabBarHeight,
  },
  tabLabel: {
    fontSize: FontSize.xs,
    fontWeight: '500',
    fontFamily: FontFamily.medium,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 20,
    opacity: 0.5,
  },
  iconFocused: {
    opacity: 1,
  },
});
