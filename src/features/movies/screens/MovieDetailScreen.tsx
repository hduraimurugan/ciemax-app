import React, { useEffect, useMemo, useState } from 'react';
import {
  Dimensions,
  Image,
  Linking,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Heart, Share2, Play } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@ctypes/navigation';
import { Movie } from '@ctypes/models';
import { ColorTokens, FontSize, FontWeight, Radius, Spacing } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';
import { useFavourites } from '@hooks/useFavourites';
import { StorageKeys } from '@constants/config';
import { Badge, Button, Loader } from '@shared/ui';
import { Heading1, Body, BodySmall, Label } from '@shared/ui';
import { formatDuration, formatRating } from '@shared/utils';
import { getMovieById } from '@services/moviesService';

type Props = NativeStackScreenProps<RootStackParamList, 'MovieDetail'>;

const SCREEN_WIDTH = Dimensions.get('window').width;
const SYNOPSIS_CLAMP = 110;

export function MovieDetailScreen({ navigation, route }: Props) {
  const { movieId } = route.params;
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [synopsisExpanded, setSynopsisExpanded] = useState(false);
  const { isFavourite, toggle } = useFavourites(StorageKeys.favouriteMovies);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getMovieById(movieId).then(m => {
      if (cancelled) return;
      if (m) setMovie(m);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [movieId]);

  function handleBookNow() {
    if (!movie) return;
    navigation.navigate('Showtimes', { movieId: movie.id });
  }

  async function handleShare() {
    if (!movie) return;
    try {
      await Share.share({
        message: `Check out ${movie.title} on CineHall!`,
        title: movie.title,
      });
    } catch {
      // user dismissed — nothing to do
    }
  }

  const trailerUrl = movie?.trailerUrl;

  if (loading) return <Loader fullScreen />;
  if (!movie) return null;

  const favourited = isFavourite(movie.id);
  const synopsisText =
    synopsisExpanded || movie.synopsis.length <= SYNOPSIS_CLAMP
      ? movie.synopsis
      : movie.synopsis.slice(0, SYNOPSIS_CLAMP) + '…';

  return (
    <SafeAreaView style={styles.screen} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Image source={{ uri: movie.backdropUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          <View style={[StyleSheet.absoluteFill, styles.heroOverlay]} />

          <Pressable style={styles.iconButton} onPress={() => navigation.goBack()}>
            <ArrowLeft size={18} color="#fff" />
          </Pressable>
          <View style={styles.heroActions}>
            <Pressable style={styles.iconButton} onPress={() => toggle(movie.id)}>
              <Heart size={17} color="#fff" fill={favourited ? '#fff' : 'none'} />
            </Pressable>
            <Pressable style={styles.iconButton} onPress={handleShare}>
              <Share2 size={16} color="#fff" />
            </Pressable>
          </View>

          {trailerUrl ? (
            <Pressable style={styles.playButton} onPress={() => Linking.openURL(trailerUrl)}>
              <Play size={20} color="#fff" fill="#fff" />
            </Pressable>
          ) : null}
        </View>

        <View style={styles.body}>
          <Heading1 style={styles.title}>{movie.title}</Heading1>
          <View style={styles.pillRow}>
            <Badge label={`★ ${formatRating(movie.rating)}`} variant="gold" />
            <Badge label={movie.genre.join(' · ')} variant="default" />
            <Badge label={formatDuration(movie.duration)} variant="default" />
            <Badge label={movie.language} variant="default" />
          </View>

          <Body style={styles.synopsis}>{synopsisText}</Body>
          {movie.synopsis.length > SYNOPSIS_CLAMP && (
            <Pressable onPress={() => setSynopsisExpanded(v => !v)}>
              <Text style={styles.readMore}>{synopsisExpanded ? 'Show less' : 'Read more'}</Text>
            </Pressable>
          )}

          {movie.cast.length > 0 && (
            <>
              <Label style={styles.castLabel}>Cast</Label>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.castRow}>
                {movie.cast.map(c => (
                  <View key={c.name} style={styles.castItem}>
                    <View style={styles.castAvatar}>
                      {c.profilePath ? (
                        <Image source={{ uri: c.profilePath }} style={styles.castPhoto} resizeMode="cover" />
                      ) : (
                        <Text style={styles.castInitials}>{c.initials}</Text>
                      )}
                    </View>
                    <BodySmall style={styles.castName} numberOfLines={1}>{c.name}</BodySmall>
                    {c.character ? (
                      <BodySmall style={styles.castCharacter} numberOfLines={1}>{c.character}</BodySmall>
                    ) : null}
                  </View>
                ))}
              </ScrollView>
            </>
          )}
        </View>
      </ScrollView>

      <View style={styles.cta}>
        <Button label="Book Tickets" onPress={handleBookNow} fullWidth size="lg" />
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (Colors: ColorTokens) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: Colors.background },
    content: { paddingBottom: 100 },

    hero: {
      width: SCREEN_WIDTH,
      height: 340,
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: Colors.surfaceElevated,
    },
    heroOverlay: { backgroundColor: 'rgba(0,0,0,0.25)' },
    iconButton: {
      position: 'absolute',
      top: Spacing.md,
      left: Spacing.md,
      width: 36,
      height: 36,
      borderRadius: Radius.md,
      backgroundColor: 'rgba(0,0,0,0.5)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    heroActions: {
      position: 'absolute',
      top: Spacing.md,
      right: Spacing.md,
      flexDirection: 'row',
      gap: Spacing.sm,
    },
    playButton: {
      position: 'absolute',
      left: '50%',
      top: '60%',
      marginLeft: -28,
      marginTop: -28,
      width: 56,
      height: 56,
      borderRadius: Radius.full,
      backgroundColor: 'rgba(255,255,255,0.18)',
      borderWidth: 1.5,
      borderColor: 'rgba(255,255,255,0.5)',
      alignItems: 'center',
      justifyContent: 'center',
    },

    body: { padding: Spacing.lg, marginTop: -Spacing.lg },
    title: { marginBottom: Spacing.md },
    pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
    synopsis: { marginBottom: Spacing.xs, lineHeight: FontSize.sm * 1.6 },
    readMore: { color: Colors.accent, fontWeight: FontWeight.semibold, fontSize: FontSize.sm, marginBottom: Spacing.lg },
    castLabel: { marginBottom: Spacing.sm + 2 },
    castRow: { gap: Spacing.md, paddingBottom: Spacing.md },
    castItem: { alignItems: 'center', width: 64 },
    castAvatar: {
      width: 56,
      height: 56,
      borderRadius: Radius.full,
      backgroundColor: Colors.secondary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 6,
      overflow: 'hidden',
    },
    castPhoto: { width: '100%', height: '100%' },
    castInitials: { fontSize: FontSize.md - 1, fontWeight: FontWeight.bold, color: Colors.textPrimary },
    castName: { textAlign: 'center', color: Colors.textMuted },
    castCharacter: { textAlign: 'center', color: Colors.textMuted, opacity: 0.7, fontSize: FontSize.xs - 1 },

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
