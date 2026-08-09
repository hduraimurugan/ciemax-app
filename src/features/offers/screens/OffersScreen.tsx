import React, { useEffect, useMemo, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, LogIn, Tag } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@ctypes/navigation';
import { Offer } from '@ctypes/models';
import { ColorTokens, FontFamily, FontSize, FontWeight, Radius, Spacing } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';
import { Badge, Body, Button } from '@shared/ui';
import { Heading2, BodySmall, Caption } from '@shared/ui';
import { getOffers, getCachedOffers } from '@services/offersService';
import { formatDate } from '@shared/utils';
import { useAuthStore } from '@store/authStore';
import { OfferGridSkeleton } from '../components/OfferCardSkeleton';

type Props = NativeStackScreenProps<RootStackParamList, 'Offers'>;

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = (SCREEN_WIDTH - Spacing.md * 2 - Spacing.sm) / 2;

export function OffersScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const status = useAuthStore(s => s.status);
  const [offers, setOffers] = useState<Offer[]>(() => getCachedOffers() ?? []);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (status !== 'authed') {
      setIsRefreshing(false);
      return;
    }
    setIsRefreshing(true);
    getOffers().then(data => {
      setOffers(data);
      setIsRefreshing(false);
    });
  }, [status]);

  const loading = isRefreshing && offers.length === 0;

  function handleCopy(code: string) {
    // Keep the screen loadable when a stale native build has not linked the Clipboard pod yet.
    try {
      const Clipboard = require('@react-native-clipboard/clipboard').default;
      Clipboard.setString(code);
      setCopied(code);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // Copy becomes available after rebuilding the native app with the installed pods.
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.pageHeader}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()} hitSlop={8}>
          <ArrowLeft size={18} color={colors.textPrimary} />
        </Pressable>
        <View>
          <Heading2>Offers &amp; Coupons</Heading2>
          <BodySmall style={styles.headerSub}>Save on your next booking</BodySmall>
        </View>
      </View>

      {status !== 'authed' ? (
        <View style={styles.signedOut}>
          <Tag size={40} color={colors.textMuted} />
          <Body style={styles.signedOutText}>Please log in to view offers.</Body>
          <Button label="Sign In" onPress={() => navigation.navigate('Login', {})} leftIcon={<LogIn size={16} color={colors.textInverse} />} />
        </View>
      ) : loading ? (
        <OfferGridSkeleton />
      ) : offers.length === 0 ? (
        <View style={styles.signedOut}>
          <Tag size={40} color={colors.textMuted} />
          <Body style={styles.signedOutText}>No offers available right now — check back soon.</Body>
        </View>
      ) : (
        <FlatList
          data={offers}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => (
            <OfferCard offer={item} copied={copied} onCopy={handleCopy} colors={colors} />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

function OfferCard({
  offer,
  copied,
  onCopy,
  colors,
}: {
  offer: Offer;
  copied: string | null;
  onCopy: (code: string) => void;
  colors: ColorTokens;
}) {
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const isCopied = copied === offer.code;
  const isRedeemed = !!offer.isRedeemed;
  const discountLabel = offer.discountType === 'percentage'
    ? `${offer.discountValue}%`
    : `₹${offer.discountValue}`;

  const daysUntilExpiry = Math.ceil((new Date(offer.validUntil).getTime() - Date.now()) / 86400000);
  const endingSoon = daysUntilExpiry >= 0 && daysUntilExpiry <= 3;

  return (
    <View style={[styles.card, isRedeemed && styles.cardRedeemed]}>
      <View style={styles.accentBar} />

      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <Text style={[styles.offerCode, isRedeemed && styles.strikethrough]}>{offer.code}</Text>
          <Badge label={discountLabel} variant="violet" />
        </View>

        <BodySmall style={[styles.offerTitle, isRedeemed && styles.strikethrough]} numberOfLines={2}>{offer.title}</BodySmall>
        <Caption style={styles.offerMin}>Min ₹{offer.minOrderAmount}</Caption>

        <View style={styles.badges}>
          {isRedeemed ? (
            <Badge label="ALREADY USED" variant="zinc" />
          ) : offer.hallScoped ? (
            <Badge label="HALL OFFER" variant="gold" />
          ) : endingSoon ? (
            <Badge label="ENDING SOON" variant="error" />
          ) : (
            <Badge label="ACTIVE" variant="success" />
          )}
        </View>

        {!isRedeemed && (
          <Pressable
            style={[styles.copyBtn, isCopied && styles.copyBtnCopied]}
            onPress={() => onCopy(offer.code)}>
            <Text style={[styles.copyBtnText, isCopied && styles.copyBtnTextCopied]}>
              {isCopied ? '✓ Copied' : 'Copy Code'}
            </Text>
          </Pressable>
        )}

        <Caption style={styles.validity}>Expires {formatDate(offer.validUntil)}</Caption>
      </View>
    </View>
  );
}

const makeStyles = (Colors: ColorTokens) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: Colors.background },
    pageHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
      paddingHorizontal: Spacing.md,
      paddingTop: Spacing.md,
      paddingBottom: Spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: Colors.border,
    },
    backBtn: {
      width: 34,
      height: 34,
      borderRadius: Radius.md,
      backgroundColor: Colors.surfaceElevated,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerSub: { color: Colors.textMuted },
    signedOut: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, padding: Spacing.xl },
    signedOutText: { textAlign: 'center', color: Colors.textSecondary },
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
    cardRedeemed: { opacity: 0.55 },
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
    strikethrough: { textDecorationLine: 'line-through' },
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
