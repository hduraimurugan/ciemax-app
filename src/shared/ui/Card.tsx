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

  const containerStyle = [
    styles.card,
    elevated && styles.elevated,
    variant === 'glass' && styles.glass,
    variant === 'neon' && styles.neon,
    padding !== 'none' && styles[`pad_${padding}`],
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [...containerStyle, pressed && styles.pressed]}
        onPress={onPress}>
        {children}
      </Pressable>
    );
  }

  return <View style={containerStyle}>{children}</View>;
}

const makeStyles = (Colors: ColorTokens) =>
  StyleSheet.create({
    card: {
      backgroundColor: Colors.surface,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: Colors.border,
      overflow: 'hidden',
    },
    elevated: {
      ...Shadow.md,
      borderColor: Colors.surfaceElevated,
    },
    glass: {
      backgroundColor: Colors.glassSurface,
      borderColor: Colors.glassBorder,
    },
    neon: {
      ...makeNeonShadow(Colors),
    },
    pressed: {
      opacity: 0.85,
    },
    pad_sm: { padding: Spacing.sm },
    pad_md: { padding: Spacing.md },
    pad_lg: { padding: Spacing.lg },
  });
