export const Colors = {
  // Backgrounds — dark navy palette (matches cinema-hall-users oklch dark tokens)
  background: '#141A21',       // oklch(0.14 0.01 240) — almost-black with navy tint
  surface: '#1C2330',          // oklch(0.18 0.01 240) — card surface
  surfaceElevated: '#242D3A',  // oklch(0.22 0.01 240) — elevated surface / input bg
  surfaceHighlight: '#303D4F', // oklch(0.3 0.01 250)  — muted highlight surface
  secondary: '#343E4E',        // oklch(0.3 0.02 240)  — cool gray-blue secondary surface

  // Brand — cinema red (primary)
  accent: '#E50914',
  accentDim: '#B20710',
  accentLight: 'rgba(229, 9, 20, 0.15)',

  // Glass surfaces (web .glass-effect equivalent)
  glassSurface: 'rgba(28, 35, 48, 0.80)', // card at 80% opacity
  glassBorder: 'rgba(255, 255, 255, 0.08)',

  // Seat sections
  gold: '#FFD700',
  goldDim: 'rgba(255, 215, 0, 0.15)',
  silver: '#C0C0C0',
  silverDim: 'rgba(192, 192, 192, 0.15)',

  // Text — blue-tinted tones (oklch foreground tokens)
  textPrimary: '#F4F6F9',    // oklch(0.98 0.01 240) — soft white with cool tint
  textSecondary: '#8895A6',  // oklch(0.68 0.02 250) — blue-gray secondary
  textMuted: '#636D7A',      // oklch(0.55 0.02 250) — muted blue-gray
  textInverse: '#141A21',

  // Semantic
  success: '#22C55E',
  successDim: 'rgba(34, 197, 94, 0.15)',
  error: '#EF4444',          // oklch(0.7 0.21 27) — destructive
  errorDim: 'rgba(239, 68, 68, 0.15)',
  warning: '#F59E0B',
  info: '#3B82F6',

  // UI chrome — translucent borders (oklch(1 0 0 / 10%))
  border: 'rgba(255, 255, 255, 0.10)',
  borderFocus: '#E50914',
  divider: 'rgba(255, 255, 255, 0.08)',
  overlay: 'rgba(0, 0, 0, 0.7)',

  // Seat states
  seatAvailable: '#2D3748',
  seatSelected: '#E50914',
  seatBooked: '#1A2332',
  seatBookedBorder: '#2D3748',

  // Stars / rating
  star: '#FFD700',

  // Emerald — selected seats, seat CTA, booking success accents
  emerald: '#10B981',
  emeraldDim: 'rgba(16, 185, 129, 0.12)',

  // Violet — offer card accents
  violet: '#8B5CF6',
  violetDim: 'rgba(139, 92, 246, 0.12)',

  // Zinc — seat pills on ticket card
  zinc: '#71717A',
  zincSurface: '#27272A',

  // Navbar border — slightly darker than border
  navbarBorder: 'rgba(255, 255, 255, 0.06)',

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
  tabBarHeight: 64,
};

export const Radius = {
  xs: 6,    // --radius-sm = base - 4px  (0.225rem ≈ 6px)
  sm: 8,    // --radius-md = base - 2px  (0.425rem ≈ 8px)
  md: 10,   // --radius    = 0.625rem    (10px base)
  lg: 14,   // --radius-xl = base + 4px  (14px)
  xl: 18,   // --radius-2xl= base + 8px  (18px)
  xxl: 22,  // --radius-3xl= base + 12px (22px)
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
  // cinema .neon-glow equivalent — cinema red radial glow
  neon: {
    shadowColor: '#E50914',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
  },
};

export const ZIndex = {
  base: 0,
  card: 10,
  overlay: 100,
  modal: 200,
  toast: 300,
};

// JetBrains Mono — matches cinema-hall-users --font-sans
// Requires font files linked via react-native.config.js (see README)
export const FontFamily = {
  regular: 'JetBrainsMono-Regular',
  medium: 'JetBrainsMono-Medium',
  semibold: 'JetBrainsMono-SemiBold',
  bold: 'JetBrainsMono-Bold',
  extrabold: 'JetBrainsMono-ExtraBold',
};
