import React, { useMemo } from 'react';
import { AccessibilityProps, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  Easing,
  makeMutable,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { ColorTokens, FontSize, Radius, Spacing } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';

/**
 * One shared value drives every shimmer band on screen (and across screens),
 * so N skeleton placeholders cost a single UI-thread animation and stay
 * perfectly in phase. Created once at module scope, started immediately.
 */
const shimmerProgress = makeMutable(0);

// Kick off the loop once, at module load. `withRepeat`/`withTiming` are safe
// to invoke outside a component to drive a mutable's animation — Reanimated
// schedules the driver on the UI thread internally.
shimmerProgress.value = withRepeat(
  withTiming(1, { duration: 1200, easing: Easing.linear }),
  -1,
  false,
);

const BAND_WIDTH_RATIO = 0.55;

interface SkeletonProps {
  width: number | `${number}%`;
  height: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

/** Base skeleton block: a themed fill with a soft light band sweeping across it. */
export function Skeleton({ width, height, radius = Radius.sm, style }: SkeletonProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const numericWidth = typeof width === 'number' ? width : 200; // fallback for band translation math on '%' widths
  const bandWidth = Math.max(40, numericWidth * BAND_WIDTH_RATIO);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX:
          -bandWidth + shimmerProgress.value * (numericWidth + bandWidth * 2),
      },
    ],
  }));

  return (
    <View style={[{ width, height, borderRadius: radius }, styles.base, style]}>
      <Animated.View style={[StyleSheet.absoluteFill, { width: bandWidth }, animatedStyle]}>
        <LinearGradient
          style={StyleSheet.absoluteFill}
          colors={[colors.transparent, colors.surfaceHighlight, colors.transparent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
      </Animated.View>
    </View>
  );
}

interface SkeletonTextProps {
  lines?: number;
  width?: number | `${number}%`;
  lastLineWidth?: number | `${number}%`;
  lineHeight?: number;
  gap?: number;
  style?: StyleProp<ViewStyle>;
}

/** Stacked bars mimicking wrapped text — the last line defaults shorter. */
export function SkeletonText({
  lines = 1,
  width = '100%',
  lastLineWidth = '60%',
  lineHeight = FontSize.sm,
  gap = Spacing.xs,
  style,
}: SkeletonTextProps) {
  return (
    <View style={[{ gap }, style]}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          width={i === lines - 1 && lines > 1 ? lastLineWidth : width}
          height={lineHeight}
          radius={4}
        />
      ))}
    </View>
  );
}

/** Circular placeholder — avatars, cast photos. */
export function SkeletonCircle({ size, style }: { size: number; style?: StyleProp<ViewStyle> }) {
  return <Skeleton width={size} height={size} radius={Radius.full} style={style} />;
}

/** Mirrors MovieCard.tsx's 128x184 poster + two text lines exactly. */
export function SkeletonPoster({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ width: 128 }, style]}>
      <Skeleton width={128} height={184} radius={Radius.lg} />
      <View style={{ paddingTop: Spacing.xs + 4, gap: 2 }}>
        <Skeleton width="85%" height={FontSize.sm} radius={4} />
        <Skeleton width="55%" height={FontSize.xs} radius={4} />
      </View>
    </View>
  );
}

/** Screen-root wrapper — marks the whole block as a single a11y loading region. */
export function SkeletonGroup({
  children,
  style,
  label = 'Loading',
}: { children: React.ReactNode; style?: StyleProp<ViewStyle>; label?: string } & AccessibilityProps) {
  return (
    <View
      style={style}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      importantForAccessibility="yes">
      {children}
    </View>
  );
}

const makeStyles = (Colors: ColorTokens) =>
  StyleSheet.create({
    base: {
      backgroundColor: Colors.surfaceElevated,
      overflow: 'hidden',
    },
  });
