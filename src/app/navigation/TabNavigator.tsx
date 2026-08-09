import React, { useMemo } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';
import { Home, Search, Ticket, User } from 'lucide-react-native';
import { ColorTokens, FontFamily, FontSize, Spacing } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';
import { TabParamList } from '@ctypes/navigation';

// Screens
import { MoviesScreen } from '@features/movies';
import { SearchScreen } from '@features/search';
import { MyBookingsScreen, ProfileScreen } from '@features/profile';

const Tab = createBottomTabNavigator<TabParamList>();

type TabIconProps = { color: string; size: number };
function HomeIcon({ color, size }: TabIconProps) { return <Home color={color} size={size} />; }
function SearchIcon({ color, size }: TabIconProps) { return <Search color={color} size={size} />; }
function TicketIcon({ color, size }: TabIconProps) { return <Ticket color={color} size={size} />; }
function UserIcon({ color, size }: TabIconProps) { return <User color={color} size={size} />; }

export function TabNavigator() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
      }}>
      <Tab.Screen
        name="Home"
        component={MoviesScreen}
        options={{ tabBarLabel: 'Home', tabBarIcon: HomeIcon }}
      />
      <Tab.Screen
        name="SearchTab"
        component={SearchScreen}
        options={{ tabBarLabel: 'Search', tabBarIcon: SearchIcon }}
      />
      <Tab.Screen
        name="Bookings"
        component={MyBookingsScreen}
        options={{ tabBarLabel: 'Bookings', tabBarIcon: TicketIcon }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile', tabBarIcon: UserIcon }}
      />
    </Tab.Navigator>
  );
}

const makeStyles = (Colors: ColorTokens) =>
  StyleSheet.create({
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
