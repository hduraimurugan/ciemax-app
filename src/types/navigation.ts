export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  Otp: { email: string };
  MainTabs: undefined;
  MovieDetail: { movieId: string };
  Showtimes: { movieId: string };
  SeatSelection: { showId: string };
  Checkout: undefined;
  Payment: undefined;
  BookingSuccess: { bookingId: string };
  BookingFailure: { error?: string };
  TicketDetail: { bookingId: string };
};

export type TabParamList = {
  Home: undefined;
  SearchTab: undefined;
  Bookings: undefined;
  ProfileTab: undefined;
};
