import { useShallow } from 'zustand/react/shallow';
import { useThemeStore } from '@store/themeStore';

export const useTheme = () =>
  useThemeStore(useShallow(s => ({ colors: s.colors, mode: s.mode, toggleTheme: s.toggleTheme })));
