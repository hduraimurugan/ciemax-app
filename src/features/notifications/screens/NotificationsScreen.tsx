import React, { useCallback, useMemo } from 'react';
import { Pressable, RefreshControl, SectionList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  Bell,
  CalendarCheck,
  CheckCheck,
  ChevronRight,
  Clock3,
  LogIn,
  RotateCcw,
  Wallet,
} from 'lucide-react-native';
import { RootStackParamList } from '@ctypes/navigation';
import { Notification } from '@ctypes/models';
import { ColorTokens, FontFamily, FontWeight, Radius, Shadow, Spacing } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';
import { BodySmall, Caption, EmptyState, ScreenHeader } from '@shared/ui';
import { formatRelativeTime } from '@shared/utils';
import { useAuthStore } from '@store/authStore';
import { useNotificationStore } from '@store/notificationStore';
import { NotificationListSkeleton } from '../components/NotificationCardSkeleton';

type NotificationVisual = { Icon: typeof Bell; iconColor: string; badgeColor: string };

function getNotificationVisual(event: string, colors: ColorTokens): NotificationVisual {
  if (event.includes('refund_settled')) {
    return { Icon: Wallet, iconColor: colors.emerald, badgeColor: colors.emeraldDim };
  }
  if (event.includes('refund')) {
    return { Icon: RotateCcw, iconColor: colors.warning, badgeColor: colors.warningDim };
  }
  if (event.includes('booking')) {
    return { Icon: CalendarCheck, iconColor: colors.success, badgeColor: colors.successDim };
  }
  if (event.includes('reminder') || event.includes('starts') || event.includes('show')) {
    return { Icon: Clock3, iconColor: colors.info, badgeColor: colors.infoDim };
  }
  return { Icon: Bell, iconColor: colors.accent, badgeColor: colors.accentLight };
}

type NotificationSection = { title: string; data: Notification[] };

/** Buckets notifications into Today / Yesterday / This Week / Earlier, newest section first. */
function groupByDate(items: Notification[]): NotificationSection[] {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const dayMs = 24 * 60 * 60 * 1000;

  const buckets: Record<string, Notification[]> = {
    Today: [],
    Yesterday: [],
    'This Week': [],
    Earlier: [],
  };

  for (const item of items) {
    const daysAgo = Math.floor((startOfToday.getTime() - new Date(item.createdAt).setHours(0, 0, 0, 0)) / dayMs);
    if (daysAgo <= 0) buckets.Today.push(item);
    else if (daysAgo === 1) buckets.Yesterday.push(item);
    else if (daysAgo < 7) buckets['This Week'].push(item);
    else buckets.Earlier.push(item);
  }

  return Object.entries(buckets)
    .filter(([, data]) => data.length > 0)
    .map(([title, data]) => ({ title, data }));
}

type Props = NativeStackScreenProps<RootStackParamList, 'Notifications'>;

