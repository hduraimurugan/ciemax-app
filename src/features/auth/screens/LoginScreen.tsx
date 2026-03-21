import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@ctypes/navigation';
import { Colors, FontFamily, FontSize, FontWeight, Radius, Spacing } from '@constants/theme';
import { Button, Card, Input } from '@shared/ui';
import { Heading2, Body, Caption } from '@shared/ui';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.kav}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Logo / brand */}
          <View style={styles.brandRow}>
            <Text style={styles.logo}>CINEBOOK</Text>
          </View>

          <Card variant="glass" padding="none" style={styles.formCard}>
            {/* Tab bar */}
            <View style={styles.tabs}>
              <View style={[styles.tab, styles.tabActive]}>
                <Text style={[styles.tabText, styles.tabTextActive]}>Login</Text>
              </View>
              <Pressable style={styles.tab} onPress={() => navigation.replace('Register')}>
                <Text style={styles.tabText}>Sign Up</Text>
              </Pressable>
            </View>

            <View style={styles.formBody}>
              <View style={styles.iconRow}>
                <View style={styles.iconCircle}>
                  <Text style={styles.iconEmoji}>🔒</Text>
                </View>
                <Heading2 style={styles.formTitle}>Welcome to CineBook</Heading2>
                <Body style={styles.formSub}>Sign in to your account</Body>
              </View>

              <Input
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Input
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Enter password"
                secureTextEntry
              />

              <Pressable>
                <Caption style={styles.forgotLink}>Forgot password?</Caption>
              </Pressable>

              <Button label="Sign In" onPress={() => navigation.goBack()} fullWidth size="lg" />
            </View>
          </Card>

          <Caption style={styles.footer}>
            By continuing you agree to our{' '}
            <Caption style={styles.footerLink}>Terms of Service</Caption>
            {' & '}
            <Caption style={styles.footerLink}>Privacy Policy</Caption>
          </Caption>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  kav: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  brandRow: {
    alignItems: 'center',
  },
  logo: {
    color: Colors.accent,
    fontSize: FontSize.xxl,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
    letterSpacing: 2,
  },
  formCard: {},
  // Tabs
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: 2,
    borderBottomColor: Colors.transparent,
  },
  tabActive: {
    borderBottomColor: Colors.accent,
  },
  tabText: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.medium,
    fontWeight: FontWeight.medium,
    color: Colors.textMuted,
  },
  tabTextActive: {
    color: Colors.textPrimary,
  },
  formBody: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  iconRow: {
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: Radius.full,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 24,
  },
  formTitle: {
    textAlign: 'center',
    color: Colors.textPrimary,
  },
  formSub: {
    textAlign: 'center',
    color: Colors.textSecondary,
  },
  forgotLink: {
    color: Colors.accent,
    textAlign: 'right',
  },
  footer: {
    textAlign: 'center',
    color: Colors.textMuted,
  },
  footerLink: {
    color: Colors.accent,
    textDecorationLine: 'underline',
  },
});
