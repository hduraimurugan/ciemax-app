import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { Colors, FontFamily, FontSize, FontWeight } from '@constants/theme';

interface TypographyProps extends TextProps {
  color?: string;
}

export function DisplayText({ style, color, ...props }: TypographyProps) {
  return (
    <Text
      style={[styles.display, color ? { color } : undefined, style]}
      {...props}
    />
  );
}

export function Heading1({ style, color, ...props }: TypographyProps) {
  return (
    <Text
      style={[styles.h1, color ? { color } : undefined, style]}
      {...props}
    />
  );
}

export function Heading2({ style, color, ...props }: TypographyProps) {
  return (
    <Text
      style={[styles.h2, color ? { color } : undefined, style]}
      {...props}
    />
  );
}

export function Heading3({ style, color, ...props }: TypographyProps) {
  return (
    <Text
      style={[styles.h3, color ? { color } : undefined, style]}
      {...props}
    />
  );
}

export function BodyLarge({ style, color, ...props }: TypographyProps) {
  return (
    <Text
      style={[styles.bodyLarge, color ? { color } : undefined, style]}
      {...props}
    />
  );
}

export function Body({ style, color, ...props }: TypographyProps) {
  return (
    <Text
      style={[styles.body, color ? { color } : undefined, style]}
      {...props}
    />
  );
}

export function BodySmall({ style, color, ...props }: TypographyProps) {
  return (
    <Text
      style={[styles.bodySmall, color ? { color } : undefined, style]}
      {...props}
    />
  );
}

export function Caption({ style, color, ...props }: TypographyProps) {
  return (
    <Text
      style={[styles.caption, color ? { color } : undefined, style]}
      {...props}
    />
  );
}

export function Label({ style, color, ...props }: TypographyProps) {
  return (
    <Text
      style={[styles.label, color ? { color } : undefined, style]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  display: {
    fontSize: FontSize.display,
    fontFamily: FontFamily.extrabold,
    fontWeight: FontWeight.extrabold,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  h1: {
    fontSize: FontSize.xxl,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  h2: {
    fontSize: FontSize.xl,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  h3: {
    fontSize: FontSize.lg,
    fontFamily: FontFamily.semibold,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  bodyLarge: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.medium,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
    lineHeight: FontSize.md * 1.6,
  },
  body: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.regular,
    fontWeight: FontWeight.regular,
    color: Colors.textSecondary,
    lineHeight: FontSize.sm * 1.6,
  },
  bodySmall: {
    fontSize: FontSize.xs + 1,
    fontFamily: FontFamily.regular,
    fontWeight: FontWeight.regular,
    color: Colors.textSecondary,
    lineHeight: (FontSize.xs + 1) * 1.5,
  },
  caption: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.regular,
    fontWeight: FontWeight.regular,
    color: Colors.textMuted,
  },
  label: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.semibold,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});
