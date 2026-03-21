import React, { useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theatre } from '@ctypes/models';
import { Colors, Spacing } from '@constants/theme';
import { Heading2, Loader } from '@shared/ui';
import { getAllTheatres } from '@services/theatresService';
import { TheatreCard } from '../components/TheatreCard';

export function AllTheatresScreen() {
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

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  title: { padding: Spacing.md },
  list: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xxl },
});
