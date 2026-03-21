module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@app': './src/app',
          '@features': './src/features',
          '@shared': './src/shared',
          '@services': './src/services',
          '@hooks': './src/hooks',
          '@store': './src/store',
          '@assets': './src/assets',
          '@constants': './src/constants',
          '@ctypes': './src/types',
        },
      },
    ],
    'react-native-reanimated/plugin', // must be last
  ],
};
