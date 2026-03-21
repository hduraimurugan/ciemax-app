import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Colors, Spacing } from '@constants/theme';
import { Body } from './Typography';

interface LoaderProps {
  message?: string;
  fullScreen?: boolean;
  size?: 'small' | 'large';
}

export function Loader({ message, fullScreen = false, size = 'large' }: LoaderProps) {
  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <ActivityIndicator size={size} color={Colors.accent} />
      {message ? (
        <Body style={styles.message}>{message}</Body>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  message: {
    textAlign: 'center',
  },
});
