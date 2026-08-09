import React, { useEffect, useMemo, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MapPin, Mail } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@ctypes/navigation';
import { Booking } from '@ctypes/models';
import { ColorTokens, FontFamily, FontSize, FontWeight, Radius, Spacing } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';
import { Heading3, QRCode } from '@shared/ui';
import { Body, Caption } from '@shared/ui';
import { getBookingById, getCachedBooking } from '@services/bookingService';
import { formatPrice, formatSeatList, formatShowDate } from '@shared/utils';
import { TicketCardSkeleton } from '@features/booking';

type Props = NativeStackScreenProps<RootStackParamList, 'TicketDetail'>;

export function TicketDetailScreen({ navigation, route }: Props) {
  const { bookingId } = route.params;
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [booking, setBooking] = useState<Booking | null>(() => getCachedBooking(bookingId) ?? null);
  // Distinguishes "still fetching" from "confirmed not found" now that there's
  // no separate loading flag — starts settled when cache already seeded booking.
  const [fetched, setFetched] = useState(() => !!getCachedBooking(bookingId));

  useEffect(() => {
    let cancelled = false;
    getBookingById(bookingId)
      .then(b => {
        if (cancelled) return;
        setBooking(b ?? null);
      })
      .finally(() => {
        if (!cancelled) setFetched(true);
      });
    return () => {
      cancelled = true;
    };
  }, [bookingId]);

  const loading = !fetched && !booking;

  function openDirections() {
    if (!booking) return;
    const url =
      booking.theatreLatitude && booking.theatreLongitude
        ? `https://www.google.com/maps/search/?api=1&query=${booking.theatreLatitude},${booking.theatreLongitude}`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.theatreName)}`;
    Linking.openURL(url).catch(() => {});
  }

  function contactSupport() {
    if (!booking) return;
    Linking.openURL(
      `mailto:support@cinehall.app?subject=${encodeURIComponent(`Booking #${booking.id.slice(0, 8).toUpperCase()}`)}`,
    ).catch(() => {});
  }

  const statusLabel = booking
    ? booking.status === 'confirmed' ? 'VALID FOR ENTRY' : booking.status === 'cancelled' ? 'CANCELLED' : 'BOOKING COMPLETED'
    : '';
  const hasRefund = !!booking?.refundStatus;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={18} color={colors.textPrimary} />
        </Pressable>
        <Heading3>E-Ticket</Heading3>
      </View>

      {loading ? (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <TicketCardSkeleton rows={4} />
        </ScrollView>
      ) : !booking ? (
        <Body style={styles.notFound}>Booking not found.</Body>
      ) : (
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.ticketCard}>
          <Text style={styles.statusLabel}>{statusLabel}</Text>
          <QRCode value={booking.id} size={160} />
          <Text style={styles.ticketId}>{booking.id}</Text>

          <View style={styles.detailRows}>
            <DetailRow label="Movie" value={booking.movieTitle} colors={colors} />
            <Pressable onPress={openDirections}>
              <DetailRow label="Cinema" value={booking.theatreName} colors={colors} link />
            </Pressable>
            <DetailRow label="Date & Time" value={`${formatShowDate(booking.showDate)} · ${booking.showTime}`} colors={colors} />
            <DetailRow
              label="Seats"
              value={booking.seatLabels?.join(', ') ?? formatSeatList(booking.seats)}
              colors={colors}
              mono
            />
          </View>
        </View>

        <View style={styles.card}>
          <Caption style={styles.cardLabel}>PRICE BREAKDOWN</Caption>
          <DetailRow label="Ticket Price" value={formatPrice(booking.subtotal)} colors={colors} />
          <DetailRow label="Convenience Fee" value={formatPrice(booking.convenienceFee)} colors={colors} />
          {booking.gstAmount ? <DetailRow label="GST" value={formatPrice(booking.gstAmount)} colors={colors} /> : null}
          {booking.discountAmount ? (
            <DetailRow label={`Discount${booking.offerCode ? ` (${booking.offerCode})` : ''}`} value={`-${formatPrice(booking.discountAmount)}`} colors={colors} highlight="success" />
          ) : null}
          <View style={styles.divider} />
          <DetailRow label="Amount Paid" value={formatPrice(booking.totalAmount)} colors={colors} bold />
        </View>

        {booking.paymentId ? (
          <View style={styles.card}>
            <Caption style={styles.cardLabel}>PAYMENT INFO</Caption>
            <DetailRow label="Payment ID" value={booking.paymentId} colors={colors} mono />
            <DetailRow label="Booked On" value={formatShowDate(booking.bookingDate)} colors={colors} />
          </View>
        ) : null}

        {hasRefund && (
          <View style={[styles.card, styles.refundCard]}>
            <Caption style={styles.cardLabel}>REFUND DETAILS</Caption>
            <DetailRow
              label="Status"
              value={(booking.refundStatus ?? '').toUpperCase()}
              colors={colors}
              highlight={booking.refundStatus === 'settled' ? 'success' : booking.refundStatus === 'failed' ? 'error' : 'warning'}
            />
            {booking.refundAmount ? <DetailRow label="Refund Amount" value={formatPrice(booking.refundAmount)} colors={colors} /> : null}
            {booking.razorpayRefundId ? <DetailRow label="Refund ID" value={booking.razorpayRefundId} colors={colors} mono /> : null}
            {booking.refundInitiatedAt ? <DetailRow label="Initiated" value={formatShowDate(booking.refundInitiatedAt)} colors={colors} /> : null}
            {booking.refundSettledAt ? <DetailRow label="Settled" value={formatShowDate(booking.refundSettledAt)} colors={colors} /> : null}
            {booking.refundFailureReason ? <DetailRow label="Reason" value={booking.refundFailureReason} colors={colors} /> : null}
          </View>
        )}

        <View style={styles.actionRow}>
          <Pressable style={styles.actionBtn} onPress={openDirections}>
            <MapPin size={16} color={colors.textPrimary} />
            <Text style={styles.actionBtnText}>Directions</Text>
          </Pressable>
          <Pressable style={styles.actionBtn} onPress={contactSupport}>
            <Mail size={16} color={colors.textPrimary} />
            <Text style={styles.actionBtnText}>Contact Support</Text>
          </Pressable>
        </View>
      </ScrollView>
      )}
    </SafeAreaView>
  );
}

function DetailRow({
  label,
  value,
  colors,
  mono,
  bold,
  link,
  highlight,
}: {
  label: string;
  value: string;
  colors: ColorTokens;
  mono?: boolean;
  bold?: boolean;
  link?: boolean;
  highlight?: 'success' | 'error' | 'warning';
}) {
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const highlightColor = highlight === 'success' ? colors.success : highlight === 'error' ? colors.error : highlight === 'warning' ? colors.warning : undefined;
  return (
    <View style={styles.detailRow}>
      <Caption style={styles.detailLabel}>{label}</Caption>
      <Text
        style={[
          styles.detailValue,
          mono && styles.detailValueMono,
          bold && styles.detailValueBold,
          link && { color: colors.accent },
          highlightColor ? { color: highlightColor } : undefined,
        ]}>
        {value}
      </Text>
    </View>
  );
}

const makeStyles = (Colors: ColorTokens) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: Colors.background },
    notFound: { textAlign: 'center', marginTop: Spacing.xl },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
      paddingHorizontal: Spacing.lg,
      paddingTop: Spacing.md,
      paddingBottom: Spacing.sm + 2,
    },
    backBtn: {
      width: 34,
      height: 34,
      borderRadius: Radius.md,
      backgroundColor: Colors.surfaceElevated,
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: { padding: Spacing.lg, gap: Spacing.md, paddingBottom: Spacing.xxl },
    ticketCard: {
      backgroundColor: Colors.surface,
      borderWidth: 1,
      borderColor: Colors.border,
      borderRadius: Radius.xl,
      padding: Spacing.lg,
      alignItems: 'center',
    },
    statusLabel: { fontSize: FontSize.xs, color: Colors.textMuted, letterSpacing: 1.5, marginBottom: Spacing.md },
    ticketId: {
      fontFamily: FontFamily.semibold,
      fontWeight: FontWeight.semibold,
      fontSize: FontSize.sm,
      color: Colors.textPrimary,
      marginTop: Spacing.md,
      marginBottom: Spacing.lg,
    },
    detailRows: {
      width: '100%',
      borderTopWidth: 1,
      borderTopColor: Colors.border,
      borderStyle: 'dashed',
      paddingTop: Spacing.md,
      gap: Spacing.sm + 4,
    },
    card: {
      backgroundColor: Colors.surface,
      borderWidth: 1,
      borderColor: Colors.border,
      borderRadius: Radius.lg,
      padding: Spacing.md,
      gap: Spacing.xs + 2,
    },
    refundCard: { borderColor: Colors.warning },
    cardLabel: { fontWeight: FontWeight.semibold, marginBottom: Spacing.xs },
    divider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.xs },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.sm },
    detailLabel: { color: Colors.textMuted },
    detailValue: { fontSize: FontSize.sm - 0.5, color: Colors.textPrimary, fontWeight: FontWeight.semibold, flexShrink: 1, textAlign: 'right' },
    detailValueMono: { fontFamily: FontFamily.semibold },
    detailValueBold: { fontSize: FontSize.md, color: Colors.accent },
    actionRow: { flexDirection: 'row', gap: Spacing.sm },
    actionBtn: {
      flex: 1,
      height: 46,
      flexDirection: 'row',
      gap: Spacing.xs,
      borderRadius: Radius.md,
      backgroundColor: Colors.surface,
      borderWidth: 1,
      borderColor: Colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionBtnText: { color: Colors.textPrimary, fontSize: FontSize.sm - 0.5, fontWeight: FontWeight.semibold },
  });
