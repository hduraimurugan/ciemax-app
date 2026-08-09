import React, { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theatre } from '@ctypes/models';
import { ColorTokens, Spacing } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';
import { Heading2, Loader } from '@shared/ui';
import { getAllTheatres } from '@services/theatresService';
import { TheatreCard } from '../components/TheatreCard';

// NOTE: the old "Theatres" tab has no equivalent in the CineHall design (tab bar is
// Home/Search/Bookings/Profile) and is no longer routed in TabNavigator. Kept on
// disk, unrouted, rather than deleted.
export function AllTheatresScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [theatres, setTheatres] = useState<Theatre[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllTheatres().then(data => {
      setTheatres(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <Loader fullScreen />;

  return (
    <SafeAreaView style={styles.screen}>
      <Heading2 style={styles.title}>Theatres Near You</Heading2>
      <FlatList
        data={theatres}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TheatreCard theatre={item} onPress={() => {}} />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const makeStyles = (Colors: ColorTokens) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: Colors.background },
    title: { padding: Spacing.md },
    list: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xxl },
  });
