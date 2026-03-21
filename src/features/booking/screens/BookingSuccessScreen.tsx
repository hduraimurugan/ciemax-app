import React, { useEffect, useRef } from 'react';
import {
  Animated,
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@ctypes/navigation';
import { Colors, Radius, Spacing } from '@constants/theme';
import { Button, Card } from '@shared/ui';
import {
  Heading1,
  Heading3,
  Body,
  BodySmall,
  Label,
} from '@shared/ui';
import { useBookingStore } from '@store/bookingStore';
import { formatPrice, formatSeatList, formatShowDate } from '@shared/utils';

type Props = NativeStackScreenProps<RootStackParamList, 'BookingSuccess'>;

export function BookingSuccessScreen({ navigation, route }: Props) {
  const booking = useBookingStore(s => s.bookingDetails);
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 50, friction: 7 }),
      Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, [opacity, scale]);

  function handleGoHome() {
    navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        {/* Success animation */}
        <Animated.View style={[styles.iconWrapper, { transform: [{ scale }], opacity }]}>
          <Heading1 style={styles.checkmark}>✓</Heading1>
        </Animated.View>

        <Heading1 style={styles.title}>Booking Confirmed!</Heading1>
        <Body style={styles.subtitle}>Your tickets have been booked successfully.</Body>

        {booking ? (
          <Card padding="md" style={styles.ticket}>
            {/* Ticket header */}
            <View style={styles.ticketHeader}>
              <Heading3>{booking.movieTitle}</Heading3>
              <BodySmall style={styles.bookingId}>#{booking.id}</BodySmall>
            </View>

            <View style={styles.ticketDivider} />

            {/* Ticket details */}
            <View style={styles.ticketRows}>
              <TicketRow label="Theatre" value={booking.theatreName} />
              <TicketRow label="Date" value={formatShowDate(booking.showDate)} />
              <TicketRow label="Time" value={`${booking.showTime} · ${booking.showFormat}`} />
              <TicketRow label="Seats" value={formatSeatList(booking.seats)} />
              <TicketRow label="Amount Paid" value={formatPrice(booking.totalAmount)} />
            </View>
          </Card>
        ) : null}
      </View>

      <View style={styles.cta}>
        <Button label="Back to Home" onPress={handleGoHome} fullWidth size="lg" />
        <Button
          label="My Bookings"
          onPress={() => {
            navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
          }}
          variant="secondary"
          fullWidth
          size="lg"
        />
      </View>
    </SafeAreaView>
  );
}

function TicketRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={rowStyles.row}>
      <Label>{label}</Label>
      <BodySmall style={rowStyles.value} numberOfLines={2}>{value}</BodySmall>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 6,
    gap: Spacing.md,
  },
  value: { color: Colors.textPrimary, textAlign: 'right', flex: 1 },
});

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  content: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  iconWrapper: {
    width: 90,
    height: 90,
    borderRadius: Radius.full,
    backgroundColor: Colors.successDim,
    borderWidth: 2,
    borderColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xl,
  },
  checkmark: { color: Colors.success, fontSize: 40 },
  title: { textAlign: 'center', color: Colors.textPrimary },
  subtitle: { textAlign: 'center', color: Colors.textSecondary },
  ticket: {
    width: '100%',
    gap: Spacing.sm,
  },
  ticketHeader: {
    gap: Spacing.xs,
  },
  bookingId: { color: Colors.textMuted },
  ticketDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.xs,
  },
  ticketRows: { gap: 0 },
  cta: {
    padding: Spacing.md,
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
