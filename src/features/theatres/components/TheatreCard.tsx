import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Theatre } from '@ctypes/models';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@constants/theme';
import { Heading3, Body, BodySmall, Caption } from '@shared/ui';
import { Badge } from '@shared/ui';

interface TheatreCardProps {
  theatre: Theatre;
  onPress: (theatre: Theatre) => void;
}

export function TheatreCard({ theatre, onPress }: TheatreCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={() => onPress(theatre)}>
      <View style={styles.header}>
        <View style={styles.titleBlock}>
          <Heading3 numberOfLines={1}>{theatre.name}</Heading3>
          <Body numberOfLines={1}>{theatre.address}</Body>
        </View>
        <View style={styles.right}>
          {theatre.distance ? (
            <Caption style={styles.distance}>{theatre.distance}</Caption>
          ) : null}
          <BodySmall style={styles.rating}>⭐ {theatre.rating}</BodySmall>
        </View>
      </View>
      <View style={styles.amenities}>
        {theatre.amenities.map(a => (
          <Badge key={a} label={a} variant="default" style={styles.badge} />
        ))}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
  right: { alignItems: 'flex-end', gap: 4 },
  distance: {
    color: Colors.info,
    fontSize: FontSize.xs,
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
});
