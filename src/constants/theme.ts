export const Colors = {
  // Backgrounds
  background: '#0D0D0D',
  surface: '#1A1A2E',
  surfaceElevated: '#252540',
  surfaceHighlight: '#2E2E50',

  // Brand
  accent: '#E50914',
  accentDim: '#B20710',
  accentLight: 'rgba(229, 9, 20, 0.15)',

  // Seat sections
  gold: '#FFD700',
  goldDim: 'rgba(255, 215, 0, 0.15)',
  silver: '#C0C0C0',
  silverDim: 'rgba(192, 192, 192, 0.15)',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0A0',
  textMuted: '#666666',
  textInverse: '#0D0D0D',

  // Semantic
  success: '#22C55E',
  successDim: 'rgba(34, 197, 94, 0.15)',
  error: '#EF4444',
  errorDim: 'rgba(239, 68, 68, 0.15)',
  warning: '#F59E0B',
  info: '#3B82F6',

  // UI chrome
  border: '#2A2A3E',
  borderFocus: '#E50914',
  divider: 'rgba(255, 255, 255, 0.08)',
  overlay: 'rgba(0, 0, 0, 0.7)',

  // Seat states
  seatAvailable: '#374151',
  seatSelected: '#E50914',
  seatBooked: '#1F2937',
  seatBookedBorder: '#374151',

  // Stars / rating
  star: '#FFD700',

  transparent: 'transparent',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const Radius = {
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
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

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
};

export const ZIndex = {
  base: 0,
  card: 10,
  overlay: 100,
  modal: 200,
  toast: 300,
};
