import React, { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { ColorTokens, Spacing } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';
import { Body } from './Typography';

interface LoaderProps {
  message?: string;
  fullScreen?: boolean;
  size?: 'small' | 'large';
}

export function Loader({ message, fullScreen = false, size = 'large' }: LoaderProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <ActivityIndicator size={size} color={colors.accent} />
      {message ? (
        <Body style={styles.message}>{message}</Body>
      ) : null}
    </View>
  );
}

const makeStyles = (Colors: ColorTokens) =>
  StyleSheet.create({
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
