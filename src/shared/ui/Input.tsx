import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { ColorTokens, FontSize, Radius, Spacing } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Input({
  label,
  error,
  containerStyle,
  leftIcon,
  rightIcon,
  style,
  ...props
}: InputProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.inputRow,
          focused && styles.inputFocused,
          error ? styles.inputError : undefined,
        ]}>
        {leftIcon ? <View style={styles.iconLeft}>{leftIcon}</View> : null}
        <TextInput
          style={[styles.input, leftIcon ? { paddingLeft: 0 } : undefined, style]}
          placeholderTextColor={colors.textMuted}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          selectionColor={colors.accent}
          {...props}
        />
        {rightIcon ? <View style={styles.iconRight}>{rightIcon}</View> : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const makeStyles = (Colors: ColorTokens) =>
  StyleSheet.create({
    wrapper: { gap: Spacing.xs },
    label: {
      fontSize: FontSize.xs,
      color: Colors.textSecondary,
      fontWeight: '500',
      letterSpacing: 0.3,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: Colors.surfaceElevated,
      borderRadius: Radius.md,
      borderWidth: 1,
      borderColor: Colors.border,
      paddingHorizontal: Spacing.md,
    },
    // Border-only on purpose — no shadow/elevation here. This app runs on
    // Fabric (newArchEnabled), where Android *does* render shadowColor/
    // shadowOpacity/shadowRadius (unlike the old architecture, which ignored
    // them without `elevation`). Toggling any shadow prop on the direct
    // parent of a TextInput promotes it to a new native layer right as it
    // gains focus, which remounts the TextInput mid-focus and kicks focus to
    // the next field — reproduced on-device: IME session mismatch + an
    // immediate programmatic hide right after the show. Confirmed via adb.
    inputFocused: {
      borderColor: Colors.accent,
    },
    inputError: {
      borderColor: Colors.error,
    },
    input: {
      flex: 1,
      color: Colors.textPrimary,
      fontSize: FontSize.sm,
      paddingVertical: Spacing.sm + 4,
    },
    iconLeft: { marginRight: Spacing.sm },
    iconRight: { marginLeft: Spacing.sm },
    errorText: {
      fontSize: FontSize.xs,
      color: Colors.error,
      marginTop: 2,
    },
  });
