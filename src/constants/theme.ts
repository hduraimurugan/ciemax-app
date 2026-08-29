// Design tokens for CineHall. Theme-dependent colors live in DarkColors/LightColors
// below (see src/store/themeStore.ts + src/hooks/useTheme.ts for how a component
// reads the active palette). Keys mirror the CineHall.dc.html design's getTheme(mode).
export interface ColorTokens {
  background: string;
  surface: string;
  surfaceElevated: string;
  surfaceHighlight: string;
  secondary: string;

  accent: string;
  accentDim: string;
  accentLight: string;

  glassSurface: string;
  glassBorder: string;

  gold: string;
  goldDim: string;
  silver: string;
  silverDim: string;

  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;

  success: string;
  successDim: string;
  error: string;
  errorDim: string;
  warning: string;
  info: string;

  border: string;
  borderFocus: string;
  divider: string;
  overlay: string;

  seatAvailable: string;
  seatSelected: string;
  seatBooked: string;
  seatBookedBorder: string;

  star: string;

  emerald: string;
  emeraldDim: string;

  violet: string;
  violetDim: string;

  zinc: string;
  zincSurface: string;

  navbarBorder: string;
  transparent: string;

  warningDim: string;
  infoDim: string;

  // Theme-invariant: for content sitting on photographic imagery or a fixed
  // white surface (QR codes) that never adapts to light/dark mode.
  textOnMedia: string;
  mediaScrim: string;
  mediaGlassSurface: string;
  mediaGlassBorder: string;
}

export const DarkColors: ColorTokens = {
  background: '#0C0D11',
  surface: '#15171D',
  surfaceElevated: '#1E2128',
  surfaceHighlight: '#292D36',
  secondary: '#363B46',

  accent: '#E6474E',
  accentDim: '#C93940',
  accentLight: 'rgba(230, 71, 78, 0.45)',

  glassSurface: 'rgba(31, 32, 36, 0.80)',
  glassBorder: 'rgba(255, 255, 255, 0.08)',

  gold: '#D9A24A',
  goldDim: 'rgba(217, 162, 74, 0.15)',
  silver: '#C0C0C0',
  silverDim: 'rgba(192, 192, 192, 0.15)',

  textPrimary: '#F8F9FB',
  textSecondary: '#A6A9B4',
  textMuted: '#A6A9B4',
  textInverse: '#16171B',

  success: '#4FB878',
  successDim: 'rgba(79, 184, 120, 0.15)',
  error: '#F2564A',
  errorDim: 'rgba(242, 86, 74, 0.15)',
  warning: '#E3A75E',
  info: '#6C9CEB',

  border: 'rgba(255, 255, 255, 0.10)',
  borderFocus: '#E6474E',
  divider: 'rgba(255, 255, 255, 0.08)',
  overlay: 'rgba(0, 0, 0, 0.7)',

  seatAvailable: '#26282E',
  seatSelected: '#E6474E',
  seatBooked: '#383A42',
  seatBookedBorder: '#383A42',

  star: '#D9A24A',

  emerald: '#4FB878',
  emeraldDim: 'rgba(79, 184, 120, 0.12)',

  violet: '#A97EE0',
  violetDim: 'rgba(169, 126, 224, 0.12)',

  zinc: '#A6A9B4',
  zincSurface: '#26282E',

  navbarBorder: 'rgba(255, 255, 255, 0.06)',
  transparent: 'transparent',

  warningDim: 'rgba(227, 167, 94, 0.15)',
  infoDim: 'rgba(108, 156, 235, 0.15)',

  textOnMedia: '#FFFFFF',
  mediaScrim: 'rgba(10, 11, 14, 0.55)',
  mediaGlassSurface: 'rgba(255, 255, 255, 0.18)',
  mediaGlassBorder: 'rgba(255, 255, 255, 0.5)',
};

export const LightColors: ColorTokens = {
  background: '#F9FAFC',
  surface: '#F1F2F5',
  surfaceElevated: '#E7E9EE',
  surfaceHighlight: '#DDE0E6',
  secondary: '#DEE1EA',

  accent: '#D93C43',
  accentDim: '#B32E34',
  accentLight: 'rgba(217, 60, 67, 0.25)',

  glassSurface: 'rgba(241, 242, 245, 0.85)',
  glassBorder: 'rgba(0, 0, 0, 0.08)',

  gold: '#D9A24A',
  goldDim: 'rgba(217, 162, 74, 0.15)',
  silver: '#9AA0AC',
  silverDim: 'rgba(154, 160, 172, 0.15)',

  textPrimary: '#1D1F23',
  textSecondary: '#6B6F7A',
  textMuted: '#6B6F7A',
  textInverse: '#F9FAFC',

  success: '#4FB878',
  successDim: 'rgba(79, 184, 120, 0.15)',
  error: '#F2564A',
  errorDim: 'rgba(242, 86, 74, 0.15)',
  warning: '#E3A75E',
  info: '#6C9CEB',

  border: '#CCCFD6',
  borderFocus: '#D93C43',
  divider: '#E2E4E9',
  overlay: 'rgba(0, 0, 0, 0.5)',

  seatAvailable: '#E7E9EE',
  seatSelected: '#D93C43',
  seatBooked: '#DEE1EA',
  seatBookedBorder: '#DEE1EA',

  star: '#D9A24A',

  emerald: '#4FB878',
  emeraldDim: 'rgba(79, 184, 120, 0.12)',

  violet: '#A97EE0',
  violetDim: 'rgba(169, 126, 224, 0.12)',

  zinc: '#6B6F7A',
  zincSurface: '#E7E9EE',

  navbarBorder: 'rgba(0, 0, 0, 0.06)',
  transparent: 'transparent',

  warningDim: 'rgba(227, 167, 94, 0.15)',
  infoDim: 'rgba(108, 156, 235, 0.15)',

  textOnMedia: '#FFFFFF',
  mediaScrim: 'rgba(10, 11, 14, 0.55)',
  mediaGlassSurface: 'rgba(255, 255, 255, 0.18)',
  mediaGlassBorder: 'rgba(255, 255, 255, 0.5)',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
  tabBarHeight: 64,
};

export const Radius = {
  xs: 6,
  sm: 8,
  md: 10,
  lg: 14,
  xl: 18,
  xxl: 22,
  full: 9999,
};

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 18,
  xl: 22,
  xxl: 28,
  display: 36,
};

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

// Neutral shadows (not theme-dependent). The design's "neon" glow depends on the
// active accent color, so it's computed per-render — see makeNeonShadow below.
export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 6,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.55,
    shadowRadius: 18,
    elevation: 12,
  },
};

export function makeNeonShadow(colors: ColorTokens) {
  return {
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
  };
}

export const ZIndex = {
  base: 0,
  card: 10,
  overlay: 100,
  modal: 200,
  toast: 300,
};

// JetBrains Mono — headings, labels, mono numerals/prices. Body text intentionally
// has no fontFamily override (falls back to the platform system sans, close to the
// design's Inter) since Inter .ttf files aren't linked in this project yet.
export const FontFamily = {
  regular: 'JetBrainsMono-Regular',
  medium: 'JetBrainsMono-Medium',
  semibold: 'JetBrainsMono-SemiBold',
  bold: 'JetBrainsMono-Bold',
  extrabold: 'JetBrainsMono-ExtraBold',
};
