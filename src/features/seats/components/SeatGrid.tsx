import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Seat, SeatLayout, SeatSection } from '@ctypes/models';
import { ColorTokens, FontSize, FontWeight, Spacing } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';
import { SeatItem } from './SeatItem';
import { SectionHeader } from './SectionHeader';
import { SeatLegend } from './SeatLegend';

/**
 * SeatGrid — pure UI renderer with pinch-to-zoom/pan.
 *
 * Built from `layout.allSeats` (not `layout.sections`) because that's the
 * only place passage/aisle seats live — they must render as invisible
 * spacers *within* a row to keep column alignment correct. Consecutive rows
 * are grouped by their seat type so section headers (premium/gold/silver)
 * still render at the right boundaries.
 *
 * Seat toggle logic is NOT here — it lives in the screen + seatSelection.ts
 * so this component stays a dumb, reusable renderer.
 */

interface SeatGridProps {
  layout: SeatLayout;
  selectedSeatIds: Set<string>;
  onSeatPress: (seat: Seat) => void;
}

interface GridRow {
  row: string;
  section: SeatSection;
  seats: Seat[];
}

interface SectionGroup {
  section: SeatSection;
  rows: GridRow[];
}

function buildRows(allSeats: Seat[]): GridRow[] {
  const byRow = new Map<string, Seat[]>();
  for (const seat of allSeats) {
    const list = byRow.get(seat.row) ?? [];
    list.push(seat);
    byRow.set(seat.row, list);
  }
  return Array.from(byRow.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([row, seats]) => {
      const sorted = [...seats].sort((a, b) => a.number - b.number);
      const dominant = sorted.find(s => s.section !== 'passage')?.section ?? 'gold';
      return { row, section: dominant, seats: sorted };
    });
}

function groupBySection(rows: GridRow[]): SectionGroup[] {
  const groups: SectionGroup[] = [];
  for (const row of rows) {
    const last = groups[groups.length - 1];
    if (last && last.section === row.section) last.rows.push(row);
    else groups.push({ section: row.section, rows: [row] });
  }
  return groups;
}

const MIN_SCALE = 0.6;
const MAX_SCALE = 2.2;

export function SeatGrid({ layout, selectedSeatIds, onSeatPress }: SeatGridProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const screenPosition = layout.screenPosition ?? 'top';
  const aisleAfterColumns = layout.aisleAfterColumns ?? [];
  const aisleAfterRows = layout.aisleAfterRows ?? [];

  const groups = useMemo(() => groupBySection(buildRows(layout.allSeats ?? [])), [layout.allSeats]);

  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedScale = useSharedValue(1);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const pinch = Gesture.Pinch()
    .onUpdate(e => {
      scale.value = Math.min(MAX_SCALE, Math.max(MIN_SCALE, savedScale.value * e.scale));
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  const pan = Gesture.Pan()
    .minPointers(1)
    .onUpdate(e => {
      translateX.value = savedTranslateX.value + e.translationX;
      translateY.value = savedTranslateY.value + e.translationY;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      scale.value = withTiming(1);
      translateX.value = withTiming(0);
      translateY.value = withTiming(0);
      savedScale.value = 1;
      savedTranslateX.value = 0;
      savedTranslateY.value = 0;
    });

  const composedGesture = Gesture.Simultaneous(pinch, pan, doubleTap);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const screenIndicator = (
    <View style={styles.screenWrapper}>
      <View style={styles.screenArc} />
      <Text style={styles.screenLabel}>ALL EYES THIS WAY</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={[styles.gridContent, animatedStyle]}>
          {screenPosition === 'top' && screenIndicator}

          <SeatLegend />

          {groups.map((group, gi) => {
            const groupPrice = group.rows.flatMap(r => r.seats).find(s => s.section !== 'passage')?.price ?? 0;
            return (
            <View key={`${group.section}-${gi}`}>
              {group.section !== 'passage' && <SectionHeader section={group.section} price={groupPrice} />}
              {group.rows.map(row => (
                <View key={row.row}>
                  <View style={styles.row}>
                    <Text style={styles.rowLabel}>{row.row}</Text>
                    <View style={styles.seats}>
                      {row.seats.map(seat => {
                        const afterColGap = aisleAfterColumns.includes(seat.number);
                        const effectiveStatus = selectedSeatIds.has(seat.id) ? 'selected' : seat.status;
                        return (
                          <React.Fragment key={seat.id}>
                            <SeatItem seat={{ ...seat, status: effectiveStatus }} onPress={onSeatPress} />
                            {afterColGap ? <View style={styles.colAisle} /> : null}
                          </React.Fragment>
                        );
                      })}
                    </View>
                    <Text style={styles.rowLabel}>{row.row}</Text>
                  </View>
                  {aisleAfterRows.includes(row.row) ? <View style={styles.rowAisle} /> : null}
                </View>
              ))}
            </View>
            );
          })}

          {screenPosition === 'bottom' && screenIndicator}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const makeStyles = (Colors: ColorTokens) =>
  StyleSheet.create({
    container: {
      flex: 1,
      overflow: 'hidden',
    },
    gridContent: {
      alignItems: 'center',
      paddingHorizontal: Spacing.md,
      paddingBottom: Spacing.xl,
    },
    screenWrapper: {
      alignItems: 'center',
      marginBottom: Spacing.md,
      gap: Spacing.xs,
    },
    screenArc: {
      width: 220,
      height: 34,
      marginHorizontal: 30,
      backgroundColor: Colors.accentLight,
      borderTopLeftRadius: 200,
      borderTopRightRadius: 200,
      borderBottomLeftRadius: 6,
      borderBottomRightRadius: 6,
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
      alignItems: 'center',
    },
    colAisle: { width: 14 },
    rowAisle: { height: 12 },
  });
