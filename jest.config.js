module.exports = {
  preset: 'react-native',
  // Required by react-native-gesture-handler (used by the seat map's
  // pinch/pan zoom) — without it, any test that imports App.tsx (which
  // wraps the tree in GestureHandlerRootView) fails with a
  // TurboModuleRegistry "RNGestureHandlerModule not found" error.
  setupFiles: [
    'react-native-gesture-handler/jestSetup',
    // Package.json "exports" blocks this deep subpath as a bare specifier,
    // so it's referenced by direct file path instead.
    '<rootDir>/node_modules/@react-native-google-signin/google-signin/jest/build/jest/setup.js',
  ],
  // Every zustand persist store (theme/auth/location) touches AsyncStorage
  // at import time, which has no native module under Jest — redirect it to
  // the library's own official mock (a setupFiles require alone doesn't
  // work here since that file only exports an object, it doesn't call
  // jest.mock() itself).
  moduleNameMapper: {
    '^@react-native-async-storage/async-storage$':
      '@react-native-async-storage/async-storage/jest/async-storage-mock',
  },
  // react-native-reanimated is mocked manually in __mocks__/ (its own
  // bundled mock.js still pulls in the real native Worklets module under
  // this v4 + react-native-worklets combination, so it can't be used as-is).
  // The 'react-native' preset's default transformIgnorePatterns only
  // exempts react-native itself — every other RN-ecosystem package here
  // ships ESM that Jest's CJS transform can't parse unless it's allowed
  // through too. (@react-navigation/native was already imported by the
  // original App.tsx, so this was broken before this integration work —
  // fixed here since it blocks the one existing test from ever running.)
  transformIgnorePatterns: [
    'node_modules/(?!(' +
      [
        '(jest-)?react-native',
        '@react-native(-community)?',
        '@react-navigation',
        'react-native-.*',
        '@react-native-.*',
      ].join('|') +
      ')/)',
  ],
};
