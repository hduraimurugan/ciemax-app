import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors, Radius, Spacing } from '@constants/theme';
import { Caption } from '@shared/ui';

export function SeatLegend() {
  return (
    <View style={styles.container}>
      <View style={styles.item}>
        <View style={[styles.dot, styles.dotAvailable]} />
        <Caption>Available</Caption>
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

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.lg,
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
    backgroundColor: Colors.transparent,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dotSelected: {
    backgroundColor: Colors.emerald,
  },
  dotBooked: {
    backgroundColor: Colors.surfaceHighlight,
  },
});
