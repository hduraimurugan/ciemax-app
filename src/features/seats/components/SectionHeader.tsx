import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SeatSection } from '@ctypes/models';
import { Colors, FontWeight, Spacing } from '@constants/theme';
import { Label } from '@shared/ui';
import { formatPrice } from '@shared/utils';
import { SeatPricing } from '@constants/config';

interface SectionHeaderProps {
  section: SeatSection;
}

const SECTION_CONFIG: Record<SeatSection, { label: string; color: string }> = {
  premium: { label: 'PREMIUM', color: Colors.accent },
  gold: { label: 'GOLD', color: Colors.gold },
  silver: { label: 'SILVER', color: Colors.silver },
};

export function SectionHeader({ section }: SectionHeaderProps) {
  const { label, color } = SECTION_CONFIG[section];
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

const styles = StyleSheet.create({
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
