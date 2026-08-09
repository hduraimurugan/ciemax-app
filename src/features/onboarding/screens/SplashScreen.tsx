import React, { useEffect, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Play } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@ctypes/navigation';
import { ColorTokens, FontFamily, FontSize, FontWeight, Radius, Spacing, makeNeonShadow } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';
import { StorageKeys } from '@constants/config';
import { useAuthStore } from '@store/authStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const MIN_DWELL_MS = 1400;

export function SplashScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const authStatus = useAuthStore(s => s.status);

  useEffect(() => {
    // Browsing is public, so Splash doesn't gate on being logged in — it
    // only waits for a persisted token (if any) to finish being verified,
    // so an already-signed-in user doesn't flash a guest state on cold start.
    if (authStatus === 'loading') return;

    let cancelled = false;
    async function proceed() {
      const [seen] = await Promise.all([
        AsyncStorage.getItem(StorageKeys.onboardingSeen),
        new Promise<void>(resolve => setTimeout(resolve, MIN_DWELL_MS)),
      ]);
      if (cancelled) return;
      navigation.replace(seen ? 'MainTabs' : 'Onboarding');
    }
    proceed();
    return () => {
      cancelled = true;
    };
  }, [authStatus, navigation]);

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
