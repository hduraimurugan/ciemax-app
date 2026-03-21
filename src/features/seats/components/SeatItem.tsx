import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Seat } from '@ctypes/models';
import { Colors, FontSize, FontWeight, Radius } from '@constants/theme';

const SEAT_SIZE = 30;
const SEAT_GAP = 5;

interface SeatItemProps {
  seat: Seat;
  onPress: (seat: Seat) => void;
}

export function SeatItem({ seat, onPress }: SeatItemProps) {
  const isBooked = seat.status === 'booked';
  const isSelected = seat.status === 'selected';

  return (
    <Pressable
      style={[
        styles.seat,
        isBooked && styles.booked,
        isSelected && styles.selected,
      ]}
      onPress={() => !isBooked && onPress(seat)}
      disabled={isBooked}
      hitSlop={2}>
      <Text style={[styles.label, isSelected && styles.labelSelected]}>
        {seat.number}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  seat: {
    width: SEAT_SIZE,
    height: SEAT_SIZE,
    borderRadius: Radius.xs + 1,
    backgroundColor: Colors.seatAvailable,
    alignItems: 'center',
    justifyContent: 'center',
    margin: SEAT_GAP / 2,
  },
  booked: {
    backgroundColor: Colors.seatBooked,
    borderWidth: 1,
    borderColor: Colors.seatBookedBorder,
  },
  selected: {
    backgroundColor: Colors.seatSelected,
  },
  label: {
    fontSize: FontSize.xs - 1,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  labelSelected: {
    color: Colors.textPrimary,
    fontWeight: FontWeight.bold,
  },
});

export { SEAT_SIZE, SEAT_GAP };
