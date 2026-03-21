import React from 'react';
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@ctypes/navigation';
import { Colors, Spacing } from '@constants/theme';
import { Badge, Button, Card } from '@shared/ui';
import {
  Heading2,
  Heading3,
  Body,
  BodySmall,
  Label,
} from '@shared/ui';
import { useBookingStore } from '@store/bookingStore';
import { formatPrice, formatSeatList, formatShowDate } from '@shared/utils';
import { PriceBreakdown } from '../components/PriceBreakdown';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderSummary'>;

export function OrderSummaryScreen({ navigation }: Props) {
  const selectedMovie = useBookingStore(s => s.selectedMovie);
  const selectedTheatre = useBookingStore(s => s.selectedTheatre);
  const selectedShow = useBookingStore(s => s.selectedShow);
  const selectedSeats = useBookingStore(s => s.selectedSeats);
  const getTotalAmount = useBookingStore(s => s.getTotalAmount);
  const getConvenienceFee = useBookingStore(s => s.getConvenienceFee);

  const subtotal = getTotalAmount();
  const fee = getConvenienceFee();

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()}>
            <Body style={styles.back}>← Back</Body>
          </Pressable>
          <Heading2>Order Summary</Heading2>
        </View>

        {/* Movie Info Card */}
        {selectedMovie && (
          <Card padding="md" style={styles.card}>
            <View style={styles.movieRow}>
              <Image source={{ uri: selectedMovie.posterUrl }} style={styles.poster} />
              <View style={styles.movieInfo}>
                <Heading3>{selectedMovie.title}</Heading3>
                <BodySmall>{selectedMovie.language}</BodySmall>
                {selectedShow && (
                  <>
                    <Badge label={selectedShow.format} variant="accent" style={styles.badge} />
                  </>
                )}
              </View>
            </View>
          </Card>
        )}

        {/* Show Details */}
        {selectedShow && selectedTheatre && (
          <Card padding="md" style={styles.card}>
            <Label>Show Details</Label>
            <View style={styles.detailRows}>
              <DetailRow label="Theatre" value={selectedTheatre.name} />
              <DetailRow label="Date" value={formatShowDate(selectedShow.date)} />
              <DetailRow label="Time" value={selectedShow.time} />
              <DetailRow label="Language" value={selectedShow.language} />
            </View>
          </Card>
        )}

        {/* Seats */}
        <Card padding="md" style={styles.card}>
          <Label>Seats ({selectedSeats.length})</Label>
          <Body style={styles.seats}>{formatSeatList(selectedSeats)}</Body>
        </Card>

        {/* Price */}
        <Card padding="md" style={styles.card}>
          <PriceBreakdown subtotal={subtotal} convenienceFee={fee} />
        </Card>
      </ScrollView>

      {/* CTA */}
      <View style={styles.cta}>
        <Button
          label={`Proceed to Pay  ${formatPrice(subtotal + fee)}`}
          onPress={() => navigation.navigate('Payment')}
          fullWidth
          size="lg"
        />
      </View>
    </SafeAreaView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={detailStyles.row}>
      <BodySmall>{label}</BodySmall>
      <BodySmall style={detailStyles.value}>{value}</BodySmall>
    </View>
  );
}

const detailStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  value: { color: Colors.textPrimary, fontWeight: '500' },
});

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingBottom: 100, gap: Spacing.md },
  header: { gap: Spacing.xs },
  back: { color: Colors.accent, marginBottom: Spacing.xs },
  card: {},
  movieRow: { flexDirection: 'row', gap: Spacing.md },
  poster: { width: 70, height: 100, borderRadius: 8 },
  movieInfo: { flex: 1, gap: Spacing.xs },
  badge: { marginTop: 4 },
  detailRows: { marginTop: Spacing.sm, gap: 0 },
  seats: { color: Colors.accent, marginTop: Spacing.xs },
  cta: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.md,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
