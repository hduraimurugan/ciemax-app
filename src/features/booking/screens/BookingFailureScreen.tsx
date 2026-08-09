import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@ctypes/navigation';
import { ColorTokens, Radius, Spacing } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';
import { Button } from '@shared/ui';
import { Heading1, Body, BodySmall } from '@shared/ui';

type Props = NativeStackScreenProps<RootStackParamList, 'BookingFailure'>;

export function BookingFailureScreen({ navigation, route }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 50, friction: 7 }),
      Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, [opacity, scale]);

  function handleGoHome() {
    navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
  }

  function handleTryAgain() {
    navigation.goBack();
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <Animated.View style={[styles.iconWrapper, { transform: [{ scale }], opacity }]}>
          <X size={36} color={colors.error} strokeWidth={3} />
        </Animated.View>

        <Heading1 style={styles.title}>Booking Failed</Heading1>
        <Body style={styles.subtitle}>
          {route.params?.error ?? 'Something went wrong. Your payment could not be processed.'}
        </Body>
        <BodySmall style={styles.hint}>
          No amount has been charged. Please try again.
        </BodySmall>
      </View>

      <View style={styles.cta}>
        <Button label="Try Again" onPress={handleTryAgain} variant="secondary" fullWidth size="lg" />
        <Button label="Back to Home" onPress={handleGoHome} fullWidth size="lg" />
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
    cta: {
      padding: Spacing.md,
      gap: Spacing.sm,
      borderTopWidth: 1,
      borderTopColor: Colors.border,
    },
  });
