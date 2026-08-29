import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ColorTokens, FontFamily, FontSize, FontWeight, Radius, Spacing } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';
import { Card, Heading2, Body } from '@shared/ui';

interface AuthCardTabs {
  activeLabel: string;
  inactiveLabel: string;
  onInactivePress: () => void;
}

interface AuthCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  tabs?: AuthCardTabs;
  error?: string | null;
  children: React.ReactNode;
}

export function AuthCard({ icon, title, subtitle, tabs, error, children }: AuthCardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <Card variant="glass" padding="none">
      {tabs && (
        <View style={styles.tabs}>
          <View style={[styles.tab, styles.tabActive]}>
            <Text style={[styles.tabText, styles.tabTextActive]}>{tabs.activeLabel}</Text>
          </View>
          <Pressable style={styles.tab} onPress={tabs.onInactivePress}>
            <Text style={styles.tabText}>{tabs.inactiveLabel}</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.formBody}>
        <View style={styles.iconRow}>
          <View style={styles.iconCircle}>{icon}</View>
          <Heading2 style={styles.formTitle}>{title}</Heading2>
          {subtitle ? <Body style={styles.formSub}>{subtitle}</Body> : null}
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {children}
      </View>
    </Card>
  );
}

const makeStyles = (Colors: ColorTokens) =>
  StyleSheet.create({
    tabs: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: Colors.border,
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: Spacing.sm + 2,
      borderBottomWidth: 2,
      borderBottomColor: Colors.transparent,
    },
    tabActive: {
      borderBottomColor: Colors.accent,
    },
    tabText: {
      fontSize: FontSize.sm,
      fontFamily: FontFamily.medium,
      fontWeight: FontWeight.medium,
      color: Colors.textMuted,
    },
    tabTextActive: {
      color: Colors.textPrimary,
    },
    formBody: {
      padding: Spacing.lg,
      gap: Spacing.md,
    },
    iconRow: {
      alignItems: 'center',
      gap: Spacing.sm,
      marginBottom: Spacing.sm,
    },
    iconCircle: {
      width: 56,
      height: 56,
      borderRadius: Radius.full,
      backgroundColor: Colors.accentLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    formTitle: {
      textAlign: 'center',
    },
    formSub: {
      textAlign: 'center',
      color: Colors.textSecondary,
    },
    errorText: {
      fontSize: FontSize.sm,
      color: Colors.error,
      textAlign: 'center',
    },
  });
