import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Svg, { Circle, Defs, G, Line, Path, Polygon, Rect, Stop, LinearGradient as SvgGradient } from 'react-native-svg';
import { RootStackParamList } from '@ctypes/navigation';
import { ColorTokens, FontSize, Radius, Spacing } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';
import { StorageKeys } from '@constants/config';
import { Button, Caption, Heading2, Body } from '@shared/ui';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const ONBOARD_SLIDES = [
  { title: 'Browse Now Showing & Upcoming', desc: 'Explore the latest blockbusters and book your favorite showtimes in seconds.', illustration: 'discover' },
  { title: 'Pick Your Perfect Seat', desc: "Real cinema seat maps so you know exactly where you'll sit before you pay.", illustration: 'seats' },
  { title: 'Pay & Walk Right In', desc: 'Secure checkout with Razorpay and a QR ticket ready at the door.', illustration: 'ticket' },
] as const;

type IllustrationKind = (typeof ONBOARD_SLIDES)[number]['illustration'];

function OnboardingIllustration({ kind, colors }: { kind: IllustrationKind; colors: ColorTokens }) {
  const coral = colors.accent;
  const paper = '#FFF8F2';
  const gold = colors.gold;

  return (
    <View style={illustrationStyles.frame}>
      <Svg width="100%" height="100%" viewBox="0 0 340 280" fill="none">
        <Defs>
          <SvgGradient id="redGlow" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={coral} /><Stop offset="1" stopColor={colors.accentDim} />
          </SvgGradient>
          <SvgGradient id="ticketGlow" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#FFDB8A" /><Stop offset="1" stopColor={gold} />
          </SvgGradient>
        </Defs>
        <Circle cx="283" cy="42" r="22" fill={colors.surfaceHighlight} opacity=".55" />
        <Circle cx="54" cy="218" r="38" fill={colors.accentLight} opacity=".3" />
        {kind === 'discover' && <G>
          <Path d="M42 214V103c0-9 7-16 16-16h224c9 0 16 7 16 16v111" stroke={colors.border} strokeWidth="3" />
          <Path d="M30 214h280" stroke={gold} strokeWidth="4" strokeLinecap="round" />
          <Rect x="57" y="61" width="226" height="43" rx="8" fill="url(#redGlow)" />
          <Path d="M75 61v-13M265 61v-13" stroke={gold} strokeWidth="4" strokeLinecap="round" />
          {[78, 104, 130, 156, 182, 208, 234, 260].map(x => <Circle key={x} cx={x} cy="82" r="4" fill="#FFD27A" />)}
          <Path d="M77 132h56l-5 52H82l-5-52ZM207 132h56l-5 52h-46l-5-52Z" fill={paper} stroke={colors.border} strokeWidth="2" />
          <Path d="M89 143h32M89 151h25M219 143h32M219 151h25" stroke={coral} strokeWidth="4" strokeLinecap="round" />
          <Circle cx="168" cy="156" r="28" fill={colors.surfaceElevated} stroke={gold} strokeWidth="3" />
          <Path d="m168 140 5 11 12 1-9 8 3 12-11-6-11 6 3-12-9-8 12-1 5-11Z" fill={gold} />
          <Path d="M56 214v-14M284 214v-14" stroke={coral} strokeWidth="5" strokeLinecap="round" />
        </G>}
        {kind === 'seats' && <G>
          <Path d="M88 54h164" stroke={gold} strokeWidth="6" strokeLinecap="round" />
          <Path d="M111 66h118" stroke={colors.textMuted} strokeWidth="2" strokeDasharray="5 6" />
          {[0, 1, 2, 3].map(row => <G key={row}>{[0, 1, 2, 3, 4].map(col => {
            const x = 83 + col * 38 + (row % 2 ? 10 : 0); const y = 91 + row * 31; const selected = row === 2 && col === 2;
            return <G key={col}><Rect x={x} y={y} width="26" height="20" rx="7" fill={selected ? coral : colors.surfaceElevated} stroke={selected ? '#FF9B83' : colors.border} strokeWidth="2" /><Line x1={x + 5} y1={y + 25} x2={x + 21} y2={y + 25} stroke={selected ? coral : colors.textMuted} strokeWidth="3" strokeLinecap="round" /></G>;
          })}</G>)}
          <Circle cx="173" cy="186" r="25" fill={coral} opacity=".15" />
          <Path d="m163 187 7 7 14-16" stroke="#FFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M115 239h110" stroke={gold} strokeWidth="3" strokeLinecap="round" />
        </G>}
        {kind === 'ticket' && <G>
          <Path d="M80 85c8 0 14-6 14-14h152c0 8 6 14 14 14v91c-8 0-14 6-14 14H94c0-8-6-14-14-14V85Z" fill="url(#ticketGlow)" stroke="#FFE7AA" strokeWidth="3" />
          <Path d="M203 80v110" stroke="#B98536" strokeWidth="2" strokeDasharray="5 7" />
          <Rect x="112" y="107" width="65" height="65" rx="4" fill={paper} />
          <Path d="M119 114h17v17h-17zM153 114h17v17h-17zM119 148h17v17h-17zM155 151h5v5h-5zM165 143h5v5h-5zM151 162h5v5h-5z" fill={colors.background} />
          <Path d="M220 111h24M220 122h16M220 145h24M220 156h18" stroke="#8D652D" strokeWidth="4" strokeLinecap="round" />
          <Circle cx="232" cy="174" r="5" fill={coral} />
          <Path d="M57 214h226M105 214v-16M235 214v-16" stroke={colors.border} strokeWidth="3" strokeLinecap="round" />
          <Polygon points="67,214 105,214 96,235 76,235" fill={colors.surfaceElevated} /><Polygon points="235,214 273,214 264,235 244,235" fill={colors.surfaceElevated} />
        </G>}
      </Svg>
      <View style={[illustrationStyles.badge, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
        <View style={[illustrationStyles.badgeDot, { backgroundColor: coral }]} />
        <Caption style={{ color: colors.textSecondary }}>{kind === 'discover' ? 'NOW SHOWING' : kind === 'seats' ? 'YOUR SEAT' : 'READY TO GO'}</Caption>
      </View>
    </View>
  );
}

export function OnboardingScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [idx, setIdx] = useState(0);
  const slide = ONBOARD_SLIDES[idx];
  const isLast = idx === ONBOARD_SLIDES.length - 1;
  // Browsing is public — onboarding lands guests in the app, not a forced
  // login. Login only appears when a protected action needs it
  // (useRequireAuth), matching the web app's behavior.
  const finish = async () => {
    await AsyncStorage.setItem(StorageKeys.onboardingSeen, '1');
    navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
  };
  const onNext = () => isLast ? finish() : setIdx(i => i + 1);

  return <SafeAreaView style={styles.screen}>
    <View style={styles.skipRow}><Pressable onPress={finish} hitSlop={8}><Caption style={styles.skip}>Skip</Caption></Pressable></View>
    <View style={styles.body}>
      <OnboardingIllustration kind={slide.illustration} colors={colors} />
      <View style={styles.textBlock}><Heading2 style={styles.title}>{slide.title}</Heading2><Body style={styles.desc}>{slide.desc}</Body></View>
    </View>
    <View style={styles.dots}>{ONBOARD_SLIDES.map((_, i) => <View key={i} style={[styles.dot, i === idx && styles.dotActive]} />)}</View>
    <View style={styles.footer}><Button label={isLast ? 'Get Started' : 'Next'} onPress={onNext} fullWidth size="lg" /></View>
  </SafeAreaView>;
}

const illustrationStyles = StyleSheet.create({
  frame: { width: '100%', maxWidth: 360, height: 280, position: 'relative' },
  badge: { position: 'absolute', top: 14, left: 14, flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 8, borderWidth: 1 },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
});

const makeStyles = (Colors: ColorTokens) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  skipRow: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm },
  skip: { color: Colors.textMuted, padding: Spacing.xs },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.xl, paddingHorizontal: Spacing.lg },
  textBlock: { alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.sm },
  title: { textAlign: 'center', maxWidth: 340 },
  desc: { textAlign: 'center', lineHeight: FontSize.sm * 1.6, maxWidth: 330 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.xs, marginBottom: Spacing.lg },
  dot: { width: 6, height: 6, borderRadius: Radius.full, backgroundColor: Colors.border },
  dotActive: { width: 18, backgroundColor: Colors.accent },
  footer: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
});
