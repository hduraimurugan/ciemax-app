import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@ctypes/navigation';
import { Offer } from '@ctypes/models';
import { ColorTokens, DarkColors, FontFamily, FontSize, FontWeight, Radius, Spacing } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';
import { Badge, Button, Card, CountdownTimer } from '@shared/ui';
import {
  Heading3,
  Body,
  BodySmall,
  Label,
  Caption,
} from '@shared/ui';
import { useBookingStore } from '@store/bookingStore';
import { formatPrice, formatShowDate } from '@shared/utils';
import { getOffers } from '@services/offersService';
import { PriceBreakdown } from '../components/PriceBreakdown';

// NOTE: superseded by CheckoutScreen.tsx (single promo-code input instead of an
// offer carousel, matching the CineHall design) and no longer routed in
// RootNavigator. Kept on disk, unrouted, rather than deleted.
type Props = { navigation: NativeStackNavigationProp<RootStackParamList> };

export function OrderSummaryScreen({ navigation }: Props) {
  const { colors: Colors } = useTheme();
  const styles = useMemo(() => makeStyles(Colors), [Colors]);
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

  const [offers, setOffers] = useState<Offer[]>([]);

  const subtotal = getTotalAmount();
  const fee = getConvenienceFee();
  const gst = getGST();
  const discount = getAppliedDiscount();
  const grandTotal = getGrandTotal();

  useEffect(() => {
    getOffers().then(setOffers).catch(() => {});
  }, []);

  const handleSessionExpire = useCallback(() => {
    Alert.alert(
      'Session Expired',
      'Your order session has expired. Please start again.',
      [{
        text: 'OK',
        onPress: () => navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] }),
      }],
    );
  }, [navigation]);

  function handleApplyOffer(offer: Offer) {
    if (subtotal < offer.minOrderAmount) {
      Alert.alert('Offer Unavailable', `Minimum order ₹${offer.minOrderAmount} required`);
      return;
    }
    setAppliedOffer(appliedOffer?.id === offer.id ? null : offer);
  }

  return (
    <SafeAreaView style={styles.screen}>
      {/* Sticky header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={18} color={Colors.textPrimary} />
        </Pressable>
        <Body style={styles.headerTitle}>Order Summary</Body>
        <CountdownTimer initialSeconds={600} onExpire={handleSessionExpire} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>

        {/* Movie Info */}
        {selectedMovie && (
          <Card padding="md" style={styles.card}>
            <View style={styles.movieRow}>
              <Image source={{ uri: selectedMovie.posterUrl }} style={styles.poster} resizeMode="cover" />
              <View style={styles.movieInfo}>
                <Heading3>{selectedMovie.title}</Heading3>
                <BodySmall>{selectedMovie.language}</BodySmall>
                {selectedShow && (
                  <Badge label={selectedShow.format} variant="accent" style={styles.badge} />
                )}
              </View>
            </View>
          </Card>
        )}

        {/* Show Details */}
        {selectedShow && selectedTheatre && (
          <Card padding="md" style={styles.card}>
            <Label>Show Details</Label>
            <View style={styles.detailRows}>
              <DetailRow label="Theatre" value={selectedTheatre.name} />
              <DetailRow label="Date" value={formatShowDate(selectedShow.date)} />
              <DetailRow label="Time" value={selectedShow.time} />
              <DetailRow label="Language" value={selectedShow.language} />
            </View>
          </Card>
        )}

        {/* Seats */}
        <Card padding="md" style={styles.card}>
          <Label>Seats ({selectedSeats.length})</Label>
          <View style={styles.seatPills}>
            {selectedSeats.map(s => (
              <Badge key={s.id} label={`${s.row}${s.number}`} variant="zinc" />
            ))}
          </View>
        </Card>

        {/* Offers Panel */}
        {offers.length > 0 && (
          <Card padding="md" style={styles.card}>
            <View style={styles.offersHeader}>
              <Label>Available Offers</Label>
              <View style={styles.offerCount}>
                <Caption style={styles.offerCountText}>{offers.length}</Caption>
              </View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.offersList}>
              {offers.map(offer => {
                const isApplied = appliedOffer?.id === offer.id;
                const isEligible = subtotal >= offer.minOrderAmount;
                return (
                  <View key={offer.id} style={[styles.offerCard, isApplied && styles.offerCardApplied]}>
                    <View style={[styles.offerAccentBar, isApplied ? styles.offerBarApplied : styles.offerBarDefault]} />
                    <View style={styles.offerBody}>
                      <View style={styles.offerTop}>
                        <Text style={styles.offerCode}>{offer.code}</Text>
                        <Badge
                          label={offer.discountType === 'flat' ? `₹${offer.discountValue}` : `${offer.discountValue}%`}
                          variant={isApplied ? 'success' : 'violet'}
                        />
                      </View>
                      <BodySmall style={styles.offerTitle} numberOfLines={2}>{offer.title}</BodySmall>
                      <Caption style={styles.offerMin}>Min ₹{offer.minOrderAmount}</Caption>
                      <Button
                        label={isApplied ? 'Remove' : (isEligible ? 'Apply' : 'Ineligible')}
                        onPress={() => handleApplyOffer(offer)}
                        variant={isApplied ? 'danger' : 'secondary'}
                        size="sm"
                        disabled={!isEligible && !isApplied}
                        style={styles.applyBtn}
                      />
                    </View>
                  </View>
                );
              })}
            </ScrollView>
            {appliedOffer && (
              <View style={styles.appliedRow}>
                <Badge label={appliedOffer.code} variant="success" />
                <Caption style={styles.appliedText}>Applied! Saving {formatPrice(discount)}</Caption>
              </View>
            )}
          </Card>
        )}

        {/* Price Breakdown */}
        <Card padding="md" style={styles.card}>
          <PriceBreakdown subtotal={subtotal} convenienceFee={fee} gst={gst} discount={discount} />
        </Card>
      </ScrollView>

      {/* CTA */}
      <View style={styles.cta}>
        <Button
          label={`Proceed to Pay  ${formatPrice(grandTotal)}`}
          onPress={() => navigation.navigate('Payment')}
          fullWidth
          size="lg"
        />
      </View>
    </SafeAreaView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={detailStyles.row}>
      <BodySmall>{label}</BodySmall>
      <BodySmall style={detailStyles.value}>{value}</BodySmall>
    </View>
  );
}

const detailStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  value: { color: DarkColors.textPrimary, fontWeight: FontWeight.medium },
});

const makeStyles = (Colors: ColorTokens) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    color: Colors.textPrimary,
    fontWeight: FontWeight.semibold,
    fontFamily: FontFamily.semibold,
  },
  content: { padding: Spacing.md, paddingBottom: 100, gap: Spacing.md },
  card: {},
  movieRow: { flexDirection: 'row', gap: Spacing.md },
  poster: { width: 70, height: 100, borderRadius: Radius.sm },
  movieInfo: { flex: 1, gap: Spacing.xs },
  badge: { marginTop: 4 },
  detailRows: { marginTop: Spacing.sm, gap: 0 },
  seatPills: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginTop: Spacing.sm },
  // Offers
  offersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  offerCount: {
    width: 20,
    height: 20,
    borderRadius: Radius.full,
    backgroundColor: Colors.violetDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  offerCountText: {
    color: Colors.violet,
    fontSize: FontSize.xs - 1,
    fontWeight: FontWeight.bold,
  },
  offersList: { gap: Spacing.sm },
  offerCard: {
    width: 180,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  offerCardApplied: {
    borderColor: Colors.success,
  },
  offerAccentBar: {
    height: 4,
  },
  offerBarDefault: {
    backgroundColor: Colors.violet,
  },
  offerBarApplied: {
    backgroundColor: Colors.success,
  },
  offerBody: {
    padding: Spacing.sm,
    gap: Spacing.xs,
  },
  offerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  offerCode: {
    color: Colors.textPrimary,
    fontSize: FontSize.sm,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
    letterSpacing: 1,
  },
  offerTitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
  },
  offerMin: {
    color: Colors.textMuted,
    fontSize: FontSize.xs - 1,
  },
  applyBtn: {
    marginTop: Spacing.xs,
  },
  appliedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  appliedText: {
    color: Colors.success,
  },
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
