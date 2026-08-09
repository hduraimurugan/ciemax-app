import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@ctypes/navigation';
import { ColorTokens, Radius, Spacing } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';
import { Button, CountdownTimer } from '@shared/ui';
import { Heading1, Body, BodySmall } from '@shared/ui';
import { releaseSeats } from '@services/bookingService';

type Props = NativeStackScreenProps<RootStackParamList, 'BookingFailure'>;

export function BookingFailureScreen({ navigation, route }: Props) {
  const { reason, message, checkoutParams } = route.params;
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const [releasing, setReleasing] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 50, friction: 7 }),
      Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, [opacity, scale]);

  const initialSeconds = Math.max(
    0,
    Math.floor((new Date(checkoutParams.holdExpiresAt).getTime() - Date.now()) / 1000),
  );

  // The hold keeps counting down in the background even on this screen — if
  // it lapses before the user retries, bounce back to seat selection.
  const handleHoldExpire = useCallback(() => {
    navigation.replace('SeatSelection', { showId: checkoutParams.showId, movieId: checkoutParams.movieId });
  }, [navigation, checkoutParams.showId, checkoutParams.movieId]);

  function handleTryAgain() {
    navigation.replace('Checkout', checkoutParams);
  }

  async function handleCancelAndRelease() {
    setReleasing(true);
    try {
      await releaseSeats(checkoutParams.showId, checkoutParams.seatIds);
    } catch {
      // best-effort
    }
    setReleasing(false);
    navigation.replace('SeatSelection', { showId: checkoutParams.showId, movieId: checkoutParams.movieId });
  }

  const title = reason === 'cancelled' ? 'Payment Cancelled' : 'Payment Failed';
  const defaultMessage =
    reason === 'cancelled'
      ? 'You closed the payment window before it completed.'
      : 'Something went wrong. Your payment could not be processed.';

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <Animated.View style={[styles.iconWrapper, { transform: [{ scale }], opacity }]}>
          <X size={36} color={colors.error} strokeWidth={3} />
        </Animated.View>

        <Heading1 style={styles.title}>{title}</Heading1>
        <Body style={styles.subtitle}>{message ?? defaultMessage}</Body>
        <BodySmall style={styles.hint}>No amount has been charged. Your seats are still held.</BodySmall>

        {initialSeconds > 0 && (
          <View style={styles.timerWrap}>
            <CountdownTimer initialSeconds={initialSeconds} onExpire={handleHoldExpire} />
          </View>
        )}
      </View>

      <View style={styles.cta}>
        <Button label="Try Again" onPress={handleTryAgain} fullWidth size="lg" />
        <Button
          label={releasing ? 'Releasing seats…' : 'Cancel and Release Seats'}
          onPress={handleCancelAndRelease}
          disabled={releasing}
          loading={releasing}
          variant="secondary"
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
    content: {
      flex: 1,
      alignItems: 'center',
      padding: Spacing.lg,
      gap: Spacing.md,
      justifyContent: 'center',
    },
    iconWrapper: {
      width: 80,
      height: 80,
      borderRadius: Radius.full,
      backgroundColor: Colors.errorDim,
      borderWidth: 2,
      borderColor: Colors.error,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.sm,
    },
    title: { textAlign: 'center', color: Colors.textPrimary },
    subtitle: { textAlign: 'center', color: Colors.textSecondary },
    hint: { textAlign: 'center', color: Colors.textMuted },
    timerWrap: { marginTop: Spacing.md },
    cta: {
      padding: Spacing.md,
      gap: Spacing.sm,
      borderTopWidth: 1,
      borderTopColor: Colors.border,
    },
  });
