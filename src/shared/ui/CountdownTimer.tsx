import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { ColorTokens, FontFamily, FontSize, FontWeight, Radius, Spacing } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';
import { useCountdown } from '@hooks/useCountdown';

interface CountdownTimerProps {
  initialSeconds?: number;
  onExpire?: () => void;
}

export function CountdownTimer({ initialSeconds = 600, onExpire }: CountdownTimerProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { seconds } = useCountdown(initialSeconds, onExpire);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const isUrgent = seconds < 120;

  useEffect(() => {
    if (!isUrgent) return;
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.5, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [isUrgent, pulseAnim]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  return (
    <Animated.View
      style={[
        styles.wrapper,
        isUrgent ? styles.urgent : styles.normal,
        isUrgent && { opacity: pulseAnim },
      ]}>
      <Text style={[styles.text, isUrgent ? styles.textUrgent : styles.textNormal]}>
        ⏱ {mm}:{ss}
      </Text>
    </Animated.View>
  );
}

const makeStyles = (Colors: ColorTokens) =>
  StyleSheet.create({
    wrapper: {
      paddingHorizontal: Spacing.sm + 2,
      paddingVertical: Spacing.xs,
      borderRadius: Radius.full,
    },
    normal: {
      backgroundColor: 'rgba(227, 167, 94, 0.15)',
    },
    urgent: {
      backgroundColor: Colors.errorDim,
    },
    text: {
      fontSize: FontSize.xs,
      fontFamily: FontFamily.medium,
      fontWeight: FontWeight.semibold,
    },
    textNormal: {
      color: Colors.warning,
    },
    textUrgent: {
      color: Colors.error,
    },
  });
