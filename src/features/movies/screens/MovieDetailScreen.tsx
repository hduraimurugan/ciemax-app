import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@ctypes/navigation';
import { Movie } from '@ctypes/models';
import { Colors, FontFamily, FontSize, FontWeight, Radius, Spacing } from '@constants/theme';
import { Badge, Button, Loader } from '@shared/ui';
import {
  Heading1,
  Body,
  BodySmall,
  Caption,
  Label,
} from '@shared/ui';
import { formatDuration, formatRating } from '@shared/utils';
import { getMovieById } from '@services/moviesService';
import { useBookingStore } from '@store/bookingStore';

type Props = NativeStackScreenProps<RootStackParamList, 'MovieDetail'>;

const SCREEN_WIDTH = Dimensions.get('window').width;

function getNext7Days() {
  const days = [];
  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push({
      key: d.toISOString().split('T')[0],
      day: dayNames[d.getDay()],
      date: d.getDate(),
    });
  }
  return days;
}

export function MovieDetailScreen({ navigation, route }: Props) {
  const { movieId } = route.params;
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const setSelectedMovie = useBookingStore(s => s.setSelectedMovie);

  const dateDays = getNext7Days();

  useEffect(() => {
    getMovieById(movieId).then(m => {
      if (m) setMovie(m);
      setLoading(false);
    });
  }, [movieId]);

  function handleBookNow() {
    if (!movie) return;
    setSelectedMovie(movie);
    navigation.navigate('Theatres', { movieId: movie.id });
  }

  if (loading) return <Loader fullScreen />;
  if (!movie) return null;

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Blurred backdrop hero */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: movie.backdropUrl || movie.posterUrl }}
            style={[StyleSheet.absoluteFill, styles.blurredBg]}
            blurRadius={20}
            resizeMode="cover"
          />
          <View style={[StyleSheet.absoluteFill, styles.heroOverlay]} />

          {/* Back button */}
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft size={18} color={Colors.textPrimary} />
          </Pressable>

          {/* Poster + title */}
          <View style={styles.heroRow}>
            <Image source={{ uri: movie.posterUrl }} style={styles.poster} resizeMode="cover" />
            <View style={styles.titleBlock}>
              <Heading1 style={styles.title}>{movie.title}</Heading1>
              <View style={styles.pillRow}>
                {movie.genre.slice(0, 2).map(g => (
                  <Badge key={g} label={g} variant="accent" />
                ))}
                <Badge label={movie.language} variant="default" />
                <Badge label={formatDuration(movie.duration)} variant="default" />
              </View>
              <Badge label={`★ ${formatRating(movie.rating)}/10`} variant="warning" />
            </View>
          </View>
        </View>

        {/* Date selector */}
        <View style={styles.dateSectionWrapper}>
          <Label style={styles.dateSectionLabel}>Select Date</Label>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateList}>
            {dateDays.map(d => (
              <Pressable
                key={d.key}
                style={[styles.dateBtn, selectedDate === d.key && styles.dateBtnActive]}
                onPress={() => setSelectedDate(d.key)}>
                <Caption style={[styles.dateBtnDay, selectedDate === d.key && styles.dateBtnTextActive]}>
                  {d.day}
                </Caption>
                <Text style={[styles.dateBtnDate, selectedDate === d.key && styles.dateBtnTextActive]}>
                  {d.date}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.body}>
          {/* Synopsis */}
          <View style={styles.section}>
            <Label>Synopsis</Label>
            <Body>{movie.synopsis}</Body>
          </View>

          {/* Available formats */}
          <View style={styles.section}>
            <Label>Available in</Label>
            <View style={styles.formatRow}>
              {movie.format.map(f => (
                <Badge key={f} label={f} variant="accent" />
              ))}
            </View>
          </View>

          {/* Director */}
          <View style={styles.section}>
            <Label>Director</Label>
            <BodySmall style={styles.value}>{movie.director}</BodySmall>
          </View>

          {/* Cast */}
          <View style={styles.section}>
            <Label>Cast</Label>
            <BodySmall style={styles.value}>{movie.cast.join(', ')}</BodySmall>
          </View>
        </View>
      </ScrollView>

      {/* Sticky CTA */}
      <View style={styles.cta}>
        <Button label="Book Tickets" onPress={handleBookNow} fullWidth size="lg" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 100 },

  // Hero
  heroContainer: {
    width: SCREEN_WIDTH,
    height: 260,
    position: 'relative',
    overflow: 'hidden',
  },
  blurredBg: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    backgroundColor: 'rgba(20, 26, 33, 0.75)',
  },
  backButton: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: Radius.full,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.md,
    paddingTop: Spacing.xl + Spacing.md,
    flex: 1,
    alignItems: 'flex-end',
  },
  poster: {
    width: 90,
    height: 135,
    borderRadius: Radius.md,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  titleBlock: {
    flex: 1,
    gap: Spacing.sm,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },

  // Date selector
  dateSectionWrapper: {
    paddingTop: Spacing.md,
    gap: Spacing.sm,
  },
  dateSectionLabel: {
    paddingHorizontal: Spacing.md,
  },
  dateList: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  dateBtn: {
    width: 56,
    height: 64,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 2,
  },
  dateBtnActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  dateBtnDay: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontFamily: FontFamily.medium,
  },
  dateBtnDate: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
  },
  dateBtnTextActive: {
    color: Colors.textPrimary,
  },

  // Body
  body: { padding: Spacing.md, gap: Spacing.lg },
  section: { gap: Spacing.sm },
  formatRow: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  value: { color: Colors.textPrimary },
  cta: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.md,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
