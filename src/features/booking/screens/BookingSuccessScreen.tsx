import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Platform,
  PermissionsAndroid,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ViewShot, { ViewShotRef } from 'react-native-view-shot';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { Check, Download, Share2 } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@ctypes/navigation';
import { ColorTokens, FontFamily, FontSize, FontWeight, Radius, Shadow, Spacing } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';
import { Badge, Button, QRCode } from '@shared/ui';
import {
  Heading1,
  Heading2,
  Body,
  BodySmall,
  Caption,
} from '@shared/ui';
import { Booking } from '@ctypes/models';
import { getBookingByPaymentId } from '@services/bookingService';
import { formatPrice, formatShowDate } from '@shared/utils';
import { TicketCardSkeleton } from '../components/TicketCardSkeleton';

type Props = NativeStackScreenProps<RootStackParamList, 'BookingSuccess'>;

async function ensureStoragePermission(): Promise<boolean> {
  if (Platform.OS !== 'android' || Platform.Version >= 29) return true;
  const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
  return granted === PermissionsAndroid.RESULTS.GRANTED;
}

export function BookingSuccessScreen({ navigation, route }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const viewShotRef = useRef<ViewShotRef>(null);

  useEffect(() => {
    let cancelled = false;
    getBookingByPaymentId(route.params.paymentId)
      .then(b => {
        if (!cancelled) setBooking(b ?? null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [route.params.paymentId]);

  useEffect(() => {
    if (loading) return;
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 50, friction: 7 }),
      Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, [loading, opacity, scale]);

  function handleGoHome() {
    navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
  }

  function handleViewBookings() {
    navigation.reset({ index: 0, routes: [{ name: 'MainTabs', params: { screen: 'Bookings' } as never }] });
  }

  async function handleDownload() {
    if (!viewShotRef.current) return;
    const allowed = await ensureStoragePermission();
    if (!allowed) {
      Alert.alert('Permission needed', 'Storage access is required to save the ticket.');
      return;
    }
    setSaving(true);
    try {
      const uri = await viewShotRef.current.capture();
      await CameraRoll.saveAsset(uri, { type: 'photo', album: 'CineHall' });
      Alert.alert('Saved', 'Your ticket has been saved to your photo library.');
    } catch {
      Alert.alert('Could not save', 'Something went wrong while saving your ticket.');
    } finally {
      setSaving(false);
    }
  }

  async function handleShare() {
    if (!booking) return;
    try {
      const uri = viewShotRef.current ? await viewShotRef.current.capture() : undefined;
      await Share.share({
        title: 'My CineHall Ticket',
        message: `${booking.movieTitle} · ${formatShowDate(booking.showDate)} · ${booking.showTime} · Seats ${booking.seatLabels?.join(', ') ?? ''}`,
        ...(uri ? { url: uri } : {}),
      });
    } catch {
      // user dismissed
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Animated.View style={[styles.iconWrapper, { transform: [{ scale }], opacity }]}>
          <Check size={40} color={colors.success} strokeWidth={3} />
        </Animated.View>

        <Heading1 style={styles.title}>Booking Confirmed!</Heading1>
        <Body style={styles.subtitle}>Your seats are locked in. Enjoy the show!</Body>

        {loading ? (
          <TicketCardSkeleton showAmount rows={4} />
        ) : booking ? (
          <ViewShot ref={viewShotRef} style={styles.ticketWrapper} options={{ format: 'png', quality: 0.92 }}>
            <View style={styles.ticketCard}>
              <View style={styles.ticketHeader}>
                <Text style={styles.ticketBrand}>CINEHALL</Text>
                <Body style={styles.ticketMovie}>{booking.movieTitle}</Body>
                <BodySmall style={styles.ticketShowInfo}>
                  {formatShowDate(booking.showDate)} · {booking.showTime}
                </BodySmall>
              </View>

              <DashedLine styles={styles} />

              <View style={styles.ticketBody}>
                <TicketRow label="Booking ID" value={`#${booking.id.slice(0, 8).toUpperCase()}`} mono colors={colors} />
                {booking.theatreName ? (
                  <TicketRow label="Theatre" value={booking.theatreName} colors={colors} />
                ) : null}
                <TicketRow label="Date" value={formatShowDate(booking.showDate)} colors={colors} />
                <TicketRow label="Time" value={booking.showTime} colors={colors} />

                <View style={styles.seatSection}>
                  <Caption style={styles.rowLabel}>Seats</Caption>
                  <View style={styles.seatPills}>
                    {(booking.seatLabels ?? booking.seats.map(s => s.label ?? `${s.row}${s.number}`)).map(label => (
                      <Badge key={label} label={label} variant="zinc" />
                    ))}
                  </View>
                </View>

                <View style={styles.amountSection}>
                  <Caption style={styles.rowLabel}>Amount Paid</Caption>
                  <Heading2 style={styles.amountText}>{formatPrice(booking.totalAmount)}</Heading2>
                </View>

                <View style={styles.qrSection}>
                  <View style={styles.qrFrame}>
                    <QRCode value={booking.id} size={130} />
                  </View>
                  <Caption style={styles.qrHint}>Scan at theatre entrance</Caption>
                </View>
              </View>
            </View>
          </ViewShot>
        ) : (
          <Body style={styles.subtitle}>
            Payment succeeded, but we couldn&apos;t load the ticket details right now. Check My Bookings shortly.
          </Body>
        )}

        <Pressable onPress={handleViewBookings}>
          <Text style={styles.viewBookings}>View My Bookings</Text>
        </Pressable>

        <View style={styles.bottomPad} />
      </ScrollView>

      <View style={styles.actionRow}>
        <Pressable style={styles.actionBtn} onPress={handleDownload} disabled={saving || !booking}>
          {saving ? <ActivityIndicator size="small" color={colors.textSecondary} /> : <Download size={16} color={colors.textSecondary} />}
          <Caption style={styles.actionBtnText}>Download</Caption>
        </Pressable>
        <Pressable style={styles.actionBtn} onPress={handleShare} disabled={!booking}>
          <Share2 size={16} color={colors.textSecondary} />
          <Caption style={styles.actionBtnText}>Share</Caption>
        </Pressable>
        <Button label="Home" onPress={handleGoHome} style={styles.homeBtn} />
      </View>
    </SafeAreaView>
  );
}

function DashedLine({ styles }: { styles: ReturnType<typeof makeStyles> }) {
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

function TicketRow({ label, value, mono, colors }: { label: string; value: string; mono?: boolean; colors: ColorTokens }) {
  const styles = useMemo(() => makeTicketRowStyles(colors), [colors]);
  return (
    <View style={styles.row}>
      <Caption style={styles.label}>{label}</Caption>
      <BodySmall
        style={[styles.value, mono && styles.mono]}
        numberOfLines={1}
        ellipsizeMode="tail">
        {value}
      </BodySmall>
    </View>
  );
}

const makeTicketRowStyles = (Colors: ColorTokens) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingVertical: 5,
    },
    label: { color: Colors.textMuted, flexShrink: 0 },
    value: { color: Colors.textPrimary, textAlign: 'right', flex: 1, marginLeft: Spacing.sm },
    mono: {
      fontFamily: FontFamily.medium,
      letterSpacing: 0.5,
    },
  });

const makeStyles = (Colors: ColorTokens) =>
  StyleSheet.create({
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
    title: { textAlign: 'center', color: Colors.textPrimary },
    subtitle: { textAlign: 'center', color: Colors.textSecondary },

    ticketWrapper: {
      width: '100%',
      ...Shadow.lg,
    },
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
      color: '#fff',
      fontFamily: FontFamily.bold,
      fontWeight: FontWeight.bold,
      fontSize: FontSize.sm,
      letterSpacing: 2,
      opacity: 0.85,
    },
    ticketMovie: {
      color: '#fff',
      fontWeight: FontWeight.bold,
      fontFamily: FontFamily.bold,
      fontSize: FontSize.lg,
    },
    ticketShowInfo: {
      color: 'rgba(255,255,255,0.7)',
    },

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
      paddingTop: Spacing.lg,
      paddingBottom: Spacing.sm,
      gap: Spacing.sm,
      borderTopWidth: 1,
      borderTopColor: Colors.border,
      marginTop: Spacing.xs,
    },
    qrFrame: {
      padding: Spacing.sm + 4,
      backgroundColor: '#fff',
      borderRadius: Radius.lg,
    },
    qrHint: {
      color: Colors.textMuted,
    },
    viewBookings: {
      color: Colors.accent,
      fontWeight: FontWeight.semibold,
      fontSize: FontSize.sm,
    },

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
      gap: 4,
    },
    actionBtnText: {
      color: Colors.textSecondary,
    },
    homeBtn: {
      flex: 1,
    },
    bottomPad: { height: Spacing.lg },
  });
