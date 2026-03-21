import React, { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, ShieldCheck } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@ctypes/navigation';
import { Colors, FontFamily, FontSize, FontWeight, Radius, Spacing } from '@constants/theme';
import { Button, Card, Input } from '@shared/ui';
import { Heading2, Body, Caption } from '@shared/ui';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;
type Step = 'form' | 'otp';

export function RegisterScreen({ navigation }: Props) {
  const [step, setStep] = useState<Step>('form');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [resendSeconds, setResendSeconds] = useState(60);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (step !== 'otp' || resendSeconds <= 0) return;
    const timer = setInterval(() => setResendSeconds(s => s - 1), 1000);
    return () => clearInterval(timer);
  }, [step, resendSeconds]);

  function handleOtpChange(value: string, index: number) {
    const newOtp = [...otp];
    newOtp[index] = value.replace(/[^0-9]/g, '').slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyPress(key: string, index: number) {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.kav}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Logo */}
          <View style={styles.brandRow}>
            <Text style={styles.logo}>CINEBOOK</Text>
          </View>

          <Card variant="glass" padding="none" style={styles.formCard}>
            {/* Tab bar */}
            <View style={styles.tabs}>
              <Pressable style={styles.tab} onPress={() => navigation.replace('Login')}>
                <Text style={styles.tabText}>Login</Text>
              </Pressable>
              <View style={[styles.tab, styles.tabActive]}>
                <Text style={[styles.tabText, styles.tabTextActive]}>Sign Up</Text>
              </View>
            </View>

            {step === 'form' ? (
              <View style={styles.formBody}>
                <View style={styles.iconRow}>
                  <View style={styles.iconCircle}>
                    <User size={24} color={Colors.accent} />
                  </View>
                  <Heading2 style={styles.formTitle}>Create Account</Heading2>
                  <Body style={styles.formSub}>Join CineBook to start booking</Body>
                </View>

                <Input label="Full Name" value={name} onChangeText={setName} placeholder="Your name" />
                <Input
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <Input
                  label="Phone"
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
                />

                <Button
                  label="Create Account"
                  onPress={() => setStep('otp')}
                  fullWidth
                  size="lg"
                />
              </View>
            ) : (
              <View style={styles.formBody}>
                <View style={styles.iconRow}>
                  <View style={styles.iconCircleGray}>
                    <ShieldCheck size={24} color={Colors.textSecondary} />
                  </View>
                  <Heading2 style={styles.formTitle}>Verify Your Phone</Heading2>
                  <Body style={styles.formSub}>
                    Enter the 6-digit OTP sent to {phone || 'your number'}
                  </Body>
                </View>

                {/* OTP boxes */}
                <View style={styles.otpRow}>
                  {otp.map((digit, i) => (
                    <TextInput
                      key={i}
                      ref={el => { inputRefs.current[i] = el; }}
                      style={[styles.otpBox, digit ? styles.otpBoxFilled : null]}
                      value={digit}
                      onChangeText={v => handleOtpChange(v, i)}
                      onKeyPress={({ nativeEvent }) => handleOtpKeyPress(nativeEvent.key, i)}
                      keyboardType="numeric"
                      maxLength={1}
                      textAlign="center"
                      selectTextOnFocus
                    />
                  ))}
                </View>

                <Button
                  label="Verify OTP"
                  onPress={() => navigation.navigate('Login')}
                  fullWidth
                  size="lg"
                />

                {resendSeconds > 0 ? (
                  <Caption style={styles.resendTimer}>
                    Resend OTP in {resendSeconds}s
                  </Caption>
                ) : (
                  <Pressable onPress={() => setResendSeconds(60)}>
                    <Caption style={styles.resendLink}>Resend OTP</Caption>
                  </Pressable>
                )}
              </View>
            )}
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
  iconCircleGray: {
    width: 56,
    height: 56,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceElevated,
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
  // OTP
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  otpBox: {
    width: 44,
    height: 54,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceElevated,
    color: Colors.textPrimary,
    fontSize: FontSize.xl,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
    textAlign: 'center',
  },
  otpBoxFilled: {
    borderColor: Colors.accent,
  },
  resendTimer: {
    textAlign: 'center',
    color: Colors.textMuted,
  },
  resendLink: {
    textAlign: 'center',
    color: Colors.accent,
    textDecorationLine: 'underline',
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
