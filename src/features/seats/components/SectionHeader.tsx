import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { SeatSection } from '@ctypes/models';
import { ColorTokens, FontWeight, Spacing } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';
import { Label } from '@shared/ui';
import { formatPrice } from '@shared/utils';
import { SeatPricing } from '@constants/config';

interface SectionHeaderProps {
  section: SeatSection;
}

export function SectionHeader({ section }: SectionHeaderProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const sectionConfig: Record<SeatSection, { label: string; color: string }> = {
    premium: { label: 'PREMIUM', color: colors.gold },
    gold: { label: 'STANDARD', color: colors.textMuted },
    silver: { label: 'SILVER', color: colors.silver },
  };
  const { label, color } = sectionConfig[section];
  const price = SeatPricing[section];

  return (
    <View style={styles.container}>
      <View style={[styles.line, { backgroundColor: color }]} />
      <Label style={[styles.label, { color }]}>{label}</Label>
      <Label style={styles.price}>{formatPrice(price)}</Label>
      <View style={[styles.line, { backgroundColor: color }]} />
    </View>
  );
}

const makeStyles = (Colors: ColorTokens) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: Spacing.md,
      gap: Spacing.sm,
    },
    line: {
      flex: 1,
      height: 1,
      opacity: 0.4,
    },
    label: {
      fontWeight: FontWeight.bold,
      letterSpacing: 1.5,
    },
    price: {
      color: Colors.textMuted,
    },
  });