export function NotificationsScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const status = useAuthStore(s => s.status);

  const items = useNotificationStore(s => s.items);
  const unreadCount = useNotificationStore(s => s.unreadCount);
  const loading = useNotificationStore(s => s.loading);
  const hasMore = useNotificationStore(s => s.hasMore);
  const fetchList = useNotificationStore(s => s.fetchList);
  const fetchUnreadCount = useNotificationStore(s => s.fetchUnreadCount);
  const loadMore = useNotificationStore(s => s.loadMore);
  const markRead = useNotificationStore(s => s.markRead);
  const markAllRead = useNotificationStore(s => s.markAllRead);

  useFocusEffect(
    useCallback(() => {
      if (status === 'authed') {
        fetchList();
        fetchUnreadCount();
      }
    }, [status, fetchList, fetchUnreadCount]),
  );

  function onItemPress(item: Notification) {
    markRead(item.id);
    if (item.bookingId) {
      navigation.navigate('TicketDetail', { bookingId: item.bookingId });
    }
  }

  if (status !== 'authed') {
    return (
      <SafeAreaView style={styles.screen}>
        <ScreenHeader title="Notifications" titleIcon={<Bell size={16} color={colors.textPrimary} />} />
        <EmptyState
          icon={<Bell size={48} color={colors.textMuted} />}
          message="Sign in to view your notifications."
          actionLabel="Sign In"
          actionIcon={<LogIn size={16} color={colors.textInverse} />}
          onAction={() => navigation.navigate('Login', {})}
        />
      </SafeAreaView>
    );
  }

  const initialLoading = loading && items.length === 0;
  const sections = useMemo(() => groupByDate(items), [items]);

  return (
    <SafeAreaView style={styles.screen}>
      <ScreenHeader
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} unread` : undefined}
        titleIcon={
          <View>
            <Bell size={16} color={colors.textPrimary} />
            {unreadCount > 0 ? <View style={styles.titleBadgeDot} /> : null}
          </View>
        }
        rightIcon={unreadCount > 0 ? <CheckCheck size={14} color={colors.accent} /> : undefined}
        rightLabel={unreadCount > 0 ? 'Mark all read' : undefined}
        onRightPress={() => markAllRead()}
      />

      {initialLoading ? (
        <NotificationListSkeleton />
      ) : items.length === 0 ? (
        <EmptyState icon={<Bell size={48} color={colors.textMuted} />} message="No notifications yet" />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <NotificationCard item={item} onPress={() => onItemPress(item)} colors={colors} />
          )}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <BodySmall style={styles.sectionTitle}>{section.title}</BodySmall>
            </View>
          )}
          stickySectionHeadersEnabled={false}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={loading && items.length > 0} onRefresh={() => fetchList()} tintColor={colors.accent} />
          }
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (hasMore) loadMore();
          }}
        />
      )}
    </SafeAreaView>
  );
}

const NotificationCard = React.memo(function NotificationCard({
  item,
  onPress,
  colors,
}: {
  item: Notification;
  onPress: () => void;
  colors: ColorTokens;
}) {
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const unread = !item.readAt;
  const { Icon, iconColor, badgeColor } = getNotificationVisual(item.event, colors);
  return (
    <Pressable
      style={({ pressed }) => [styles.card, unread && styles.cardUnread, pressed && styles.cardPressed]}
      onPress={onPress}
    >
      <View style={[styles.badge, { backgroundColor: badgeColor }]}>
        <Icon size={20} color={iconColor} />
        {unread ? <View style={styles.badgeDot} /> : null}
      </View>
      <View style={styles.cardContent}>
        <BodySmall style={[styles.cardTitle, unread && styles.cardTitleUnread]}>{item.title}</BodySmall>
        {item.body ? (
          <Caption style={styles.cardBody} numberOfLines={2}>
            {item.body}
          </Caption>
        ) : null}
        <Caption style={styles.cardTime}>{formatRelativeTime(item.createdAt)}</Caption>
      </View>
      {item.bookingId ? <ChevronRight size={18} color={colors.textMuted} style={styles.chevron} /> : null}
    </Pressable>
  );
});

const makeStyles = (Colors: ColorTokens) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: Colors.background },
    titleBadgeDot: {
      position: 'absolute',
      top: -2,
      right: -3,
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: Colors.accent,
      borderWidth: 1.5,
      borderColor: Colors.accentLight,
    },
    list: { padding: Spacing.md, paddingBottom: Spacing.xxl, gap: Spacing.sm },
    sectionHeader: { paddingTop: Spacing.xs, paddingBottom: Spacing.xs, paddingHorizontal: Spacing.xs },
    sectionTitle: {
      color: Colors.textMuted,
      fontFamily: FontFamily.semibold,
      fontWeight: FontWeight.semibold,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      fontSize: 12,
    },
    card: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: Spacing.sm,
      padding: Spacing.md,
      backgroundColor: Colors.surface,
      borderRadius: Radius.xl,
      borderWidth: 1,
      borderColor: Colors.border,
      borderLeftWidth: 3,
      borderLeftColor: Colors.transparent,
      ...Shadow.sm,
    },
    cardUnread: {
      backgroundColor: Colors.surfaceElevated,
      borderLeftColor: Colors.accent,
      borderColor: Colors.accentLight,
      ...Shadow.md,
    },
    cardPressed: { opacity: 0.7 },
    badge: {
      width: 42,
      height: 42,
      borderRadius: Radius.full,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgeDot: {
      position: 'absolute',
      top: -1,
      right: -1,
      width: 9,
      height: 9,
      borderRadius: 5,
      backgroundColor: Colors.accent,
      borderWidth: 1.5,
      borderColor: Colors.surface,
    },
    cardContent: { flex: 1, gap: 3, paddingTop: 1 },
    cardTitle: { color: Colors.textSecondary },
    cardTitleUnread: { color: Colors.textPrimary, fontFamily: FontFamily.semibold, fontWeight: FontWeight.semibold },
    cardBody: { color: Colors.textSecondary },
    cardTime: { color: Colors.textMuted, marginTop: 2 },
    chevron: { alignSelf: 'center', marginLeft: Spacing.xs },
  });
