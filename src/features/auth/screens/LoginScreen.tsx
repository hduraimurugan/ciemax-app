import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Eye, EyeOff, X } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@ctypes/navigation';
import { ColorTokens, FontFamily, FontSize, FontWeight, Spacing } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';
import { flushPendingAuthCallbacks, clearPendingAuthCallbacks } from '@hooks/useRequireAuth';
import { Button, Input } from '@shared/ui';
import { useAuthStore } from '@store/authStore';
import { authService } from '@services/authService';
import { signInWithGoogle } from '../utils/googleAuth';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const login = useAuthStore(s => s.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);

  const dismiss = () => {
    clearPendingAuthCallbacks();
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
  };

  const onSuccess = () => {
    const hadPending = navigation.canGoBack();
    flushPendingAuthCallbacks();
    if (hadPending) navigation.goBack();
    else navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
  };

  const submit = async () => {
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }
    setError(null);
    setHint(null);
    setSubmitting(true);
    const result = await login(email.trim(), password);
    setSubmitting(false);

    if (result.success) {
      onSuccess();
      return;
    }

    const err = result.error;
    if (!err) {
      setError('Login failed. Please try again.');
      return;
    }
    if (err.code === 'ACCOUNT_LOCKED') {
      const until = err.lockedUntil ? new Date(err.lockedUntil).toLocaleTimeString() : 'later';
      setError(`Account locked due to too many failed attempts. Try again after ${until}, or reset your password.`);
      return;
    }
    if (err.message?.toLowerCase().includes('not verified') || err.message?.toLowerCase().includes('unverified')) {
      // Matches the web app: bounce to OTP verification and resend a code.
      authService.sendOtp(email.trim(), 'signup').catch(() => {});
      navigation.navigate('Otp', { email: email.trim(), type: 'signup' });
      return;
    }
    setError(err.message);
    if (err.hint) setHint(err.hint);
  };

  const continueWithGoogle = async () => {
    setError(null);
    setGoogleSubmitting(true);
    const google = await signInWithGoogle();
    if (google.cancelled) {
      setGoogleSubmitting(false);
      return;
    }
    if (google.error || !google.idToken) {
      setGoogleSubmitting(false);
      setError(google.error ?? 'Google sign-in failed.');
      return;
    }
    const result = await useAuthStore.getState().googleLogin(google.idToken);
    setGoogleSubmitting(false);
    if (result.success) {
      onSuccess();
    } else {
      setError(result.error?.message ?? 'Google sign-in failed.');
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.kav}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {navigation.canGoBack() && (
            <Pressable style={styles.closeButton} onPress={dismiss} hitSlop={8}>
              <X size={18} color={colors.textPrimary} />
            </Pressable>
          )}

          <Text style={styles.wordmark}>CineHall</Text>
          <Text style={styles.subtitle}>Sign in to book your next show</Text>

          {error ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          ) : null}
          {hint ? <Text style={styles.hintText}>{hint}</Text> : null}

          <Input
            label="EMAIL ADDRESS"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            containerStyle={styles.inputGap}
          />

          <Input
            label="PASSWORD"
            value={password}
            onChangeText={setPassword}
            placeholder="Your password"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            containerStyle={styles.inputGap}
            rightIcon={
              <Pressable onPress={() => setShowPassword(s => !s)} hitSlop={8}>
                {showPassword ? (
                  <EyeOff size={18} color={colors.textMuted} />
                ) : (
                  <Eye size={18} color={colors.textMuted} />
                )}
              </Pressable>
            }
          />

          <Pressable onPress={() => navigation.navigate('ForgotPassword')} style={styles.forgotLink}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </Pressable>

          <Button
            label={submitting ? 'Signing in…' : 'Continue with Email'}
            onPress={submit}
            disabled={submitting}
            loading={submitting}
            fullWidth
            size="lg"
            style={styles.continueBtn}
          />

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <Button
            label={googleSubmitting ? 'Connecting…' : 'Continue with Google'}
            onPress={continueWithGoogle}
            disabled={googleSubmitting}
            fullWidth
            size="lg"
            variant="secondary"
          />
          {googleSubmitting && <ActivityIndicator style={styles.googleSpinner} color={colors.accent} />}

          <Pressable onPress={() => navigation.navigate('Register')} style={styles.signupRow}>
            <Text style={styles.signupText}>
              Don&apos;t have an account? <Text style={styles.signupLink}>Sign Up</Text>
            </Text>
          </Pressable>
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
      padding: Spacing.xl,
    },
    closeButton: {
      alignSelf: 'flex-end',
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: Colors.surfaceElevated,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.md,
    },
    wordmark: {
      fontFamily: FontFamily.bold,
      fontWeight: FontWeight.bold,
      fontSize: FontSize.xl,
      color: Colors.textPrimary,
      marginBottom: Spacing.xs,
    },
    subtitle: {
      fontSize: FontSize.sm,
      color: Colors.textMuted,
      marginBottom: Spacing.xl,
    },
    errorBanner: {
      backgroundColor: Colors.errorDim,
      borderRadius: 10,
      padding: Spacing.md,
      marginBottom: Spacing.md,
    },
    errorBannerText: { color: Colors.error, fontSize: FontSize.sm },
    hintText: { color: Colors.warning, fontSize: FontSize.xs, marginBottom: Spacing.md },
    inputGap: { marginBottom: Spacing.md },
    forgotLink: { alignSelf: 'flex-end', marginBottom: Spacing.lg },
    forgotText: { color: Colors.accent, fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
    continueBtn: { marginBottom: Spacing.md },
    dividerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm + 2,
      marginVertical: Spacing.sm,
    },
    dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
    dividerText: { fontSize: FontSize.xs, color: Colors.textMuted },
    googleSpinner: { marginTop: Spacing.sm },
    signupRow: { alignItems: 'center', marginTop: Spacing.xl },
    signupText: { fontSize: FontSize.sm, color: Colors.textMuted },
    signupLink: { color: Colors.accent, fontWeight: FontWeight.semibold },
  });
