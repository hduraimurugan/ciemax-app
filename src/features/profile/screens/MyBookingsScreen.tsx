import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Calendar, Clock, MapPin, Monitor, Film, Ticket } from 'lucide-react-native';
import { Booking } from '@ctypes/models';
import { Colors, FontFamily, FontSize, FontWeight, Radius, Spacing } from '@constants/theme';
import { Badge, Loader, Modal, QRCode } from '@shared/ui';
import { Heading2, Heading3, Body, BodySmall, Caption, Label } from '@shared/ui';
import { getUserBookings } from '@services/bookingService';
import { formatPrice, formatShowDate } from '@shared/utils';

type ActiveTab = 'upcoming' | 'past';

export function MyBookingsScreen() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('upcoming');
  const [qrBookingId, setQrBookingId] = useState<string | null>(null);

  useEffect(() => {
    getUserBookings().then(data => {
      setBookings(data);
      setLoading(false);
    });
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const upcoming = bookings.filter(b => b.status === 'confirmed' && b.showDate >= today);
  const past = bookings.filter(b => b.status !== 'confirmed' || b.showDate < today);
  const displayed = activeTab === 'upcoming' ? upcoming : past;

  if (loading) return <Loader fullScreen />;

  return (
    <SafeAreaView style={styles.screen}>
      {/* Header */}
      <View style={styles.pageHeader}>
        <Heading2 style={styles.title}>My Bookings</Heading2>
      </View>

      {/* Tabs */}
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
          <Ticket size={48} color={Colors.textMuted} />
          <Body style={styles.emptyText}>
            {activeTab === 'upcoming' ? 'No upcoming bookings' : 'No past bookings'}
          </Body>
        </View>
      ) : (
        <FlatList
          data={displayed}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <BookingCard
              booking={item}
              onShowQR={() => setQrBookingId(item.id)}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* QR Dialog */}
      <Modal visible={qrBookingId !== null} onClose={() => setQrBookingId(null)} title="Your Ticket QR">
        {qrBookingId ? (
          <View style={styles.qrContent}>
            <QRCode value={qrBookingId} size={150} />
            <Caption style={styles.qrId}>#{qrBookingId}</Caption>
          </View>
        ) : null}
      </Modal>
    </SafeAreaView>
  );
}

function BookingCard({ booking, onShowQR }: { booking: Booking; onShowQR: () => void }) {
  const accentColor = booking.status === 'confirmed'
    ? Colors.success
    : booking.status === 'cancelled'
    ? Colors.error
    : Colors.info;

  const statusVariant = booking.status === 'confirmed'
    ? 'success'
    : booking.status === 'cancelled' ? 'error' : 'warning';

  return (
    <View style={[styles.card, { borderLeftColor: accentColor }]}>
      <View style={styles.cardRow}>
        {/* Poster thumbnail */}
        {booking.posterUrl ? (
          <Image source={{ uri: booking.posterUrl }} style={styles.poster} resizeMode="cover" />
        ) : (
          <View style={styles.posterPlaceholder}>
            <Film size={20} color={Colors.textMuted} />
          </View>
        )}

        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Heading3 style={styles.movieTitle} numberOfLines={1}>{booking.movieTitle}</Heading3>
            <Badge label={booking.status.toUpperCase()} variant={statusVariant} />
          </View>
          <View style={styles.meta}>
            <View style={styles.metaRow}>
              <MapPin size={11} color={Colors.textMuted} />
              <Caption style={styles.metaText}>{booking.theatreName}</Caption>
            </View>
            <View style={styles.metaRow}>
              <Calendar size={11} color={Colors.textMuted} />
              <Caption style={styles.metaText}>{formatShowDate(booking.showDate)}</Caption>
              <Clock size={11} color={Colors.textMuted} />
              <Caption style={styles.metaText}>{booking.showTime}</Caption>
            </View>
            <View style={styles.metaRow}>
              <Monitor size={11} color={Colors.textMuted} />
              <Caption style={styles.metaText}>{booking.showFormat}</Caption>
            </View>
          </View>
          {/* Seat pills */}
          <View style={styles.seatPills}>
            {booking.seats.slice(0, 4).map(s => (
              <Badge key={s.id} label={`${s.row}${s.number}`} variant="default" />
            ))}
            {booking.seats.length > 4 && (
              <Caption style={styles.morePills}>+{booking.seats.length - 4}</Caption>
            )}
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Label style={styles.bookingId}>#{booking.id}</Label>
        <View style={styles.footerRight}>
          <BodySmall style={styles.amount}>{formatPrice(booking.totalAmount)}</BodySmall>
          <Pressable style={styles.qrBtn} onPress={onShowQR}>
            <Caption style={styles.qrBtnText}>View QR</Caption>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  pageHeader: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {},
  // Tabs
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
  // List
  list: { padding: Spacing.md, paddingBottom: Spacing.xxl, gap: Spacing.sm },
  // Card
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
  // QR modal
  qrContent: {
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
  },
  qrId: {
    color: Colors.textMuted,
    fontFamily: FontFamily.medium,
  },
  // Empty
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  emptyText: { color: Colors.textSecondary },
});
