import React, { useEffect, useMemo, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Heart, MapPin, Navigation } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@ctypes/navigation';
import { Movie, Show, Theatre } from '@ctypes/models';
import { ColorTokens, FontFamily, FontSize, FontWeight, Radius, Spacing } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';
import { useTheatresForMovie, useShowsForMovie } from '@hooks/useTheatres';
import { useFavourites } from '@hooks/useFavourites';
import { StorageKeys } from '@constants/config';
import { getMovieById } from '@services/moviesService';
import { Body, Heading3, Loader } from '@shared/ui';
import { useBookingStore } from '@store/bookingStore';
import { LocationModal } from '@features/location';

type Props = NativeStackScreenProps<RootStackParamList, 'Showtimes'>;
type ShowStatus = 'available' | 'fast' | 'soldout';

function statusOf(show: Show): ShowStatus {
  const available = show.availableSeats ?? 0;
  const total = show.totalSeats ?? 1;
  if (available === 0) return 'soldout';
  if (available / total < 0.2) return 'fast';
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
  const [movie, setMovie] = useState<Movie | null>(null);
  const [dateIdx, setDateIdx] = useState(0);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const selectedDate = DATE_LABELS[dateIdx]?.iso;
  const { theatres, loading: theatresLoading, hasLocation } = useTheatresForMovie(movieId);
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
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ArrowLeft size={17} color={colors.textPrimary} />
          </Pressable>
          <Heading3 numberOfLines={1}>{movie?.title ?? 'Select Showtime'}</Heading3>
        </View>
        <View style={styles.noLocation}>
          <MapPin size={32} color={colors.textMuted} />
          <Body style={styles.noLocationText}>
            Set your location to see theatres and showtimes playing near you.
          </Body>
          <Pressable style={styles.setLocationBtn} onPress={() => setLocationModalVisible(true)}>
            <Text style={styles.setLocationBtnText}>Set Location</Text>
          </Pressable>
        </View>
        <LocationModal visible={locationModalVisible} onClose={() => setLocationModalVisible(false)} />
      </SafeAreaView>
    );
  }

  if (theatresLoading || showsLoading) return <Loader fullScreen message="Loading showtimes..." />;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={17} color={colors.textPrimary} />
        </Pressable>
        <View>
          <Heading3 numberOfLines={1}>{movie?.title ?? 'Select Showtime'}</Heading3>
          <Text style={styles.subtitle}>Select date & showtime</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateStrip}>
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

      <ScrollView contentContainerStyle={styles.cinemaList} showsVerticalScrollIndicator={false}>
        {theatres.length === 0 && (
          <Body style={styles.empty}>No showtimes available for this movie yet.</Body>
        )}
        {theatres.map((theatre: Theatre) => {
          const cinemaShows = shows.filter(s => s.theatreId === theatre.id);
          if (cinemaShows.length === 0) return null;
          const favourited = isFavourite(theatre.id);
          return (
            <View key={theatre.id} style={styles.cinemaCard}>
              <View style={styles.cinemaHeaderRow}>
                <View style={styles.cinemaInfo}>
                  <Heading3 style={styles.cinemaName}>{theatre.name}</Heading3>
                  <Text style={styles.cinemaScreen}>{theatre.address}</Text>
                </View>
                <Pressable onPress={() => toggle(theatre.id)} hitSlop={8}>
                  <Heart size={17} color={favourited ? colors.accent : colors.textMuted} fill={favourited ? colors.accent : 'none'} />
                </Pressable>
                <Pressable onPress={() => openDirections(theatre)} hitSlop={8} style={styles.directionsBtn}>
                  <Navigation size={15} color={colors.accent} />
                </Pressable>
              </View>
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
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (Colors: ColorTokens) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: Colors.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
      paddingHorizontal: Spacing.lg,
      paddingTop: Spacing.md,
      paddingBottom: Spacing.sm + 2,
    },
    backBtn: {
      width: 34,
      height: 34,
      borderRadius: Radius.md,
      backgroundColor: Colors.surfaceElevated,
      alignItems: 'center',
      justifyContent: 'center',
    },
    subtitle: { fontSize: FontSize.xs + 1, color: Colors.textMuted, marginTop: 2 },
    noLocation: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, padding: Spacing.xl },
    noLocationText: { textAlign: 'center', color: Colors.textMuted },
    setLocationBtn: {
      backgroundColor: Colors.accent,
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.sm + 2,
      borderRadius: Radius.md,
    },
    setLocationBtnText: { color: '#fff', fontWeight: FontWeight.semibold },
    dateStrip: { gap: Spacing.sm, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
    dateBtn: {
      width: 52,
      height: 68,
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
    dateTextActive: { color: '#fff' },
    cinemaList: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl, gap: Spacing.md },
    empty: { textAlign: 'center', marginTop: Spacing.xl },
    cinemaCard: {
      backgroundColor: Colors.surface,
      borderWidth: 1,
      borderColor: Colors.border,
      borderRadius: Radius.xl,
      padding: Spacing.md,
    },
    cinemaHeaderRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, marginBottom: Spacing.md },
    cinemaInfo: { flex: 1 },
    directionsBtn: { paddingLeft: 2 },
    cinemaName: { marginBottom: 2 },
    cinemaScreen: { fontSize: FontSize.xs + 1, color: Colors.textMuted },
    chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    chip: {
      paddingHorizontal: Spacing.sm + 4,
      paddingVertical: Spacing.sm,
      borderRadius: Radius.md,
      borderWidth: 1,
      alignItems: 'center',
    },
    chipAvailable: { backgroundColor: 'rgba(79,184,120,0.12)', borderColor: Colors.success },
    chipFast: { backgroundColor: 'rgba(227,167,94,0.15)', borderColor: Colors.warning },
    chipSoldout: { backgroundColor: Colors.secondary, borderColor: Colors.secondary, opacity: 0.6 },
    chipTime: { fontFamily: FontFamily.semibold, fontWeight: FontWeight.semibold, fontSize: FontSize.sm - 1 },
    chipScreen: { fontSize: FontSize.xs - 1, color: Colors.textMuted, marginTop: 1 },
    chipTextAvailable: { color: Colors.success },
    chipTextFast: { color: Colors.warning },
    chipTextSoldout: { color: Colors.textMuted },
  });
