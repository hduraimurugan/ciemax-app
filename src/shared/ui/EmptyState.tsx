import React, { useMemo } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Spacing } from '@constants/theme';
import { Heading3, Body } from './Typography';
import { Button } from './Button';

interface EmptyStateProps {
  icon: React.ReactNode;
  title?: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: React.ReactNode;
  /** Fill the parent (flex:1, centered) — set false for an inline/partial-screen empty state. */
  fill?: boolean;
  style?: ViewStyle;
}

export function EmptyState({
  icon,
  title,
  message,
  actionLabel,
  onAction,
  actionIcon,
  fill = true,
  style,
}: EmptyStateProps) {
  const styles = useMemo(() => makeStyles(), []);

  return (
    <View style={[fill ? styles.containerFill : styles.containerInline, style]}>
      {icon}
      {title ? <Heading3 style={styles.title}>{title}</Heading3> : null}
      <Body style={styles.message}>{message}</Body>
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} leftIcon={actionIcon} style={styles.action} />
      ) : null}
    </View>
  );
}

const makeStyles = () =>
  StyleSheet.create({
    containerFill: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.md,
      padding: Spacing.xl,
    },
    containerInline: {
      alignItems: 'center',
      gap: Spacing.md,
      paddingTop: Spacing.xxl,
      paddingHorizontal: Spacing.xl,
    },
    title: { textAlign: 'center' },
    message: { textAlign: 'center' },
    action: { marginTop: Spacing.xs },
  });
