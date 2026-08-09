import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Linking,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Calendar, Clock, MapPin, Film, Ticket, LogIn } from 'lucide-react-native';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { RootStackParamList, TabParamList } from '@ctypes/navigation';
import { Booking } from '@ctypes/models';
import { ColorTokens, FontFamily, FontSize, FontWeight, Radius, Spacing } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';
import { Badge, Button, Loader } from '@shared/ui';
import { Heading2, Heading3, Body, BodySmall, Caption, Label } from '@shared/ui';
import { getUserBookings } from '@services/bookingService';
import { formatPrice, formatShowDate } from '@shared/utils';
import { useAuthStore } from '@store/authStore';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Bookings'>,
  NativeStackScreenProps<RootStackParamList>
>;
type ActiveTab = 'upcoming' | 'past';

export function MyBookingsScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const status = useAuthStore(s => s.status);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('upcoming');

  const load = useCallback(() => {
    if (status !== 'authed') {
      setLoading(false);
      return;
    }
    return getUserBookings()
      .then(setBookings)
      .finally(() => setLoading(false));
  }, [status]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  // Refresh when returning from a new booking so it shows up immediately.
  useFocusEffect(
    useCallback(() => {
      if (status === 'authed') load();
    }, [load, status]),
  );

  function onRefresh() {
    setRefreshing(true);
    Promise.resolve(load()).finally(() => setRefreshing(false));
  }

  const today = new Date().toISOString().split('T')[0];
  const upcoming = bookings.filter(b => b.status === 'confirmed' && b.showDate >= today);
  const past = bookings.filter(b => b.status !== 'confirmed' || b.showDate < today);
  const displayed = activeTab === 'upcoming' ? upcoming : past;

  function openTicket(bookingId: string) {
    navigation.navigate('TicketDetail', { bookingId });
  }

  if (status !== 'authed') {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.signedOut}>
          <Ticket size={48} color={colors.textMuted} />
          <Body style={styles.emptyText}>Sign in to view your bookings.</Body>
          <Button
            label="Sign In"
            onPress={() => navigation.navigate('Login', {})}
            leftIcon={<LogIn size={16} color={colors.textInverse} />}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (loading) return <Loader fullScreen />;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.pageHeader}>
        <Heading2 style={styles.title}>My Bookings</Heading2>
      </View>

      <View style={styles.tabs}>
        <Pressable
          style={[styles.tab, activeTab === 'upcoming' && styles.tabActive]}
          onPress={() => setActiveTab('upcoming')}>
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.tabTextActive]}>
            Upcoming{upcoming.length > 0 ? ` (${upcoming.length})` : ''}
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'past' && styles.tabActive]}
          onPress={() => setActiveTab('past')}>
          <Text style={[styles.tabText, activeTab === 'past' && styles.tabTextActive]}>
            Past{past.length > 0 ? ` (${past.length})` : ''}
          </Text>
        </Pressable>
      </View>

      {displayed.length === 0 ? (
        <View style={styles.empty}>
          <Ticket size={48} color={colors.textMuted} />
          <Body style={styles.emptyText}>
            {activeTab === 'upcoming' ? 'No upcoming bookings' : 'No past bookings'}
          </Body>
        </View>
      ) : (
        <FlatList
          data={displayed}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <BookingCard booking={item} onPress={() => openTicket(item.id)} colors={colors} />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
        />
      )}
    </SafeAreaView>
  );
}

function openDirections(booking: Booking) {
  const url =
    booking.theatreLatitude && booking.theatreLongitude
      ? `https://www.google.com/maps/search/?api=1&query=${booking.theatreLatitude},${booking.theatreLongitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.theatreName)}`;
  Linking.openURL(url).catch(() => {});
}

