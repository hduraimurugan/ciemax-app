import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';
import { Offer } from '@ctypes/models';
import { Colors, Radius, Spacing } from '@constants/theme';
import { Card, Loader } from '@shared/ui';
import { Heading2, Heading3, Body, BodySmall, Caption } from '@shared/ui';
import { getOffers } from '@services/offersService';

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
      <Heading2 style={styles.title}>Offers & Coupons</Heading2>
      <FlatList
        data={offers}
        keyExtractor={item => item.id}
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

  return (
    <Card padding="md" style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.discount}>
          <Heading3 style={styles.discountText}>
            {offer.discountType === 'percentage'
              ? `${offer.discountValue}% OFF`
              : `₹${offer.discountValue} OFF`}
          </Heading3>
        </View>
        <Pressable
          style={[styles.codeBox, isCopied && styles.codeBoxCopied]}
          onPress={() => onCopy(offer.code)}>
          <Caption style={[styles.codeText, isCopied && styles.codeTextCopied]}>
            {isCopied ? '✓ COPIED' : offer.code}
          </Caption>
        </Pressable>
      </View>
      <Heading3>{offer.title}</Heading3>
      <Body>{offer.description}</Body>
      <BodySmall style={styles.validity}>Valid until {offer.validUntil}</BodySmall>
    </Card>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  title: { padding: Spacing.md },
  list: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xxl, gap: Spacing.md },
  card: { gap: Spacing.sm },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  discount: {
    backgroundColor: Colors.accentLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  discountText: { color: Colors.accent },
  codeBox: {
    borderWidth: 1,
    borderColor: Colors.accent,
    borderStyle: 'dashed',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  codeBoxCopied: {
    borderColor: Colors.success,
    backgroundColor: Colors.successDim,
    borderStyle: 'solid',
  },
  codeText: { color: Colors.accent, letterSpacing: 1 },
  codeTextCopied: { color: Colors.success },
  validity: { color: Colors.textMuted },
});
