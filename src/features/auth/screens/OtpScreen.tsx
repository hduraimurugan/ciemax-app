import React, { useMemo, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Mail } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@ctypes/navigation';
import { ColorTokens, FontFamily, FontSize, FontWeight, Radius, Spacing } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';
import { useCountdown } from '@hooks/useCountdown';
import { flushPendingAuthCallbacks } from '@hooks/useRequireAuth';
import { Button } from '@shared/ui';
import { authService } from '@services/authService';
import { errorMessage } from '@services/httpClient';
import { useAuthStore } from '@store/authStore';
import { AuthCard } from '../components/AuthCard';

type Props = NativeStackScreenProps<RootStackParamList, 'Otp'>;

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

export function OtpScreen({ navigation, route }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputs = useRef<Array<TextInput | null>>([]);
  const { seconds, reset } = useCountdown(RESEND_SECONDS);
  const login = useAuthStore(s => s.login);

  const { email, type, password } = route.params;
  const maskedEmail = email.replace(/(.{2}).+(@.+)/, '$1***$2');
  const code = otp.join('');

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

  const verify = async () => {
    if (code.length !== OTP_LENGTH) {
      setError('Enter the full 6-digit code.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await authService.verifyOtp(email, code, type);

      if (password) {
        // Came from Register — log straight in with the password already collected.
        const result = await login(email, password);
        setSubmitting(false);
        if (!result.success) {
          setError(result.error?.message ?? 'Verified, but sign-in failed. Please log in manually.');
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
          return;
        }
        flushPendingAuthCallbacks();
        navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
        return;
      }

      // Bounced here from an "email not verified" login attempt.
      setSubmitting(false);
      Alert.alert('Email verified', 'You can now sign in.');
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    } catch (err) {
      setSubmitting(false);
      setError(errorMessage(err, 'Invalid code. Please try again.'));
    }
  };

  const resend = async () => {
    reset(RESEND_SECONDS);
    try {
      await authService.sendOtp(email, type);
    } catch (err) {
      setError(errorMessage(err, 'Could not resend the code. Try again shortly.'));
    }
  };

  const resendLabel = seconds > 0 ? `Resend code in 0:${String(seconds).padStart(2, '0')}` : '';

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()} hitSlop={8}>
          <ArrowLeft size={18} color={colors.textPrimary} />
        </Pressable>

        <AuthCard
          icon={<Mail size={24} color={colors.accent} />}
          title="Verify your email"
          subtitle={`We sent a 6-digit code to\n${maskedEmail}`}
          error={error}>
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

          <Button
            label={submitting ? 'Verifying…' : 'Verify & Continue'}
            onPress={verify}
            disabled={submitting}
            loading={submitting}
            fullWidth
            size="lg"
          />
        </AuthCard>
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
    otpRow: {
      flexDirection: 'row',
      gap: Spacing.sm,
    },
    otpBox: {
      flex: 1,
      height: 56,
      borderRadius: Radius.md,
      backgroundColor: Colors.surfaceElevated,
      borderWidth: 1,
      borderColor: Colors.border,
      color: Colors.textPrimary,
      textAlign: 'center',
      fontFamily: FontFamily.semibold,
      fontWeight: FontWeight.semibold,
      fontSize: FontSize.xl,
    },
    otpBoxFilled: {
      borderColor: Colors.accent,
    },
    resendRow: { marginBottom: Spacing.xl },
    resendMuted: { fontSize: FontSize.sm, color: Colors.textMuted },
    resendLink: { fontSize: FontSize.sm, color: Colors.accent, fontWeight: FontWeight.semibold },
  });
