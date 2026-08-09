import React, { useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {
  Ticket,
  CreditCard,
  Bell,
  HelpCircle,
  LogOut,
  ChevronRight,
  Moon,
} from 'lucide-react-native';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { RootStackParamList, TabParamList } from '@ctypes/navigation';
import { ColorTokens, FontFamily, FontSize, FontWeight, Radius, Spacing } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';
import { Card } from '@shared/ui';
import { Heading2, Heading3, Body, BodySmall } from '@shared/ui';
import { useBookingStore } from '@store/bookingStore';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'ProfileTab'>,
  NativeStackScreenProps<RootStackParamList>
>;

interface ProfileMenuItem {
  icon: React.ReactNode;
  label: string;
  description: string;
  onPress: () => void;
}

export function ProfileScreen({ navigation }: Props) {
  const { colors, mode, toggleTheme } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const resetBookingFlow = useBookingStore(s => s.resetBookingFlow);

  function handleLogout() {
    resetBookingFlow();
    navigation.getParent<NativeStackNavigationProp<RootStackParamList>>()?.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  }

  const menuItems: ProfileMenuItem[] = [
    {
      icon: <Ticket size={18} color={colors.textPrimary} />,
      label: 'My Bookings',
      description: 'View your booking history',
      onPress: () => navigation.navigate('Bookings'),
    },
    { icon: <CreditCard size={18} color={colors.textPrimary} />, label: 'Payment Methods', description: 'Manage saved cards & UPI', onPress: () => {} },
    { icon: <Bell size={18} color={colors.textPrimary} />, label: 'Notifications', description: 'Manage alerts', onPress: () => {} },
    { icon: <HelpCircle size={18} color={colors.textPrimary} />, label: 'Help & Support', description: 'FAQs and contact us', onPress: () => {} },
    { icon: <LogOut size={18} color={colors.textPrimary} />, label: 'Logout', description: 'Sign out of your account', onPress: handleLogout },
  ];

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.avatarSection}>
          <LinearGradient
            colors={[colors.accent, colors.accentDim]}
            style={styles.avatar}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}>
            <Text style={styles.avatarInitials}>AS</Text>
          </LinearGradient>
          <Heading2 style={styles.userName}>Aditi Sharma</Heading2>
          <Body style={styles.userEmail}>aditi.sharma@email.com</Body>
        </View>

        <Pressable style={styles.themeRow} onPress={toggleTheme}>
          <View style={styles.themeRowLeft}>
            <View style={styles.menuIconWrapper}>
              <Moon size={18} color={colors.textPrimary} />
            </View>
            <BodySmall style={styles.themeLabel}>Dark Mode</BodySmall>
          </View>
          <Switch
            value={mode === 'dark'}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.secondary, true: colors.accent }}
            thumbColor="#fff"
          />
        </Pressable>

        <View style={styles.menu}>
          {menuItems.map(item => (
            <Card key={item.label} onPress={item.onPress} padding="md">
              <View style={styles.menuRow}>
                <View style={styles.menuIconWrapper}>
                  {item.icon}
                </View>
                <View style={styles.menuText}>
                  <Heading3 style={styles.menuLabel}>{item.label}</Heading3>
                  <BodySmall>{item.description}</BodySmall>
                </View>
                <ChevronRight size={18} color={colors.textMuted} />
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (Colors: ColorTokens) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: Colors.background },
    content: { padding: Spacing.md, gap: Spacing.lg, paddingBottom: Spacing.xxl },
    avatarSection: {
      alignItems: 'center',
      gap: Spacing.sm,
      paddingVertical: Spacing.lg,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: Radius.full,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarInitials: {
      color: '#fff',
      fontSize: FontSize.xl,
      fontFamily: FontFamily.bold,
      fontWeight: FontWeight.bold,
    },
    userName: {
      color: Colors.textPrimary,
    },
    userEmail: {
      color: Colors.textSecondary,
    },
    themeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: Colors.surface,
      borderWidth: 1,
      borderColor: Colors.border,
      borderRadius: Radius.lg,
      padding: Spacing.md,
    },
    themeRowLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
    themeLabel: { color: Colors.textPrimary, fontWeight: FontWeight.medium },
    menu: { gap: Spacing.sm },
    menuRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
    },
    menuIconWrapper: {
      width: 40,
      height: 40,
      borderRadius: Radius.sm,
      backgroundColor: Colors.surfaceElevated,
      alignItems: 'center',
      justifyContent: 'center',
    },
    menuText: { flex: 1, gap: 2 },
    menuLabel: { color: Colors.textPrimary },
  });
