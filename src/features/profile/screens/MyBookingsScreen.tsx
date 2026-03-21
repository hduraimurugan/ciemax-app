import React, { useEffect, useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';
import { Booking } from '@ctypes/models';
import { Colors, Radius, Spacing } from '@constants/theme';
import { Badge, Card, Loader } from '@shared/ui';
import { Heading2, Heading3, Body, BodySmall, Label } from '@shared/ui';
import { getUserBookings } from '@services/bookingService';
import { formatPrice, formatSeatList, formatShowDate } from '@shared/utils';

export function MyBookingsScreen() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserBookings().then(data => {
      setBookings(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <Loader fullScreen />;

  return (
    <SafeAreaView style={styles.screen}>
      <Heading2 style={styles.title}>My Bookings</Heading2>

      {bookings.length === 0 ? (
        <View style={styles.empty}>
          <Body style={styles.emptyIcon}>🎟</Body>
          <Body>No bookings yet. Book your first movie!</Body>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <BookingCard booking={item} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

function BookingCard({ booking }: { booking: Booking }) {
  const statusVariant = booking.status === 'confirmed'
    ? 'success'
    : booking.status === 'cancelled' ? 'error' : 'warning';

  return (
    <Card padding="md" style={styles.card}>
      <View style={styles.cardHeader}>
        <Heading3 style={styles.movieTitle}>{booking.movieTitle}</Heading3>
        <Badge label={booking.status.toUpperCase()} variant={statusVariant} />
      </View>
      <View style={styles.details}>
        <BodySmall>{booking.theatreName}</BodySmall>
        <BodySmall>{formatShowDate(booking.showDate)} · {booking.showTime}</BodySmall>
        <BodySmall>Seats: {formatSeatList(booking.seats)}</BodySmall>
      </View>
      <View style={styles.footer}>
        <Label style={styles.bookingId}>#{booking.id}</Label>
        <BodySmall style={styles.amount}>{formatPrice(booking.totalAmount)}</BodySmall>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  title: { padding: Spacing.md },
  list: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xxl, gap: Spacing.sm },
  card: { gap: Spacing.sm },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  movieTitle: { flex: 1, marginRight: Spacing.sm },
  details: { gap: 4 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  bookingId: { color: Colors.textMuted },
  amount: { color: Colors.accent, fontWeight: '600' },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  emptyIcon: { fontSize: 48 },
});
