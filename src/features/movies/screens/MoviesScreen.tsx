import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, ChevronDown, Bell, MapPin, Clapperboard } from 'lucide-react-native';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { RootStackParamList, TabParamList } from '@ctypes/navigation';
import { Movie } from '@ctypes/models';
import { ColorTokens, FontFamily, FontSize, FontWeight, Radius, Spacing } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';
import { AdBanner, Loader } from '@shared/ui';
import { Body, Heading2 } from '@shared/ui';
import { formatRating } from '@shared/utils';
import { useMovies } from '@hooks/useMovies';
import { useLocationStore } from '@store/locationStore';
import { getActiveAds, recordAdClick } from '@services/adsService';
import { LocationModal } from '@features/location';
import { MovieCard } from '../components/MovieCard';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

const HERO_ROTATE_MS = 4000;

export function MoviesScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { nowShowing, comingSoon, loading, error } = useMovies();
  const [heroIdx, setHeroIdx] = useState(0);
  const progress = useRef(new Animated.Value(0)).current;

  const district = useLocationStore(s => s.district);
  const detect = useLocationStore(s => s.detect);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [ads, setAds] = useState<{ id: string; image_url: string; click_url?: string | null }[]>([]);

  useEffect(() => {
    // Best-effort auto-detect on first Home mount if no location is cached yet.
    if (!district) detect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    getActiveAds('banner').then(setAds);
  }, []);

  const heroMovies = nowShowing.slice(0, 3);
  const recommended = [...nowShowing, ...comingSoon].reverse().slice(0, 4);

  useEffect(() => {
    if (heroMovies.length <= 1) return;
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: HERO_ROTATE_MS,
      useNativeDriver: false,
    }).start();
    const t = setTimeout(() => setHeroIdx(i => (i + 1) % heroMovies.length), HERO_ROTATE_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heroIdx, heroMovies.length]);

  function handleMoviePress(movie: Movie) {
    navigation.navigate('MovieDetail', { movieId: movie.id });
  }

  function handleAdPress(index: number) {
    const ad = ads[index];
    if (ad) recordAdClick(ad.id);
  }

  if (loading && nowShowing.length === 0) {
    return <Loader fullScreen message="Loading movies..." />;
  }

  if (error && nowShowing.length === 0) {
    return (
      <SafeAreaView style={styles.screen}>
        <Body style={styles.errorText}>{error}</Body>
      </SafeAreaView>
    );
  }

  const heroMovie = heroMovies[heroIdx];

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable style={styles.locationRow} onPress={() => setLocationModalVisible(true)} hitSlop={6}>
          <MapPin size={14} color={colors.textPrimary} />
          <Text style={styles.location} numberOfLines={1}>{district ?? 'Set location'}</Text>
          <ChevronDown size={10} color={colors.textMuted} />
        </Pressable>
        <View style={styles.headerActions}>
          <Pressable onPress={() => navigation.navigate('Theatres')} hitSlop={8}>
            <Clapperboard size={20} color={colors.textPrimary} />
          </Pressable>
          <Pressable onPress={() => navigation.navigate('SearchTab')} hitSlop={8}>
            <Search size={20} color={colors.textPrimary} />
          </Pressable>
          <Bell size={20} color={colors.textPrimary} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {heroMovie && (
          <Pressable style={styles.hero} onPress={() => handleMoviePress(heroMovie)}>
            <Image source={{ uri: heroMovie.backdropUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
            <View style={[StyleSheet.absoluteFill, styles.heroOverlay]} />
            <View style={styles.heroDots}>
              {heroMovies.map((_, i) => (
                <View key={i} style={styles.heroDotTrack}>
                  {i < heroIdx && <View style={[styles.heroDotFill, { width: '100%' }]} />}
                  {i === heroIdx && (
                    <Animated.View
                      style={[
                        styles.heroDotFill,
                        {
                          width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
                        },
                      ]}
                    />
                  )}
                </View>
              ))}
            </View>
            <View style={styles.heroTextBlock}>
              <Text style={styles.heroTag}>★ {formatRating(heroMovie.rating)} · {heroMovie.isNowShowing ? 'Now Showing' : 'Coming Soon'}</Text>
              <Text style={styles.heroTitle}>{heroMovie.title}</Text>
            </View>
          </Pressable>
        )}

        {ads.length > 0 && (
          <View style={styles.adBannerWrap}>
            {/* AdBanner sizes itself to the full device width internally. */}
            <AdBanner imageUrls={ads.map(a => a.image_url)} onPressIndex={handleAdPress} />
          </View>
        )}

        <MovieRow title="Now Showing" movies={nowShowing} onPress={handleMoviePress} colors={colors} />
        <MovieRow title="Coming Soon" movies={comingSoon} onPress={handleMoviePress} colors={colors} variant="soon" />
        <MovieRow title="Recommended For You" movies={recommended} onPress={handleMoviePress} colors={colors} variant="plain" />

        {nowShowing.length === 0 && comingSoon.length === 0 && !loading && (
          <Body style={styles.errorText}>
            {district ? `No movies found near ${district}.` : 'Set your location to see movies playing near you.'}
          </Body>
        )}

        <View style={styles.bottomPad} />
      </ScrollView>

      <LocationModal visible={locationModalVisible} onClose={() => setLocationModalVisible(false)} />
    </SafeAreaView>
  );
}

