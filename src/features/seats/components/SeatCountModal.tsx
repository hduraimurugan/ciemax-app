import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ColorTokens, FontFamily, FontSize, FontWeight, Radius, Spacing } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';
import { BottomSheet, Body, Caption, Heading3 } from '@shared/ui';
import { formatPrice } from '@shared/utils';
import { AppConfig } from '@constants/config';
import { SeatLayout, SeatSection } from '@ctypes/models';

interface SeatCountModalProps {
  visible: boolean;
  layout: SeatLayout | null;
  onSelect: (count: number) => void;
  onDismiss: () => void;
}

// The one place the app's per-booking seat cap is enforced — matches
// AppConfig.maxSeatSelectionPerBooking rather than a separately hardcoded number.
const COUNTS = Array.from({ length: AppConfig.maxSeatSelectionPerBooking }, (_, i) => i + 1);
const SECTION_ORDER: SeatSection[] = ['premium', 'gold', 'silver'];
const SECTION_LABEL: Record<string, string> = { premium: 'Premium', gold: 'Standard', silver: 'Silver' };

function availabilityFor(layout: SeatLayout | null, section: SeatSection) {
  const seats = (layout?.allSeats ?? []).filter(s => s.section === section);
  if (seats.length === 0) return null;
  const available = seats.filter(s => s.status === 'available').length;
  const total = seats.length;
  const price = seats[0]?.price ?? 0;
  const ratio = available / total;
  const label = ratio === 0 ? 'SOLD OUT' : ratio < 0.3 ? 'FILLING FAST' : 'AVAILABLE';
  return { price, label, ratio };
}

export function SeatCountModal({ visible, layout, onSelect, onDismiss }: SeatCountModalProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <BottomSheet visible={visible} onClose={onDismiss} snapHeight={420}>
      <Heading3 style={styles.title}>How many seats?</Heading3>
      <Body style={styles.subtitle}>Select adjacent seats by tapping any available seat.</Body>

      <View style={styles.countGrid}>
        {COUNTS.map(n => (
          <Pressable key={n} style={styles.countBtn} onPress={() => onSelect(n)}>
            <Text style={styles.countBtnText}>{n}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.statsList}>
        {SECTION_ORDER.map(section => {
          const stat = availabilityFor(layout, section);
          if (!stat) return null;
          return (
            <View key={section} style={styles.statRow}>
              <Caption style={styles.statLabel}>{SECTION_LABEL[section]} · {formatPrice(stat.price)}</Caption>
              <Caption
                style={[
                  styles.statBadge,
                  stat.label === 'SOLD OUT' && { color: colors.error },
                  stat.label === 'FILLING FAST' && { color: colors.warning },
                  stat.label === 'AVAILABLE' && { color: colors.success },
                ]}>
                {stat.label}
              </Caption>
            </View>
          );
        })}
      </View>
    </BottomSheet>
  );
}

const makeStyles = (Colors: ColorTokens) =>
  StyleSheet.create({
    title: { marginBottom: Spacing.xs },
    subtitle: { color: Colors.textMuted, marginBottom: Spacing.lg },
    countGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
    countBtn: {
      width: 48,
      height: 48,
      borderRadius: Radius.full,
      backgroundColor: Colors.surfaceElevated,
      borderWidth: 1,
      borderColor: Colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    countBtnText: {
      fontFamily: FontFamily.bold,
      fontWeight: FontWeight.bold,
      fontSize: FontSize.md,
      color: Colors.textPrimary,
    },
    statsList: { gap: Spacing.sm },
    statRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: Spacing.xs,
      borderBottomWidth: 1,
      borderBottomColor: Colors.divider,
    },
    statLabel: { color: Colors.textPrimary },
    statBadge: { fontWeight: FontWeight.semibold },
  });
