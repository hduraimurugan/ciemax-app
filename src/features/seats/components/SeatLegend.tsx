import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors, Radius, Spacing } from '@constants/theme';
import { Caption } from '@shared/ui';

interface LegendItem {
  color: string;
  label: string;
}

const LEGEND_ITEMS: LegendItem[] = [
  { color: Colors.seatAvailable, label: 'Available' },
  { color: Colors.seatSelected, label: 'Selected' },
  { color: Colors.seatBooked, label: 'Booked' },
];

export function SeatLegend() {
  return (
    <View style={styles.container}>
      {LEGEND_ITEMS.map(item => (
        <View key={item.label} style={styles.item}>
          <View style={[styles.dot, { backgroundColor: item.color }]} />
          <Caption>{item.label}</Caption>
        </View>
      ))}
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
});
