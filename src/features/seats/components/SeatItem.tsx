import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Seat, SeatStatus } from '@ctypes/models';
import { ColorTokens, FontSize, FontWeight, Radius, makeNeonShadow } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';

const SEAT_SIZE = 28;
const SEAT_GAP = 4;

interface SeatItemProps {
  seat: Seat;
  /**
   * Effective status, separate from `seat.status`: the grid overlays local
   * selection state on top of the fetched seat without mutating/cloning the
   * seat object (which would defeat React.memo below on every render).
   */
  status: SeatStatus;
  onPress: (seat: Seat) => void;
}

export const SeatItem = React.memo(function SeatItem({ seat, status, onPress }: SeatItemProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  // Passage/blocked seats are invisible spacers that preserve the grid's
  // column alignment — not rendered as a seat at all.
  if (seat.section === 'passage' || seat.isBlocked) {
    return <View style={styles.spacer} />;
  }

  const isBooked = status === 'booked';
  const isHeld = status === 'held';
  const isUnavailable = isBooked || isHeld;
  const isSelected = status === 'selected';
  const isPremium = seat.section === 'premium';

  return (
    <Pressable
      style={[
        styles.seat,
        isPremium && !isUnavailable && !isSelected && styles.premium,
        isUnavailable && styles.booked,
        isSelected && styles.selected,
      ]}
      onPress={() => !isUnavailable && onPress(seat)}
      disabled={isUnavailable}
      hitSlop={2}>
      <Text
        style={[
          styles.label,
          isPremium && !isUnavailable && !isSelected && styles.labelPremium,
          isSelected && styles.labelSelected,
        ]}>
        {String(seat.number).padStart(2, '0')}
      </Text>
    </Pressable>
  );
});

const makeStyles = (Colors: ColorTokens) =>
  StyleSheet.create({
    spacer: {
      width: SEAT_SIZE,
      height: SEAT_SIZE,
      margin: SEAT_GAP / 2,
    },
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
      opacity: 0.55,
    },
    selected: {
      backgroundColor: Colors.seatSelected,
      borderColor: Colors.seatSelected,
      ...makeNeonShadow(Colors),
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
      color: Colors.textPrimary,
      fontWeight: FontWeight.bold,
    },
  });

export { SEAT_SIZE, SEAT_GAP };
