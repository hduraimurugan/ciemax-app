const fs = require('fs');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

// Resolve through the *native* realpath so the project root is always the
// true underlying path, not whatever drive letter happened to be current
// when this file loaded (e.g. a `subst`'d drive used to dodge Windows' MAX_PATH
// limit on the native build). Metro's file-map crawler canonicalizes every
// path via fs.realpathSync.native, which unwinds subst/junction mappings —
// the plain (non-native) fs.realpathSync does NOT, so using it here left
// projectRoot on the subst'd drive while the crawler indexed files under the
// real path, and Metro threw "Failed to get the SHA-1" for anything it
// resolved (not found under the drive-letter root it thought it was watching).
const projectRoot = fs.realpathSync.native(__dirname);

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

module.exports = mergeConfig(getDefaultConfig(projectRoot), config);
