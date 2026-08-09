import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@ctypes/navigation';
import { Movie, Show, Theatre } from '@ctypes/models';
import { ColorTokens, FontFamily, FontSize, FontWeight, Radius, Spacing } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';
import { useTheatresForMovie, useShowsForMovie } from '@hooks/useTheatres';
import { getMovieById } from '@services/moviesService';
import { SHOWTIME_DATES } from '@services/theatresService';
import { Body, Heading3, Loader } from '@shared/ui';
import { useBookingStore } from '@store/bookingStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Showtimes'>;
type ShowStatus = 'available' | 'fast' | 'soldout';

function statusOf(show: Show): ShowStatus {
  if (show.availableSeats === 0) return 'soldout';
  if (show.availableSeats / show.totalSeats < 0.2) return 'fast';
  return 'available';
}

const DATE_LABELS = SHOWTIME_DATES.map(iso => {
  const d = new Date(iso);
  return {
    iso,
    dow: d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
    num: String(d.getDate()),
  };
});

export function ShowtimesScreen({ navigation, route }: Props) {
  const { movieId } = route.params;
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [movie, setMovie] = useState<Movie | null>(null);
  const [dateIdx, setDateIdx] = useState(0);
  const { theatres, loading: theatresLoading } = useTheatresForMovie(movieId);
  const { shows, loading: showsLoading } = useShowsForMovie(movieId);
  const setSelectedMovie = useBookingStore(s => s.setSelectedMovie);
  const setSelectedTheatre = useBookingStore(s => s.setSelectedTheatre);
  const setSelectedShow = useBookingStore(s => s.setSelectedShow);

  useEffect(() => {
    getMovieById(movieId).then(m => m && setMovie(m));
  }, [movieId]);

  const selectedDate = DATE_LABELS[dateIdx]?.iso;
  const showsForDate = shows.filter(s => s.date === selectedDate);

  function goSeats(show: Show, theatre: Theatre) {
    if (movie) setSelectedMovie(movie);
    setSelectedTheatre(theatre);
    setSelectedShow(show);
    navigation.navigate('SeatSelection', { showId: show.id });
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
          const cinemaShows = showsForDate.filter(s => s.theatreId === theatre.id);
          if (cinemaShows.length === 0) return null;
          return (
            <View key={theatre.id} style={styles.cinemaCard}>
              <Heading3 style={styles.cinemaName}>{theatre.name}</Heading3>
              <Text style={styles.cinemaScreen}>{theatre.address}</Text>
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
    cinemaName: { marginBottom: 2 },
    cinemaScreen: { fontSize: FontSize.xs + 1, color: Colors.textMuted, marginBottom: Spacing.md },
    chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    chip: {
      paddingHorizontal: Spacing.sm + 4,
      paddingVertical: Spacing.sm,
      borderRadius: Radius.md,
      borderWidth: 1,
    },
    chipAvailable: { backgroundColor: 'rgba(79,184,120,0.12)', borderColor: Colors.success },
    chipFast: { backgroundColor: 'rgba(227,167,94,0.15)', borderColor: Colors.warning },
    chipSoldout: { backgroundColor: Colors.secondary, borderColor: Colors.secondary, opacity: 0.6 },
    chipTime: { fontFamily: FontFamily.semibold, fontWeight: FontWeight.semibold, fontSize: FontSize.sm - 1 },
    chipTextAvailable: { color: Colors.success },
    chipTextFast: { color: Colors.warning },
    chipTextSoldout: { color: Colors.textMuted },
  });
