import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, AppState, Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@ctypes/navigation';
import { Seat } from '@ctypes/models';
import { ColorTokens, FontFamily, FontWeight, Radius, Spacing } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';
import { useRequireAuth } from '@hooks/useRequireAuth';
import { Badge, Button } from '@shared/ui';
import { Body, BodySmall, Caption, Heading2 } from '@shared/ui';
import { useSeatLayout } from '@hooks/useSeatLayout';
import { useBookingStore } from '@store/bookingStore';
import { formatPrice, formatShowTime } from '@shared/utils';
import { holdSeats } from '@services/bookingService';
import { errorMessage, isApiError } from '@services/httpClient';
import { SeatGrid } from '../components/SeatGrid';
import { SeatLegend } from '../components/SeatLegend';
import { SeatGridSkeleton } from '../components/SeatGridSkeleton';
import { SeatCountModal } from '../components/SeatCountModal';
import { findBestAdjacentSeats } from '../utils/seatSelection';

type Props = NativeStackScreenProps<RootStackParamList, 'SeatSelection'>;

export function SeatSelectionScreen({ navigation, route }: Props) {
  const { showId, movieId } = route.params;
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { layout, loading, error, refetch } = useSeatLayout(showId);
  const requireAuth = useRequireAuth();
  const isFocused = useIsFocused();

  const selectedSeats = useBookingStore(s => s.selectedSeats);
  const seatCount = useBookingStore(s => s.seatCount);
  const selectedShow = useBookingStore(s => s.selectedShow);
  const selectedMovie = useBookingStore(s => s.selectedMovie);
  const selectedTheatre = useBookingStore(s => s.selectedTheatre);
  const setSeatCount = useBookingStore(s => s.setSeatCount);
  const setSelectedSeats = useBookingStore(s => s.setSelectedSeats);
  const clearSeatSelection = useBookingStore(s => s.clearSeatSelection);
  const getTotalAmount = useBookingStore(s => s.getTotalAmount);

  const [countModalVisible, setCountModalVisible] = useState(seatCount === 0);
  const [holding, setHolding] = useState(false);

  const selectedSeatIds = useMemo(() => new Set(selectedSeats.map(s => s.id)), [selectedSeats]);

  // Seat freshness is poll-only (the API has no realtime/sockets) — refetch
  // whenever this screen regains focus or the app comes back to foreground.
  // The mount effect (inside useSeatLayout) already fetches once, so the
  // *first* focus is skipped to avoid an immediate, redundant second request.
  const hasFocusedOnce = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (hasFocusedOnce.current) {
        refetch();
      } else {
        hasFocusedOnce.current = true;
      }
    }, [refetch]),
  );

  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      // Only poll on foreground if this screen is the one actually on screen —
      // otherwise a background tab would also fire a refetch it doesn't need.
      if (state === 'active' && isFocused) refetch();
    });
    return () => sub.remove();
  }, [refetch, isFocused]);

  function handleSeatCountSelect(count: number) {
    setSeatCount(count);
    setCountModalVisible(false);
  }

  function handleSeatCountDismiss() {
    if (seatCount === 0) {
      navigation.goBack();
      return;
    }
    setCountModalVisible(false);
  }

  const handleSeatPress = useCallback(
    (seat: Seat) => {
      if (!layout) return;
      if (selectedSeatIds.has(seat.id)) {
        clearSeatSelection();
        return;
      }
      if (!seatCount) {
        setCountModalVisible(true);
        return;
      }
      const block = findBestAdjacentSeats(seat, seatCount, layout.allSeats ?? []);
      if (block.length === seatCount) {
        setSelectedSeats(block);
      } else {
        Alert.alert('Not enough adjacent seats', `Unable to find ${seatCount} adjacent seats near your selection.`);
        clearSeatSelection();
      }
    },
    [layout, selectedSeatIds, seatCount, clearSeatSelection, setSelectedSeats],
  );

  async function handleProceed() {
    if (selectedSeats.length === 0 || !layout) return;
    requireAuth(async () => {
      setHolding(true);
      try {
        const result = await holdSeats(showId, selectedSeats.map(s => s.id));
        setHolding(false);
        navigation.navigate('Checkout', {
          showId,
          movieId,
          seatIds: selectedSeats.map(s => s.id),
          seatLabels: selectedSeats.map(s => s.label ?? `${s.row}${s.number}`),
          holdExpiresAt: result.hold_expires_at,
          ticketTotal: getTotalAmount(),
          movieTitle: selectedMovie?.title ?? '',
          posterUrl: selectedMovie?.posterUrl,
          cinemaName: selectedTheatre?.name ?? '',
          screenName: selectedShow?.screenName ?? '',
          showDate: selectedShow?.date ?? '',
          startTime: selectedShow?.rawStartTime ?? selectedShow?.time ?? '',
          language: selectedShow?.language ?? '',
        });
      } catch (err) {
        setHolding(false);
        if (isApiError(err) && err.status === 409) {
          const seatLabelById = new Map(selectedSeats.map(s => [s.id, s.label ?? `${s.row}${s.number}`]));
          const takenLabels = (err.results ?? [])
            .filter(r => r.status === 'unavailable')
            .map(r => seatLabelById.get(r.seat_id) ?? r.seat_id);
          Alert.alert(
            'Some seats are no longer available',
            takenLabels.length
              ? `These seats were just taken: ${takenLabels.join(', ')}. Please pick again.`
              : 'Please select your seats again.',
          );
        } else {
          Alert.alert('Could not hold seats', errorMessage(err));
        }
        clearSeatSelection();
        refetch();
      }
    });
  }

  const total = getTotalAmount();
  const hasSelection = selectedSeats.length > 0 && selectedSeats.length === seatCount;
  const showError = !loading && (error || !layout);

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
              {selectedShow.rawStartTime ? formatShowTime(selectedShow.rawStartTime) : selectedShow.time}
              {' · '}
              {selectedShow.language}
              {selectedTheatre ? ` · ${selectedTheatre.name}` : ''}
            </Caption>
          ) : null}
        </View>
      </View>

      {loading ? (
        <>
          <SeatLegend />
          <View style={styles.gridWrapper}>
            <SeatGridSkeleton />
          </View>
        </>
      ) : showError ? (
        <View style={styles.gridWrapper}>
          <Body style={styles.center}>{error ?? 'Failed to load seats.'}</Body>
        </View>
      ) : layout ? (
        <>
          <View style={styles.gridWrapper}>
            <SeatGrid layout={layout} selectedSeatIds={selectedSeatIds} onSeatPress={handleSeatPress} />
          </View>

          <View style={styles.bottomBar}>
            {selectedSeats.length > 0 ? (
              <View style={styles.seatPills}>
                <Caption style={styles.seatPillsLabel}>
                  {selectedSeats.length}/{seatCount} Selected:{' '}
                </Caption>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillScroll}>
                  {selectedSeats.map(s => (
                    <Badge key={s.id} label={s.label ?? `${s.row}${s.number}`} variant="zinc" style={styles.pill} />
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
                label={holding ? 'Holding seats…' : hasSelection ? 'Proceed' : `Select ${seatCount || ''} seat${seatCount === 1 ? '' : 's'}`}
                onPress={handleProceed}
                disabled={!hasSelection || holding}
                loading={holding}
                variant="primary"
                size="lg"
                style={styles.proceedBtn}
              />
            </View>
          </View>

          <SeatCountModal
            visible={countModalVisible}
            layout={layout}
            onSelect={handleSeatCountSelect}
            onDismiss={handleSeatCountDismiss}
          />
        </>
      ) : null}
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
      minWidth: 150,
    },
  });
