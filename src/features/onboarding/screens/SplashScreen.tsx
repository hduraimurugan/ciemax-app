import React, { useEffect, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Play } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@ctypes/navigation';
import { ColorTokens, FontFamily, FontSize, FontWeight, Radius, Spacing, makeNeonShadow } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export function SplashScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  useEffect(() => {
    const t = setTimeout(() => navigation.replace('Onboarding'), 2200);
    return () => clearTimeout(t);
  }, [navigation]);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <View style={styles.iconBox}>
          <Play size={40} color="#fff" fill="#fff" />
        </View>
        <Text style={styles.wordmark}>CineHall</Text>
        <Text style={styles.tagline}>BOOK. WATCH. REPEAT.</Text>
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (Colors: ColorTokens) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: Colors.background },
    content: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.md,
    },
    iconBox: {
      width: 88,
      height: 88,
      borderRadius: Radius.xxl,
      backgroundColor: Colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
      ...makeNeonShadow(Colors),
    },
    wordmark: {
      fontFamily: FontFamily.bold,
      fontWeight: FontWeight.bold,
      fontSize: FontSize.xxl - 2,
      color: Colors.textPrimary,
      letterSpacing: -0.5,
    },
    tagline: {
      fontSize: FontSize.xs,
      color: Colors.textMuted,
      letterSpacing: 2,
    },
  });
