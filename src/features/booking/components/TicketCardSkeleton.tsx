import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { ColorTokens, Radius, Spacing } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';
import { Skeleton, SkeletonGroup } from '@shared/ui';

interface TicketCardSkeletonProps {
  /** Show a larger "Amount Paid" block below the detail rows (BookingSuccessScreen's layout). */
  showAmount?: boolean;
  rows?: number;
}

/**
 * Mirrors the ticket-card shape shared by TicketDetailScreen and
 * BookingSuccessScreen: a status/brand line, a QR square, and a stack of
 * label/value detail rows.
 */
export function TicketCardSkeleton({ showAmount = false, rows = 4 }: TicketCardSkeletonProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <SkeletonGroup label="Loading ticket" style={styles.card}>
      <Skeleton width={140} height={12} radius={4} style={styles.statusLabel} />
      <View style={styles.qrFrame}>
        <Skeleton width={140} height={140} radius={Radius.md} />
      </View>
      <Skeleton width={160} height={14} radius={4} style={styles.ticketId} />

      <View style={styles.divider} />

      <View style={styles.detailRows}>
        {Array.from({ length: rows }).map((_, i) => (
          <View key={i} style={styles.detailRow}>
            <Skeleton width={80} height={12} radius={4} />
            <Skeleton width={110} height={12} radius={4} />
          </View>
        ))}
      </View>

      {showAmount && (
        <View style={styles.amountBlock}>
          <Skeleton width={100} height={12} radius={4} style={styles.amountLabel} />
          <Skeleton width={140} height={26} radius={4} />
        </View>
      )}
    </SkeletonGroup>
  );
}

const makeStyles = (Colors: ColorTokens) =>
  StyleSheet.create({
    card: {
      width: '100%',
      backgroundColor: Colors.surface,
      borderWidth: 1,
      borderColor: Colors.border,
      borderRadius: Radius.xl,
      padding: Spacing.lg,
      alignItems: 'center',
    },
    statusLabel: { marginBottom: Spacing.md },
    qrFrame: { padding: Spacing.sm },
    ticketId: { marginTop: Spacing.md, marginBottom: Spacing.lg },
    divider: { width: '100%', height: 1, backgroundColor: Colors.border, marginBottom: Spacing.md },
    detailRows: { width: '100%', gap: Spacing.sm + 4 },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between' },
    amountBlock: { width: '100%', alignItems: 'center', marginTop: Spacing.lg, gap: Spacing.xs },
    amountLabel: {},
  });
