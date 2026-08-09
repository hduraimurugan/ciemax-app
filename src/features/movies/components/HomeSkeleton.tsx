import React from 'react';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import { Radius, Spacing } from '@constants/theme';
import { Skeleton, SkeletonGroup, SkeletonPoster, SkeletonText } from '@shared/ui';

const SCREEN_WIDTH = Dimensions.get('window').width;

/** Mirrors MoviesScreen's hero + ad banner + 3 poster rails (MoviesScreen.tsx). */
export function HomeSkeleton() {
  return (
    <SkeletonGroup label="Loading movies">
      <Skeleton width={SCREEN_WIDTH - Spacing.lg * 2} height={190} radius={Radius.xl} style={styles.hero} />
      <Skeleton
        width={SCREEN_WIDTH - Spacing.lg * 2}
        height={Math.round((SCREEN_WIDTH - Spacing.lg * 2) / 3.5)}
        radius={Radius.lg}
        style={styles.adBanner}
      />
      <Rail />
      <Rail />
      <Rail />
    </SkeletonGroup>
  );
}

function Rail() {
  return (
    <View style={styles.section}>
      <SkeletonText width={150} lineHeight={18} style={styles.sectionTitle} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonPoster key={i} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { marginHorizontal: Spacing.lg, marginBottom: Spacing.lg },
  adBanner: { marginHorizontal: Spacing.lg, marginBottom: Spacing.lg },
  section: { marginBottom: Spacing.lg },
  sectionTitle: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.sm },
  horizontalList: { paddingHorizontal: Spacing.lg, gap: Spacing.sm },
});
