import React, { useMemo } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@ctypes/navigation';
import { Seat } from '@ctypes/models';
import { ColorTokens, FontFamily, FontWeight, Radius, Spacing } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';
import { Badge, Button, Loader } from '@shared/ui';
import { Body, BodySmall, Caption, Heading2 } from '@shared/ui';
import { useSeatLayout } from '@hooks/useSeatLayout';
import { useBookingStore } from '@store/bookingStore';
import { formatPrice } from '@shared/utils';
import { SeatGrid } from '../components/SeatGrid';

type Props = NativeStackScreenProps<RootStackParamList, 'SeatSelection'>;

export function SeatSelectionScreen({ navigation, route }: Props) {
  const { showId } = route.params;
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
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
    navigation.navigate('Checkout');
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
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={18} color={colors.textPrimary} />
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

      <View style={styles.gridWrapper}>
        <SeatGrid
          layout={layout}
          selectedSeatIds={selectedSeatIds}
          onSeatPress={handleSeatPress}
        />
      </View>

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
            variant="primary"
            size="lg"
            style={styles.proceedBtn}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (Colors: ColorTokens) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: Colors.background },
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
