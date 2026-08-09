import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check, User, X } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@ctypes/navigation';
import { ColorTokens, FontFamily, FontSize, FontWeight, Radius, Spacing } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';
import { Button, Card, Input, Heading2, Body, Caption } from '@shared/ui';
import { useAuthStore } from '@store/authStore';
import { authService } from '@services/authService';
import { evaluatePassword, isPasswordValid } from '../utils/passwordPolicy';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const signup = useAuthStore(s => s.signup);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const rules = evaluatePassword(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const submit = async () => {
    setError(null);
    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in your name, email, and password.');
      return;
    }
    if (!email.includes('@')) {
      setError('Enter a valid email address.');
      return;
    }
    if (!isPasswordValid(password)) {
      setError('Your password doesn’t meet all the requirements below.');
      return;
    }
    if (!passwordsMatch) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    const result = await signup({
      name: name.trim(),
      email: email.trim(),
      password,
      phone: phone.trim() || undefined,
    });

    if (!result.success) {
      setSubmitting(false);
      setError(result.error?.message ?? 'Signup failed. Please try again.');
      return;
    }

    try {
      await authService.sendOtp(email.trim(), 'signup');
    } catch {
      // Non-fatal — OtpScreen's own "Resend Code" can retry.
    }
    setSubmitting(false);
    navigation.replace('Otp', { email: email.trim(), type: 'signup', password });
  };

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.kav}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {navigation.canGoBack() && (
            <Pressable style={styles.closeButton} onPress={() => navigation.goBack()} hitSlop={8}>
              <X size={18} color={colors.textPrimary} />
            </Pressable>
          )}

          <View style={styles.brandRow}>
            <Text style={styles.logo}>CINEHALL</Text>
          </View>

          <Card variant="glass" padding="none" style={styles.formCard}>
            <View style={styles.tabs}>
              <View style={[styles.tab, styles.tabActive]}>
                <Text style={[styles.tabText, styles.tabTextActive]}>Sign Up</Text>
              </View>
              <Pressable style={styles.tab} onPress={() => navigation.replace('Login')}>
                <Text style={styles.tabText}>Login</Text>
              </Pressable>
            </View>

            <View style={styles.formBody}>
              <View style={styles.iconRow}>
                <View style={styles.iconCircle}>
                  <User size={24} color={colors.accent} />
                </View>
                <Heading2 style={styles.formTitle}>Create Account</Heading2>
                <Body style={styles.formSub}>Join CineHall to start booking</Body>
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <Input label="Full Name" value={name} onChangeText={setName} placeholder="Your name" />
              <Input
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
              <Input
                label="Phone (optional)"
                value={phone}
                onChangeText={setPhone}
                placeholder="10-digit mobile number"
                keyboardType="phone-pad"
              />
              <Input
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Create a password"
                secureTextEntry
                autoCapitalize="none"
              />

              {password.length > 0 && (
                <View style={styles.checklist}>
                  {rules.map(rule => (
                    <View key={rule.key} style={styles.checklistRow}>
                      {rule.passed ? (
                        <Check size={13} color={colors.success} />
                      ) : (
                        <X size={13} color={colors.textMuted} />
                      )}
                      <Caption style={[styles.checklistLabel, rule.passed && { color: colors.success }]}>
                        {rule.label}
                      </Caption>
                    </View>
                  ))}
                </View>
              )}

              <Input
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Re-enter your password"
                secureTextEntry
                autoCapitalize="none"
                error={confirmPassword.length > 0 && !passwordsMatch ? 'Passwords do not match' : undefined}
              />

              <Button
                label={submitting ? 'Creating account…' : 'Create Account'}
                onPress={submit}
                disabled={submitting}
                loading={submitting}
                fullWidth
                size="lg"
              />
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

const makeStyles = (Colors: ColorTokens) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: Colors.background },
    kav: { flex: 1 },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: Spacing.lg,
      gap: Spacing.lg,
    },
    closeButton: {
      alignSelf: 'flex-end',
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: Colors.surfaceElevated,
      alignItems: 'center',
      justifyContent: 'center',
    },
    brandRow: { alignItems: 'center' },
    logo: {
      color: Colors.accent,
      fontSize: FontSize.xxl,
      fontFamily: FontFamily.bold,
      fontWeight: FontWeight.bold,
      letterSpacing: 2,
    },
    formCard: {},
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
    formTitle: {
      textAlign: 'center',
      color: Colors.textPrimary,
    },
    formSub: {
      textAlign: 'center',
      color: Colors.textSecondary,
    },
    errorText: {
      fontSize: FontSize.sm,
      color: Colors.error,
      textAlign: 'center',
    },
    checklist: {
      gap: Spacing.xs / 2,
      marginTop: -Spacing.xs,
      marginBottom: Spacing.xs,
    },
    checklistRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
    checklistLabel: { color: Colors.textMuted },
    footer: {
      textAlign: 'center',
      color: Colors.textMuted,
    },
    footerLink: {
      color: Colors.accent,
      textDecorationLine: 'underline',
    },
  });
