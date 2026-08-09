import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import QRCodeSVG from 'react-native-qrcode-svg';
import { ColorTokens, Radius } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';

interface QRCodeProps {
  value: string;
  size?: number;
}

export function QRCode({ value, size = 90 }: QRCodeProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={styles.wrapper}>
      <QRCodeSVG
        value={value || 'CINEHALL'}
        size={size}
        color={colors.textPrimary}
        backgroundColor={colors.surface}
      />
    </View>
  );
}

const makeStyles = (Colors: ColorTokens) =>
  StyleSheet.create({
    wrapper: {
      padding: 8,
      backgroundColor: Colors.surface,
      borderRadius: Radius.sm,
      borderWidth: 1,
      borderColor: Colors.border,
      alignSelf: 'center',
    },
  });