function MovieRow({
  title,
  movies,
  onPress,
  colors,
  variant = 'rating',
}: {
  title: string;
  movies: Movie[];
  onPress: (m: Movie) => void;
  colors: ColorTokens;
  variant?: 'rating' | 'soon' | 'plain';
}) {
  const styles = useMemo(() => makeStyles(colors), [colors]);
  if (movies.length === 0) return null;
  return (
    <View style={styles.section}>
      <Heading2 style={styles.sectionTitle}>{title}</Heading2>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
        {movies.map(movie => (
          <MovieCard key={movie.id} movie={movie} onPress={onPress} variant={variant} />
        ))}
      </ScrollView>
    </View>
  );
}

const makeStyles = (Colors: ColorTokens) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: Colors.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.lg,
      paddingTop: Spacing.sm,
      paddingBottom: Spacing.sm,
    },
    locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, flexShrink: 1 },
    location: {
      fontSize: FontSize.md - 1,
      fontWeight: FontWeight.semibold,
      color: Colors.textPrimary,
      maxWidth: 160,
    },
    headerActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
    hero: {
      marginHorizontal: Spacing.lg,
      marginBottom: Spacing.lg,
      height: 190,
      borderRadius: Radius.xl,
      overflow: 'hidden',
    },
    heroOverlay: { backgroundColor: 'rgba(0,0,0,0.35)' },
    heroDots: {
      position: 'absolute',
      top: Spacing.sm + 4,
      left: Spacing.md,
      right: Spacing.md,
      flexDirection: 'row',
      gap: 5,
    },
    heroDotTrack: {
      flex: 1,
      height: 3,
      borderRadius: 2,
      backgroundColor: 'rgba(255,255,255,0.3)',
      overflow: 'hidden',
    },
    heroDotFill: { height: '100%', backgroundColor: '#fff' },
    heroTextBlock: { position: 'absolute', left: Spacing.md, right: Spacing.md, bottom: Spacing.md },
    heroTag: {
      fontFamily: FontFamily.medium,
      fontSize: FontSize.xs - 1,
      color: Colors.gold,
      fontWeight: FontWeight.semibold,
      marginBottom: 4,
    },
    heroTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#fff' },
    adBannerWrap: { marginBottom: Spacing.lg },
    section: { marginBottom: Spacing.lg },
    sectionTitle: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.sm, fontSize: FontSize.md + 1 },
    horizontalList: { paddingHorizontal: Spacing.lg, gap: Spacing.sm },
    errorText: { textAlign: 'center', margin: Spacing.xl },
    bottomPad: { height: Spacing.xl },
  });
