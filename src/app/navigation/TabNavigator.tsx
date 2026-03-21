import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';
import { Film, Building2, Tag, Ticket } from 'lucide-react-native';
import { Colors, FontFamily, FontSize, Spacing } from '@constants/theme';
import { TabParamList } from '@ctypes/navigation';

// Screens
import { MoviesScreen } from '@features/movies';
import { AllTheatresScreen } from '@features/theatres';
import { MyBookingsScreen } from '@features/profile';
import { OffersScreen } from '@features/offers';

const Tab = createBottomTabNavigator<TabParamList>();

type TabIconProps = { color: string; size: number };
function FilmIcon({ color, size }: TabIconProps) { return <Film color={color} size={size} />; }
function Building2Icon({ color, size }: TabIconProps) { return <Building2 color={color} size={size} />; }
function TagIcon({ color, size }: TabIconProps) { return <Tag color={color} size={size} />; }
function TicketIcon({ color, size }: TabIconProps) { return <Ticket color={color} size={size} />; }

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
        options={{ tabBarLabel: 'Movies', tabBarIcon: FilmIcon }}
      />
      <Tab.Screen
        name="TheatresTab"
        component={AllTheatresScreen}
        options={{ tabBarLabel: 'Theatres', tabBarIcon: Building2Icon }}
      />
      <Tab.Screen
        name="OffersTab"
        component={OffersScreen}
        options={{ tabBarLabel: 'Offers', tabBarIcon: TagIcon }}
      />
      <Tab.Screen
        name="Bookings"
        component={MyBookingsScreen}
        options={{ tabBarLabel: 'Bookings', tabBarIcon: TicketIcon }}
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
});
