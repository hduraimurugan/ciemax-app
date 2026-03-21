import React from 'react';
import {
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { Movie } from '@ctypes/models';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@constants/theme';
import { Badge } from '@shared/ui';
import { Heading3, BodySmall, Caption } from '@shared/ui';
import { formatDuration, formatRating } from '@shared/utils';

const CARD_WIDTH = (Dimensions.get('window').width - Spacing.md * 2 - Spacing.sm) / 2;

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
        {/* Format badges */}
        <View style={styles.formatRow}>
          {movie.format.slice(0, 2).map(f => (
            <Badge key={f} label={f} variant="default" style={styles.formatBadge} />
          ))}
        </View>
      </View>
      <View style={styles.info}>
        <Heading3 numberOfLines={2} style={styles.title}>{movie.title}</Heading3>
        <BodySmall numberOfLines={1}>{movie.genre.slice(0, 2).join(' · ')}</BodySmall>
        <BodySmall style={styles.meta}>{formatDuration(movie.duration)} · {movie.language}</BodySmall>
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
    marginBottom: Spacing.md,
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  posterWrapper: {
    width: '100%',
    height: CARD_WIDTH * 1.45,
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
  formatRow: {
    position: 'absolute',
    bottom: Spacing.xs,
    left: Spacing.xs,
    flexDirection: 'row',
    gap: 4,
  },
  formatBadge: {
    backgroundColor: 'rgba(0,0,0,0.7)',
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
    marginTop: 2,
  },
});