function BookingCard({ booking, onPress, colors }: { booking: Booking; onPress: () => void; colors: ColorTokens }) {
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const accentColor = booking.status === 'confirmed'
    ? colors.success
    : booking.status === 'cancelled'
    ? colors.error
    : colors.info;

  const statusVariant = booking.status === 'confirmed'
    ? 'success'
    : booking.status === 'cancelled' ? 'error' : 'warning';

  const seatLabels = booking.seatLabels ?? booking.seats.map(s => s.label ?? `${s.row}${s.number}`);

  return (
    <Pressable style={[styles.card, { borderLeftColor: accentColor }]} onPress={onPress}>
      <View style={styles.cardRow}>
        {booking.posterUrl ? (
          <Image source={{ uri: booking.posterUrl }} style={styles.poster} resizeMode="cover" />
        ) : (
          <View style={styles.posterPlaceholder}>
            <Film size={20} color={colors.textMuted} />
          </View>
        )}

        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Heading3 style={styles.movieTitle} numberOfLines={1}>{booking.movieTitle}</Heading3>
            <Badge label={booking.status.toUpperCase()} variant={statusVariant} />
          </View>
          <View style={styles.meta}>
            <Pressable style={styles.metaRow} onPress={() => openDirections(booking)} hitSlop={4}>
              <MapPin size={11} color={colors.textMuted} />
              <Caption style={styles.metaLink}>{booking.theatreName}</Caption>
            </Pressable>
            <View style={styles.metaRow}>
              <Calendar size={11} color={colors.textMuted} />
              <Caption style={styles.metaText}>{formatShowDate(booking.showDate)}</Caption>
              <Clock size={11} color={colors.textMuted} />
              <Caption style={styles.metaText}>{booking.showTime}</Caption>
            </View>
            {booking.refundStatus ? (
              <Badge
                label={`Refund ${booking.refundStatus}`}
                variant={booking.refundStatus === 'settled' ? 'success' : booking.refundStatus === 'failed' ? 'error' : 'warning'}
                style={styles.refundBadge}
              />
            ) : null}
          </View>
          <View style={styles.seatPills}>
            {seatLabels.slice(0, 4).map(label => (
              <Badge key={label} label={label} variant="default" />
            ))}
            {seatLabels.length > 4 && (
              <Caption style={styles.morePills}>+{seatLabels.length - 4}</Caption>
            )}
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Label style={styles.bookingId}>#{booking.id.slice(0, 8).toUpperCase()}</Label>
        <View style={styles.footerRight}>
          <BodySmall style={styles.amount}>{formatPrice(booking.totalAmount)}</BodySmall>
          <View style={styles.qrBtn}>
            <Caption style={styles.qrBtnText}>View Ticket</Caption>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const makeStyles = (Colors: ColorTokens) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: Colors.background },
    signedOut: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, padding: Spacing.xl },
    pageHeader: {
      paddingHorizontal: Spacing.md,
      paddingTop: Spacing.md,
      paddingBottom: Spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: Colors.border,
    },
    title: {},
    tabs: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: Colors.border,
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: Spacing.sm + 2,
      borderBottomWidth: 2,
      borderBottomColor: Colors.transparent,
    },
    tabActive: {
      borderBottomColor: Colors.accent,
    },
    tabText: {
      fontSize: FontSize.sm,
      fontFamily: FontFamily.medium,
      fontWeight: FontWeight.medium,
      color: Colors.textMuted,
    },
    tabTextActive: {
      color: Colors.textPrimary,
    },
    list: { padding: Spacing.md, paddingBottom: Spacing.xxl, gap: Spacing.sm },
    card: {
      backgroundColor: Colors.surface,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: Colors.border,
      borderLeftWidth: 3,
      overflow: 'hidden',
      padding: Spacing.md,
      gap: Spacing.sm,
    },
    cardRow: {
      flexDirection: 'row',
      gap: Spacing.sm,
    },
    poster: {
      width: 48,
      height: 72,
      borderRadius: Radius.sm,
    },
    posterPlaceholder: {
      width: 48,
      height: 72,
      borderRadius: Radius.sm,
      backgroundColor: Colors.surfaceElevated,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cardContent: {
      flex: 1,
      gap: Spacing.xs,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: Spacing.xs,
    },
    movieTitle: {
      flex: 1,
      fontSize: FontSize.md,
      fontFamily: FontFamily.bold,
      fontWeight: FontWeight.bold,
      color: Colors.textPrimary,
    },
    meta: { gap: 3 },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    metaText: {
      color: Colors.textSecondary,
      fontSize: FontSize.xs,
    },
    metaLink: {
      color: Colors.accent,
      fontSize: FontSize.xs,
    },
    refundBadge: { alignSelf: 'flex-start', marginTop: 2 },
    seatPills: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 4,
      marginTop: 2,
    },
    morePills: {
      color: Colors.textMuted,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: Spacing.sm,
      borderTopWidth: 1,
      borderTopColor: Colors.border,
    },
    bookingId: { color: Colors.textMuted, fontSize: FontSize.xs },
    footerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
    },
    amount: {
      color: Colors.accent,
      fontWeight: FontWeight.semibold,
      fontFamily: FontFamily.semibold,
    },
    qrBtn: {
      borderWidth: 1,
      borderColor: Colors.border,
      borderRadius: Radius.sm,
      paddingHorizontal: Spacing.sm,
      paddingVertical: 2,
    },
    qrBtnText: {
      color: Colors.textSecondary,
      fontSize: FontSize.xs,
    },
    empty: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.md,
    },
    emptyText: { color: Colors.textSecondary },
  });
