import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { SeatSection } from '@ctypes/models';
import { ColorTokens, FontWeight, Spacing } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';
import { Label } from '@shared/ui';
import { formatPrice } from '@shared/utils';

interface SectionHeaderProps {
  section: SeatSection;
  /** Real per-show price for this section (server-computed — price_override
   * wins over the screen's base pricing). Passed in rather than read from a
   * static config, since seat prices vary per show. */
  price: number;
}

export function SectionHeader({ section, price }: SectionHeaderProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const sectionConfig: Record<SeatSection, { label: string; color: string }> = {
    premium: { label: 'PREMIUM', color: colors.gold },
    gold: { label: 'STANDARD', color: colors.textMuted },
    silver: { label: 'SILVER', color: colors.silver },
    // Passage/aisle seats never get a section header rendered for them —
    // this entry only exists to satisfy the Record<SeatSection, ...> type.
    passage: { label: '', color: colors.transparent },
  };
  const { label, color } = sectionConfig[section];

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
