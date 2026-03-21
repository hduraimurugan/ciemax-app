import React from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Colors, Radius, Spacing } from '@constants/theme';
import { Card } from '@shared/ui';
import { Heading2, Heading3, Body, BodySmall, Caption } from '@shared/ui';

interface ProfileMenuItem {
  icon: string;
  label: string;
  description: string;
  onPress: () => void;
}

export function ProfileScreen() {
  const menuItems: ProfileMenuItem[] = [
    { icon: '🎟', label: 'My Bookings', description: 'View your booking history', onPress: () => {} },
    { icon: '🏷️', label: 'Offers & Coupons', description: 'View available offers', onPress: () => {} },
    { icon: '📍', label: 'Saved Theatres', description: 'Your favourite theatres', onPress: () => {} },
    { icon: '🔔', label: 'Notifications', description: 'Manage alerts', onPress: () => {} },
    { icon: '⚙️', label: 'Settings', description: 'App preferences', onPress: () => {} },
    { icon: '❓', label: 'Help & Support', description: 'FAQs and contact us', onPress: () => {} },
  ];

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        {/* Avatar section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Heading2 style={styles.avatarText}>👤</Heading2>
          </View>
          <Heading2>Hello, Cinephile!</Heading2>
          <Body>user@example.com</Body>
          <Pressable style={styles.editButton}>
            <Caption style={styles.editText}>Edit Profile</Caption>
          </Pressable>
        </View>

        {/* Menu */}
        <View style={styles.menu}>
          {menuItems.map(item => (
            <Card key={item.label} onPress={item.onPress} padding="md">
              <View style={styles.menuRow}>
                <Body style={styles.menuIcon}>{item.icon}</Body>
                <View style={styles.menuText}>
                  <Heading3 style={styles.menuLabel}>{item.label}</Heading3>
                  <BodySmall>{item.description}</BodySmall>
                </View>
                <Caption style={styles.chevron}>›</Caption>
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
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 36 },
  editButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  editText: { color: Colors.accent },
  menu: { gap: Spacing.sm },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  menuIcon: { fontSize: 22 },
  menuText: { flex: 1, gap: 2 },
  menuLabel: { color: Colors.textPrimary },
  chevron: { fontSize: 20, color: Colors.textMuted },
  signOut: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  signOutText: { color: Colors.error },
});
