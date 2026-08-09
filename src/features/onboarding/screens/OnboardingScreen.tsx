import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@ctypes/navigation';
import { ColorTokens, FontSize, Radius, Spacing } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';
import { Button, Caption, Heading2, Body } from '@shared/ui';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const ONBOARD_SLIDES = [
  {
    title: 'Browse Now Showing & Upcoming',
    desc: 'Explore the latest blockbusters and book your favorite showtimes in seconds.',
    icon: 'browsing movies',
  },
  {
    title: 'Pick Your Perfect Seat',
    desc: "Real cinema seat maps so you know exactly where you'll sit before you pay.",
    icon: 'seat map',
  },
  {
    title: 'Pay & Walk Right In',
    desc: 'Secure checkout with Razorpay and a QR ticket ready at the door.',
    icon: 'qr ticket',
  },
];

export function OnboardingScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [idx, setIdx] = useState(0);
  const slide = ONBOARD_SLIDES[idx];
  const isLast = idx === ONBOARD_SLIDES.length - 1;

  const goLogin = () => navigation.reset({ index: 0, routes: [{ name: 'Login' }] });

  const onNext = () => {
    if (isLast) goLogin();
    else setIdx(i => i + 1);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.skipRow}>
        <Pressable onPress={goLogin} hitSlop={8}>
          <Caption style={styles.skip}>Skip</Caption>
        </Pressable>
      </View>

      <View style={styles.body}>
        <View style={styles.illustration}>
          <Caption style={styles.illustrationLabel}>illustration: {slide.icon}</Caption>
        </View>
        <View style={styles.textBlock}>
          <Heading2 style={styles.title}>{slide.title}</Heading2>
          <Body style={styles.desc}>{slide.desc}</Body>
        </View>
      </View>

      <View style={styles.dots}>
        {ONBOARD_SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, i === idx && styles.dotActive]} />
        ))}
      </View>

      <View style={styles.footer}>
        <Button label={isLast ? 'Get Started' : 'Next'} onPress={onNext} fullWidth size="lg" />
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (Colors: ColorTokens) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: Colors.background },
    skipRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      paddingHorizontal: Spacing.lg,
      paddingTop: Spacing.sm,
    },
    skip: { color: Colors.textMuted, padding: Spacing.xs },
    body: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.xl,
      paddingHorizontal: Spacing.xl,
    },
    illustration: {
      width: 220,
      height: 220,
      borderRadius: Radius.xl,
      backgroundColor: Colors.surfaceElevated,
      borderWidth: 1,
      borderColor: Colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      padding: Spacing.md,
    },
    illustrationLabel: { textAlign: 'center' },
    textBlock: { alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.sm },
    title: { textAlign: 'center' },
    desc: { textAlign: 'center', lineHeight: FontSize.sm * 1.6 },
    dots: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: Spacing.xs,
      marginBottom: Spacing.lg,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: Radius.full,
      backgroundColor: Colors.border,
    },
    dotActive: {
      width: 18,
      backgroundColor: Colors.accent,
    },
    footer: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
  });
