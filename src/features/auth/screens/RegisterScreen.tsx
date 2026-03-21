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

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()}>
            <Body style={styles.back}>← Back</Body>
          </Pressable>
          <Heading1>Create Account</Heading1>
          <Body>Join CineBook to start booking tickets</Body>
        </View>

        <View style={styles.form}>
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
          <Button label="Create Account" onPress={() => navigation.navigate('Login')} fullWidth size="lg" />
          <Pressable onPress={() => navigation.navigate('Login')}>
            <Caption style={styles.loginLink}>
              Already have an account? <Caption style={styles.linkAccent}>Sign In</Caption>
            </Caption>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, padding: Spacing.lg, gap: Spacing.xl },
  header: { gap: Spacing.sm, marginTop: Spacing.md },
  back: { color: Colors.accent },
  form: { gap: Spacing.lg },
  loginLink: { textAlign: 'center' },
  linkAccent: { color: Colors.accent },
});
