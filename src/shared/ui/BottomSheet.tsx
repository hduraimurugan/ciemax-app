import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { ColorTokens, Radius, Spacing } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  snapHeight?: number; // pixels from bottom, defaults to 50% of screen
  style?: ViewStyle;
}

export function BottomSheet({
  visible,
  onClose,
  children,
  snapHeight = SCREEN_HEIGHT * 0.55,
  style,
}: BottomSheetProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const translateY = useRef(new Animated.Value(snapHeight)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 60,
        friction: 10,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: snapHeight,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, snapHeight, translateY]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Animated.View
          style={[
            styles.sheet,
            { height: snapHeight, transform: [{ translateY }] },
            style,
          ]}>
          <Pressable onPress={() => {}} style={styles.content}>
            <View style={styles.handle} />
            {children}
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const makeStyles = (Colors: ColorTokens) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: Colors.overlay,
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: Colors.surface,
      borderTopLeftRadius: Radius.xxl,
      borderTopRightRadius: Radius.xxl,
      borderTopWidth: 1,
      borderLeftWidth: 1,
      borderRightWidth: 1,
      borderColor: Colors.border,
    },
    content: {
      flex: 1,
      padding: Spacing.md,
    },
    handle: {
      width: 40,
      height: 4,
      borderRadius: Radius.full,
      backgroundColor: Colors.border,
      alignSelf: 'center',
      marginBottom: Spacing.md,
    },
  });
