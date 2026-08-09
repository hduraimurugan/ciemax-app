import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { ColorTokens, Radius, Spacing } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';
import { Skeleton, SkeletonGroup } from '@shared/ui';

/** Mirrors MyBookingsScreen's BookingCard (poster + title/meta + seat pills + footer). */
export function BookingCardSkeleton() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <Skeleton width={48} height={72} radius={Radius.sm} />
        <View style={styles.cardContent}>
          <Skeleton width="80%" height={16} radius={4} />
          <Skeleton width="55%" height={11} radius={4} />
          <Skeleton width="40%" height={11} radius={4} />
          <View style={styles.seatPills}>
            <Skeleton width={36} height={18} radius={Radius.full} />
            <Skeleton width={36} height={18} radius={Radius.full} />
            <Skeleton width={36} height={18} radius={Radius.full} />
          </View>
        </View>
      </View>
      <View style={styles.footer}>
        <Skeleton width={70} height={11} radius={4} />
        <Skeleton width={90} height={11} radius={4} />
      </View>
    </View>
  );
}

/** 4 stacked BookingCardSkeletons matching MyBookingsScreen's list padding. */
export function BookingListSkeleton() {
  return (
    <SkeletonGroup label="Loading bookings" style={styles.list}>
      <BookingCardSkeleton />
      <BookingCardSkeleton />
      <BookingCardSkeleton />
      <BookingCardSkeleton />
    </SkeletonGroup>
  );
}

const styles = StyleSheet.create({
  list: { padding: Spacing.md, gap: Spacing.sm },
});

const makeStyles = (Colors: ColorTokens) =>
  StyleSheet.create({
    card: {
      backgroundColor: Colors.surface,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: Colors.border,
      padding: Spacing.md,
      gap: Spacing.sm,
    },
    cardRow: { flexDirection: 'row', gap: Spacing.sm },
    cardContent: { flex: 1, gap: Spacing.xs, justifyContent: 'center' },
    seatPills: { flexDirection: 'row', gap: 4, marginTop: 2 },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: Spacing.sm,
      borderTopWidth: 1,
      borderTopColor: Colors.border,
    },
  });
