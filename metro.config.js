const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    // Disable package.json `exports` field resolution so Metro falls back to
    // the `main` (CJS) field. Required for packages like lucide-react-native
    // whose `exports.browser` condition points to an ESM-only build that
    // Metro/Hermes cannot process.
    unstable_enablePackageExports: false,
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
