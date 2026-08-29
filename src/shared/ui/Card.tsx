import React, { useMemo } from 'react';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { ColorTokens, Radius, Shadow, Spacing, makeNeonShadow } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  elevated?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'glass' | 'neon';
}

export function Card({
  children,
  style,
  onPress,
  elevated = false,
  padding = 'md',
  variant = 'default',
}: CardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  // Shadows and `overflow:'hidden'` (needed to clip content to the rounded
  // corners) can't live on the same view on iOS — overflow:'hidden' clips the
  // shadow itself away. So the shadow lives on an outer wrapper, while
  // background/border/padding/clipping stay on an inner content view.
  const shadowStyle = variant === 'neon' ? styles.neon : elevated ? styles.elevatedShadow : styles.baseShadow;

  const innerStyle = [
    styles.card,
    variant === 'glass' && styles.glass,
    elevated && styles.elevatedBorder,
    padding !== 'none' && styles[`pad_${padding}`],
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [styles.shadowWrap, shadowStyle, pressed && styles.pressed]}
        onPress={onPress}>
        <View style={innerStyle}>{children}</View>
      </Pressable>
    );
  }

  return (
    <View style={[styles.shadowWrap, shadowStyle]}>
      <View style={innerStyle}>{children}</View>
    </View>
  );
}

const makeStyles = (Colors: ColorTokens) =>
  StyleSheet.create({
    shadowWrap: {
      borderRadius: Radius.lg,
    },
    baseShadow: { ...Shadow.sm },
    elevatedShadow: { ...Shadow.md },
    neon: {
      ...makeNeonShadow(Colors),
    },
    pressed: {
      opacity: 0.85,
    },
    card: {
      backgroundColor: Colors.surface,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: Colors.border,
      overflow: 'hidden',
    },
    elevatedBorder: {
      borderColor: Colors.surfaceElevated,
    },
    glass: {
      backgroundColor: Colors.glassSurface,
      borderColor: Colors.glassBorder,
    },
    pad_sm: { padding: Spacing.sm },
    pad_md: { padding: Spacing.md },
    pad_lg: { padding: Spacing.lg },
  });
