import React from 'react';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Colors, Radius, Shadow, Spacing } from '@constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  elevated?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({
  children,
  style,
  onPress,
  elevated = false,
  padding = 'md',
}: CardProps) {
  const containerStyle = [
    styles.card,
    elevated && styles.elevated,
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

const styles = StyleSheet.create({
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
  pressed: {
    opacity: 0.85,
  },
  pad_sm: { padding: Spacing.sm },
  pad_md: { padding: Spacing.md },
  pad_lg: { padding: Spacing.lg },
});
