import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Colors, FontFamily, FontSize, FontWeight, Radius, Spacing } from '@constants/theme';

interface CountdownTimerProps {
  initialSeconds?: number;
  onExpire?: () => void;
}

export function CountdownTimer({ initialSeconds = 600, onExpire }: CountdownTimerProps) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const isUrgent = seconds < 120;

  useEffect(() => {
    if (seconds <= 0) {
      onExpire?.();
      return;
    }
    const timer = setInterval(() => {
      setSeconds(s => s - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [seconds, onExpire]);

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

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  normal: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
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
