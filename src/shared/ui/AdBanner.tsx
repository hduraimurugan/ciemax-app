import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { ColorTokens, Radius } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';

interface AdBannerProps {
  imageUrls: string[];
  /** Called with the tapped banner's index — e.g. to record a click or open its link. */
  onPressIndex?: (index: number) => void;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const BANNER_HEIGHT = Math.round(SCREEN_WIDTH / 5);

export function AdBanner({ imageUrls, onPressIndex }: AdBannerProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const banners = imageUrls.slice(0, 5);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex(prev => {
        const next = (prev + 1) % banners.length;
        scrollRef.current?.scrollTo({ x: next * SCREEN_WIDTH, animated: true });
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [banners.length]);

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
          const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
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

const makeStyles = (Colors: ColorTokens) =>
  StyleSheet.create({
    container: {
      width: SCREEN_WIDTH,
      height: BANNER_HEIGHT,
      borderRadius: Radius.lg,
      overflow: 'hidden',
      position: 'relative',
    },
    banner: {
      width: SCREEN_WIDTH,
      height: BANNER_HEIGHT,
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
