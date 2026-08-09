import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@ctypes/navigation';
import { ColorTokens, FontFamily, FontSize, FontWeight, Spacing } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';
import { Button, Input } from '@shared/ui';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [email, setEmail] = useState('');

  const continueWithEmail = () => navigation.navigate('Otp', { email });

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.kav}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.wordmark}>CineHall</Text>
          <Text style={styles.subtitle}>Sign in to book your next show</Text>

          <Input
            label="EMAIL ADDRESS"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            containerStyle={styles.inputGap}
          />

          <Button label="Continue with Email" onPress={continueWithEmail} fullWidth size="lg" style={styles.continueBtn} />

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <Button label="Continue with Google" onPress={() => {}} fullWidth size="lg" variant="secondary" />
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
      marginBottom: Spacing.xxl,
    },
    inputGap: { marginBottom: Spacing.lg },
    continueBtn: { marginTop: Spacing.sm, marginBottom: Spacing.md },
    dividerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm + 2,
      marginVertical: Spacing.sm,
    },
    dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
    dividerText: { fontSize: FontSize.xs, color: Colors.textMuted },
  });
