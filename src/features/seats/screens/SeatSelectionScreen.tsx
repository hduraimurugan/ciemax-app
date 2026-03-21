import React, { useMemo } from 'react';
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@ctypes/navigation';
import { Seat } from '@ctypes/models';
import { Colors, FontFamily, FontSize, FontWeight, Radius, Spacing } from '@constants/theme';
import { Badge, Button, Loader } from '@shared/ui';
import { Body, BodySmall, Caption, Heading2, Label } from '@shared/ui';
import { useSeatLayout } from '@hooks/useSeatLayout';
import { useBookingStore } from '@store/bookingStore';
import { formatPrice } from '@shared/utils';
import { SeatGrid } from '../components/SeatGrid';

type Props = NativeStackScreenProps<RootStackParamList, 'SeatSelection'>;

export function SeatSelectionScreen({ navigation, route }: Props) {
  const { showId } = route.params;
  const { layout, loading, error } = useSeatLayout(showId);

  const selectedSeats = useBookingStore(s => s.selectedSeats);
  const selectedShow = useBookingStore(s => s.selectedShow);
  const selectedMovie = useBookingStore(s => s.selectedMovie);
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
      {/* Sticky header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        {selectedMovie?.posterUrl ? (
          <Image source={{ uri: selectedMovie.posterUrl }} style={styles.poster} resizeMode="cover" />
        ) : null}
        <View style={styles.headerInfo}>
          <BodySmall style={styles.movieTitle} numberOfLines={1}>
            {selectedMovie?.title ?? 'Select Seats'}
          </BodySmall>
          {selectedShow ? (
            <Caption style={styles.showInfo}>
              {selectedShow.time} · {selectedShow.format} · {selectedShow.language}
            </Caption>
          ) : null}
        </View>
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
          <View style={styles.seatPills}>
            <Caption style={styles.seatPillsLabel}>Seats: </Caption>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillScroll}>
              {selectedSeats.map(s => (
                <Badge key={s.id} label={`${s.row}${s.number}`} variant="zinc" style={styles.pill} />
              ))}
            </ScrollView>
          </View>
        ) : null}
        <View style={styles.bottomRow}>
          <View>
            <Caption style={styles.totalLabel}>Total Amount</Caption>
            <Heading2 style={styles.totalAmount}>{formatPrice(total)}</Heading2>
          </View>
          <Button
            label={hasSelection ? 'Proceed' : 'Select a seat'}
            onPress={handleContinue}
            disabled={!hasSelection}
            variant="emerald"
            size="lg"
            style={styles.proceedBtn}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontFamily: FontFamily.medium,
  },
  poster: {
    width: 40,
    height: 60,
    borderRadius: Radius.xs,
  },
  headerInfo: {
    flex: 1,
    gap: 2,
  },
  movieTitle: {
    color: Colors.textPrimary,
    fontWeight: FontWeight.bold,
    fontFamily: FontFamily.bold,
  },
  showInfo: {
    color: Colors.textMuted,
  },
  gridWrapper: { flex: 1 },
  center: { textAlign: 'center', margin: Spacing.xl },
  // Bottom bar
  bottomBar: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  seatPills: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  seatPillsLabel: {
    color: Colors.textMuted,
  },
  pillScroll: {
    flex: 1,
  },
  pill: {
    marginRight: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    color: Colors.textMuted,
  },
  totalAmount: {
    color: Colors.textPrimary,
    fontWeight: FontWeight.bold,
    fontFamily: FontFamily.bold,
  },
  proceedBtn: {
    minWidth: 120,
  },
});
