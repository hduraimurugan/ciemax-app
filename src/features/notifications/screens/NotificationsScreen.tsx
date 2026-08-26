import React, { useCallback, useMemo } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Bell, CheckCheck, LogIn } from 'lucide-react-native';
import { RootStackParamList } from '@ctypes/navigation';
import { Notification } from '@ctypes/models';
import { ColorTokens, FontFamily, FontSize, FontWeight, Radius, Spacing } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';
import { Body, BodySmall, Caption, Button } from '@shared/ui';
import { formatRelativeTime } from '@shared/utils';
import { useAuthStore } from '@store/authStore';
import { useNotificationStore } from '@store/notificationStore';
import { NotificationListSkeleton } from '../components/NotificationCardSkeleton';

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
        <View style={styles.signedOut}>
          <Bell size={48} color={colors.textMuted} />
          <Body style={styles.emptyText}>Sign in to view your notifications.</Body>
          <Button
            label="Sign In"
            onPress={() => navigation.navigate('Login', {})}
            leftIcon={<LogIn size={16} color={colors.textInverse} />}
          />
        </View>
      </SafeAreaView>
    );
  }

  const initialLoading = loading && items.length === 0;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.pageHeader}>
        <Body style={styles.title}>Notifications</Body>
        {unreadCount > 0 && (
          <Pressable style={styles.markAllBtn} onPress={() => markAllRead()} hitSlop={8}>
            <CheckCheck size={14} color={colors.accent} />
            <Caption style={styles.markAllText}>Mark all read</Caption>
          </Pressable>
        )}
      </View>

      {initialLoading ? (
        <NotificationListSkeleton />
      ) : items.length === 0 ? (
        <View style={styles.empty}>
          <Bell size={48} color={colors.textMuted} />
          <Body style={styles.emptyText}>No notifications yet</Body>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <NotificationCard item={item} onPress={() => onItemPress(item)} colors={colors} />
          )}
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
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={[styles.dot, unread ? styles.dotUnread : styles.dotRead]} />
      <View style={styles.cardContent}>
        <BodySmall style={[styles.cardTitle, unread && styles.cardTitleUnread]}>{item.title}</BodySmall>
        {item.body ? <Caption style={styles.cardBody}>{item.body}</Caption> : null}
        <Caption style={styles.cardTime}>{formatRelativeTime(item.createdAt)}</Caption>
      </View>
    </Pressable>
  );
});

const makeStyles = (Colors: ColorTokens) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: Colors.background },
    signedOut: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, padding: Spacing.xl },
    pageHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.md,
      paddingTop: Spacing.md,
      paddingBottom: Spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: Colors.border,
    },
    title: {
      fontSize: FontSize.lg,
      fontFamily: FontFamily.bold,
      fontWeight: FontWeight.bold,
      color: Colors.textPrimary,
    },
    markAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    markAllText: { color: Colors.accent },
    list: { padding: Spacing.md, paddingBottom: Spacing.xxl, gap: Spacing.sm },
    card: {
      flexDirection: 'row',
      gap: Spacing.sm,
      padding: Spacing.md,
      backgroundColor: Colors.surface,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: Colors.border,
    },
    dot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
    dotUnread: { backgroundColor: Colors.accent },
    dotRead: { backgroundColor: 'transparent' },
    cardContent: { flex: 1, gap: 3 },
    cardTitle: { color: Colors.textSecondary },
    cardTitleUnread: { color: Colors.textPrimary, fontFamily: FontFamily.semibold, fontWeight: FontWeight.semibold },
    cardBody: { color: Colors.textSecondary },
    cardTime: { color: Colors.textMuted, marginTop: 2 },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
    emptyText: { color: Colors.textSecondary },
  });
