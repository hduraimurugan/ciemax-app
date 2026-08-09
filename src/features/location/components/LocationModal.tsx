import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { ChevronLeft, MapPin, Navigation } from 'lucide-react-native';
import { ColorTokens, FontSize, FontWeight, Radius, Spacing } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';
import { BottomSheet, Heading3, Body, Caption } from '@shared/ui';
import { useLocationStore } from '@store/locationStore';
import { getDistrictsInState } from '@services/moviesService';

// No state/city-list endpoint exists in cinema-hall-api — this curated list
// keeps the picker usable without depending on a third-party geo API for a
// step GPS detection already covers for most users.
const STATES = [
  'Karnataka', 'Tamil Nadu', 'Maharashtra', 'Delhi', 'Telangana',
  'Kerala', 'West Bengal', 'Gujarat', 'Uttar Pradesh', 'Rajasthan',
];

interface LocationModalProps {
  visible: boolean;
  onClose: () => void;
}

type Step = 'state' | 'district';

export function LocationModal({ visible, onClose }: LocationModalProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { detect, setManually, loading: detecting } = useLocationStore();
  const [step, setStep] = useState<Step>('state');
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [districts, setDistricts] = useState<string[]>([]);
  const [districtsLoading, setDistrictsLoading] = useState(false);

  useEffect(() => {
    if (!visible) {
      setStep('state');
      setSelectedState(null);
      setDistricts([]);
    }
  }, [visible]);

  const pickState = async (state: string) => {
    setSelectedState(state);
    setStep('district');
    setDistrictsLoading(true);
    try {
      const list = await getDistrictsInState(state);
      setDistricts(list);
    } catch {
      setDistricts([]);
    } finally {
      setDistrictsLoading(false);
    }
  };

  const pickDistrict = async (district: string) => {
    if (!selectedState) return;
    await setManually(district, selectedState);
    onClose();
  };

  const useCurrentLocation = async () => {
    const ok = await detect();
    if (ok) onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} snapHeight={480}>
      <View style={styles.header}>
        {step === 'district' && (
          <Pressable onPress={() => setStep('state')} hitSlop={8} style={styles.backBtn}>
            <ChevronLeft size={20} color={colors.textPrimary} />
          </Pressable>
        )}
        <Heading3>{step === 'state' ? 'Choose your state' : `${selectedState}`}</Heading3>
      </View>

      {step === 'state' && (
        <Pressable style={styles.detectRow} onPress={useCurrentLocation} disabled={detecting}>
          {detecting ? (
            <ActivityIndicator size="small" color={colors.accent} />
          ) : (
            <Navigation size={16} color={colors.accent} />
          )}
          <Body style={styles.detectText}>
            {detecting ? 'Detecting your location…' : 'Use my current location'}
          </Body>
        </Pressable>
      )}

      {step === 'state' ? (
        <FlatList
          data={STATES}
          keyExtractor={s => s}
          renderItem={({ item }) => (
            <Pressable style={styles.row} onPress={() => pickState(item)}>
              <MapPin size={15} color={colors.textMuted} />
              <Body style={styles.rowText}>{item}</Body>
            </Pressable>
          )}
          showsVerticalScrollIndicator={false}
        />
      ) : districtsLoading ? (
        <ActivityIndicator style={styles.loader} color={colors.accent} />
      ) : districts.length === 0 ? (
        <Caption style={styles.empty}>
          No movies currently showing in {selectedState}. Try another state.
        </Caption>
      ) : (
        <FlatList
          data={districts}
          keyExtractor={d => d}
          renderItem={({ item }) => (
            <Pressable style={styles.row} onPress={() => pickDistrict(item)}>
              <MapPin size={15} color={colors.textMuted} />
              <Body style={styles.rowText}>{item}</Body>
            </Pressable>
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
    </BottomSheet>
  );
}

const makeStyles = (Colors: ColorTokens) =>
  StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
    backBtn: {
      width: 28,
      height: 28,
      borderRadius: Radius.sm,
      backgroundColor: Colors.surfaceElevated,
      alignItems: 'center',
      justifyContent: 'center',
    },
    detectRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      backgroundColor: Colors.accentLight,
      borderRadius: Radius.md,
      padding: Spacing.md,
      marginBottom: Spacing.md,
    },
    detectText: { color: Colors.accent, fontWeight: FontWeight.semibold },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm + 2,
      paddingVertical: Spacing.sm + 4,
      borderBottomWidth: 1,
      borderBottomColor: Colors.divider,
    },
    rowText: { color: Colors.textPrimary, fontSize: FontSize.sm },
    loader: { marginTop: Spacing.xl },
    empty: { textAlign: 'center', marginTop: Spacing.xl, color: Colors.textMuted },
  });
