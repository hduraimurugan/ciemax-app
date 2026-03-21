import React, { useEffect, useRef } from 'react';
import {
  Animated,
  FlatList,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@ctypes/navigation';
import { Colors, FontFamily, FontSize, FontWeight, Radius, Spacing } from '@constants/theme';
import { Badge, Button, QRCode } from '@shared/ui';
import {
  Heading1,
  Heading2,
  Body,
  BodySmall,
  Caption,
} from '@shared/ui';
import { useBookingStore } from '@store/bookingStore';
import { formatPrice, formatShowDate } from '@shared/utils';

type Props = NativeStackScreenProps<RootStackParamList, 'BookingSuccess'>;

export function BookingSuccessScreen({ navigation }: Props) {
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

  // Simulate dashed line with repeated small views
  function DashedLine() {
    const dashes = Array.from({ length: 40 });
    return (
      <View style={styles.dashedRow}>
        <View style={styles.halfCircleLeft} />
        <FlatList
          data={dashes}
          horizontal
          scrollEnabled={false}
          keyExtractor={(_, i) => String(i)}
          renderItem={() => <View style={styles.dash} />}
          contentContainerStyle={styles.dashes}
          style={styles.dashedLine}
        />
        <View style={styles.halfCircleRight} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Success icon */}
        <Animated.View style={[styles.iconWrapper, { transform: [{ scale }], opacity }]}>
          <Heading1 style={styles.checkmark}>✓</Heading1>
        </Animated.View>

        <Heading1 style={styles.title}>Booking Confirmed!</Heading1>
        <Body style={styles.subtitle}>Your seats are locked in. Enjoy the show!</Body>

        {booking ? (
          <View style={styles.ticketCard}>
            {/* Red gradient header zone */}
            <View style={styles.ticketHeader}>
              <Text style={styles.ticketBrand}>CINEBOOK</Text>
              <Body style={styles.ticketMovie}>{booking.movieTitle}</Body>
              <BodySmall style={styles.ticketShowInfo}>
                {formatShowDate(booking.showDate)} · {booking.showTime} · {booking.showFormat}
              </BodySmall>
            </View>

            {/* Perforated divider */}
            <DashedLine />

            {/* Ticket body */}
            <View style={styles.ticketBody}>
              <TicketRow label="Booking ID" value={`#${booking.id}`} mono />
              <TicketRow label="Theatre" value={booking.theatreName} />
              <TicketRow label="Date" value={formatShowDate(booking.showDate)} />
              <TicketRow label="Time" value={booking.showTime} />

              {/* Seat pills */}
              <View style={styles.seatSection}>
                <Caption style={styles.rowLabel}>Seats</Caption>
                <View style={styles.seatPills}>
                  {booking.seats.map(s => (
                    <Badge key={s.id} label={`${s.row}${s.number}`} variant="zinc" />
                  ))}
                </View>
              </View>

              {/* Amount */}
              <View style={styles.amountSection}>
                <Caption style={styles.rowLabel}>Amount Paid</Caption>
                <Heading2 style={styles.amountText}>{formatPrice(booking.totalAmount)}</Heading2>
              </View>

              {/* QR code */}
              <View style={styles.qrSection}>
                <QRCode value={booking.id} size={90} />
                <Caption style={styles.qrHint}>Scan at theatre entrance</Caption>
              </View>
            </View>
          </View>
        ) : null}

        <View style={styles.bottomPad} />
      </ScrollView>

      {/* 3-column action buttons */}
      <View style={styles.actionRow}>
        <Pressable style={styles.actionBtn}>
          <Caption style={styles.actionBtnText}>↓ Download</Caption>
        </Pressable>
        <Pressable style={styles.actionBtn}>
          <Caption style={styles.actionBtnText}>⤴ Share</Caption>
        </Pressable>
        <Button label="Home" onPress={handleGoHome} style={styles.homeBtn} />
      </View>
    </SafeAreaView>
  );
}

function TicketRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <View style={ticketRowStyles.row}>
      <Caption style={ticketRowStyles.label}>{label}</Caption>
      <BodySmall style={[ticketRowStyles.value, mono && ticketRowStyles.mono]}>{value}</BodySmall>
    </View>
  );
}

const ticketRowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 5,
  },
  label: { color: Colors.textMuted },
  value: { color: Colors.textPrimary, textAlign: 'right', flex: 1, marginLeft: Spacing.sm },
  mono: {
    fontFamily: FontFamily.medium,
    letterSpacing: 0.5,
  },
});

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  scrollContent: {
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  iconWrapper: {
    width: 80,
    height: 80,
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

  // Ticket card
  ticketCard: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ticketHeader: {
    backgroundColor: Colors.accent,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  ticketBrand: {
    color: Colors.textPrimary,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
    fontSize: FontSize.sm,
    letterSpacing: 2,
    opacity: 0.85,
  },
  ticketMovie: {
    color: Colors.textPrimary,
    fontWeight: FontWeight.bold,
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
  },
  ticketShowInfo: {
    color: 'rgba(255,255,255,0.7)',
  },

  // Perforated divider
  dashedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: Colors.surface,
  },
  halfCircleLeft: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.background,
    marginLeft: -8,
    flexShrink: 0,
  },
  halfCircleRight: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.background,
    marginRight: -8,
    flexShrink: 0,
  },
  dashedLine: {
    flex: 1,
    overflow: 'hidden',
  },
  dashes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 10,
  },
  dash: {
    width: 6,
    height: 1,
    backgroundColor: Colors.border,
  },

  // Ticket body
  ticketBody: {
    padding: Spacing.md,
    gap: 0,
  },
  seatSection: {
    paddingVertical: 5,
    gap: Spacing.xs,
  },
  rowLabel: {
    color: Colors.textMuted,
  },
  seatPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: 4,
  },
  amountSection: {
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: Spacing.xs,
  },
  amountText: {
    color: Colors.textPrimary,
    fontSize: FontSize.xxl,
    fontFamily: FontFamily.extrabold,
    fontWeight: FontWeight.extrabold,
  },
  qrSection: {
    alignItems: 'center',
    paddingTop: Spacing.md,
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: Spacing.xs,
  },
  qrHint: {
    color: Colors.textMuted,
  },

  // Actions
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm + 2,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
  },
  actionBtnText: {
    color: Colors.textSecondary,
  },
  homeBtn: {
    flex: 1,
  },
  bottomPad: { height: Spacing.lg },
});
