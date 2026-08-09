import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { ColorTokens, FontSize, Spacing } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';
import { Label, Skeleton, SkeletonGroup } from '@shared/ui';

/**
 * Mirrors PriceBreakdown's row layout — used by CheckoutScreen while
 * getSettings() is still resolving, so the fee/GST amounts don't visibly
 * jump from the hardcoded defaults to the server values.
 */
export function PriceBreakdownSkeleton() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <SkeletonGroup label="Loading price breakdown" style={styles.container}>
      <Label>Price Breakdown</Label>
      <View style={styles.rows}>
        <Row />
        <Row />
        <Row />
        <View style={styles.divider} />
        <View style={styles.totalRow}>
          <Skeleton width={90} height={FontSize.md} radius={4} />
          <Skeleton width={80} height={FontSize.xl} radius={4} />
        </View>
      </View>
    </SkeletonGroup>
  );
}

function Row() {
  return (
    <View style={rowStyles.row}>
      <Skeleton width={110} height={FontSize.sm} radius={4} />
      <Skeleton width={60} height={FontSize.sm} radius={4} />
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});

const makeStyles = (Colors: ColorTokens) =>
  StyleSheet.create({
    container: { gap: Spacing.md },
    rows: { gap: Spacing.sm },
    divider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.xs },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  });
