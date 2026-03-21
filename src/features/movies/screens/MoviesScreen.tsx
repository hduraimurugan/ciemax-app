import React, { useState } from 'react';
import {
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@ctypes/navigation';
import { Movie } from '@ctypes/models';
import { Colors, Spacing } from '@constants/theme';
import { Loader } from '@shared/ui';
import { Heading1, Body } from '@shared/ui';
import { useMovies } from '@hooks/useMovies';
import { MovieCard } from '../components/MovieCard';
import { MovieFilter } from '../components/MovieFilter';
import { MovieTab } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function MoviesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [activeTab, setActiveTab] = useState<MovieTab>('now_showing');
  const { nowShowing, comingSoon, loading, error, refresh } = useMovies();

  const movies = activeTab === 'now_showing' ? nowShowing : comingSoon;

  function handleMoviePress(movie: Movie) {
    navigation.navigate('MovieDetail', { movieId: movie.id });
  }

  if (loading && movies.length === 0) {
    return <Loader fullScreen message="Loading movies..." />;
  }

  if (error && movies.length === 0) {
    return (
      <SafeAreaView style={styles.screen}>
        <Body style={styles.errorText}>{error}</Body>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Heading1>🎬 CineBook</Heading1>
        <Body>What are you watching today?</Body>
      </View>

      <MovieFilter activeTab={activeTab} onTabChange={setActiveTab} />

      <FlatList
        data={movies}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <MovieCard movie={item} onPress={handleMoviePress} />
        )}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            tintColor={Colors.accent}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: 4,
  },
  row: {
    gap: Spacing.sm,
  },
  list: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  errorText: {
    textAlign: 'center',
    margin: Spacing.xl,
  },
});
