import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@ctypes/navigation';
import { ColorTokens, FontFamily, FontSize, FontWeight, Radius, Spacing } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';
import { Badge, Button, CountdownTimer, Heading3 } from '@shared/ui';
import { Body, BodySmall, Caption } from '@shared/ui';
import { useBookingStore } from '@store/bookingStore';
import { formatShowDate } from '@shared/utils';
import { validateCoupon } from '@services/offersService';
import { PriceBreakdown } from '../components/PriceBreakdown';

type Props = NativeStackScreenProps<RootStackParamList, 'Checkout'>;

export function CheckoutScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const selectedMovie = useBookingStore(s => s.selectedMovie);
  const selectedTheatre = useBookingStore(s => s.selectedTheatre);
  const selectedShow = useBookingStore(s => s.selectedShow);
  const selectedSeats = useBookingStore(s => s.selectedSeats);
  const appliedOffer = useBookingStore(s => s.appliedOffer);
  const setAppliedOffer = useBookingStore(s => s.setAppliedOffer);
  const getTotalAmount = useBookingStore(s => s.getTotalAmount);
  const getConvenienceFee = useBookingStore(s => s.getConvenienceFee);
  const getGST = useBookingStore(s => s.getGST);
  const getAppliedDiscount = useBookingStore(s => s.getAppliedDiscount);
  const getGrandTotal = useBookingStore(s => s.getGrandTotal);

  const [promoCode, setPromoCode] = useState('');
  const [checking, setChecking] = useState(false);

  const subtotal = getTotalAmount();
  const fee = getConvenienceFee();
  const gst = getGST();
  const discount = getAppliedDiscount();
  const grandTotal = getGrandTotal();

  const handleSessionExpire = useCallback(() => {
    Alert.alert(
      'Session Expired',
      'Your seat hold has expired. Please select your seats again.',
      [{
        text: 'OK',
        onPress: () => navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] }),
      }],
    );
  }, [navigation]);

  async function applyPromo() {
    if (!promoCode.trim()) return;
    setChecking(true);
    const result = await validateCoupon(promoCode.trim().toUpperCase(), subtotal);
    setChecking(false);
    if (result.valid && result.offer) {
      setAppliedOffer(result.offer);
    } else {
      Alert.alert('Invalid Code', result.message ?? 'This promo code is not valid.');
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={18} color={colors.textPrimary} />
        </Pressable>
        <Heading3>Booking Summary</Heading3>
        <View style={styles.timerSlot}>
          <CountdownTimer initialSeconds={300} onExpire={handleSessionExpire} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.summaryCard}>
          {selectedMovie?.posterUrl ? (
            <Image source={{ uri: selectedMovie.posterUrl }} style={styles.poster} resizeMode="cover" />
          ) : (
            <View style={styles.poster} />
          )}
          <View style={styles.summaryInfo}>
            <Heading3 numberOfLines={1}>{selectedMovie?.title ?? ''}</Heading3>
            {selectedTheatre ? <BodySmall style={styles.muted}>{selectedTheatre.name}</BodySmall> : null}
            {selectedShow ? (
              <BodySmall style={styles.muted}>
                {formatShowDate(selectedShow.date)} · {selectedShow.time}
              </BodySmall>
            ) : null}
          </View>
        </View>

        <View style={styles.card}>
          <Caption style={styles.cardLabel}>SEATS ({selectedSeats.length})</Caption>
          <View style={styles.seatChips}>
            {selectedSeats.map(s => (
              <Badge key={s.id} label={`${s.row}${s.number}`} variant="accent" />
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <PriceBreakdown subtotal={subtotal} convenienceFee={fee} gst={gst} discount={discount} />
        </View>

        <View style={styles.promoRow}>
          <TextInput
            value={promoCode}
            onChangeText={setPromoCode}
            placeholder="Promo code (try FIRST50)"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="characters"
            style={styles.promoInput}
          />
          <Pressable style={styles.applyBtn} onPress={applyPromo} disabled={checking}>
            <Body style={styles.applyText}>{appliedOffer ? 'Applied' : 'Apply'}</Body>
          </Pressable>
        </View>
      </ScrollView>

      <View style={styles.cta}>
        <Button
          label={`Pay Now · ₹${grandTotal.toLocaleString('en-IN')}`}
          onPress={() => navigation.navigate('Payment')}
          fullWidth
          size="lg"
        />
      </View>
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
    timerSlot: { marginLeft: 'auto' },
    content: { paddingHorizontal: Spacing.lg, paddingBottom: 120, gap: Spacing.md },
    summaryCard: {
      flexDirection: 'row',
      gap: Spacing.md,
      backgroundColor: Colors.surface,
      borderWidth: 1,
      borderColor: Colors.border,
      borderRadius: Radius.lg,
      padding: Spacing.md,
    },
    poster: {
      width: 56,
      height: 80,
      borderRadius: Radius.sm,
      backgroundColor: Colors.surfaceElevated,
    },
    summaryInfo: { flex: 1, justifyContent: 'center', gap: 2 },
    muted: { color: Colors.textMuted },
    card: {
      backgroundColor: Colors.surface,
      borderWidth: 1,
      borderColor: Colors.border,
      borderRadius: Radius.lg,
      padding: Spacing.md,
    },
    cardLabel: { fontWeight: FontWeight.semibold, marginBottom: Spacing.sm },
    seatChips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    promoRow: { flexDirection: 'row', gap: Spacing.sm },
    promoInput: {
      flex: 1,
      height: 46,
      borderRadius: Radius.md,
      backgroundColor: Colors.surface,
      borderWidth: 1,
      borderColor: Colors.border,
      color: Colors.textPrimary,
      paddingHorizontal: Spacing.md,
      fontSize: FontSize.sm,
    },
    applyBtn: {
      height: 46,
      paddingHorizontal: Spacing.lg,
      borderRadius: Radius.md,
      backgroundColor: Colors.secondary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    applyText: { color: Colors.textPrimary, fontWeight: FontWeight.semibold, fontFamily: FontFamily.semibold },
    cta: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: Spacing.md,
      backgroundColor: Colors.background,
      borderTopWidth: 1,
      borderTopColor: Colors.border,
    },
  });
