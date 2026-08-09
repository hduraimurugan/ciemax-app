import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ColorTokens, DarkColors, LightColors } from '@constants/theme';

export type ThemeMode = 'dark' | 'light';

interface ThemeState {
  mode: ThemeMode;
  colors: ColorTokens;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const paletteFor = (mode: ThemeMode): ColorTokens => (mode === 'dark' ? DarkColors : LightColors);

export const useThemeStore = create<ThemeState>()(
  persist(
    set => ({
      mode: 'dark',
      colors: DarkColors,
      toggleTheme: () =>
        set(state => {
          const mode: ThemeMode = state.mode === 'dark' ? 'light' : 'dark';
          return { mode, colors: paletteFor(mode) };
        }),
      setTheme: mode => set({ mode, colors: paletteFor(mode) }),
    }),
    {
      name: 'cinehall-theme',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({ mode: state.mode }),
      onRehydrateStorage: () => state => {
        if (state) state.colors = paletteFor(state.mode);
      },
    }
  )
);
