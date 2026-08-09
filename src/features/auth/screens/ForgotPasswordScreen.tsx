import React, { useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, CheckCircle2, KeyRound } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@ctypes/navigation';
import { ColorTokens, FontFamily, FontSize, FontWeight, Radius, Spacing } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';
import { useCountdown } from '@hooks/useCountdown';
import { Button, Heading2, Body, Input, Caption } from '@shared/ui';
import { authService } from '@services/authService';
import { errorMessage } from '@services/httpClient';
import { evaluatePassword, isPasswordValid } from '../utils/passwordPolicy';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;
type Step = 'email' | 'reset' | 'done';

const OTP_LENGTH = 6;

export function ForgotPasswordScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const inputs = useRef<Array<TextInput | null>>([]);
  const { seconds, reset } = useCountdown(60);

  const code = otp.join('');
  const rules = evaluatePassword(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const requestOtp = async () => {
    if (!email.trim()) {
      setError('Enter your email address.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      // Always returns a generic success message server-side — no account
      // enumeration — so we advance to the next step regardless.
      await authService.forgotPassword(email.trim());
      setStep('reset');
      reset(60);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const updateDigit = (i: number, value: string) => {
    const digit = value.replace(/[^0-9]/g, '').slice(-1);
    setOtp(prev => {
      const next = [...prev];
      next[i] = digit;
      return next;
    });
    if (digit && i < OTP_LENGTH - 1) inputs.current[i + 1]?.focus();
  };

  const onKeyPress = (i: number, key: string) => {
    if (key === 'Backspace' && !otp[i] && i > 0) inputs.current[i - 1]?.focus();
  };

  const resend = async () => {
    reset(60);
    try {
      await authService.forgotPassword(email.trim());
    } catch {
      // silent — generic response either way
    }
  };

  const submitReset = async () => {
    if (code.length !== OTP_LENGTH) {
      setError('Enter the full 6-digit code.');
      return;
    }
    if (!isPasswordValid(newPassword)) {
      setError('Your new password doesn’t meet all the requirements below.');
      return;
    }
    if (!passwordsMatch) {
      setError('Passwords do not match.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await authService.resetPassword(email.trim(), code, newPassword);
      setStep('done');
    } catch (err) {
      setError(errorMessage(err, 'Could not reset your password. The code may be expired.'));
    } finally {
      setSubmitting(false);
    }
  };

  const resendLabel = seconds > 0 ? `Resend code in 0:${String(seconds).padStart(2, '0')}` : '';

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()} hitSlop={8}>
          <ArrowLeft size={18} color={colors.textPrimary} />
        </Pressable>

        {step === 'email' && (
          <>
            <Heading2 style={styles.title}>Reset your password</Heading2>
            <Body style={styles.subtitle}>
              Enter the email on your account and we&apos;ll send a code to reset your password.
            </Body>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <Input
              label="EMAIL ADDRESS"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              containerStyle={styles.inputGap}
            />
            <Button
              label={submitting ? 'Sending…' : 'Send Reset Code'}
              onPress={requestOtp}
              disabled={submitting}
              loading={submitting}
              fullWidth
              size="lg"
            />
          </>
        )}

        {step === 'reset' && (
          <>
            <Heading2 style={styles.title}>Enter code & new password</Heading2>
            <Body style={styles.subtitle}>We sent a 6-digit code to {email}</Body>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.otpRow}>
              {otp.map((digit, i) => (
                <TextInput
                  key={i}
                  ref={ref => {
                    inputs.current[i] = ref;
                  }}
                  value={digit}
                  onChangeText={v => updateDigit(i, v)}
                  onKeyPress={e => onKeyPress(i, e.nativeEvent.key)}
                  maxLength={1}
                  keyboardType="number-pad"
                  style={[styles.otpBox, digit ? styles.otpBoxFilled : undefined]}
                />
              ))}
            </View>

            <View style={styles.resendRow}>
              {resendLabel ? (
                <Text style={styles.resendMuted}>{resendLabel}</Text>
              ) : (
                <Pressable onPress={resend}>
                  <Text style={styles.resendLink}>Resend Code</Text>
                </Pressable>
              )}
            </View>

            <Input
              label="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Create a new password"
              secureTextEntry
              autoCapitalize="none"
              containerStyle={styles.inputGap}
            />
            {newPassword.length > 0 && (
              <View style={styles.checklist}>
                {rules.map(rule => (
                  <Caption key={rule.key} style={[styles.checklistLabel, rule.passed && { color: colors.success }]}>
                    {rule.passed ? '✓' : '·'} {rule.label}
                  </Caption>
                ))}
              </View>
            )}
            <Input
              label="Confirm New Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Re-enter your new password"
              secureTextEntry
              autoCapitalize="none"
              containerStyle={styles.inputGap}
              error={confirmPassword.length > 0 && !passwordsMatch ? 'Passwords do not match' : undefined}
            />

            <Button
              label={submitting ? 'Resetting…' : 'Reset Password'}
              onPress={submitReset}
              disabled={submitting}
              loading={submitting}
              fullWidth
              size="lg"
            />
          </>
        )}

        {step === 'done' && (
          <View style={styles.doneWrap}>
            <View style={styles.doneIcon}>
              <CheckCircle2 size={40} color={colors.success} />
            </View>
            <Heading2 style={styles.title}>Password reset</Heading2>
            <Body style={styles.subtitle}>
              Your password has been changed and other devices have been signed out. Sign in with your new password.
            </Body>
            <Button
              label="Back to Sign In"
              onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Login' }] })}
              fullWidth
              size="lg"
              leftIcon={<KeyRound size={18} color={colors.textInverse} />}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (Colors: ColorTokens) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: Colors.background },
    content: { flex: 1, padding: Spacing.xl },
    backButton: {
      width: 36,
      height: 36,
      borderRadius: Radius.sm,
      backgroundColor: Colors.surfaceElevated,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.xl,
    },
    title: { marginBottom: Spacing.sm },
    subtitle: {
      fontSize: FontSize.sm,
      color: Colors.textMuted,
      lineHeight: FontSize.sm * 1.5,
      marginBottom: Spacing.xl,
    },
    errorText: { fontSize: FontSize.sm, color: Colors.error, marginBottom: Spacing.md },
    inputGap: { marginBottom: Spacing.md },
    otpRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
    otpBox: {
      flex: 1,
      height: 52,
      borderRadius: Radius.md,
      backgroundColor: Colors.surfaceElevated,
      borderWidth: 1,
      borderColor: Colors.border,
      color: Colors.textPrimary,
      textAlign: 'center',
      fontFamily: FontFamily.semibold,
      fontWeight: FontWeight.semibold,
      fontSize: FontSize.lg,
    },
    otpBoxFilled: { borderColor: Colors.accent },
    resendRow: { marginBottom: Spacing.lg },
    resendMuted: { fontSize: FontSize.sm, color: Colors.textMuted },
    resendLink: { fontSize: FontSize.sm, color: Colors.accent, fontWeight: FontWeight.semibold },
    checklist: { gap: 2, marginBottom: Spacing.md },
    checklistLabel: { color: Colors.textMuted },
    doneWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
    doneIcon: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: Colors.successDim,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.sm,
    },
  });
