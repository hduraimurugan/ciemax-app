import React, { useMemo } from 'react';
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@ctypes/navigation';
import { Seat } from '@ctypes/models';
import { Colors, Spacing } from '@constants/theme';
import { Button, Loader } from '@shared/ui';
import {
  Heading2,
  Body,
  BodySmall,
  Label,
} from '@shared/ui';
import { useSeatLayout } from '@hooks/useSeatLayout';
import { useBookingStore } from '@store/bookingStore';
import { formatPrice, formatSeatList } from '@shared/utils';
import { SeatGrid } from '../components/SeatGrid';

type Props = NativeStackScreenProps<RootStackParamList, 'SeatSelection'>;

export function SeatSelectionScreen({ navigation, route }: Props) {
  const { showId } = route.params;
  const { layout, loading, error } = useSeatLayout(showId);

  const selectedSeats = useBookingStore(s => s.selectedSeats);
  const selectedShow = useBookingStore(s => s.selectedShow);
  const toggleSeat = useBookingStore(s => s.toggleSeat);
  const getTotalAmount = useBookingStore(s => s.getTotalAmount);

  const selectedSeatIds = useMemo(
    () => new Set(selectedSeats.map(s => s.id)),
    [selectedSeats],
  );

  function handleSeatPress(seat: Seat) {
    toggleSeat(seat);
  }

  function handleContinue() {
    navigation.navigate('OrderSummary');
  }

  if (loading) return <Loader fullScreen message="Loading seats..." />;

  if (error || !layout) {
    return (
      <SafeAreaView style={styles.screen}>
        <Body style={styles.center}>{error ?? 'Failed to load seats.'}</Body>
      </SafeAreaView>
    );
  }

  const total = getTotalAmount();
  const hasSelection = selectedSeats.length > 0;

  return (
    <SafeAreaView style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Body style={styles.back}>← Back</Body>
        </Pressable>
        <Heading2>Select Seats</Heading2>
        {selectedShow ? (
          <Body>{selectedShow.time} · {selectedShow.format} · {selectedShow.language}</Body>
        ) : null}
      </View>

      {/* Seat Grid */}
      <View style={styles.gridWrapper}>
        <SeatGrid
          layout={layout}
          selectedSeatIds={selectedSeatIds}
          onSeatPress={handleSeatPress}
        />
      </View>

      {/* Bottom bar */}
      <View style={styles.bottomBar}>
        {hasSelection ? (
          <View style={styles.selectionInfo}>
            <View>
              <Label>Selected Seats</Label>
              <BodySmall style={styles.seatLabels} numberOfLines={1}>
                {formatSeatList(selectedSeats)}
              </BodySmall>
            </View>
            <Body style={styles.total}>{formatPrice(total)}</Body>
          </View>
        ) : (
          <Body style={styles.hint}>Tap on a seat to select</Body>
        )}
        <Button
          label={hasSelection ? `Continue (${selectedSeats.length} seat${selectedSeats.length > 1 ? 's' : ''})` : 'Select a seat'}
          onPress={handleContinue}
          disabled={!hasSelection}
          fullWidth
          size="lg"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  header: {
    padding: Spacing.md,
    gap: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  back: { color: Colors.accent, marginBottom: Spacing.xs },
  gridWrapper: { flex: 1 },
  center: { textAlign: 'center', margin: Spacing.xl },
  bottomBar: {
    padding: Spacing.md,
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  selectionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seatLabels: { color: Colors.accent, marginTop: 2 },
  total: { fontWeight: '700', color: Colors.textPrimary },
  hint: { textAlign: 'center', color: Colors.textMuted },
});
