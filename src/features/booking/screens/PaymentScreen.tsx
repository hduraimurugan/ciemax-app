import React, { useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CreditCard, Landmark, ShieldCheck, Smartphone, Wallet } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@ctypes/navigation';
import { ColorTokens, FontFamily, FontSize, FontWeight, Spacing } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';
import { Button, Card, Caption, ScreenHeader } from '@shared/ui';
import { formatPrice } from '@shared/utils';
import { useAuthStore } from '@store/authStore';
import { createOrder } from '@services/paymentService';
import { errorMessage } from '@services/httpClient';

type Props = NativeStackScreenProps<RootStackParamList, 'Payment'>;

const METHODS = [
  { key: 'card', label: 'Cards', icon: CreditCard },
  { key: 'upi', label: 'UPI', icon: Smartphone },
  { key: 'wallet', label: 'Wallets', icon: Wallet },
  { key: 'netbanking', label: 'Net Banking', icon: Landmark },
] as const;

export function PaymentScreen({ navigation, route }: Props) {
  const params = route.params;
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const customer = useAuthStore(s => s.customer);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Guards against a double-tap firing two Razorpay orders for the same hold.
  const inFlight = useRef(false);

  async function payNow() {
    if (inFlight.current) return;
    inFlight.current = true;
    setSubmitting(true);
    setError(null);
    try {
      const order = await createOrder(params.showId, params.seatIds, params.offerCode ?? undefined);
      setSubmitting(false);
      inFlight.current = false;
      navigation.navigate('RazorpayWebView', {
        orderId: order.order_id,
        amountPaise: order.amount,
        currency: order.currency,
        keyId: order.key_id,
        customerName: customer?.name ?? '',
        customerEmail: customer?.email ?? '',
        customerPhone: customer?.phone ?? undefined,
        description: `Booking for ${params.seatIds.length} seat(s) — ${params.movieTitle}`,
        checkoutParams: params,
        offerCode: params.offerCode,
      });
    } catch (err) {
      setSubmitting(false);
      inFlight.current = false;
      setError(errorMessage(err, 'Could not start payment. Please try again.'));
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScreenHeader title="Payment" onBack={() => navigation.goBack()} />

      <View style={styles.content}>
        <View style={styles.amountBlock}>
          <Text style={styles.amountLabel}>AMOUNT PAYABLE</Text>
          <Text style={styles.amountValue}>{formatPrice(params.grandTotal)}</Text>
          <Text style={styles.amountSub}>{params.seatIds.length} seat(s) · {params.movieTitle}</Text>
        </View>

        <View style={styles.secureRow}>
          <ShieldCheck size={16} color={colors.success} />
          <Text style={styles.secureText}>Secured by Razorpay · PCI-DSS compliant</Text>
        </View>

        <View style={styles.methodsGrid}>
          {METHODS.map(m => (
            <Card key={m.key} padding="sm" style={styles.methodTile}>
              <m.icon size={20} color={colors.textSecondary} />
              <Text style={styles.methodLabel}>{m.label}</Text>
            </Card>
          ))}
        </View>
        <Caption style={styles.methodsCaption}>You&apos;ll choose how to pay in the next step</Caption>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>

      <View style={styles.cta}>
        <Button
          label={submitting ? 'Starting payment…' : `Pay ${formatPrice(params.grandTotal)} securely`}
          onPress={payNow}
          disabled={submitting}
          loading={submitting}
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
    content: { flex: 1, paddingHorizontal: Spacing.lg, gap: Spacing.lg },
    amountBlock: { alignItems: 'center', marginTop: Spacing.xl },
    amountLabel: { fontSize: FontSize.xs, color: Colors.textMuted, letterSpacing: 1.5, marginBottom: 4 },
    amountValue: {
      fontFamily: FontFamily.bold,
      fontWeight: FontWeight.bold,
      fontSize: FontSize.xxl,
      color: Colors.textPrimary,
    },
    amountSub: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 4 },
    secureRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.xs,
    },
    secureText: { fontSize: FontSize.xs, color: Colors.textMuted },
    methodsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.sm,
      justifyContent: 'center',
    },
    methodTile: {
      width: 78,
      height: 64,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },
    methodLabel: { fontSize: FontSize.xs - 1, color: Colors.textMuted },
    methodsCaption: { textAlign: 'center', marginTop: -Spacing.xs },
    errorText: { textAlign: 'center', color: Colors.error, fontSize: FontSize.sm },
    cta: {
      padding: Spacing.lg,
      backgroundColor: Colors.background,
      borderTopWidth: 1,
      borderTopColor: Colors.border,
    },
  });
