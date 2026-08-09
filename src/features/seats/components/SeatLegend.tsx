import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { ColorTokens, Radius, Spacing } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';
import { Caption } from '@shared/ui';

export function SeatLegend() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={styles.container}>
      <View style={styles.item}>
        <View style={[styles.dot, styles.dotAvailable]} />
        <Caption>Available</Caption>
      </View>
      <View style={styles.item}>
        <View style={[styles.dot, styles.dotPremium]} />
        <Caption>Premium</Caption>
      </View>
      <View style={styles.item}>
        <View style={[styles.dot, styles.dotSelected]} />
        <Caption>Selected</Caption>
      </View>
      <View style={styles.item}>
        <View style={[styles.dot, styles.dotBooked]} />
        <Caption>Booked</Caption>
      </View>
    </View>
  );
}

const makeStyles = (Colors: ColorTokens) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'center',
      flexWrap: 'wrap',
      gap: Spacing.md,
      paddingVertical: Spacing.md,
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
    },
    dot: {
      width: 14,
      height: 14,
      borderRadius: Radius.xs,
    },
    dotAvailable: {
      backgroundColor: Colors.seatAvailable,
      borderWidth: 1,
      borderColor: Colors.border,
    },
    dotPremium: {
      backgroundColor: Colors.goldDim,
      borderWidth: 1,
      borderColor: Colors.gold,
    },
    dotSelected: {
      backgroundColor: Colors.seatSelected,
    },
    dotBooked: {
      backgroundColor: Colors.seatBooked,
      opacity: 0.7,
    },
  });
