import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Heart, Star, MapPin } from 'lucide-react-native';
import { Show, Theatre } from '@ctypes/models';
import { ColorTokens, FontSize, FontWeight, Radius, Spacing } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';
import { Heading3, Body, BodySmall, Caption } from '@shared/ui';
import { Badge } from '@shared/ui';

interface TheatreCardProps {
  theatre: Theatre;
  onPress: (theatre: Theatre) => void;
  shows?: Show[];
  onShowPress?: (show: Show) => void;
}

export function TheatreCard({ theatre, onPress, shows, onShowPress }: TheatreCardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [isFav, setIsFav] = useState(false);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={() => onPress(theatre)}>
      <View style={styles.header}>
        <View style={styles.titleBlock}>
          <Heading3 numberOfLines={1}>{theatre.name}</Heading3>
          <Body numberOfLines={1} style={styles.address}>{theatre.address}</Body>
          {theatre.distance ? (
            <View style={styles.distanceRow}>
              <MapPin size={11} color={colors.info} />
              <Caption style={styles.distance}>{theatre.distance}</Caption>
            </View>
          ) : null}
        </View>
        <View style={styles.right}>
          <Pressable
            style={styles.favBtn}
            onPress={e => {
              e.stopPropagation?.();
              setIsFav(f => !f);
            }}>
            <Heart
              size={20}
              color={isFav ? colors.accent : colors.textMuted}
              fill={isFav ? colors.accent : 'none'}
            />
          </Pressable>
          <View style={styles.ratingRow}>
            <Star size={12} color={colors.star} fill={colors.star} />
            <BodySmall style={styles.rating}>{theatre.rating}</BodySmall>
          </View>
        </View>
      </View>

      <View style={styles.amenities}>
        {theatre.amenities.map(a => (
          <Badge key={a} label={a} variant="default" style={styles.badge} />
        ))}
      </View>

      {shows && shows.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.showTimes}>
          {shows.map(show => (
            <Pressable
              key={show.id}
              style={styles.showBtn}
              onPress={e => {
                e.stopPropagation?.();
                onShowPress?.(show);
              }}>
              <BodySmall style={styles.showTime}>{show.time}</BodySmall>
              <Caption style={styles.showFormat}>{show.format}</Caption>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}
    </Pressable>
  );
}

const makeStyles = (Colors: ColorTokens) =>
  StyleSheet.create({
    card: {
      backgroundColor: Colors.surface,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: Colors.border,
      padding: Spacing.md,
      marginBottom: Spacing.sm,
      gap: Spacing.sm,
    },
    pressed: { opacity: 0.85 },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: Spacing.sm,
    },
    titleBlock: { flex: 1, gap: 2 },
    address: { color: Colors.textSecondary, fontSize: FontSize.sm },
    right: { alignItems: 'flex-end', gap: 4 },
    favBtn: {
      padding: 4,
    },
    distanceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
    },
    distance: {
      color: Colors.info,
      fontSize: FontSize.xs,
    },
    ratingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
    },
    rating: {
      color: Colors.star,
      fontWeight: FontWeight.semibold,
      fontSize: FontSize.xs,
    },
    amenities: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.xs,
    },
    badge: {},
    showTimes: {
      gap: Spacing.sm,
      paddingTop: Spacing.xs,
    },
    showBtn: {
      borderWidth: 1,
      borderColor: Colors.success,
      borderRadius: Radius.sm,
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.xs,
      alignItems: 'center',
      minWidth: 80,
    },
    showTime: {
      color: Colors.success,
      fontWeight: FontWeight.semibold,
      fontSize: FontSize.sm,
    },
    showFormat: {
      color: Colors.textMuted,
      fontSize: FontSize.xs - 1,
    },
  });
