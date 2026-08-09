import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import { ColorTokens, FontSize, FontWeight, Radius, Spacing } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'emerald';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  leftIcon?: React.ReactNode;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled,
  loading,
  fullWidth,
  style,
  leftIcon,
}: ButtonProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        fullWidth && styles.fullWidth,
        (pressed && !isDisabled) && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'danger' || variant === 'emerald' ? colors.textPrimary : colors.accent}
        />
      ) : (
        <>
          {leftIcon}
          <Text
            style={[
              styles.label,
              styles[`label_${variant}`],
              styles[`labelSize_${size}`],
              leftIcon ? { marginLeft: Spacing.sm } : undefined,
            ]}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const makeStyles = (Colors: ColorTokens) =>
  StyleSheet.create({
    base: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: Radius.md,
      borderWidth: 1,
      borderColor: Colors.transparent,
    },
    fullWidth: {
      width: '100%',
    },
    pressed: {
      opacity: 0.8,
    },
    disabled: {
      opacity: 0.4,
    },

    // Variants
    primary: {
      backgroundColor: Colors.accent,
    },
    secondary: {
      backgroundColor: Colors.transparent,
      borderColor: Colors.accent,
    },
    ghost: {
      backgroundColor: Colors.transparent,
      borderColor: Colors.transparent,
    },
    danger: {
      backgroundColor: Colors.error,
    },
    emerald: {
      backgroundColor: Colors.emerald,
    },

    // Sizes
    size_sm: {
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.xs + 2,
      borderRadius: Radius.sm,
    },
    size_md: {
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.sm + 4,
    },
    size_lg: {
      paddingHorizontal: Spacing.xl,
      paddingVertical: Spacing.md,
      borderRadius: Radius.lg,
    },

    // Label base
    label: {
      fontWeight: FontWeight.semibold,
      letterSpacing: 0.3,
    },
    label_primary: { color: Colors.textPrimary },
    label_secondary: { color: Colors.accent },
    label_ghost: { color: Colors.textSecondary },
    label_danger: { color: Colors.textPrimary },
    label_emerald: { color: Colors.textPrimary },

    // Label sizes
    labelSize_sm: { fontSize: FontSize.xs + 1 },
    labelSize_md: { fontSize: FontSize.sm },
    labelSize_lg: { fontSize: FontSize.md },
  });
