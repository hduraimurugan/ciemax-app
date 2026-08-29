import React, { useMemo } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { ColorTokens, FontSize, FontWeight, Radius, Spacing } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';

type BadgeVariant = 'default' | 'accent' | 'success' | 'warning' | 'error' | 'gold' | 'silver' | 'premium' | 'violet' | 'zinc' | 'info';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  /** Adds a soft glow in the variant's own color — reserve for a single standout badge, not every instance. */
  glow?: boolean;
  style?: ViewStyle;
}

export function Badge({ label, variant = 'default', glow, style }: BadgeProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={[styles.container, styles[variant], glow && styles[`glow_${variant}`], style]}>
      <Text style={[styles.text, styles[`text_${variant}`]]}>{label}</Text>
    </View>
  );
}

const makeStyles = (Colors: ColorTokens) => {
  const glowFor = (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  });

  return StyleSheet.create({
    container: {
      paddingHorizontal: Spacing.sm,
      paddingVertical: 2,
      borderRadius: Radius.full,
      alignSelf: 'flex-start',
      borderWidth: 1,
      borderColor: Colors.transparent,
    },
    text: {
      fontSize: FontSize.xs,
      fontWeight: FontWeight.semibold,
      letterSpacing: 0.4,
    },

    default: { backgroundColor: Colors.surfaceElevated, borderColor: Colors.border },
    accent: { backgroundColor: Colors.accentLight, borderColor: Colors.accent },
    success: { backgroundColor: Colors.successDim, borderColor: Colors.success },
    warning: { backgroundColor: Colors.warningDim, borderColor: Colors.warning },
    error: { backgroundColor: Colors.errorDim, borderColor: Colors.error },
    gold: { backgroundColor: Colors.goldDim, borderColor: Colors.gold },
    silver: { backgroundColor: Colors.silverDim, borderColor: Colors.silver },
    premium: { backgroundColor: Colors.accentLight, borderColor: Colors.accent },
    violet: { backgroundColor: Colors.violetDim, borderColor: Colors.violet },
    zinc: { backgroundColor: Colors.zincSurface, borderColor: Colors.border },
    info: { backgroundColor: Colors.infoDim, borderColor: Colors.info },

    glow_default: glowFor(Colors.border),
    glow_accent: glowFor(Colors.accent),
    glow_success: glowFor(Colors.success),
    glow_warning: glowFor(Colors.warning),
    glow_error: glowFor(Colors.error),
    glow_gold: glowFor(Colors.gold),
    glow_silver: glowFor(Colors.silver),
    glow_premium: glowFor(Colors.accent),
    glow_violet: glowFor(Colors.violet),
    glow_zinc: glowFor(Colors.border),
    glow_info: glowFor(Colors.info),

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
};
