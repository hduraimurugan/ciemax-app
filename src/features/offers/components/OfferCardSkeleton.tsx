import React, { useMemo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { ColorTokens, Radius, Spacing } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';
import { Skeleton, SkeletonGroup } from '@shared/ui';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = (SCREEN_WIDTH - Spacing.md * 2 - Spacing.sm) / 2;

/** Mirrors OffersScreen's OfferCard (accent bar + code/discount + title + copy button). */
export function OfferCardSkeleton() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={styles.card}>
      <View style={styles.accentBar} />
      <View style={styles.body}>
        <View style={styles.top}>
          <Skeleton width="60%" height={15} radius={4} />
          <Skeleton width={44} height={18} radius={Radius.full} />
        </View>
        <Skeleton width="90%" height={11} radius={4} style={styles.gap} />
        <Skeleton width="40%" height={10} radius={4} style={styles.gap} />
        <Skeleton width="100%" height={22} radius={Radius.sm} style={styles.copyBtn} />
        <Skeleton width="55%" height={10} radius={4} style={styles.gap} />
      </View>
    </View>
  );
}

/** 2x2 grid of OfferCardSkeletons matching OffersScreen's list padding. */
export function OfferGridSkeleton() {
  return (
    <SkeletonGroup label="Loading offers" style={styles.grid}>
      <View style={styles.row}>
        <OfferCardSkeleton />
        <OfferCardSkeleton />
      </View>
      <View style={styles.row}>
        <OfferCardSkeleton />
        <OfferCardSkeleton />
      </View>
    </SkeletonGroup>
  );
}

const styles = StyleSheet.create({
  grid: { padding: Spacing.md },
  row: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
});

const makeStyles = (Colors: ColorTokens) =>
  StyleSheet.create({
    card: {
      width: CARD_WIDTH,
      backgroundColor: Colors.surface,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: Colors.border,
      overflow: 'hidden',
    },
    accentBar: { height: 4, backgroundColor: Colors.surfaceElevated },
    body: { padding: Spacing.sm, gap: 4 },
    top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 4 },
    gap: { marginTop: 2 },
    copyBtn: { marginTop: 6 },
  });
