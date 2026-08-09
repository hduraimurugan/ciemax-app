import React, { useMemo } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { ColorTokens, FontSize, FontWeight, Radius, Spacing } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';

type BadgeVariant = 'default' | 'accent' | 'success' | 'warning' | 'error' | 'gold' | 'silver' | 'premium' | 'violet' | 'zinc' | 'info';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

export function Badge({ label, variant = 'default', style }: BadgeProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={[styles.container, styles[variant], style]}>
      <Text style={[styles.text, styles[`text_${variant}`]]}>{label}</Text>
    </View>
  );
}

const makeStyles = (Colors: ColorTokens) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: Spacing.sm,
      paddingVertical: 2,
      borderRadius: Radius.full,
      alignSelf: 'flex-start',
    },
    text: {
      fontSize: FontSize.xs,
      fontWeight: FontWeight.semibold,
      letterSpacing: 0.4,
    },

    default: { backgroundColor: Colors.surfaceElevated },
    accent: { backgroundColor: Colors.accentLight },
    success: { backgroundColor: Colors.successDim },
    warning: { backgroundColor: 'rgba(227, 167, 94, 0.15)' },
    error: { backgroundColor: Colors.errorDim },
    gold: { backgroundColor: Colors.goldDim },
    silver: { backgroundColor: Colors.silverDim },
    premium: { backgroundColor: Colors.accentLight },
    violet: { backgroundColor: Colors.violetDim },
    zinc: { backgroundColor: Colors.zincSurface },
    info: { backgroundColor: 'rgba(108, 156, 235, 0.15)' },

    text_default: { color: Colors.textSecondary },
    text_accent: { color: Colors.accent },
    text_success: { color: Colors.success },
    text_warning: { color: Colors.warning },
    text_error: { color: Colors.error },
    text_gold: { color: Colors.gold },
    text_silver: { color: Colors.silver },
    text_premium: { color: Colors.accent },
    text_violet: { color: Colors.violet },
    text_zinc: { color: Colors.textSecondary },
    text_info: { color: Colors.info },
  });
