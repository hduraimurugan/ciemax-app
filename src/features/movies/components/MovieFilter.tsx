import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { ColorTokens, FontSize, FontWeight, Radius, Spacing } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';
import { MovieTab } from '../types';

interface MovieFilterProps {
  activeTab: MovieTab;
  onTabChange: (tab: MovieTab) => void;
}

const TABS: { key: MovieTab; label: string }[] = [
  { key: 'now_showing', label: 'Now Showing' },
  { key: 'coming_soon', label: 'Coming Soon' },
];

export function MovieFilter({ activeTab, onTabChange }: MovieFilterProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}>
      {TABS.map(tab => (
        <Pressable
          key={tab.key}
          style={[styles.tab, activeTab === tab.key && styles.tabActive]}
          onPress={() => onTabChange(tab.key)}>
          <Text
            style={[
              styles.tabText,
              activeTab === tab.key && styles.tabTextActive,
            ]}>
            {tab.label}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const makeStyles = (Colors: ColorTokens) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      gap: Spacing.sm,
      flexDirection: 'row',
    },
    tab: {
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.xs + 2,
      borderRadius: Radius.full,
      borderWidth: 1,
      borderColor: Colors.border,
      backgroundColor: Colors.surface,
    },
    tabActive: {
      backgroundColor: Colors.accent,
      borderColor: Colors.accent,
    },
    tabText: {
      fontSize: FontSize.sm,
      fontWeight: FontWeight.medium,
      color: Colors.textSecondary,
    },
    tabTextActive: {
      color: Colors.textPrimary,
      fontWeight: FontWeight.semibold,
    },
  });
