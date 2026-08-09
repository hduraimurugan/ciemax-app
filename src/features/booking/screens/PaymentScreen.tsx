import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@ctypes/navigation';
import { PaymentMethod } from '@ctypes/models';
import { ColorTokens, FontFamily, FontSize, FontWeight, Radius, Spacing } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';
import { Heading3 } from '@shared/ui';
import { useBookingStore } from '@store/bookingStore';
import { createBooking } from '@services/bookingService';
import { formatPrice } from '@shared/utils';

type Props = NativeStackScreenProps<RootStackParamList, 'Payment'>;
type Tab = Extract<PaymentMethod, 'card' | 'upi' | 'wallet'>;

const TABS: { key: Tab; label: string }[] = [
  { key: 'card', label: 'Card' },
  { key: 'upi', label: 'UPI' },
  { key: 'wallet', label: 'Wallet' },
];
const UPI_APPS = ['GPay', 'PhonePe', 'Paytm'];
const WALLETS = ['Amazon Pay', 'Paytm Wallet', 'Mobikwik'];

export function PaymentScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [tab, setTab] = useState<Tab>('card');
  const [processing, setProcessing] = useState(false);
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!processing) return;
    spin.setValue(0);
    const loop = Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 800, easing: Easing.linear, useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [processing, spin]);

  const spinRotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  const selectedMovie = useBookingStore(s => s.selectedMovie);
  const selectedTheatre = useBookingStore(s => s.selectedTheatre);
  const selectedShow = useBookingStore(s => s.selectedShow);
  const selectedSeats = useBookingStore(s => s.selectedSeats);
  const getGrandTotal = useBookingStore(s => s.getGrandTotal);
  const getConvenienceFee = useBookingStore(s => s.getConvenienceFee);
  const setBookingDetails = useBookingStore(s => s.setBookingDetails);
  const resetBookingFlow = useBookingStore(s => s.resetBookingFlow);

  const grandTotal = getGrandTotal();

  async function payNow() {
    if (!selectedMovie || !selectedTheatre || !selectedShow) return;
    setProcessing(true);
    try {
      const booking = await createBooking({
        movie: { id: selectedMovie.id, title: selectedMovie.title, posterUrl: selectedMovie.posterUrl },
        theatre: { id: selectedTheatre.id, name: selectedTheatre.name },
        show: selectedShow,
        seats: selectedSeats,
        paymentMethod: tab,
        convenienceFee: getConvenienceFee(),
        totalAmount: grandTotal,
      });
      setBookingDetails(booking);
      setProcessing(false);
      navigation.navigate('BookingSuccess', { bookingId: booking.id });
      setTimeout(resetBookingFlow, 3000);
    } catch (e: any) {
      setProcessing(false);
      navigation.navigate('BookingFailure', { error: e?.message ?? 'Payment failed' });
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={18} color={colors.textPrimary} />
        </Pressable>
        <Heading3>Payment</Heading3>
      </View>

      {processing ? (
        <View style={styles.processing}>
          <Animated.View style={[styles.spinner, { transform: [{ rotate: spinRotate }] }]} />
          <Text style={styles.processingText}>Processing payment via Razorpay...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.amountBlock}>
            <Text style={styles.amountLabel}>AMOUNT PAYABLE</Text>
            <Text style={styles.amountValue}>{formatPrice(grandTotal)}</Text>
          </View>

          <View style={styles.tabsRow}>
            {TABS.map(t => (
              <Pressable
                key={t.key}
                style={[styles.tabBtn, tab === t.key && styles.tabBtnActive]}
                onPress={() => setTab(t.key)}>
                <Text style={[styles.tabLabel, tab === t.key && styles.tabLabelActive]}>{t.label}</Text>
              </Pressable>
            ))}
          </View>

          {tab === 'card' && (
            <View style={styles.formGroup}>
              <TextInput
                placeholder="Card Number"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
              />
              <View style={styles.rowGap}>
                <TextInput
                  placeholder="MM/YY"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.input, styles.flex1]}
                />
                <TextInput
                  placeholder="CVV"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.input, styles.flex1]}
                  secureTextEntry
                />
              </View>
            </View>
          )}

          {tab === 'upi' && (
            <View style={styles.formGroup}>
              <TextInput
                placeholder="yourname@upi"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
                autoCapitalize="none"
              />
              <View style={styles.rowGap}>
                {UPI_APPS.map(app => (
                  <View key={app} style={[styles.upiTile, styles.flex1]}>
                    <Text style={styles.upiTileText}>{app}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {tab === 'wallet' && (
            <View style={styles.walletList}>
              {WALLETS.map(w => (
                <View key={w} style={styles.walletRow}>
                  <Text style={styles.walletLabel}>{w}</Text>
                  <View style={styles.radio} />
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      {!processing && (
        <View style={styles.cta}>
          <Pressable style={styles.payBtn} onPress={payNow}>
            <Text style={styles.payBtnText}>Pay {formatPrice(grandTotal)}</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
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
    processing: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
    spinner: {
      width: 44,
      height: 44,
      borderRadius: Radius.full,
      borderWidth: 3,
      borderColor: Colors.border,
      borderTopColor: Colors.accent,
    },
    processingText: { fontSize: FontSize.sm, color: Colors.textMuted },
    content: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
    amountBlock: { alignItems: 'center', marginBottom: Spacing.lg },
    amountLabel: { fontSize: FontSize.xs, color: Colors.textMuted, letterSpacing: 1.5, marginBottom: 4 },
    amountValue: {
      fontFamily: FontFamily.bold,
      fontWeight: FontWeight.bold,
      fontSize: FontSize.xxl,
      color: Colors.textPrimary,
    },
    tabsRow: {
      flexDirection: 'row',
      backgroundColor: Colors.surface,
      borderRadius: Radius.md,
      padding: 4,
      marginBottom: Spacing.lg,
    },
    tabBtn: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: Spacing.sm + 2,
      borderRadius: Radius.sm,
    },
    tabBtnActive: { backgroundColor: Colors.accent },
    tabLabel: { fontSize: FontSize.sm - 0.5, fontWeight: FontWeight.semibold, color: Colors.textMuted },
    tabLabelActive: { color: '#fff' },
    formGroup: { gap: Spacing.md },
    rowGap: { flexDirection: 'row', gap: Spacing.md },
    flex1: { flex: 1 },
    input: {
      height: 48,
      borderRadius: Radius.md,
      backgroundColor: Colors.surface,
      borderWidth: 1,
      borderColor: Colors.border,
      color: Colors.textPrimary,
      paddingHorizontal: Spacing.md,
      fontSize: FontSize.sm,
      fontFamily: FontFamily.medium,
    },
    upiTile: {
      height: 56,
      borderRadius: Radius.md,
      backgroundColor: Colors.surface,
      borderWidth: 1,
      borderColor: Colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    upiTileText: { fontSize: FontSize.xs, color: Colors.textMuted, fontFamily: FontFamily.medium },
    walletList: { gap: 2 },
    walletRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: Spacing.sm + 6,
      borderBottomWidth: 1,
      borderBottomColor: Colors.border,
    },
    walletLabel: { fontSize: FontSize.sm + 0.5, color: Colors.textPrimary },
    radio: {
      width: 18,
      height: 18,
      borderRadius: Radius.full,
      borderWidth: 2,
      borderColor: Colors.border,
    },
    cta: {
      padding: Spacing.lg,
      backgroundColor: Colors.background,
      borderTopWidth: 1,
      borderTopColor: Colors.border,
    },
    payBtn: {
      height: 52,
      borderRadius: Radius.lg,
      backgroundColor: Colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    payBtnText: { color: '#fff', fontWeight: FontWeight.semibold, fontSize: FontSize.md },
  });
