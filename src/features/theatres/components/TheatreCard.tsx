import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Building2, Heart, Navigation } from 'lucide-react-native';
import { ColorTokens, FontSize, Radius, Spacing } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';
import { Card, Heading3 } from '@shared/ui';

interface TheatreCardProps {
  name: string;
  location: string;
  favourited: boolean;
  onToggleFavourite: () => void;
  onDirections: () => void;
  children?: React.ReactNode;
}

export function TheatreCard({ name, location, favourited, onToggleFavourite, onDirections, children }: TheatreCardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <Card elevated padding="md" style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.iconBadge}>
          <Building2 size={16} color={colors.accent} />
        </View>
        <View style={styles.info}>
          <Heading3 numberOfLines={1}>{name}</Heading3>
          <Text style={styles.location} numberOfLines={1}>{location}</Text>
        </View>
        <Pressable onPress={onToggleFavourite} hitSlop={8}>
          <Heart size={17} color={favourited ? colors.accent : colors.textMuted} fill={favourited ? colors.accent : 'none'} />
        </Pressable>
        <Pressable onPress={onDirections} hitSlop={8} style={styles.directionsBtn}>
          <Navigation size={15} color={colors.accent} />
        </Pressable>
      </View>
      {children}
    </Card>
  );
}

const makeStyles = (Colors: ColorTokens) =>
  StyleSheet.create({
    card: { gap: Spacing.md },
    headerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    iconBadge: {
      width: 32,
      height: 32,
      borderRadius: Radius.sm,
      backgroundColor: Colors.accentLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    info: { flex: 1 },
    location: { fontSize: FontSize.xs + 1, color: Colors.textMuted, marginTop: 2 },
    directionsBtn: { paddingLeft: 2 },
  });
