import React, { useEffect, useMemo, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@ctypes/navigation';
import { Movie, Show, Theatre } from '@ctypes/models';
import { ColorTokens, FontFamily, FontSize, FontWeight, Radius, Spacing } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';
import { useTheatresForMovie, useShowsForMovie } from '@hooks/useTheatres';
import { useFavourites } from '@hooks/useFavourites';
import { StorageKeys } from '@constants/config';
import { getMovieById, getCachedMovie } from '@services/moviesService';
import { Body, EmptyState, ScreenHeader } from '@shared/ui';
import { useBookingStore } from '@store/bookingStore';
import { LocationModal } from '@features/location';
import { TheatreCard } from '../components/TheatreCard';
import { TheatreListSkeleton } from '../components/TheatreCardSkeleton';

type Props = NativeStackScreenProps<RootStackParamList, 'Showtimes'>;
type ShowStatus = 'available' | 'fast' | 'soldout';

function statusOf(show: Show): ShowStatus {
  // The real API's showtime list doesn't report seat counts up front (only
  // the mock service does) — treat unknown availability as bookable rather
  // than defaulting to sold out. Actual availability is enforced when the
  // seat map loads.
  if (show.availableSeats == null || show.totalSeats == null) return 'available';
  if (show.availableSeats === 0) return 'soldout';
  if (show.availableSeats / show.totalSeats < 0.2) return 'fast';
  return 'available';
}

function getNext7Dates(): Array<{ iso: string; dow: string; num: string }> {
  const days: Array<{ iso: string; dow: string; num: string }> = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push({
      iso: d.toISOString().split('T')[0],
      dow: d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
      num: String(d.getDate()),
    });
  }
  return days;
}

const DATE_LABELS = getNext7Dates();
const DATE_BTN_HEIGHT = 68;

function openDirections(theatre: Theatre) {
  const label = encodeURIComponent(theatre.name);
  const url =
    theatre.latitude && theatre.longitude
      ? `https://www.google.com/maps/search/?api=1&query=${theatre.latitude},${theatre.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${label}+${encodeURIComponent(theatre.address)}`;
  Linking.openURL(url).catch(() => {});
}

