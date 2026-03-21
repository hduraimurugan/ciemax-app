import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors, Spacing } from '@constants/theme';
import { Body, BodySmall, Heading3, Label } from '@shared/ui';
import { formatPrice } from '@shared/utils';

interface PriceBreakdownProps {
  subtotal: number;
  convenienceFee: number;
  discount?: number;
}

export function PriceBreakdown({ subtotal, convenienceFee, discount = 0 }: PriceBreakdownProps) {
  const total = subtotal + convenienceFee - discount;

  return (
    <View style={styles.container}>
      <Label>Price Breakdown</Label>

      <View style={styles.rows}>
        <Row label="Subtotal" value={formatPrice(subtotal)} />
        <Row label="Convenience Fee" value={formatPrice(convenienceFee)} />
        {discount > 0 && (
          <Row
            label="Discount"
            value={`-${formatPrice(discount)}`}
            valueColor={Colors.success}
          />
        )}
        <View style={styles.divider} />
        <View style={styles.totalRow}>
          <Heading3>Total</Heading3>
          <Heading3 style={styles.totalAmount}>{formatPrice(total)}</Heading3>
        </View>
      </View>
    </View>
  );
}

function Row({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View style={styles.row}>
      <Body>{label}</Body>
      <BodySmall style={[styles.value, valueColor ? { color: valueColor } : undefined]}>
        {value}
      </BodySmall>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.md },
  rows: { gap: Spacing.sm },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  value: { color: Colors.textPrimary },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.xs,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalAmount: { color: Colors.accent },
});
