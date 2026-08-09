import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { Radius, Spacing } from '@constants/theme';
import { Skeleton, SkeletonGroup } from '@shared/ui';

const SCREEN_WIDTH = Dimensions.get('window').width;
const POSTER_WIDTH = (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.md) / 2;
const POSTER_HEIGHT = POSTER_WIDTH * 1.5; // matches SearchScreen's aspectRatio: 2 / 3

/** Mirrors SearchScreen's 2-col results grid (SearchScreen.tsx). */
export function SearchResultsSkeleton() {
  return (
    <SkeletonGroup label="Searching" style={styles.grid}>
      {Array.from({ length: 3 }).map((_, row) => (
        <View key={row} style={styles.row}>
          <Item />
          <Item />
        </View>
      ))}
    </SkeletonGroup>
  );
}

function Item() {
  return (
    <View style={styles.item}>
      <Skeleton width={POSTER_WIDTH} height={POSTER_HEIGHT} radius={Radius.md} />
      <Skeleton width="70%" height={13} radius={4} style={styles.title} />
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { paddingHorizontal: Spacing.lg },
  row: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  item: { flex: 1 },
  title: { marginTop: Spacing.xs },
});