export function ShowtimesScreen({ navigation, route }: Props) {
  const { movieId } = route.params;
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [movie, setMovie] = useState<Movie | null>(() => getCachedMovie(movieId) ?? null);
  const [dateIdx, setDateIdx] = useState(0);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const selectedDate = DATE_LABELS[dateIdx]?.iso;
  const { theatres, loading: theatresLoading, hasLocation } = useTheatresForMovie(movieId, selectedDate);
  const { shows, loading: showsLoading } = useShowsForMovie(movieId, selectedDate);
  const setSelectedMovie = useBookingStore(s => s.setSelectedMovie);
  const setSelectedTheatre = useBookingStore(s => s.setSelectedTheatre);
  const setSelectedShow = useBookingStore(s => s.setSelectedShow);
  const { isFavourite, toggle } = useFavourites(StorageKeys.favouriteTheatres);

  useEffect(() => {
    getMovieById(movieId).then(m => m && setMovie(m));
  }, [movieId]);

  function goSeats(show: Show, theatre: Theatre) {
    if (movie) setSelectedMovie(movie);
    setSelectedTheatre(theatre);
    setSelectedShow(show);
    navigation.navigate('SeatSelection', { showId: show.id, movieId });
  }

  if (!hasLocation) {
    return (
      <SafeAreaView style={styles.screen}>
        <ScreenHeader title={movie?.title ?? 'Select Showtime'} onBack={() => navigation.goBack()} />
        <EmptyState
          icon={<MapPin size={48} color={colors.textMuted} />}
          message="Set your location to see theatres and showtimes playing near you."
          actionLabel="Set Location"
          onAction={() => setLocationModalVisible(true)}
        />
        <LocationModal visible={locationModalVisible} onClose={() => setLocationModalVisible(false)} />
      </SafeAreaView>
    );
  }

  const showSkeleton = theatresLoading || showsLoading;

  return (
    <SafeAreaView style={styles.screen}>
      <ScreenHeader
        title={movie?.title ?? 'Select Showtime'}
        subtitle="Select date & showtime"
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        horizontal
        style={styles.dateStripScroll}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dateStrip}>
        {DATE_LABELS.map((d, i) => (
          <Pressable
            key={d.iso}
            style={[styles.dateBtn, i === dateIdx && styles.dateBtnActive]}
            onPress={() => setDateIdx(i)}>
            <Text style={[styles.dateDow, i === dateIdx && styles.dateTextActive]}>{d.dow}</Text>
            <Text style={[styles.dateNum, i === dateIdx && styles.dateTextActive]}>{d.num}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {showSkeleton ? (
        <TheatreListSkeleton />
      ) : (
      <ScrollView style={styles.cinemaListScroll} contentContainerStyle={styles.cinemaList} showsVerticalScrollIndicator={false}>
        {theatres.length === 0 && (
          <Body style={styles.empty}>No showtimes available for this movie yet.</Body>
        )}
        {theatres.map((theatre: Theatre) => {
          const cinemaShows = shows.filter(s => s.theatreId === theatre.id);
          if (cinemaShows.length === 0) return null;
          const favourited = isFavourite(theatre.id);
          return (
            <TheatreCard
              key={theatre.id}
              name={theatre.name}
              location={theatre.address}
              favourited={favourited}
              onToggleFavourite={() => toggle(theatre.id)}
              onDirections={() => openDirections(theatre)}>
              <View style={styles.chipsRow}>
                {cinemaShows.map(show => {
                  const status = statusOf(show);
                  const disabled = status === 'soldout';
                  return (
                    <Pressable
                      key={show.id}
                      disabled={disabled}
                      onPress={() => goSeats(show, theatre)}
                      style={[
                        styles.chip,
                        status === 'available' && styles.chipAvailable,
                        status === 'fast' && styles.chipFast,
                        status === 'soldout' && styles.chipSoldout,
                      ]}>
                      <Text
                        style={[
                          styles.chipTime,
                          status === 'available' && styles.chipTextAvailable,
                          status === 'fast' && styles.chipTextFast,
                          status === 'soldout' && styles.chipTextSoldout,
                        ]}>
                        {show.time}
                      </Text>
                      {show.screenName ? <Text style={styles.chipScreen}>{show.screenName}</Text> : null}
                    </Pressable>
                  );
                })}
              </View>
            </TheatreCard>
          );
        })}
      </ScrollView>
      )}
    </SafeAreaView>
  );
}

const makeStyles = (Colors: ColorTokens) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: Colors.background },
    // Explicit height on the horizontal ScrollView itself (not just its
    // contentContainerStyle) — without it, Yoga can't reliably measure an
    // unstyled horizontal ScrollView's cross-axis size, and the sibling
    // below it (given flex: 1) ends up pushed down by a large phantom gap.
    dateStripScroll: { height: DATE_BTN_HEIGHT + Spacing.lg, flexGrow: 0 },
    dateStrip: { gap: Spacing.sm, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
    dateBtn: {
      width: 52,
      height: DATE_BTN_HEIGHT,
      borderRadius: Radius.lg,
      backgroundColor: Colors.surface,
      borderWidth: 1,
      borderColor: Colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dateBtnActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
    dateDow: { fontSize: FontSize.xs - 1, fontWeight: FontWeight.semibold, color: Colors.textMuted },
    dateNum: {
      fontFamily: FontFamily.bold,
      fontSize: FontSize.md + 2,
      fontWeight: FontWeight.bold,
      color: Colors.textPrimary,
      marginTop: 2,
    },
    dateTextActive: { color: Colors.textPrimary },
    cinemaListScroll: { flex: 1 },
    cinemaList: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl, gap: Spacing.md },
    empty: { textAlign: 'center', marginTop: Spacing.xl },
    chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    chip: {
      paddingHorizontal: Spacing.sm + 4,
      paddingVertical: Spacing.sm,
      borderRadius: Radius.md,
      borderWidth: 1,
      alignItems: 'center',
    },
    chipAvailable: { backgroundColor: Colors.emeraldDim, borderColor: Colors.success },
    chipFast: { backgroundColor: Colors.warningDim, borderColor: Colors.warning },
    chipSoldout: { backgroundColor: Colors.secondary, borderColor: Colors.secondary, opacity: 0.6 },
    chipTime: { fontFamily: FontFamily.semibold, fontWeight: FontWeight.semibold, fontSize: FontSize.sm - 1 },
    chipScreen: { fontSize: FontSize.xs - 1, color: Colors.textMuted, marginTop: 1 },
    chipTextAvailable: { color: Colors.success },
    chipTextFast: { color: Colors.warning },
    chipTextSoldout: { color: Colors.textMuted },
  });
