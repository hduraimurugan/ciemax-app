import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ColorTokens, Radius, Spacing } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';
import { Skeleton, SkeletonGroup } from '@shared/ui';

/** Mirrors the cinemaCard/hallCard layout shared by ShowtimesScreen and TheatresScreen. */
export function TheatreCardSkeleton() {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.info}>
          <Skeleton width="65%" height={16} radius={4} style={styles.name} />
          <Skeleton width="45%" height={12} radius={4} />
        </View>
        <Skeleton width={17} height={17} radius={Radius.full} />
      </View>
      <View style={styles.chipsRow}>
        <Skeleton width={64} height={38} radius={Radius.md} />
        <Skeleton width={64} height={38} radius={Radius.md} />
        <Skeleton width={64} height={38} radius={Radius.md} />
        <Skeleton width={64} height={38} radius={Radius.md} />
      </View>
    </View>
  );
}

/** 3 stacked TheatreCardSkeletons, matching the list padding both screens use. */
export function TheatreListSkeleton() {
  return (
    <SkeletonGroup label="Loading theatres" style={styles.list}>
      <TheatreCardSkeleton />
      <TheatreCardSkeleton />
      <TheatreCardSkeleton />
    </SkeletonGroup>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: Spacing.lg, gap: Spacing.md },
});

const makeStyles = (Colors: ColorTokens) => ({
  card: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.xl,
    padding: Spacing.md,
  } as const,
  headerRow: { flexDirection: 'row' as const, alignItems: 'flex-start' as const, gap: Spacing.sm, marginBottom: Spacing.md },
  info: { flex: 1, gap: Spacing.xs },
  name: { marginBottom: 2 },
  chipsRow: { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: Spacing.sm },
});
