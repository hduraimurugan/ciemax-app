import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Linking, NativeScrollEvent, NativeSyntheticEvent, Pressable, StyleSheet, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { useSharedValue } from 'react-native-reanimated';
import { ChevronLeft, MapPin, Navigation, Search, X } from 'lucide-react-native';
import { ColorTokens, FontSize, FontWeight, Radius, Spacing } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';
import { BottomSheet, Heading3, Body, Caption, Input } from '@shared/ui';
import { useLocationStore } from '@store/locationStore';
import { INDIA_LOCATIONS } from '@constants/indiaLocations';

// Same India states/districts dataset the web app (cinema-hall-users) uses
// for its "Select Your City" picker — bundled locally, so no backend
// endpoint or network round-trip is needed to browse the full list.
const STATES = INDIA_LOCATIONS.map(s => s.name);

interface LocationModalProps {
  visible: boolean;
  onClose: () => void;
}

type Step = 'state' | 'district';

export function LocationModal({ visible, onClose }: LocationModalProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { district: currentDistrict, state: currentState, detect, setManually, clear, loading: detecting } = useLocationStore();
  const [step, setStep] = useState<Step>('state');
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const listRef = useRef<FlatList<string>>(null);
  const scrollOffset = useSharedValue(0);
  const onListScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollOffset.value = e.nativeEvent.contentOffset.y;
  };

  useEffect(() => {
    if (!visible) {
      setStep('state');
      setSelectedState(null);
      setSearch('');
    }
  }, [visible]);

  // Each step renders its own FlatList instance — reset the tracked offset so
  // the drag-to-close gesture doesn't see a stale scroll position from the last one.
  useEffect(() => {
    scrollOffset.value = 0;
  }, [step, scrollOffset]);

  const districts = useMemo(
    () => INDIA_LOCATIONS.find(s => s.name === selectedState)?.districts ?? [],
    [selectedState],
  );

  const pickState = (state: string) => {
    setSelectedState(state);
    setStep('district');
    setSearch('');
  };

  const pickDistrict = async (district: string) => {
    if (!selectedState) return;
    await setManually(district, selectedState);
    onClose();
  };

  const useCurrentLocation = async () => {
    const result = await detect();
    if (result.ok) {
      onClose();
      return;
    }
    switch (result.reason) {
      case 'denied':
        Alert.alert(
          'Location access needed',
          'Allow location access so we can find movies and showtimes near you.',
          [{ text: 'Cancel', style: 'cancel' }, { text: 'Try Again', onPress: useCurrentLocation }],
        );
        break;
      case 'blocked':
        Alert.alert(
          'Location access blocked',
          'You previously denied location access. Enable it for CineHall in Settings to use this.',
          [{ text: 'Cancel', style: 'cancel' }, { text: 'Open Settings', onPress: () => Linking.openSettings() }],
        );
        break;
      case 'services-off':
        Alert.alert(
          'Turn on location services',
          'Your device location (GPS) is off. Turn it on to detect your location automatically.',
          [{ text: 'Cancel', style: 'cancel' }, { text: 'Open Settings', onPress: () => Linking.openSettings() }],
        );
        break;
      default:
        Alert.alert('Couldn\'t detect your location', 'Please try again, or pick your state manually below.');
    }
  };

  const clearLocation = () => {
    clear();
    setStep('state');
    setSelectedState(null);
    setSearch('');
  };

  const filteredStates = STATES.filter(s => s.toLowerCase().includes(search.trim().toLowerCase()));
  const filteredDistricts = districts.filter(d => d.toLowerCase().includes(search.trim().toLowerCase()));

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      snapHeight={480}
      scrollRef={listRef}
      scrollOffset={scrollOffset}>
      <View style={styles.header}>
        {step === 'district' && (
          <Pressable onPress={() => setStep('state')} hitSlop={8} style={styles.backBtn}>
            <ChevronLeft size={20} color={colors.textPrimary} />
          </Pressable>
        )}
        <Heading3 style={styles.headerTitle}>
          {step === 'state' ? 'Choose your state' : `${selectedState}`}
        </Heading3>
        {!!(currentDistrict && currentState) && (
          <Pressable onPress={clearLocation} hitSlop={8}>
            <Body style={styles.clearText}>Clear</Body>
          </Pressable>
        )}
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

      <Input
        containerStyle={styles.searchWrap}
        placeholder={step === 'state' ? 'Search states…' : 'Search districts…'}
        value={search}
        onChangeText={setSearch}
        leftIcon={<Search size={16} color={colors.textMuted} />}
        rightIcon={
          search ? (
            <Pressable onPress={() => setSearch('')} hitSlop={8}>
              <X size={16} color={colors.textMuted} />
            </Pressable>
          ) : undefined
        }
      />

      {step === 'state' ? (
        filteredStates.length === 0 ? (
          <Caption style={styles.empty}>No states match "{search}".</Caption>
        ) : (
          <FlatList
            ref={listRef}
            data={filteredStates}
            keyExtractor={s => s}
            renderItem={({ item }) => (
              <Pressable style={styles.row} onPress={() => pickState(item)}>
                <MapPin size={15} color={colors.textMuted} />
                <Body style={styles.rowText}>{item}</Body>
              </Pressable>
            )}
            onScroll={onListScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          />
        )
      ) : filteredDistricts.length === 0 ? (
        <Caption style={styles.empty}>No districts match "{search}".</Caption>
      ) : (
        <FlatList
          ref={listRef}
          data={filteredDistricts}
          keyExtractor={d => d}
          renderItem={({ item }) => (
            <Pressable style={styles.row} onPress={() => pickDistrict(item)}>
              <MapPin size={15} color={colors.textMuted} />
              <Body style={styles.rowText}>{item}</Body>
            </Pressable>
          )}
          onScroll={onListScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        />
      )}
    </BottomSheet>
  );
}

const makeStyles = (Colors: ColorTokens) =>
  StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
    headerTitle: { flex: 1 },
    clearText: { color: Colors.accent, fontWeight: FontWeight.semibold, fontSize: FontSize.sm },
    searchWrap: { marginBottom: Spacing.md },
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
    empty: { textAlign: 'center', marginTop: Spacing.xl, color: Colors.textMuted },
  });
