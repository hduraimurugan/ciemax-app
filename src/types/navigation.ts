/** Shared shape carried from SeatSelection through Checkout/Payment/Failure — a live
 * server-side seat hold, so every screen in that chain needs the same identifying data. */
export type CheckoutParams = {
  showId: string;
  seatIds: string[];
  seatLabels: string[];
  holdExpiresAt: string; // ISO — from POST /api/booking/hold's hold_expires_at
  ticketTotal: number; // sum of seat prices, before fee/GST/discount
  movieId: string;
  movieTitle: string;
  posterUrl?: string;
  cinemaName: string;
  screenName: string;
  showDate: string;
  startTime: string; // "HH:MM:SS", display-formatted by the screen
  language: string;
};

export type RazorpayWebViewParams = {
  orderId: string;
  amountPaise: number;
  currency: string;
  keyId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  description: string;
  checkoutParams: CheckoutParams;
  offerCode?: string | null;
};

export type BookingFailureParams = {
  reason: 'cancelled' | 'failed';
  message?: string;
  checkoutParams: CheckoutParams;
  offerCode?: string | null;
};

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  // `redirectTo` lets any screen raise Login as a modal and resume after
  // success (see useRequireAuth) — omitted, it just pops back on success.
  Login: { redirectTo?: string } | undefined;
  Otp: {
    email: string;
    type: 'signup' | 'password_reset';
    // Carried through from Register so OTP-verify can auto-login afterwards.
    password?: string;
  };
  Register: undefined;
  ForgotPassword: undefined;
  MainTabs: undefined;
  MovieDetail: { movieId: string };
  Showtimes: { movieId: string };
  Theatres: undefined;
  Offers: undefined;
  SeatSelection: { showId: string; movieId: string };
  Checkout: CheckoutParams;
  Payment: CheckoutParams & { offerCode?: string | null; discountAmount?: number; grandTotal: number };
  RazorpayWebView: RazorpayWebViewParams;
  BookingSuccess: { paymentId: string };
  BookingFailure: BookingFailureParams;
  TicketDetail: { bookingId: string };
  ChangePassword: undefined;
  SetPassword: undefined;
  Notifications: undefined;
};

export type TabParamList = {
  Home: undefined;
  SearchTab: undefined;
  Bookings: undefined;
  ProfileTab: undefined;
};
