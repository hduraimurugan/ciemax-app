import React from 'react';
import {
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@ctypes/navigation';
import { Movie } from '@ctypes/models';
import { Colors, FontFamily, FontSize, FontWeight, Radius, Spacing } from '@constants/theme';
import { AdBanner, Loader } from '@shared/ui';
import { Body, BodySmall, Caption } from '@shared/ui';
import { useMovies } from '@hooks/useMovies';
import { MovieCard } from '../components/MovieCard';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const NAV_TABS = ['Movies', 'Theatres', 'Offers', 'Bookings'];

export function MoviesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { nowShowing, comingSoon, loading, error, refresh } = useMovies();

  function handleMoviePress(movie: Movie) {
    navigation.navigate('MovieDetail', { movieId: movie.id });
  }

  function handleAvatarPress() {
    navigation.navigate('Profile');
  }

  const bannerUrls = nowShowing.slice(0, 3).map(m => m.backdropUrl).filter(Boolean);

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

  return (
    <SafeAreaView style={styles.screen}>
      {/* Sticky header */}
      <View style={styles.header}>
        <Text style={styles.logo}>CINEBOOK</Text>
        <View style={styles.headerRight}>
          <Text style={styles.searchIcon}>⌕</Text>
          <Caption style={styles.location}>Mumbai ▾</Caption>
          <Pressable style={styles.avatar} onPress={handleAvatarPress}>
            <Text style={styles.avatarIcon}>👤</Text>
          </Pressable>
        </View>
      </View>

      {/* Secondary nav */}
      <View style={styles.navBar}>
        {NAV_TABS.map(tab => (
          <View key={tab} style={[styles.navTab, tab === 'Movies' && styles.navTabActive]}>
            <Text style={[styles.navTabText, tab === 'Movies' && styles.navTabTextActive]}>
              {tab}
            </Text>
          </View>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            tintColor={Colors.accent}
          />
        }>
        {/* Ad Banner */}
        {bannerUrls.length > 0 && (
          <View style={styles.bannerWrapper}>
            <AdBanner imageUrls={bannerUrls} />
          </View>
        )}

        {/* Now Showing section */}
        {nowShowing.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Now Showing</Text>
              <BodySmall style={styles.seeAll}>See all</BodySmall>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}>
              {nowShowing.map(movie => (
                <MovieCard key={movie.id} movie={movie} onPress={handleMoviePress} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Coming Soon section */}
        {comingSoon.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Coming Soon</Text>
              <BodySmall style={styles.seeAll}>See all</BodySmall>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}>
              {comingSoon.map(movie => (
                <MovieCard key={movie.id} movie={movie} onPress={handleMoviePress} />
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  // Sticky header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.navbarBorder,
  },
  logo: {
    color: Colors.accent,
    fontSize: FontSize.md + 3,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
    letterSpacing: 1.5,
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm + 2,
  },
  searchIcon: {
    color: Colors.textSecondary,
    fontSize: FontSize.lg,
  },
  location: {
    color: Colors.textMuted,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarIcon: {
    fontSize: FontSize.sm,
  },
  // Secondary nav
  navBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  navTab: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: 2,
    borderBottomColor: Colors.transparent,
  },
  navTabActive: {
    borderBottomColor: Colors.accent,
  },
  navTabText: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.medium,
    fontWeight: FontWeight.medium,
    color: Colors.textMuted,
  },
  navTabTextActive: {
    color: Colors.textPrimary,
  },
  // Banner
  bannerWrapper: {
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.md,
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  // Sections
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
  },
  seeAll: {
    color: Colors.accent,
  },
  horizontalList: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  errorText: {
    textAlign: 'center',
    margin: Spacing.xl,
  },
  bottomPad: {
    height: Spacing.xl,
  },
});
