export type RootStackParamList = {
  MainTabs: undefined;
  MovieDetail: { movieId: string };
  Theatres: { movieId: string };
  ShowSelection: { movieId: string; theatreId: string };
  SeatSelection: { showId: string };
  OrderSummary: undefined;
  Payment: undefined;
  BookingSuccess: { bookingId: string };
  Login: undefined;
  Register: undefined;
};

export type TabParamList = {
  Home: undefined;
  TheatresTab: undefined;
  Bookings: undefined;
  Profile: undefined;
};
