import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { Movie } from '@ctypes/models';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@constants/theme';
import { Heading3, BodySmall, Caption } from '@shared/ui';
import { formatRating } from '@shared/utils';

const CARD_WIDTH = 160;
const CARD_HEIGHT = 240; // aspect-[2/3]

interface MovieCardProps {
  movie: Movie;
  onPress: (movie: Movie) => void;
}

export function MovieCard({ movie, onPress }: MovieCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={() => onPress(movie)}>
      <View style={styles.posterWrapper}>
        <Image
          source={{ uri: movie.posterUrl }}
          style={styles.poster}
          resizeMode="cover"
        />
        {/* Rating pill */}
        <View style={styles.ratingPill}>
          <Caption style={styles.ratingText}>⭐ {formatRating(movie.rating)}</Caption>
        </View>
        {/* Genre chips at bottom */}
        <View style={styles.genreRow}>
          {movie.genre.slice(0, 2).map(g => (
            <View key={g} style={styles.genreChip}>
              <Caption style={styles.genreText}>{g}</Caption>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.info}>
        <Heading3 numberOfLines={2} style={styles.title}>{movie.title}</Heading3>
        <BodySmall style={styles.meta} numberOfLines={1}>{movie.language}</BodySmall>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginRight: Spacing.sm,
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  posterWrapper: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    position: 'relative',
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  ratingPill: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  ratingText: {
    color: Colors.star,
    fontWeight: FontWeight.semibold,
    fontSize: FontSize.xs,
  },
  genreRow: {
    position: 'absolute',
    bottom: Spacing.xs,
    left: Spacing.xs,
    flexDirection: 'row',
    gap: 4,
    flexWrap: 'nowrap',
  },
  genreChip: {
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: Radius.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  genreText: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs - 1,
  },
  info: {
    padding: Spacing.sm,
    gap: 2,
  },
  title: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  meta: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
  },
});
