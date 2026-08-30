// react-native-reanimated@4's own bundled mock.js still pulls in the real
// native Worklets module (a known gap in the 4.x + react-native-worklets
// split as of this version), so it throws under Jest too. This is a
// minimal hand-rolled stand-in covering only what SeatGrid.tsx, Skeleton.tsx,
// and BottomSheet.tsx use (useSharedValue/useAnimatedStyle/withTiming/
// withRepeat/makeMutable/Easing/runOnJS + Animated.View).
const React = require('react');
const { View } = require('react-native');

function useSharedValue(initial) {
  return { value: initial };
}

// Module-scope mutables (Skeleton.tsx's shared shimmer value) need the same
// plain { value } shape as useSharedValue — there's no UI thread under Jest.
function makeMutable(initial) {
  return { value: initial };
}

function useAnimatedStyle(styleFactory) {
  try {
    return styleFactory();
  } catch {
    return {};
  }
}

function withTiming(toValue) {
  return toValue;
}

function withRepeat(animation) {
  return animation;
}

const Easing = {
  linear: t => t,
  ease: t => t,
  cubic: t => t,
  // out/in/inOut etc. just wrap another easing fn — identity is enough under Jest.
  out: easing => easing,
  in: easing => easing,
  inOut: easing => easing,
};

// No UI/JS thread split under Jest — just call the function directly.
function runOnJS(fn) {
  return fn;
}

// react-native-gesture-handler's GestureDetector also reaches into
// Reanimated's default export for createAnimatedComponent at import time.
function createAnimatedComponent(Component) {
  return Component;
}

module.exports = {
  __esModule: true,
  default: { View, createAnimatedComponent },
  useSharedValue,
  makeMutable,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
  runOnJS,
};
