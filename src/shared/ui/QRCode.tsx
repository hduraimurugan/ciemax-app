import React from 'react';
import { StyleSheet, View } from 'react-native';
import QRCodeSVG from 'react-native-qrcode-svg';
import { Colors, Radius } from '@constants/theme';

interface QRCodeProps {
  value: string;
  size?: number;
}

export function QRCode({ value, size = 90 }: QRCodeProps) {
  return (
    <View style={styles.wrapper}>
      <QRCodeSVG
        value={value || 'CINEBOOK'}
        size={size}
        color={Colors.textPrimary}
        backgroundColor={Colors.surface}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    padding: 8,
    backgroundColor: Colors.surface,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    alignSelf: 'center',
  },
});
