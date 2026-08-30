import React, { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { ColorTokens, FontSize, Radius, Shadow, Spacing } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';
import { Heading2, Heading3 } from './Typography';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  /** Small icon shown in a badge to the left of the title (e.g. a Bell for Notifications). */
  titleIcon?: React.ReactNode;
  onBack?: () => void;
  backLoading?: boolean;
  rightIcon?: React.ReactNode;
  rightLabel?: string;
  onRightPress?: () => void;
  /** Arbitrary right-aligned content (e.g. a CountdownTimer) — takes precedence over rightIcon/rightLabel. */
  rightSlot?: React.ReactNode;
  variant?: 'default' | 'onMedia';
  style?: ViewStyle;
}

export function ScreenHeader({
  title,
  subtitle,
  titleIcon,
  onBack,
  backLoading,
  rightIcon,
  rightLabel,
  onRightPress,
  rightSlot,
  variant = 'default',
  style,
}: ScreenHeaderProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const onMedia = variant === 'onMedia';
  const iconColor = onMedia ? colors.textOnMedia : colors.textPrimary;

  return (
    <View style={[styles.container, style]}>
      {onBack ? (
        <Pressable
          style={[styles.backBtn, onMedia && styles.backBtnOnMedia]}
          onPress={onBack}
          disabled={backLoading}
          hitSlop={8}>
          {backLoading ? (
            <ActivityIndicator size="small" color={iconColor} />
          ) : (
            <ArrowLeft size={18} color={iconColor} />
          )}
        </Pressable>
      ) : null}

      {titleIcon ? (
        <View style={[styles.titleIconWrap, onMedia && styles.titleIconWrapOnMedia]}>{titleIcon}</View>
      ) : null}

      <View style={styles.titleBlock}>
        {subtitle ? (
          <>
            <Heading3 color={onMedia ? colors.textOnMedia : undefined} numberOfLines={1}>
              {title}
            </Heading3>
            <Text style={[styles.subtitle, onMedia && styles.subtitleOnMedia]} numberOfLines={1}>
              {subtitle}
            </Text>
          </>
        ) : (
          <Heading2 color={onMedia ? colors.textOnMedia : undefined} numberOfLines={1}>
            {title}
          </Heading2>
        )}
      </View>

      {rightSlot ? (
        <View style={styles.rightSlot}>{rightSlot}</View>
      ) : (
        (rightIcon || rightLabel) && (
          <Pressable style={styles.rightSlot} onPress={onRightPress} hitSlop={8}>
            {rightIcon}
            {rightLabel ? <Text style={[styles.rightLabel, onMedia && styles.subtitleOnMedia]}>{rightLabel}</Text> : null}
          </Pressable>
        )
      )}
    </View>
  );
}

const makeStyles = (Colors: ColorTokens) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
      paddingHorizontal: Spacing.lg,
      paddingTop: Spacing.md,
      paddingBottom: Spacing.sm + 2,
    },
    backBtn: {
      width: 34,
      height: 34,
      borderRadius: Radius.md,
      backgroundColor: Colors.surfaceElevated,
      alignItems: 'center',
      justifyContent: 'center',
      ...Shadow.sm,
    },
    backBtnOnMedia: {
      backgroundColor: Colors.mediaGlassSurface,
      borderWidth: 1,
      borderColor: Colors.mediaGlassBorder,
    },
    titleIconWrap: {
      width: 34,
      height: 34,
      borderRadius: Radius.md,
      backgroundColor: Colors.surfaceElevated,
      alignItems: 'center',
      justifyContent: 'center',
      ...Shadow.sm,
    },
    titleIconWrapOnMedia: {
      backgroundColor: Colors.mediaGlassSurface,
      borderWidth: 1,
      borderColor: Colors.mediaGlassBorder,
    },
    titleBlock: { flex: 1 },
    subtitle: {
      fontSize: FontSize.xs + 1,
      color: Colors.textMuted,
      marginTop: 2,
    },
    subtitleOnMedia: { color: Colors.textOnMedia, opacity: 0.85 },
    rightSlot: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
    rightLabel: { fontSize: FontSize.xs + 1, color: Colors.accent, fontWeight: '600' },
  });
