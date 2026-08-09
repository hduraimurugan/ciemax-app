import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Seat } from '@ctypes/models';
import { ColorTokens, FontSize, FontWeight, Radius } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';

const SEAT_SIZE = 28;
const SEAT_GAP = 4;

interface SeatItemProps {
  seat: Seat;
  onPress: (seat: Seat) => void;
}

export function SeatItem({ seat, onPress }: SeatItemProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const isBooked = seat.status === 'booked';
  const isSelected = seat.status === 'selected';
  const isPremium = seat.section === 'premium';

  return (
    <Pressable
      style={[
        styles.seat,
        isPremium && !isBooked && !isSelected && styles.premium,
        isBooked && styles.booked,
        isSelected && styles.selected,
      ]}
      onPress={() => !isBooked && onPress(seat)}
      disabled={isBooked}
      hitSlop={2}>
      <Text
        style={[
          styles.label,
          isPremium && !isBooked && !isSelected && styles.labelPremium,
          isSelected && styles.labelSelected,
        ]}>
        {seat.number}
      </Text>
    </Pressable>
  );
}

const makeStyles = (Colors: ColorTokens) =>
  StyleSheet.create({
    seat: {
      width: SEAT_SIZE,
      height: SEAT_SIZE,
      borderRadius: Radius.xs,
      backgroundColor: Colors.transparent,
      borderWidth: 1,
      borderColor: Colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      margin: SEAT_GAP / 2,
    },
    premium: {
      backgroundColor: Colors.goldDim,
      borderColor: Colors.gold,
    },
    booked: {
      backgroundColor: Colors.seatBooked,
      borderColor: Colors.seatBookedBorder,
    },
    selected: {
      backgroundColor: Colors.seatSelected,
      borderColor: Colors.seatSelected,
    },
    label: {
      fontSize: FontSize.xs - 1,
      color: Colors.textSecondary,
      fontWeight: FontWeight.medium,
    },
    labelPremium: {
      color: Colors.gold,
    },
    labelSelected: {
      color: '#fff',
      fontWeight: FontWeight.bold,
    },
  });

export { SEAT_SIZE, SEAT_GAP };
