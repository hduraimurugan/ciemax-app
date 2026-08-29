import React, { useMemo } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { Movie } from '@ctypes/models';
import { ColorTokens, FontSize, FontWeight, Radius, Spacing } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';
import { Heading3, BodySmall, Caption } from '@shared/ui';
import { formatRating } from '@shared/utils';

const CARD_WIDTH = 128;
const CARD_HEIGHT = 184; // matches CineHall design's 128x184 poster cards

interface MovieCardProps {
  movie: Movie;
  onPress: (movie: Movie) => void;
  variant?: 'rating' | 'soon' | 'plain';
}

export const MovieCard = React.memo(function MovieCard({ movie, onPress, variant = 'rating' }: MovieCardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
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
        {variant === 'rating' && (
          <View style={styles.ratingPill}>
            <Caption style={styles.ratingText}>⭐ {formatRating(movie.rating)}</Caption>
          </View>
        )}
        {variant === 'soon' && (
          <View style={styles.soonPill}>
            <Caption style={styles.soonText}>SOON</Caption>
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Heading3 numberOfLines={2} style={styles.title}>{movie.title}</Heading3>
        <BodySmall style={styles.meta} numberOfLines={1}>{movie.genre.join(', ')}</BodySmall>
      </View>
    </Pressable>
  );
});

const makeStyles = (Colors: ColorTokens) =>
  StyleSheet.create({
    container: {
      width: CARD_WIDTH,
    },
    pressed: { opacity: 0.85 },
    posterWrapper: {
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      position: 'relative',
      borderRadius: Radius.lg,
      overflow: 'hidden',
      backgroundColor: Colors.surfaceElevated,
      borderWidth: 1,
      borderColor: Colors.border,
    },
    poster: {
      width: '100%',
      height: '100%',
    },
    ratingPill: {
      position: 'absolute',
      top: Spacing.xs,
      right: Spacing.xs,
      backgroundColor: Colors.mediaScrim,
      borderRadius: Radius.sm,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    ratingText: {
      color: Colors.star,
      fontWeight: FontWeight.semibold,
      fontSize: FontSize.xs,
    },
    soonPill: {
      position: 'absolute',
      top: Spacing.xs,
      left: Spacing.xs,
      backgroundColor: Colors.violet,
      borderRadius: Radius.sm,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    soonText: {
      color: Colors.textPrimary,
      fontWeight: FontWeight.semibold,
      fontSize: FontSize.xs - 1,
    },
    info: {
      paddingTop: Spacing.xs + 4,
      gap: 2,
    },
    title: {
      fontSize: FontSize.sm,
      fontWeight: FontWeight.semibold,
      color: Colors.textPrimary,
      lineHeight: FontSize.sm * 1.3,
    },
    meta: {
      color: Colors.textMuted,
      fontSize: FontSize.xs,
    },
  });
