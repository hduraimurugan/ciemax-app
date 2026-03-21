import React, { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@ctypes/navigation';
import { PaymentMethod } from '@ctypes/models';
import { Colors, FontFamily, FontSize, FontWeight, Radius, Spacing } from '@constants/theme';
import { Button, Card } from '@shared/ui';
import { Heading2, Heading3, Body, Caption, Label } from '@shared/ui';
import { useBookingStore } from '@store/bookingStore';
import { createBooking } from '@services/bookingService';
import { formatPrice } from '@shared/utils';

type Props = NativeStackScreenProps<RootStackParamList, 'Payment'>;

interface PaymentOption {
  id: PaymentMethod;
  label: string;
  icon: string;
  description: string;
}

const PAYMENT_OPTIONS: PaymentOption[] = [
  { id: 'upi', label: 'UPI', icon: '📲', description: 'Google Pay, PhonePe, Paytm' },
  { id: 'card', label: 'Credit / Debit Card', icon: '💳', description: 'Visa, Mastercard, Rupay' },
  { id: 'netbanking', label: 'Net Banking', icon: '🏦', description: 'All major banks' },
  { id: 'wallet', label: 'Wallet', icon: '👛', description: 'Paytm, Amazon Pay' },
];

export function PaymentScreen({ navigation }: Props) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('upi');
  const [paying, setPaying] = useState(false);

  const selectedMovie = useBookingStore(s => s.selectedMovie);
  const selectedTheatre = useBookingStore(s => s.selectedTheatre);
  const selectedShow = useBookingStore(s => s.selectedShow);
  const selectedSeats = useBookingStore(s => s.selectedSeats);
  const getGrandTotal = useBookingStore(s => s.getGrandTotal);
  const getConvenienceFee = useBookingStore(s => s.getConvenienceFee);
  const getGST = useBookingStore(s => s.getGST);
  const setBookingDetails = useBookingStore(s => s.setBookingDetails);
  const resetBookingFlow = useBookingStore(s => s.resetBookingFlow);

  async function handlePay() {
    if (!selectedMovie || !selectedTheatre || !selectedShow) return;
    setPaying(true);
    try {
      const booking = await createBooking({
        movie: { id: selectedMovie.id, title: selectedMovie.title, posterUrl: selectedMovie.posterUrl },
        theatre: { id: selectedTheatre.id, name: selectedTheatre.name },
        show: selectedShow,
        seats: selectedSeats,
        paymentMethod: selectedMethod,
      });
      setBookingDetails(booking);
      navigation.navigate('BookingSuccess', { bookingId: booking.id });
      setTimeout(resetBookingFlow, 3000);
    } catch (e: any) {
      navigation.navigate('BookingFailure', { error: e?.message ?? 'Payment failed' });
    } finally {
      setPaying(false);
    }
  }

  const grandTotal = getGrandTotal();

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>←</Text>
          </Pressable>
          <Heading2>Payment</Heading2>
        </View>

        <Label>Select Payment Method</Label>

        {PAYMENT_OPTIONS.map(option => (
          <Pressable
            key={option.id}
            onPress={() => setSelectedMethod(option.id)}>
            <Card
              padding="md"
              style={[
                styles.option,
                selectedMethod === option.id && styles.optionSelected,
              ]}>
              <View style={styles.optionRow}>
                <Body style={styles.optionIcon}>{option.icon}</Body>
                <View style={styles.optionText}>
                  <Heading3 style={styles.optionLabel}>{option.label}</Heading3>
                  <Body>{option.description}</Body>
                </View>
                {/* Radio button with inner dot */}
                <View style={[styles.radio, selectedMethod === option.id && styles.radioSelected]}>
                  {selectedMethod === option.id && <View style={styles.radioDot} />}
                </View>
              </View>
            </Card>
          </Pressable>
        ))}
      </ScrollView>

      {/* CTA bar with two-line total */}
      <View style={styles.cta}>
        <View style={styles.ctaTotal}>
          <Caption style={styles.totalLabel}>Grand Total</Caption>
          <Heading2 style={styles.totalAmount}>{formatPrice(grandTotal)}</Heading2>
          <Caption style={styles.totalBreakdown}>
            Incl. conv. fee {formatPrice(getConvenienceFee())} + GST {formatPrice(getGST())}
          </Caption>
        </View>
        <Button
          label={paying ? 'Processing...' : `Pay ${formatPrice(grandTotal)}`}
          onPress={handlePay}
          loading={paying}
          fullWidth
          size="lg"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingBottom: 160, gap: Spacing.md },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontFamily: FontFamily.medium,
  },
  option: {},
  optionSelected: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentLight,
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
  },
  optionRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  optionIcon: { fontSize: 24 },
  optionText: { flex: 1, gap: 2 },
  optionLabel: { color: Colors.textPrimary },
  radio: {
    width: 20,
    height: 20,
    borderRadius: Radius.full,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: Colors.accent,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: Radius.full,
    backgroundColor: Colors.accent,
  },
  cta: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.sm,
  },
  ctaTotal: {
    gap: 2,
  },
  totalLabel: {
    color: Colors.textMuted,
  },
  totalAmount: {
    color: Colors.textPrimary,
    fontWeight: FontWeight.bold,
    fontFamily: FontFamily.bold,
  },
  totalBreakdown: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
  },
});
