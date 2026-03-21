import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Seat, SeatLayout, SeatRow, SeatSection } from '@ctypes/models';
import { Colors, FontSize, FontWeight, Spacing } from '@constants/theme';
import { SeatItem } from './SeatItem';
import { SectionHeader } from './SectionHeader';
import { SeatLegend } from './SeatLegend';

/**
 * SeatGrid — pure UI renderer.
 *
 * Responsibilities:
 *   - Render seats by section (premium → gold → silver)
 *   - Show section headers and row labels
 *   - Delegate tap events to onSeatPress (parent owns logic)
 *
 * Seat toggle logic is NOT here — it lives in useBookingStore.toggleSeat
 * so that this component stays a dumb, reusable renderer.
 */

interface SeatGridProps {
  layout: SeatLayout;
  selectedSeatIds: Set<string>;
  onSeatPress: (seat: Seat) => void;
}

function RowRenderer({
  row,
  selectedSeatIds,
  onSeatPress,
}: {
  row: SeatRow;
  selectedSeatIds: Set<string>;
  onSeatPress: (seat: Seat) => void;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{row.row}</Text>
      <View style={styles.seats}>
        {row.seats.map(seat => {
          const effectiveStatus =
            selectedSeatIds.has(seat.id) ? 'selected' : seat.status;
          return (
            <SeatItem
              key={seat.id}
              seat={{ ...seat, status: effectiveStatus }}
              onPress={onSeatPress}
            />
          );
        })}
      </View>
      <Text style={styles.rowLabel}>{row.row}</Text>
    </View>
  );
}

function SectionRenderer({
  section,
  rows,
  selectedSeatIds,
  onSeatPress,
}: {
  section: SeatSection;
  rows: SeatRow[];
  selectedSeatIds: Set<string>;
  onSeatPress: (seat: Seat) => void;
}) {
  return (
    <View>
      <SectionHeader section={section} />
      {rows.map(row => (
        <RowRenderer
          key={row.row}
          row={row}
          selectedSeatIds={selectedSeatIds}
          onSeatPress={onSeatPress}
        />
      ))}
    </View>
  );
}

export function SeatGrid({ layout, selectedSeatIds, onSeatPress }: SeatGridProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        contentContainerStyle={styles.gridContent}>
        {/* Screen indicator */}
        <View style={styles.screenWrapper}>
          <View style={styles.screenBar} />
          <Text style={styles.screenLabel}>SCREEN</Text>
        </View>

        <SeatLegend />

        <SectionRenderer
          section="premium"
          rows={layout.sections.premium}
          selectedSeatIds={selectedSeatIds}
          onSeatPress={onSeatPress}
        />
        <SectionRenderer
          section="gold"
          rows={layout.sections.gold}
          selectedSeatIds={selectedSeatIds}
          onSeatPress={onSeatPress}
        />
        <SectionRenderer
          section="silver"
          rows={layout.sections.silver}
          selectedSeatIds={selectedSeatIds}
          onSeatPress={onSeatPress}
        />
      </ScrollView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  gridContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  screenWrapper: {
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  screenBar: {
    width: '70%',
    height: 4,
    backgroundColor: Colors.accent,
    borderRadius: 2,
    opacity: 0.6,
  },
  screenLabel: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    letterSpacing: 3,
    fontWeight: FontWeight.semibold,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  rowLabel: {
    width: 20,
    textAlign: 'center',
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  seats: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
  },
});
