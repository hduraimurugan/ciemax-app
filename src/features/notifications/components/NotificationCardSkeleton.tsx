import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { ColorTokens, Radius, Spacing } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';
import { Skeleton, SkeletonGroup } from '@shared/ui';

/** Mirrors NotificationsScreen's NotificationCard (icon badge + title/body + timestamp). */
export function NotificationCardSkeleton() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={styles.card}>
      <Skeleton width={40} height={40} radius={20} />
      <View style={styles.content}>
        <Skeleton width="60%" height={14} radius={4} />
        <Skeleton width="90%" height={12} radius={4} />
        <Skeleton width="30%" height={10} radius={4} />
      </View>
    </View>
  );
}

export function NotificationListSkeleton() {
  return (
    <SkeletonGroup label="Loading notifications" style={styles.list}>
      <NotificationCardSkeleton />
      <NotificationCardSkeleton />
      <NotificationCardSkeleton />
      <NotificationCardSkeleton />
    </SkeletonGroup>
  );
}

const styles = StyleSheet.create({
  list: { padding: Spacing.md, gap: Spacing.sm },
});

const makeStyles = (Colors: ColorTokens) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      gap: Spacing.sm,
      padding: Spacing.md,
      backgroundColor: Colors.surface,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: Colors.border,
      borderLeftWidth: 3,
      borderLeftColor: Colors.transparent,
    },
    content: { flex: 1, gap: 6, justifyContent: 'center' },
  });
