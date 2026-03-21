import React, { useEffect, useState } from 'react';
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@ctypes/navigation';
import { Movie } from '@ctypes/models';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@constants/theme';
import { Badge, Button, Loader } from '@shared/ui';
import {
  Heading1,
  Heading3,
  Body,
  BodySmall,
  Caption,
  Label,
} from '@shared/ui';
import { formatDuration, formatRating, formatDate } from '@shared/utils';
import { getMovieById } from '@services/moviesService';
import { useBookingStore } from '@store/bookingStore';

type Props = NativeStackScreenProps<RootStackParamList, 'MovieDetail'>;

export function MovieDetailScreen({ navigation, route }: Props) {
  const { movieId } = route.params;
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const setSelectedMovie = useBookingStore(s => s.setSelectedMovie);

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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        {/* Back button */}
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Body style={styles.backText}>← Back</Body>
        </Pressable>

        {/* Backdrop */}
        <Image source={{ uri: movie.backdropUrl }} style={styles.backdrop} />

        <View style={styles.body}>
          {/* Poster + title row */}
          <View style={styles.heroRow}>
            <Image source={{ uri: movie.posterUrl }} style={styles.poster} />
            <View style={styles.titleBlock}>
              <Heading1 style={styles.title}>{movie.title}</Heading1>
              <View style={styles.genreRow}>
                {movie.genre.map(g => (
                  <Badge key={g} label={g} variant="default" />
                ))}
              </View>
              <View style={styles.metaRow}>
                <Caption>⭐ {formatRating(movie.rating)}/10</Caption>
                <Caption> · </Caption>
                <Caption>{formatDuration(movie.duration)}</Caption>
                <Caption> · </Caption>
                <Caption>{movie.language}</Caption>
              </View>
              <Caption style={styles.releaseDate}>
                {formatDate(movie.releaseDate)}
              </Caption>
            </View>
          </View>

          {/* Formats */}
          <View style={styles.section}>
            <Label>Available in</Label>
            <View style={styles.formatRow}>
              {movie.format.map(f => (
                <Badge key={f} label={f} variant="accent" />
              ))}
            </View>
          </View>

          {/* Synopsis */}
          <View style={styles.section}>
            <Label>Synopsis</Label>
            <Body>{movie.synopsis}</Body>
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
        <Button
          label="Book Tickets"
          onPress={handleBookNow}
          fullWidth
          size="lg"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 100 },
  backButton: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  backText: { color: Colors.textPrimary, fontWeight: FontWeight.medium },
  backdrop: {
    width: '100%',
    height: 220,
  },
  body: { padding: Spacing.md, gap: Spacing.lg },
  heroRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: -60,
  },
  poster: {
    width: 100,
    height: 150,
    borderRadius: Radius.md,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  titleBlock: {
    flex: 1,
    paddingTop: Spacing.xl,
    gap: Spacing.sm,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  genreRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap' },
  releaseDate: { color: Colors.textMuted },
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
