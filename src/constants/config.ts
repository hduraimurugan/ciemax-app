// Real mock/live switch lives in src/constants/env.ts (Env.USE_MOCKS) — it
// needs to be readable at build time per-environment, which AppConfig isn't.
export const AppConfig = {
  name: 'CineHall',
  version: '1.0.0',
  maxSeatSelectionPerBooking: 8,
  currencySymbol: '₹',
  supportedFormats: ['2D', '3D', 'IMAX', '4DX'] as const,
  supportedLanguages: ['Tamil', 'Hindi', 'English', 'Telugu'] as const,
};

// Only premium/gold rows are populated by seatsService (silver is unused, kept for
// SeatSection type compatibility). premium = ₹350/seat, gold = ₹220/seat per the
// CineHall design.
export const SeatPricing = {
  silver: 220,
  gold: 220,
  premium: 350,
};

export const MockDelay = 500; // ms — simulates network latency in mock services

/** AsyncStorage keys not already owned by a zustand `persist` store. */
export const StorageKeys = {
  onboardingSeen: 'cinehall-onboarding-seen',
  favouriteTheatres: 'cinehall-favourite-theatres',
  favouriteMovies: 'cinehall-favourite-movies',
  recentSearches: 'cinehall-recent-searches',
} as const;
