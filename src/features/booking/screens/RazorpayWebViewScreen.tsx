import React, { useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { X } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@ctypes/navigation';
import { ColorTokens, Radius, Spacing } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';
import { Loader } from '@shared/ui';
import { verifyPayment } from '@services/paymentService';
import { errorMessage } from '@services/httpClient';
import { razorpayCheckoutHtml } from '../utils/razorpayCheckoutHtml';

type Props = NativeStackScreenProps<RootStackParamList, 'RazorpayWebView'>;

type BridgeMessage =
  | { event: 'success'; payload: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string } }
  | { event: 'dismiss' }
  | { event: 'error'; message: string };

export function RazorpayWebViewScreen({ navigation, route }: Props) {
  const params = route.params;
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const html = useMemo(() => razorpayCheckoutHtml(params), [params]);
  const [loading, setLoading] = useState(true);
  // Guards against the bridge firing twice (e.g. a stray dismiss after success).
  const settledRef = useRef(false);

  function goFailure(reason: 'cancelled' | 'failed', message?: string) {
    if (settledRef.current) return;
    settledRef.current = true;
    navigation.replace('BookingFailure', {
      reason,
      message,
      checkoutParams: params.checkoutParams,
      offerCode: params.offerCode,
    });
  }

  async function handleMessage(event: WebViewMessageEvent) {
    if (settledRef.current) return;
    let message: BridgeMessage;
    try {
      message = JSON.parse(event.nativeEvent.data);
    } catch {
      return;
    }

    if (message.event === 'dismiss') {
      goFailure('cancelled');
      return;
    }
    if (message.event === 'error') {
      goFailure('failed', message.message);
      return;
    }
    if (message.event === 'success') {
      settledRef.current = true;
      try {
        const result = await verifyPayment(message.payload);
        navigation.replace('BookingSuccess', { paymentId: result.booking.payment_id ?? message.payload.razorpay_payment_id });
      } catch (err) {
        settledRef.current = false;
        goFailure('failed', errorMessage(err, 'Payment verification failed. If any amount was deducted, it will be refunded.'));
      }
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable style={styles.closeBtn} onPress={() => goFailure('cancelled')} hitSlop={8}>
          <X size={18} color={colors.textPrimary} />
        </Pressable>
      </View>
      <View style={styles.webviewWrap}>
        <WebView
          source={{ html }}
          originWhitelist={['*']}
          onMessage={handleMessage}
          onLoadEnd={() => setLoading(false)}
          onError={() => goFailure('failed', 'Could not load the payment page. Check your connection.')}
          javaScriptEnabled
          domStorageEnabled
          style={styles.webview}
        />
        {loading && (
          <View style={styles.loaderOverlay}>
            <Loader message="Opening secure checkout…" />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (Colors: ColorTokens) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: Colors.background },
    header: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      padding: Spacing.md,
    },
    closeBtn: {
      width: 34,
      height: 34,
      borderRadius: Radius.md,
      backgroundColor: Colors.surfaceElevated,
      alignItems: 'center',
      justifyContent: 'center',
    },
    webviewWrap: { flex: 1 },
    webview: { flex: 1, backgroundColor: Colors.background },
    loaderOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: Colors.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
