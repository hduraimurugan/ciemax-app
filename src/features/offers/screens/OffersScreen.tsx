import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Offer } from '@ctypes/models';
import { Colors, FontFamily, FontSize, FontWeight, Radius, Spacing } from '@constants/theme';
import { Badge, Loader } from '@shared/ui';
import { Heading2, Heading3, Body, BodySmall, Caption } from '@shared/ui';
import { getOffers } from '@services/offersService';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = (SCREEN_WIDTH - Spacing.md * 2 - Spacing.sm) / 2;

export function OffersScreen() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    getOffers().then(data => {
      setOffers(data);
      setLoading(false);
    });
  }, []);

  function handleCopy(code: string) {
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  }

  if (loading) return <Loader fullScreen />;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.pageHeader}>
        <Heading2>Offers & Coupons</Heading2>
        <BodySmall style={styles.headerSub}>Save on your next booking</BodySmall>
      </View>
      <FlatList
        data={offers}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <OfferCard offer={item} copied={copied} onCopy={handleCopy} />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

function OfferCard({
  offer,
  copied,
  onCopy,
}: {
  offer: Offer;
  copied: string | null;
  onCopy: (code: string) => void;
}) {
  const isCopied = copied === offer.code;
  const discountLabel = offer.discountType === 'percentage'
    ? `${offer.discountValue}%`
    : `₹${offer.discountValue}`;

  return (
    <View style={styles.card}>
      {/* Violet top accent bar */}
      <View style={styles.accentBar} />

      <View style={styles.cardBody}>
        {/* Top row: code + discount badge */}
        <View style={styles.cardTop}>
          <Heading3 style={styles.offerCode}>{offer.code}</Heading3>
          <Badge label={discountLabel} variant="violet" />
        </View>

        <BodySmall style={styles.offerTitle} numberOfLines={2}>{offer.title}</BodySmall>
        <Caption style={styles.offerMin}>Min ₹{offer.minOrderAmount}</Caption>

        <View style={styles.badges}>
          {offer.isActive ? (
            <Badge label="ACTIVE" variant="success" />
          ) : (
            <Badge label="EXPIRED" variant="error" />
          )}
        </View>

        {/* Copy button */}
        <Pressable
          style={[styles.copyBtn, isCopied && styles.copyBtnCopied]}
          onPress={() => onCopy(offer.code)}>
          <Text style={[styles.copyBtnText, isCopied && styles.copyBtnTextCopied]}>
            {isCopied ? '✓ Copied' : 'Copy Code'}
          </Text>
        </Pressable>

        <Caption style={styles.validity}>Expires {offer.validUntil}</Caption>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  pageHeader: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 2,
  },
  headerSub: { color: Colors.textMuted },
  list: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  row: {
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  accentBar: {
    height: 4,
    backgroundColor: Colors.violet,
  },
  cardBody: {
    padding: Spacing.sm,
    gap: Spacing.xs,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 4,
  },
  offerCode: {
    color: Colors.textPrimary,
    fontSize: FontSize.sm,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
    letterSpacing: 1,
    flex: 1,
  },
  offerTitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
  },
  offerMin: {
    color: Colors.textMuted,
    fontSize: FontSize.xs - 1,
  },
  badges: {},
  copyBtn: {
    borderWidth: 1,
    borderColor: Colors.violet,
    borderRadius: Radius.sm,
    paddingVertical: 4,
    alignItems: 'center',
    marginTop: 4,
  },
  copyBtnCopied: {
    borderColor: Colors.success,
    backgroundColor: Colors.emeraldDim,
  },
  copyBtnText: {
    color: Colors.violet,
    fontSize: FontSize.xs,
    fontFamily: FontFamily.medium,
    fontWeight: FontWeight.medium,
  },
  copyBtnTextCopied: {
    color: Colors.success,
  },
  validity: {
    color: Colors.textMuted,
    fontSize: FontSize.xs - 1,
  },
});
