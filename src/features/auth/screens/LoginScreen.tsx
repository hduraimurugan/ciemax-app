import React, { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@ctypes/navigation';
import { Colors, Spacing } from '@constants/theme';
import { Button, Input } from '@shared/ui';
import { Heading1, Body, Caption } from '@shared/ui';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Heading1>🎬 Welcome back</Heading1>
          <Body>Sign in to continue booking tickets</Body>
        </View>

        <View style={styles.form}>
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

          <Button label="Sign In" onPress={() => navigation.goBack()} fullWidth size="lg" />

          <Pressable onPress={() => navigation.navigate('Register')}>
            <Caption style={styles.registerLink}>
              Don't have an account? <Caption style={styles.linkAccent}>Register</Caption>
            </Caption>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  content: {
    flex: 1,
    padding: Spacing.lg,
    justifyContent: 'center',
    gap: Spacing.xl,
  },
  header: { gap: Spacing.sm },
  form: { gap: Spacing.lg },
  registerLink: { textAlign: 'center' },
  linkAccent: { color: Colors.accent },
});
