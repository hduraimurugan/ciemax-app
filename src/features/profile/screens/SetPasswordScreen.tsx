import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Check, X } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@ctypes/navigation';
import { ColorTokens, FontSize, Radius, Spacing } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';
import { Button, Heading2, Body, Input, Caption } from '@shared/ui';
import { authService } from '@services/authService';
import { errorMessage } from '@services/httpClient';
import { evaluatePassword, isPasswordValid } from '@features/auth/utils/passwordPolicy';
import { useAuthStore } from '@store/authStore';

type Props = NativeStackScreenProps<RootStackParamList, 'SetPassword'>;

export function SetPasswordScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const refreshCustomer = useAuthStore(s => s.refreshCustomer);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const rules = evaluatePassword(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  async function submit() {
    if (!isPasswordValid(newPassword)) {
      setError('Your password doesn’t meet all the requirements below.');
      return;
    }
    if (!passwordsMatch) {
      setError('Passwords do not match.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await authService.setPassword(newPassword);
      await refreshCustomer();
      navigation.goBack();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()} hitSlop={8}>
          <ArrowLeft size={18} color={colors.textPrimary} />
        </Pressable>
        <Heading2>Set Password</Heading2>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Body style={styles.subtitle}>
          You signed up with Google. Set a password to also sign in with your email.
        </Body>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Input label="New Password" value={newPassword} onChangeText={setNewPassword} secureTextEntry autoCapitalize="none" containerStyle={styles.inputGap} />

        {newPassword.length > 0 && (
          <View style={styles.checklist}>
            {rules.map(rule => (
              <View key={rule.key} style={styles.checklistRow}>
                {rule.passed ? <Check size={13} color={colors.success} /> : <X size={13} color={colors.textMuted} />}
                <Caption style={[styles.checklistLabel, rule.passed && { color: colors.success }]}>{rule.label}</Caption>
              </View>
            ))}
          </View>
        )}

        <Input
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          autoCapitalize="none"
          containerStyle={styles.inputGap}
          error={confirmPassword.length > 0 && !passwordsMatch ? 'Passwords do not match' : undefined}
        />

        <Button label={submitting ? 'Saving…' : 'Set Password'} onPress={submit} disabled={submitting} loading={submitting} fullWidth size="lg" />
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (Colors: ColorTokens) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: Colors.background },
    header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.lg },
    backBtn: {
      width: 34,
      height: 34,
      borderRadius: Radius.md,
      backgroundColor: Colors.surfaceElevated,
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl, gap: Spacing.sm },
    subtitle: { color: Colors.textMuted, marginBottom: Spacing.md },
    errorText: { color: Colors.error, fontSize: FontSize.sm, marginBottom: Spacing.sm },
    inputGap: { marginBottom: Spacing.sm },
    checklist: { gap: 2, marginBottom: Spacing.sm },
    checklistRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
    checklistLabel: { color: Colors.textMuted },
  });
