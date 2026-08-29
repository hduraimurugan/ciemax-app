import React, { useEffect, useMemo, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@ctypes/navigation';
import { Theatre } from '@ctypes/models';
import { ColorTokens, FontFamily, FontSize, FontWeight, Radius, Spacing } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';
import { useFavourites } from '@hooks/useFavourites';
import { StorageKeys } from '@constants/config';
import { useLocationStore } from '@store/locationStore';
import { getTheatresWithShows, getCachedTheatresWithShows } from '@services/theatresService';
import { mapShowSummary, mapTheatreListingMovie, mapTheatreHall } from '@services/mappers';
import { Body, EmptyState, ScreenHeader } from '@shared/ui';
import { useBookingStore } from '@store/bookingStore';
import { LocationModal } from '@features/location';
import { TheatreCard } from '../components/TheatreCard';
import { TheatreListSkeleton } from '../components/TheatreCardSkeleton';
import type { ApiTheatreHall } from '@ctypes/api';

type Props = NativeStackScreenProps<RootStackParamList, 'Theatres'>;

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
  const url =
    theatre.latitude && theatre.longitude
      ? `https://www.google.com/maps/search/?api=1&query=${theatre.latitude},${theatre.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(theatre.name + ' ' + theatre.address)}`;
  Linking.openURL(url).catch(() => {});
}

export function TheatresScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [dateIdx, setDateIdx] = useState(0);
  const district = useLocationStore(s => s.district);
  const state = useLocationStore(s => s.state);
  const [halls, setHalls] = useState<ApiTheatreHall[]>(() =>
    district && state ? getCachedTheatresWithShows(district, state, DATE_LABELS[0].iso) ?? [] : [],
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const { isFavourite, toggle } = useFavourites(StorageKeys.favouriteTheatres);
  const setSelectedMovie = useBookingStore(s => s.setSelectedMovie);
  const setSelectedTheatre = useBookingStore(s => s.setSelectedTheatre);
  const setSelectedShow = useBookingStore(s => s.setSelectedShow);

  useEffect(() => {
    if (!district || !state) {
      setHalls([]);
      return;
    }
    let cancelled = false;
    const date = DATE_LABELS[dateIdx].iso;
    const cached = getCachedTheatresWithShows(district, state, date);
    if (cached) setHalls(cached);
    setIsRefreshing(true);
    getTheatresWithShows(district, state, date)
      .then(data => {
        if (!cancelled) setHalls(data);
      })
      .catch(() => {
        if (!cancelled && !cached) setHalls([]);
      })
      .finally(() => {
        if (!cancelled) setIsRefreshing(false);
      });
    return () => {
      cancelled = true;
    };
  }, [district, state, dateIdx]);

  const loading = isRefreshing && halls.length === 0;

  function goSeats(hall: ApiTheatreHall, movie: ApiTheatreHall['movies'][number], showId: string) {
    const theatre = mapTheatreHall(hall);
    const movieModel = mapTheatreListingMovie(movie);
    const show = movie.shows.find(s => s.show_id === showId);
    if (!show) return;
    setSelectedMovie(movieModel);
    setSelectedTheatre(theatre);
    setSelectedShow(mapShowSummary(show, movie.movie_id, hall.hall_id));
    navigation.navigate('SeatSelection', { showId, movieId: movie.movie_id });
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScreenHeader title="Theatres" onBack={() => navigation.goBack()} />

      {!district || !state ? (
        <EmptyState
          icon={<MapPin size={48} color={colors.textMuted} />}
          message="Set your location to see theatres near you."
          actionLabel="Set Location"
          onAction={() => setLocationModalVisible(true)}
        />
      ) : (
        <>
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

          {loading ? (
            <TheatreListSkeleton />
          ) : (
            <ScrollView style={styles.listScroll} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
              {halls.length === 0 && (
                <Body style={styles.empty}>No theatres found near {district}.</Body>
              )}
              {halls.map(hall => {
                const theatre = mapTheatreHall(hall);
                const favourited = isFavourite(hall.hall_id);
                return (
                  <TheatreCard
                    key={hall.hall_id}
                    name={hall.hall_name}
                    location={hall.location}
                    favourited={favourited}
                    onToggleFavourite={() => toggle(hall.hall_id)}
                    onDirections={() => openDirections(theatre)}>
                    {hall.movies.map(movie => (
                      <View key={movie.movie_id} style={styles.movieBlock}>
                        <Pressable onPress={() => navigation.navigate('MovieDetail', { movieId: movie.movie_id })}>
                          <Text style={styles.movieTitle}>{movie.title}</Text>
                        </Pressable>
                        <View style={styles.chipsRow}>
                          {movie.shows.map(show => (
                            <Pressable
                              key={show.show_id}
                              style={styles.chip}
                              onPress={() => goSeats(hall, movie, show.show_id)}>
                              <Text style={styles.chipTime}>
                                {show.start_time.slice(0, 5)}
                              </Text>
                              <Text style={styles.chipScreen}>{show.screen_name}</Text>
                            </Pressable>
                          ))}
                        </View>
                      </View>
                    ))}
                  </TheatreCard>
                );
              })}
            </ScrollView>
          )}
        </>
      )}

      <LocationModal visible={locationModalVisible} onClose={() => setLocationModalVisible(false)} />
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
    listScroll: { flex: 1 },
    list: { padding: Spacing.lg, paddingTop: 0, gap: Spacing.md, paddingBottom: Spacing.xl },
    empty: { textAlign: 'center', marginTop: Spacing.xl },
    movieBlock: {
      borderTopWidth: 1,
      borderTopColor: Colors.divider,
      paddingTop: Spacing.sm,
      gap: Spacing.sm,
    },
    movieTitle: { fontWeight: FontWeight.semibold, fontSize: FontSize.sm, color: Colors.textPrimary },
    chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    chip: {
      paddingHorizontal: Spacing.sm + 4,
      paddingVertical: Spacing.sm - 2,
      borderRadius: Radius.md,
      borderWidth: 1,
      borderColor: Colors.border,
      backgroundColor: Colors.surfaceElevated,
      alignItems: 'center',
    },
    chipTime: { fontFamily: FontFamily.semibold, fontWeight: FontWeight.semibold, fontSize: FontSize.sm - 1, color: Colors.textPrimary },
    chipScreen: { fontSize: FontSize.xs - 1, color: Colors.textMuted, marginTop: 1 },
  });
