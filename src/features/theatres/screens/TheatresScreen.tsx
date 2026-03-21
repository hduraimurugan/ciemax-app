import React from 'react';
import {
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@ctypes/navigation';
import { Theatre } from '@ctypes/models';
import { Colors, Spacing } from '@constants/theme';
import { Loader } from '@shared/ui';
import { Heading2, Body } from '@shared/ui';
import { useTheatresForMovie } from '@hooks/useTheatres';
import { useBookingStore } from '@store/bookingStore';
import { TheatreCard } from '../components/TheatreCard';

type Props = NativeStackScreenProps<RootStackParamList, 'Theatres'>;

export function TheatresScreen({ navigation, route }: Props) {
  const { movieId } = route.params;
  const { theatres, loading, error } = useTheatresForMovie(movieId);
  const selectedMovie = useBookingStore(s => s.selectedMovie);
  const setSelectedTheatre = useBookingStore(s => s.setSelectedTheatre);

  function handleTheatrePress(theatre: Theatre) {
    setSelectedTheatre(theatre);
    navigation.navigate('ShowSelection', { movieId, theatreId: theatre.id });
  }

  if (loading) return <Loader fullScreen message="Finding theatres..." />;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Body style={styles.back}>← Back</Body>
        </Pressable>
        <Heading2>Select Theatre</Heading2>
        {selectedMovie ? (
          <Body numberOfLines={1}>{selectedMovie.title}</Body>
        ) : null}
      </View>

      {error ? (
        <Body style={styles.error}>{error}</Body>
      ) : (
        <FlatList
          data={theatres}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TheatreCard theatre={item} onPress={handleTheatrePress} />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  header: {
    padding: Spacing.md,
    gap: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  back: { color: Colors.accent, marginBottom: Spacing.xs },
  list: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  error: { textAlign: 'center', margin: Spacing.xl },
});
