import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ColorTokens, Radius } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';

interface AdBannerProps {
  imageUrls: string[];
  /** Width of the banner viewport. Defaults to the device width. */
  width?: number;
  /** Called with the tapped banner's index — e.g. to record a click or open its link. */
  onPressIndex?: (index: number) => void;
}

const SCREEN_WIDTH = Dimensions.get('window').width;

export function AdBanner({ imageUrls, width = SCREEN_WIDTH, onPressIndex }: AdBannerProps) {
  const { colors } = useTheme();
  const bannerHeight = Math.round(width / 3.5);
  const styles = useMemo(() => makeStyles(colors, width, bannerHeight), [colors, width, bannerHeight]);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const banners = imageUrls.slice(0, 5);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex(prev => {
        const next = (prev + 1) % banners.length;
        scrollRef.current?.scrollTo({ x: next * width, animated: true });
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [banners.length, width]);

  if (banners.length === 0) return null;

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
          onMomentumScrollEnd={e => {
            const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setActiveIndex(index);
        }}>
        {banners.map((url, i) =>
          onPressIndex ? (
            <Pressable key={i} onPress={() => onPressIndex(i)}>
              <Image source={{ uri: url }} style={styles.banner} resizeMode="cover" />
            </Pressable>
          ) : (
            <Image key={i} source={{ uri: url }} style={styles.banner} resizeMode="cover" />
          ),
        )}
      </ScrollView>
      <View style={styles.adLabel}>
        <Text style={styles.adLabelText}>AD</Text>
      </View>
      <View style={styles.dots}>
        {banners.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === activeIndex && styles.dotActive]}
          />
        ))}
      </View>
    </View>
  );
}

const makeStyles = (Colors: ColorTokens, width: number, height: number) =>
  StyleSheet.create({
    container: {
      width,
      height,
      borderRadius: Radius.lg,
      overflow: 'hidden',
      position: 'relative',
    },
    banner: {
      width,
      height,
    },
    dots: {
      position: 'absolute',
      bottom: 6,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 4,
    },
    adLabel: {
      position: 'absolute',
      top: 8,
      right: 8,
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: 4,
      backgroundColor: 'rgba(0,0,0,0.55)',
    },
    adLabelText: {
      color: Colors.textPrimary,
      fontSize: 9,
      fontWeight: '700',
      letterSpacing: 0.8,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: 'rgba(255,255,255,0.45)',
    },
    dotActive: {
      width: 16,
      backgroundColor: Colors.textPrimary,
    },
  });
