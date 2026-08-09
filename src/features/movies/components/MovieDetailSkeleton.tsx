import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Radius, Spacing } from '@constants/theme';
import { Skeleton, SkeletonCircle, SkeletonGroup, SkeletonText } from '@shared/ui';

/**
 * Mirrors MovieDetailScreen's title/pills/synopsis/cast block
 * (MovieDetailScreen.tsx). The hero backdrop is skeletoned by the screen
 * itself (see MovieDetailScreen's `hero` View) so the back button can stay
 * layered on top of it the whole time, loading or not.
 */
export function MovieDetailBodySkeleton() {
  return (
    <SkeletonGroup label="Loading movie details" style={styles.body}>
      <SkeletonText width="70%" lineHeight={26} style={styles.title} />

      <View style={styles.pillRow}>
        <Skeleton width={70} height={22} radius={Radius.full} />
        <Skeleton width={90} height={22} radius={Radius.full} />
        <Skeleton width={60} height={22} radius={Radius.full} />
        <Skeleton width={80} height={22} radius={Radius.full} />
      </View>

      <SkeletonText lines={3} lastLineWidth="75%" style={styles.synopsis} />

      <SkeletonText width={60} lineHeight={14} style={styles.castLabel} />
      <View style={styles.castRow}>
        {Array.from({ length: 5 }).map((_, i) => (
          <View key={i} style={styles.castItem}>
            <SkeletonCircle size={56} />
            <Skeleton width={48} height={11} radius={4} style={styles.castName} />
          </View>
        ))}
      </View>
    </SkeletonGroup>
  );
}

const styles = StyleSheet.create({
  body: { padding: Spacing.lg, marginTop: -Spacing.lg, gap: Spacing.md },
  title: { marginBottom: 0 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  synopsis: { marginBottom: 0 },
  castLabel: { marginBottom: 0 },
  castRow: { flexDirection: 'row', gap: Spacing.md },
  castItem: { alignItems: 'center', width: 64, gap: 6 },
  castName: { alignSelf: 'center' },
});
