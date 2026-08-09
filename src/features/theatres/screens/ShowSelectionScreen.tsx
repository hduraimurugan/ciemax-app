import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@ctypes/navigation';
import { Show } from '@ctypes/models';
import { ColorTokens, Spacing } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';
import { Button, Loader } from '@shared/ui';
import { Heading2, Heading3, Body, Label } from '@shared/ui';
import { useShowsForMovieTheatre } from '@hooks/useTheatres';
import { useBookingStore } from '@store/bookingStore';
import { formatShowDate } from '@shared/utils';
import { ShowTimeChip } from '../components/ShowTimeChip';

// NOTE: superseded by ShowtimesScreen.tsx (merges theatre + showtime selection into
// one screen per the CineHall design) and no longer routed in RootNavigator. Kept
// on disk, unrouted, rather than deleted.
type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
  route: { params: { movieId: string; theatreId: string } };
};

export function ShowSelectionScreen({ navigation, route }: Props) {
  const { movieId, theatreId } = route.params;
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { shows, loading } = useShowsForMovieTheatre(movieId, theatreId);
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);
  const storeSetSelectedShow = useBookingStore(s => s.setSelectedShow);
  const selectedTheatre = useBookingStore(s => s.selectedTheatre);

  // Group by date
  const showsByDate = shows.reduce<Record<string, Show[]>>((acc, show) => {
    if (!acc[show.date]) acc[show.date] = [];
    acc[show.date].push(show);
    return acc;
  }, {});

  function handleContinue() {
    if (!selectedShow) return;
    storeSetSelectedShow(selectedShow);
    navigation.navigate('SeatSelection', { showId: selectedShow.id });
  }

  if (loading) return <Loader fullScreen message="Loading showtimes..." />;

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()}>
            <Body style={styles.back}>← Back</Body>
          </Pressable>
          <Heading2>Select Show</Heading2>
          {selectedTheatre ? (
            <Body numberOfLines={1}>{selectedTheatre.name}</Body>
          ) : null}
        </View>

        {Object.entries(showsByDate).map(([date, dayShows]) => (
          <View key={date} style={styles.dateSection}>
            <Heading3>{formatShowDate(date)}</Heading3>
            <View style={styles.chipsRow}>
              {dayShows.map(show => (
                <ShowTimeChip
                  key={show.id}
                  show={show}
                  selected={selectedShow?.id === show.id}
                  onPress={setSelectedShow}
                />
              ))}
            </View>
          </View>
        ))}

        {shows.length === 0 ? (
          <Body style={styles.empty}>No shows available for this theatre.</Body>
        ) : null}
      </ScrollView>

      {selectedShow ? (
        <View style={styles.cta}>
          <Label style={styles.ctaLabel}>
            {selectedShow.time} · {selectedShow.format} · {selectedShow.language}
          </Label>
          <Button
            label="Select Seats"
            onPress={handleContinue}
            fullWidth
            size="lg"
          />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const makeStyles = (Colors: ColorTokens) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: Colors.background },
    content: { padding: Spacing.md, paddingBottom: 120, gap: Spacing.lg },
    header: { gap: Spacing.xs },
    back: { color: Colors.accent, marginBottom: Spacing.xs },
    dateSection: { gap: Spacing.md },
    chipsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.sm,
    },
    empty: { textAlign: 'center', marginTop: Spacing.xl },
    cta: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: Spacing.md,
      backgroundColor: Colors.surface,
      borderTopWidth: 1,
      borderTopColor: Colors.border,
      gap: Spacing.sm,
    },
    ctaLabel: { textAlign: 'center' },
  });
