import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Radius, Spacing } from '@constants/theme';
import { Skeleton, SkeletonGroup } from '@shared/ui';
import { SEAT_GAP, SEAT_SIZE } from './SeatItem';

const ROWS = 8;
const COLS = 12;

/** Mirrors SeatGrid's screen arc + seat grid, at SeatItem's exact size/gap. */
export function SeatGridSkeleton() {
  return (
    <SkeletonGroup label="Loading seats" style={styles.container}>
      <Skeleton width={220} height={34} radius={Radius.lg} style={styles.screenArc} />
      {Array.from({ length: ROWS }).map((_row, r) => (
        <View key={r} style={styles.row}>
          {Array.from({ length: COLS }).map((_col, c) => (
            <Skeleton key={c} width={SEAT_SIZE} height={SEAT_SIZE} radius={Radius.xs} style={styles.seat} />
          ))}
        </View>
      ))}
    </SkeletonGroup>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', paddingTop: Spacing.lg, paddingHorizontal: Spacing.md },
  screenArc: { marginBottom: Spacing.lg },
  row: { flexDirection: 'row' },
  seat: { margin: SEAT_GAP / 2 },
});
