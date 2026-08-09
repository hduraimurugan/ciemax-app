import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { ColorTokens, FontSize, FontWeight, Spacing } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';
import { Body, BodySmall, Heading2, Label } from '@shared/ui';
import { formatPrice } from '@shared/utils';

interface PriceBreakdownProps {
  subtotal: number;
  convenienceFee: number;
  gst?: number;
  discount?: number;
}

export function PriceBreakdown({
  subtotal,
  convenienceFee,
  gst = 0,
  discount = 0,
}: PriceBreakdownProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const total = subtotal + convenienceFee + gst - discount;

  return (
    <View style={styles.container}>
      <Label>Price Breakdown</Label>

      <View style={styles.rows}>
        <Row label="Ticket Price" value={formatPrice(subtotal)} colors={colors} />
        <Row label="Convenience Fee" value={formatPrice(convenienceFee)} hint="₹30 per seat" colors={colors} />
        {gst > 0 && <Row label="GST (18%)" value={formatPrice(gst)} colors={colors} />}
        {discount > 0 && (
          <Row
            label="Discount"
            value={`-${formatPrice(discount)}`}
            valueColor={colors.success}
            colors={colors}
          />
        )}
        <View style={styles.divider} />
        <View style={styles.totalRow}>
          <Body style={styles.totalLabel}>Grand Total</Body>
          <Heading2 style={styles.totalAmount}>{formatPrice(total)}</Heading2>
        </View>
      </View>
    </View>
  );
}

function Row({
  label,
  value,
  valueColor,
  hint,
  colors,
}: {
  label: string;
  value: string;
  valueColor?: string;
  hint?: string;
  colors: ColorTokens;
}) {
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <Body>{label}</Body>
        {hint ? <BodySmall style={styles.hint}>{hint}</BodySmall> : null}
      </View>
      <BodySmall style={[styles.value, valueColor ? { color: valueColor } : undefined]}>
        {value}
      </BodySmall>
    </View>
  );
}

const makeStyles = (Colors: ColorTokens) =>
  StyleSheet.create({
    container: { gap: Spacing.md },
    rows: { gap: Spacing.sm },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    rowLeft: { flex: 1 },
    hint: {
      color: Colors.textMuted,
      fontSize: FontSize.xs,
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
    totalLabel: {
      color: Colors.textPrimary,
      fontWeight: FontWeight.semibold,
    },
    totalAmount: {
      color: Colors.accent,
      fontSize: FontSize.xl,
      fontWeight: FontWeight.bold,
    },
  });
