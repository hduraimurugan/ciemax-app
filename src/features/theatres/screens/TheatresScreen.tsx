import React, { useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@ctypes/navigation';
import { Theatre } from '@ctypes/models';
import { Colors, FontFamily, FontSize, FontWeight, Radius, Spacing } from '@constants/theme';
import { Loader } from '@shared/ui';
import { Heading2, Body, Caption, Label } from '@shared/ui';
import { useTheatresForMovie } from '@hooks/useTheatres';
import { useBookingStore } from '@store/bookingStore';
import { TheatreCard } from '../components/TheatreCard';

type Props = NativeStackScreenProps<RootStackParamList, 'Theatres'>;

const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

function getNext7Days() {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push({
      key: d.toISOString().split('T')[0],
      day: DAY_NAMES[d.getDay()],
      date: d.getDate(),
    });
  }
  return days;
}

export function TheatresScreen({ navigation, route }: Props) {
  const { movieId } = route.params;
  const { theatres, loading, error } = useTheatresForMovie(movieId);
  const selectedMovie = useBookingStore(s => s.selectedMovie);
  const setSelectedTheatre = useBookingStore(s => s.setSelectedTheatre);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const dateDays = getNext7Days();

  function handleTheatrePress(theatre: Theatre) {
    setSelectedTheatre(theatre);
    navigation.navigate('ShowSelection', { movieId, theatreId: theatre.id });
  }

  if (loading) return <Loader fullScreen message="Finding theatres..." />;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={18} color={Colors.textPrimary} />
        </Pressable>
        <View style={styles.headerInfo}>
          <Heading2>Select Theatre</Heading2>
          {selectedMovie ? (
            <Body numberOfLines={1} style={styles.movieTitle}>{selectedMovie.title}</Body>
          ) : null}
        </View>
      </View>

      {/* Date selector */}
      <View style={styles.dateSection}>
        <Label style={styles.dateSectionLabel}>Select Date</Label>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dateList}>
          {dateDays.map(d => (
            <Pressable
              key={d.key}
              style={[styles.dateBtn, selectedDate === d.key && styles.dateBtnActive]}
              onPress={() => setSelectedDate(d.key)}>
              <Caption style={[styles.dateBtnDay, selectedDate === d.key && styles.dateBtnTextActive]}>
                {d.day}
              </Caption>
              <Text style={[styles.dateBtnDate, selectedDate === d.key && styles.dateBtnTextActive]}>
                {d.date}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: { flex: 1, gap: 2 },
  movieTitle: { color: Colors.textMuted, fontSize: FontSize.sm },
  // Date selector
  dateSection: {
    paddingTop: Spacing.md,
    gap: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: Spacing.md,
  },
  dateSectionLabel: {
    paddingHorizontal: Spacing.md,
  },
  dateList: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  dateBtn: {
    width: 56,
    height: 64,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 2,
  },
  dateBtnActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  dateBtnDay: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontFamily: FontFamily.medium,
    fontWeight: FontWeight.medium,
  },
  dateBtnDate: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
  },
  dateBtnTextActive: {
    color: Colors.textPrimary,
  },
  list: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  error: { textAlign: 'center', margin: Spacing.xl },
});
