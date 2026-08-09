import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Show } from '@ctypes/models';
import {
  ColorTokens,
  FontSize,
  FontWeight,
  Radius,
  Spacing,
} from '@constants/theme';
import { useTheme } from '@hooks/useTheme';
import { BodySmall, Caption } from '@shared/ui';
import { formatAvailability, getAvailabilityColor } from '@shared/utils';

interface ShowTimeChipProps {
  show: Show;
  selected: boolean;
  onPress: (show: Show) => void;
}

export function ShowTimeChip({ show, selected, onPress }: ShowTimeChipProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const isHousefull = show.availableSeats === 0;
  const availText = formatAvailability(show.availableSeats, show.totalSeats);
  const availColor = getAvailabilityColor(show.availableSeats, show.totalSeats);

  return (
    <Pressable
      style={[
        styles.chip,
        selected && styles.chipSelected,
        isHousefull && styles.chipDisabled,
      ]}
      onPress={() => !isHousefull && onPress(show)}
      disabled={isHousefull}>
      <View style={[styles.formatDot, { backgroundColor: formatColor(show.format) }]} />
      <BodySmall style={[styles.time, selected && styles.timeSelected]}>
        {show.time}
      </BodySmall>
      <Caption style={styles.format}>{show.format}</Caption>
      <Caption style={[styles.avail, { color: availColor }]}>{availText}</Caption>
    </Pressable>
  );
}

function formatColor(format: string): string {
  switch (format) {
    case 'IMAX': return '#3B82F6';
    case '4DX': return '#F59E0B';
    case '3D': return '#8B5CF6';
    default: return '#6B7280';
  }
}

const makeStyles = (Colors: ColorTokens) =>
  StyleSheet.create({
    chip: {
      borderWidth: 1,
      borderColor: Colors.border,
      borderRadius: Radius.md,
      padding: Spacing.sm,
      alignItems: 'center',
      gap: 3,
      minWidth: 90,
      backgroundColor: Colors.surface,
    },
    chipSelected: {
      borderColor: Colors.success,
      backgroundColor: Colors.emeraldDim,
    },
    chipDisabled: {
      opacity: 0.4,
    },
    formatDot: {
      width: 6,
      height: 6,
      borderRadius: Radius.full,
    },
    time: {
      fontWeight: FontWeight.semibold,
      fontSize: FontSize.sm,
      color: Colors.textPrimary,
    },
    timeSelected: { color: Colors.success },
    format: { color: Colors.textMuted },
    avail: { fontSize: FontSize.xs - 1 },
  });
