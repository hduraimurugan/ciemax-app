import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {
  ArrowLeft,
  Ticket,
  Tag,
  MapPin,
  Bell,
  Settings,
  HelpCircle,
  ChevronRight,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@ctypes/navigation';
import { Colors, FontFamily, FontSize, FontWeight, Radius, Spacing } from '@constants/theme';
import { Button, Card } from '@shared/ui';
import { Heading2, Heading3, Body, BodySmall, Caption } from '@shared/ui';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface ProfileMenuItem {
  icon: React.ReactNode;
  label: string;
  description: string;
  onPress: () => void;
}

export function ProfileScreen() {
  const navigation = useNavigation<NavigationProp>();

  const menuItems: ProfileMenuItem[] = [
    {
      icon: <Ticket size={20} color={Colors.accent} />,
      label: 'My Bookings',
      description: 'View your booking history',
      onPress: () => navigation.navigate('MainTabs'),
    },
    { icon: <Tag size={20} color={Colors.violet} />, label: 'Offers & Coupons', description: 'View available offers', onPress: () => {} },
    { icon: <MapPin size={20} color={Colors.info} />, label: 'Saved Theatres', description: 'Your favourite theatres', onPress: () => {} },
    { icon: <Bell size={20} color={Colors.warning} />, label: 'Notifications', description: 'Manage alerts', onPress: () => {} },
    { icon: <Settings size={20} color={Colors.textSecondary} />, label: 'Settings', description: 'App preferences', onPress: () => {} },
    { icon: <HelpCircle size={20} color={Colors.textSecondary} />, label: 'Help & Support', description: 'FAQs and contact us', onPress: () => {} },
  ];

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.pageHeader}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={18} color={Colors.textPrimary} />
        </Pressable>
        <Heading2>Profile</Heading2>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        {/* Avatar section */}
        <View style={styles.avatarSection}>
          <LinearGradient
            colors={[Colors.accent, Colors.accentDim]}
            style={styles.avatar}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}>
            <Text style={styles.avatarInitials}>DH</Text>
          </LinearGradient>
          <Heading2 style={styles.userName}>Hello, Cinephile!</Heading2>
          <Body style={styles.userEmail}>user@example.com</Body>
          <Body style={styles.userPhone}>+91 98765 43210</Body>
          <Button
            label="Edit Profile"
            variant="secondary"
            size="sm"
            onPress={() => {}}
            style={styles.editBtn}
          />
        </View>

        {/* Menu */}
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
                <ChevronRight size={18} color={Colors.textMuted} />
              </View>
            </Card>
          ))}
        </View>

        {/* Sign out */}
        <Pressable style={styles.signOut}>
          <Body style={styles.signOutText}>Sign Out</Body>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
    color: Colors.textPrimary,
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
  userPhone: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
  },
  editBtn: {
    marginTop: Spacing.xs,
  },
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
  signOut: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  signOutText: { color: Colors.error },
});
