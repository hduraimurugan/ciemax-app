export const AppConfig = {
  name: 'CineHall',
  version: '1.0.0',
  isMockEnabled: true,
  maxSeatSelectionPerBooking: 8,
  defaultCity: 'Bengaluru',
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
