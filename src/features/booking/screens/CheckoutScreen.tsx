import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Tag } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@ctypes/navigation';
import { ColorTokens, FontFamily, FontSize, FontWeight, Radius, Spacing } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';
import { Badge, Button, CountdownTimer, Heading3 } from '@shared/ui';
import { Body, BodySmall, Caption } from '@shared/ui';
import { formatShowDate, formatShowTime, formatPrice } from '@shared/utils';
import { getSettings } from '@services/settingsService';
import { getOffers, validateCoupon, CouponValidation } from '@services/offersService';
import { releaseSeats } from '@services/bookingService';
import { Offer } from '@ctypes/models';
import { PriceBreakdown } from '../components/PriceBreakdown';
import { computeCheckoutPricing } from '../utils/pricing';

type Props = NativeStackScreenProps<RootStackParamList, 'Checkout'>;

const DEFAULT_FEE_PER_TICKET = 15;
const DEFAULT_GST_PERCENTAGE = 18;

interface AppliedOffer {
  offerCode: string;
  offerTitle: string;
  discountAmount: number;
}

export function CheckoutScreen({ navigation, route }: Props) {
  const params = route.params;
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [feePerTicket, setFeePerTicket] = useState(DEFAULT_FEE_PER_TICKET);
  const [gstPercentage, setGstPercentage] = useState(DEFAULT_GST_PERCENTAGE);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [appliedOffer, setAppliedOffer] = useState<AppliedOffer | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [checking, setChecking] = useState(false);
  const [releasing, setReleasing] = useState(false);

  useEffect(() => {
    getSettings().then(s => {
      setFeePerTicket(s.convenience_fee_per_ticket);
      setGstPercentage(s.gst_percentage);
    });
    getOffers().then(setOffers);
  }, []);

  const numTickets = params.seatIds.length;
  const discountAmount = appliedOffer?.discountAmount ?? 0;
  const { convenienceTotal, gstAmount, subtotalWithFee, grandTotal } = computeCheckoutPricing({
    ticketTotal: params.ticketTotal,
    numTickets,
    feePerTicket,
    gstPercentage,
    discountAmount,
  });

  const initialSeconds = Math.max(
    0,
    Math.floor((new Date(params.holdExpiresAt).getTime() - Date.now()) / 1000),
  );

  const releaseAndExit = useCallback(
    async (destination: 'SeatSelection' | 'MainTabs') => {
      setReleasing(true);
      try {
        await releaseSeats(params.showId, params.seatIds);
      } catch {
        // best-effort — the hold will also expire server-side on its own
      }
      setReleasing(false);
      if (destination === 'SeatSelection') {
        navigation.replace('SeatSelection', { showId: params.showId, movieId: params.movieId });
      } else {
        navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
      }
    },
    [navigation, params.seatIds, params.showId, params.movieId],
  );

  const handleSessionExpire = useCallback(() => {
    Alert.alert(
      'Seat hold expired',
      'Your seat hold has expired. Please select your seats again.',
      [{ text: 'OK', onPress: () => navigation.replace('SeatSelection', { showId: params.showId, movieId: params.movieId }) }],
    );
  }, [navigation, params.showId, params.movieId]);

  const handleBack = () => {
    Alert.alert('Cancel booking?', 'Your held seats will be released.', [
      { text: 'Keep holding', style: 'cancel' },
      { text: 'Release seats', style: 'destructive', onPress: () => releaseAndExit('SeatSelection') },
    ]);
  };

  async function applyPromo() {
    if (!promoCode.trim()) return;
    setChecking(true);
    const result: CouponValidation = await validateCoupon(promoCode.trim(), params.showId, subtotalWithFee);
    setChecking(false);
    if (result.valid && result.offerCode) {
      setAppliedOffer({
        offerCode: result.offerCode,
        offerTitle: result.offerTitle ?? result.offerCode,
        discountAmount: result.discountAmount ?? 0,
      });
    } else {
      Alert.alert('Invalid Code', result.message ?? 'This promo code is not valid.');
    }
  }

  function applyOfferCard(offer: Offer) {
    setPromoCode(offer.code);
    setChecking(true);
    validateCoupon(offer.code, params.showId, subtotalWithFee)
      .then(result => {
        setChecking(false);
        if (result.valid && result.offerCode) {
          setAppliedOffer({
            offerCode: result.offerCode,
            offerTitle: result.offerTitle ?? offer.title,
            discountAmount: result.discountAmount ?? 0,
          });
        } else {
          Alert.alert('Offer not applicable', result.message ?? 'This offer cannot be applied to this order.');
        }
      })
      .catch(() => setChecking(false));
  }

  function goToPayment() {
    navigation.navigate('Payment', {
      ...params,
      offerCode: appliedOffer?.offerCode ?? null,
      discountAmount,
      grandTotal,
    });
  }

  const applicableOffers = offers.filter(o => subtotalWithFee >= o.minOrderAmount);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={handleBack} disabled={releasing}>
          {releasing ? <ActivityIndicator size="small" color={colors.textPrimary} /> : <ArrowLeft size={18} color={colors.textPrimary} />}
        </Pressable>
        <Heading3>Booking Summary</Heading3>
        <View style={styles.timerSlot}>
          <CountdownTimer initialSeconds={initialSeconds} onExpire={handleSessionExpire} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.summaryCard}>
          {params.posterUrl ? (
            <Image source={{ uri: params.posterUrl }} style={styles.poster} resizeMode="cover" />
          ) : (
            <View style={styles.poster} />
          )}
          <View style={styles.summaryInfo}>
            <Heading3 numberOfLines={1}>{params.movieTitle}</Heading3>
            <BodySmall style={styles.muted}>{params.cinemaName}{params.screenName ? ` · ${params.screenName}` : ''}</BodySmall>
            <BodySmall style={styles.muted}>
              {formatShowDate(params.showDate)} · {formatShowTime(params.startTime)} · {params.language}
            </BodySmall>
          </View>
        </View>

        <View style={styles.card}>
          <Caption style={styles.cardLabel}>SEATS ({params.seatLabels.length})</Caption>
          <View style={styles.seatChips}>
            {params.seatLabels.map(label => (
              <Badge key={label} label={label} variant="accent" />
            ))}
          </View>
        </View>

        {applicableOffers.length > 0 && (
          <View style={styles.card}>
            <Caption style={styles.cardLabel}>OFFERS FOR YOU</Caption>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.offersRow}>
              {applicableOffers.map(offer => {
                const isApplied = appliedOffer?.offerCode === offer.code;
                return (
                  <Pressable
                    key={offer.id}
                    style={[styles.offerCard, isApplied && styles.offerCardActive]}
                    onPress={() => applyOfferCard(offer)}
                    disabled={checking}>
                    <View style={styles.offerCodeRow}>
                      <Tag size={12} color={colors.accent} />
                      <Text style={styles.offerCode}>{offer.code}</Text>
                    </View>
                    <BodySmall style={styles.offerTitle} numberOfLines={2}>{offer.title}</BodySmall>
                    {offer.hallScoped ? <Caption style={styles.offerHallBadge}>Hall Offer</Caption> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        )}

        <View style={styles.card}>
          <PriceBreakdown
            subtotal={params.ticketTotal}
            convenienceFee={convenienceTotal}
            feeHint={`${formatPrice(feePerTicket)}/ticket`}
            gst={gstAmount}
            gstPercentage={gstPercentage}
            discount={discountAmount}
          />
        </View>

        <View style={styles.promoRow}>
          <TextInput
            value={promoCode}
            onChangeText={setPromoCode}
            placeholder="Enter promo code"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="characters"
            style={styles.promoInput}
          />
          <Pressable style={styles.applyBtn} onPress={applyPromo} disabled={checking}>
            {checking ? (
              <ActivityIndicator size="small" color={colors.textPrimary} />
            ) : (
              <Body style={styles.applyText}>{appliedOffer ? 'Applied' : 'Apply'}</Body>
            )}
          </Pressable>
        </View>
      </ScrollView>

      <View style={styles.cta}>
        <Button label={`Pay Now · ${formatPrice(grandTotal)}`} onPress={goToPayment} fullWidth size="lg" />
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
    offersRow: { gap: Spacing.sm },
    offerCard: {
      width: 160,
      borderWidth: 1,
      borderColor: Colors.border,
      borderRadius: Radius.md,
      padding: Spacing.sm,
      backgroundColor: Colors.surfaceElevated,
      gap: 4,
    },
    offerCardActive: { borderColor: Colors.accent, backgroundColor: Colors.accentLight },
    offerCodeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    offerCode: { color: Colors.accent, fontWeight: FontWeight.bold, fontSize: FontSize.xs },
    offerTitle: { color: Colors.textPrimary },
    offerHallBadge: { color: Colors.textMuted, fontSize: FontSize.xs - 1 },
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
      minWidth: 80,
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
