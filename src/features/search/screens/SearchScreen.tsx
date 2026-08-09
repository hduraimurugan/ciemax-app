import React, { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search as SearchIcon } from 'lucide-react-native';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { RootStackParamList, TabParamList } from '@ctypes/navigation';
import { ColorTokens, FontSize, FontWeight, Radius, Spacing } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';
import { BodySmall, Caption, Label } from '@shared/ui';
import { Movie } from '@ctypes/models';
import { searchMovies } from '@services/moviesService';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'SearchTab'>,
  NativeStackScreenProps<RootStackParamList>
>;

const RECENT_SEARCHES = ['Odyssey', 'IMAX near me', 'Spider-Man'];
const TRENDING_CHIPS = ['Action', 'Tamil Cinema', 'This Weekend', 'IMAX'];

export function SearchScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Movie[]>([]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    let cancelled = false;
    searchMovies(query).then(movies => {
      if (!cancelled) setResults(movies);
    });
    return () => {
      cancelled = true;
    };
  }, [query]);

  const showEmpty = query.trim() === '';
  const noResults = !showEmpty && results.length === 0;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.searchBar}>
        <SearchIcon size={16} color={colors.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search movies, cinemas..."
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
          autoCorrect={false}
        />
      </View>

      {showEmpty ? (
        <View style={styles.emptyBody}>
          <Label style={styles.sectionLabel}>Recent Searches</Label>
          <View style={styles.recentList}>
            {RECENT_SEARCHES.map(q => (
              <Pressable key={q} style={styles.recentRow} onPress={() => setQuery(q)}>
                <SearchIcon size={14} color={colors.textMuted} />
                <BodySmall style={styles.recentText}>{q}</BodySmall>
              </Pressable>
            ))}
          </View>

          <Label style={styles.sectionLabel}>Trending</Label>
          <View style={styles.chipsRow}>
            {TRENDING_CHIPS.map(c => (
              <Pressable key={c} style={styles.chip} onPress={() => setQuery(c)}>
                <BodySmall style={styles.chipText}>{c}</BodySmall>
              </Pressable>
            ))}
          </View>
        </View>
      ) : noResults ? (
        <View style={styles.noResults}>
          <Caption>No results for "{query}"</Caption>
        </View>
      ) : (
        <FlatList
          data={results}
          numColumns={2}
          keyExtractor={m => m.id}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.gridContent}
          renderItem={({ item }) => (
            <Pressable
              style={styles.gridItem}
              onPress={() => navigation.navigate('MovieDetail', { movieId: item.id })}>
              <Image source={{ uri: item.posterUrl }} style={styles.poster} resizeMode="cover" />
              <BodySmall style={styles.posterTitle} numberOfLines={1}>{item.title}</BodySmall>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const makeStyles = (Colors: ColorTokens) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: Colors.background },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm + 2,
      height: 46,
      backgroundColor: Colors.surface,
      borderWidth: 1,
      borderColor: Colors.border,
      borderRadius: Radius.md,
      paddingHorizontal: Spacing.md,
      marginHorizontal: Spacing.lg,
      marginTop: Spacing.md,
      marginBottom: Spacing.lg,
    },
    searchInput: {
      flex: 1,
      color: Colors.textPrimary,
      fontSize: FontSize.sm,
      padding: 0,
    },
    emptyBody: { paddingHorizontal: Spacing.lg },
    sectionLabel: { marginBottom: Spacing.sm },
    recentList: { gap: 2, marginBottom: Spacing.lg },
    recentRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm + 2,
      paddingVertical: Spacing.sm + 2,
    },
    recentText: { color: Colors.textPrimary },
    chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    chip: {
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderRadius: Radius.full,
      backgroundColor: Colors.surface,
      borderWidth: 1,
      borderColor: Colors.border,
    },
    chipText: { color: Colors.textPrimary },
    noResults: { alignItems: 'center', paddingTop: Spacing.xxl },
    gridContent: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
    gridRow: { gap: Spacing.md, marginBottom: Spacing.md },
    gridItem: { flex: 1 },
    poster: {
      width: '100%',
      aspectRatio: 2 / 3,
      borderRadius: Radius.md,
      backgroundColor: Colors.surfaceElevated,
      borderWidth: 1,
      borderColor: Colors.border,
    },
    posterTitle: { color: Colors.textPrimary, fontWeight: FontWeight.semibold, marginTop: Spacing.xs },
  });
