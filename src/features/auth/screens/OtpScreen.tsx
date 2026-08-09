import React, { useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@ctypes/navigation';
import { ColorTokens, FontFamily, FontSize, FontWeight, Radius, Spacing } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';
import { useCountdown } from '@hooks/useCountdown';
import { Button, Heading2 } from '@shared/ui';

type Props = NativeStackScreenProps<RootStackParamList, 'Otp'>;

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

export function OtpScreen({ navigation, route }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const inputs = useRef<Array<TextInput | null>>([]);
  const { seconds, reset } = useCountdown(RESEND_SECONDS);

  const email = route.params?.email || '';
  const maskedEmail = (email || 'you@example.com').replace(/(.{2}).+(@.+)/, '$1***$2');

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

  const verify = () => navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
  const resend = () => reset(RESEND_SECONDS);

  const resendLabel = seconds > 0 ? `Resend code in 0:${String(seconds).padStart(2, '0')}` : '';

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()} hitSlop={8}>
          <ArrowLeft size={18} color={colors.textPrimary} />
        </Pressable>

        <Heading2 style={styles.title}>Verify your email</Heading2>
        <Text style={styles.subtitle}>We sent a 6-digit code to{'\n'}{maskedEmail}</Text>

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

        <Button label="Verify & Continue" onPress={verify} fullWidth size="lg" />
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
    otpRow: {
      flexDirection: 'row',
      gap: Spacing.sm,
      marginBottom: Spacing.lg,
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
