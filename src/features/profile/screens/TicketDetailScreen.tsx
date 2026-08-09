import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@ctypes/navigation';
import { Booking } from '@ctypes/models';
import { ColorTokens, FontFamily, FontSize, FontWeight, Radius, Spacing } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';
import { Heading3, Loader, QRCode } from '@shared/ui';
import { Body, Caption } from '@shared/ui';
import { getBookingById, cancelBooking } from '@services/bookingService';
import { formatPrice, formatSeatList, formatShowDate } from '@shared/utils';

type Props = NativeStackScreenProps<RootStackParamList, 'TicketDetail'>;

export function TicketDetailScreen({ navigation, route }: Props) {
  const { bookingId } = route.params;
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelConfirm, setCancelConfirm] = useState(false);

  useEffect(() => {
    getBookingById(bookingId).then(b => {
      setBooking(b ?? null);
      setLoading(false);
    });
  }, [bookingId]);

  async function confirmCancel() {
    const ok = await cancelBooking(bookingId);
    if (ok) {
      const updated = await getBookingById(bookingId);
      setBooking(updated ?? null);
    }
    setCancelConfirm(false);
  }

  if (loading) return <Loader fullScreen />;
  if (!booking) return null;

  const statusLabel = booking.status === 'confirmed' ? 'VALID FOR ENTRY' : booking.status === 'cancelled' ? 'CANCELLED' : 'BOOKING COMPLETED';

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={18} color={colors.textPrimary} />
        </Pressable>
        <Heading3>E-Ticket</Heading3>
      </View>

      <View style={styles.content}>
        <View style={styles.ticketCard}>
          <Text style={styles.statusLabel}>{statusLabel}</Text>
          <QRCode value={booking.id} size={160} />
          <Text style={styles.ticketId}>{booking.id}</Text>

          <View style={styles.detailRows}>
            <DetailRow label="Movie" value={booking.movieTitle} colors={colors} />
            <DetailRow label="Cinema" value={booking.theatreName} colors={colors} />
            <DetailRow label="Date & Time" value={`${formatShowDate(booking.showDate)} · ${booking.showTime}`} colors={colors} />
            <DetailRow label="Seats" value={formatSeatList(booking.seats)} colors={colors} mono />
            <DetailRow label="Amount Paid" value={formatPrice(booking.totalAmount)} colors={colors} mono />
          </View>
        </View>

        <View style={styles.actionRow}>
          <Pressable
            style={[styles.actionBtn, styles.cancelBtn]}
            onPress={() => setCancelConfirm(true)}
            disabled={booking.status !== 'confirmed'}>
            <Text style={styles.cancelBtnText}>Cancel Booking</Text>
          </Pressable>
          <View style={styles.actionBtn}>
            <Text style={styles.supportBtnText}>Contact Support</Text>
          </View>
        </View>

        {cancelConfirm && (
          <View style={styles.confirmPanel}>
            <Body style={styles.confirmText}>
              Cancel this booking? Refunds take 5–7 business days.
            </Body>
            <View style={styles.confirmRow}>
              <Pressable style={styles.keepBtn} onPress={() => setCancelConfirm(false)}>
                <Caption style={styles.keepBtnText}>Keep Booking</Caption>
              </Pressable>
              <Pressable style={styles.yesCancelBtn} onPress={confirmCancel}>
                <Caption style={styles.yesCancelText}>Yes, Cancel</Caption>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

function DetailRow({ label, value, colors, mono }: { label: string; value: string; colors: ColorTokens; mono?: boolean }) {
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={styles.detailRow}>
      <Caption style={styles.detailLabel}>{label}</Caption>
      <Text style={[styles.detailValue, mono && styles.detailValueMono]}>{value}</Text>
    </View>
  );
}

const makeStyles = (Colors: ColorTokens) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: Colors.background },
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
    content: { padding: Spacing.lg },
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
    detailRow: { flexDirection: 'row', justifyContent: 'space-between' },
    detailLabel: { color: Colors.textMuted },
    detailValue: { fontSize: FontSize.sm - 0.5, color: Colors.textPrimary, fontWeight: FontWeight.semibold },
    detailValueMono: { fontFamily: FontFamily.semibold },
    actionRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.lg },
    actionBtn: {
      flex: 1,
      height: 46,
      borderRadius: Radius.md,
      backgroundColor: Colors.surface,
      borderWidth: 1,
      borderColor: Colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cancelBtn: { borderColor: Colors.error },
    cancelBtnText: { color: Colors.error, fontSize: FontSize.sm - 0.5, fontWeight: FontWeight.semibold },
    supportBtnText: { color: Colors.textPrimary, fontSize: FontSize.sm - 0.5, fontWeight: FontWeight.semibold },
    confirmPanel: {
      marginTop: Spacing.md,
      backgroundColor: Colors.errorDim,
      borderWidth: 1,
      borderColor: Colors.error,
      borderRadius: Radius.lg,
      padding: Spacing.md,
    },
    confirmText: { marginBottom: Spacing.sm },
    confirmRow: { flexDirection: 'row', gap: Spacing.sm },
    keepBtn: {
      flex: 1,
      height: 38,
      borderRadius: Radius.sm,
      backgroundColor: Colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    keepBtnText: { color: Colors.textPrimary },
    yesCancelBtn: {
      flex: 1,
      height: 38,
      borderRadius: Radius.sm,
      backgroundColor: Colors.error,
      alignItems: 'center',
      justifyContent: 'center',
    },
    yesCancelText: { color: '#fff', fontWeight: FontWeight.semibold },
  });
