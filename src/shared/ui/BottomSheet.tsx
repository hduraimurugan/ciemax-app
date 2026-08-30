import React, { useEffect, useMemo } from 'react';
import { Dimensions, Modal, Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  runOnJS,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { X } from 'lucide-react-native';
import { ColorTokens, Radius, Spacing } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const EASING = Easing.out(Easing.cubic);

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  snapHeight?: number; // pixels from bottom, defaults to 50% of screen
  style?: ViewStyle;
  /** Ref to a react-native-gesture-handler ScrollView/FlatList inside `children`, if any —
   *  lets the whole-sheet drag-to-close gesture run alongside that list's own scrolling. */
  scrollRef?: React.RefObject<any>;
  /** Current scroll offset of that same list. When omitted, the whole sheet is always draggable. */
  scrollOffset?: SharedValue<number>;
}

export function BottomSheet({
  visible,
  onClose,
  children,
  snapHeight = SCREEN_HEIGHT * 0.55,
  style,
  scrollRef,
  scrollOffset,
}: BottomSheetProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const translateY = useSharedValue(snapHeight);

  useEffect(() => {
    translateY.value = withTiming(visible ? 0 : snapHeight, {
      duration: visible ? 260 : 220,
      easing: EASING,
    });
  }, [visible, snapHeight, translateY]);

  const close = () => onClose();

  const settle = (event: { translationY: number; velocityY: number }) => {
    'worklet';
    const shouldClose = translateY.value > snapHeight / 5 || (event.velocityY > 600 && translateY.value > 10);
    if (shouldClose) {
      translateY.value = withTiming(snapHeight, { duration: 200, easing: EASING });
      runOnJS(close)();
    } else {
      translateY.value = withTiming(0, { duration: 200, easing: EASING });
    }
  };

  // Always-active drag handle at the top of the sheet.
  const handlePan = Gesture.Pan()
    .hitSlop({ top: 12, bottom: 20, left: 40, right: 40 })
    .onUpdate(event => {
      translateY.value = Math.max(0, event.translationY);
    })
    .onEnd(settle);

  // Drag-to-close over the rest of the sheet body, coordinated with the inner
  // list's own scrolling: only takes over once that list is scrolled to the top.
  let contentPan = Gesture.Pan()
    .activeOffsetY(10)
    .failOffsetX([-15, 15])
    .onUpdate(event => {
      const atTop = !scrollOffset || scrollOffset.value <= 0;
      if (event.translationY > 0 && atTop) {
        translateY.value = event.translationY;
      }
    })
    .onEnd(settle);
  if (scrollRef) {
    contentPan = contentPan.simultaneousWithExternalGesture(scrollRef);
  }

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Animated.View style={[styles.sheet, { height: snapHeight }, animatedStyle, style]}>
          <View style={styles.topBar}>
            <View style={styles.closeBtnSpacer} />
            <GestureDetector gesture={handlePan}>
              <View style={styles.dragZone}>
                <View style={styles.handle} />
              </View>
            </GestureDetector>
            <Pressable style={styles.closeBtn} onPress={onClose} hitSlop={8}>
              <X size={16} color={colors.textMuted} />
            </Pressable>
          </View>
          <GestureDetector gesture={contentPan}>
            <Pressable onPress={() => {}} style={styles.content}>
              {children}
            </Pressable>
          </GestureDetector>
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
      paddingHorizontal: Spacing.md,
      paddingBottom: Spacing.md,
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.md,
      paddingTop: Spacing.md,
    },
    dragZone: {
      flex: 1,
      paddingVertical: Spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    handle: {
      width: 40,
      height: 4,
      borderRadius: Radius.full,
      backgroundColor: Colors.border,
    },
    closeBtn: {
      width: 28,
      height: 28,
      borderRadius: Radius.sm,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: Colors.surfaceElevated,
    },
    closeBtnSpacer: {
      width: 28,
    },
  });
