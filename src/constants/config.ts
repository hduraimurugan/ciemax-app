export const AppConfig = {
  name: 'CineBook',
  version: '1.0.0',
  isMockEnabled: true,
  maxSeatSelectionPerBooking: 8,
  defaultCity: 'Chennai',
  currencySymbol: '₹',
  supportedFormats: ['2D', '3D', 'IMAX', '4DX'] as const,
  supportedLanguages: ['Tamil', 'Hindi', 'English', 'Telugu'] as const,
};

export const SeatPricing = {
  silver: 150,
  gold: 250,
  premium: 400,
};

export const MockDelay = 500; // ms — simulates network latency in mock services
