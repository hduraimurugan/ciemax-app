# Navigation

## Navigator Hierarchy

```
NavigationContainer                    (App.tsx)
└── RootNavigator                      (NativeStackNavigator, initialRouteName="Splash")
    ├── Splash                → SplashScreen           (fade; waits on authStore.bootstrap())
    ├── Onboarding            → OnboardingScreen        (first run only, tracked in AsyncStorage)
    │
    ├── MainTabs              (TabNavigator — browsing is public, no auth required)
    │   ├── Home              → MoviesScreen
    │   ├── SearchTab         → SearchScreen
    │   ├── Bookings          → MyBookingsScreen        (shows a "Sign in" prompt if not authed)
    │   └── ProfileTab        → ProfileScreen            (shows a "Sign in" prompt if not authed)
    │
    ├── Login                 → LoginScreen              (modal — pushed by useRequireAuth or explicit nav)
    ├── Register               → RegisterScreen           (modal)
    ├── Otp                    → OtpScreen                 (modal)
    ├── ForgotPassword         → ForgotPasswordScreen      (modal)
    │
    ├── MovieDetail            → MovieDetailScreen
    ├── Showtimes               → ShowtimesScreen
    ├── Theatres                 → TheatresScreen
    ├── Offers                    → OffersScreen
    │
    ├── SeatSelection            → SeatSelectionScreen
    ├── Checkout                  → CheckoutScreen
    ├── Payment                    → PaymentScreen             (slide_from_bottom)
    ├── RazorpayWebView             → RazorpayWebViewScreen     (fullScreenModal, no back gesture)
    ├── BookingSuccess               → BookingSuccessScreen      (fade, no back gesture)
    ├── BookingFailure                → BookingFailureScreen      (fade, no back gesture)
    │
    ├── TicketDetail                   → TicketDetailScreen
    ├── ChangePassword                  → ChangePasswordScreen     (modal)
    └── SetPassword                      → SetPasswordScreen        (modal)
```

Splash no longer forces every user through Login — it waits only for a persisted token (if any) to be verified against `GET /me`, then goes straight to `MainTabs` (or `Onboarding` on first run). This mirrors the web app: browsing, search, and movie/showtime discovery are all public.

---

## Full App Flow

```
Splash ── bootstrap() resolves ──▶  Onboarding (first run only) ──▶  MainTabs

[MainTabs: Home] — fully public
    MoviesScreen  ── city chip ──▶  LocationModal (GPS or manual state/district)
                  ── search icon ──▶  SearchTab (sibling tab)
                  ── Clapperboard icon ──▶  Theatres
        │  user taps a movie card
        ▼
    MovieDetailScreen  ── "Book Tickets" ──▶  ShowtimesScreen
                                                    │  date strip (real dates) + per-cinema showtime chips
                                                    │  (sets selectedMovie/selectedTheatre/selectedShow in bookingStore
                                                    │   — display-only until the seat count is picked)
                                                    ▼
                                               SeatSelectionScreen
                                                    │  SeatCountModal (1–8) → tap a seat → auto-adjacent block selected
                                                    │  Proceed → useRequireAuth() → POST /api/booking/hold
                                                    ├─ 200 ──▶  Checkout (with CheckoutParams: showId, seatIds,
                                                    │            seatLabels, holdExpiresAt, ticketTotal, ...)
                                                    └─ 409 ──▶  toast the conflicting seats, refetch, stay here
                                                    ▼
                                               CheckoutScreen  ── countdown driven by the real hold_expires_at
                                                    │  offers carousel + promo code (POST /api/offers/validate)
                                                    │  back/cancel → POST /api/booking/release → SeatSelection
                                                    │  "Pay Now" → Payment (adds grandTotal, offerCode, discountAmount)
                                                    ▼
                                               PaymentScreen  (slides up from bottom)
                                                    │  "Pay ₹X securely" → POST /api/payment/create-order
                                                    ▼
                                               RazorpayWebViewScreen  (checkout.js in a WebView)
                                                    ├─ success  ──▶  POST /api/payment/verify ──▶  BookingSuccess
                                                    ├─ dismiss  ──▶  BookingFailure { reason: 'cancelled' }
                                                    └─ error    ──▶  BookingFailure { reason: 'failed' }

    BookingSuccessScreen  ── fetches the booking by payment_id (never trusts local state) ──
                              "View My Bookings" → reset → MainTabs (Bookings tab)
                              "Home" → reset → MainTabs
                              "Download"/"Share" → captures the ticket card via react-native-view-shot

    BookingFailureScreen  ── the seat hold keeps counting down here too ──
                              "Try Again" → replace → Checkout (same CheckoutParams — re-verifies offers/settings)
                              "Cancel and Release Seats" → POST /api/booking/release → SeatSelection
                              hold expiry (no action taken) → auto-redirect → SeatSelection

[MainTabs: Bookings] — login-gated
    MyBookingsScreen  ── tap a booking card ──▶  TicketDetailScreen
                                                       │  price breakdown, refund block (if any), Directions,
                                                       │  Contact Support — no Cancel Booking (admin-only refunds)
                                                       │  back → MyBookingsScreen

[MainTabs: Profile] — login-gated menu, but the screen itself renders for guests too
    ProfileScreen  ── "Sign In" (guests) ──▶  Login (modal)
                   ── Dark Mode switch ──▶  toggleTheme()
                   ── "Offers & Coupons" ──▶  Offers
                   ── "Change/Set Password" ──▶  ChangePassword / SetPassword
                   ── "Logout" ──▶  authStore.logout() + resetBookingFlow() → MainTabs (stays, doesn't force Login)
```

---

## Navigation Param Types

Defined in `src/types/navigation.ts`. `CheckoutParams` is the load-bearing shared shape — see [docs/state-management.md](state-management.md#why-checkout-is-route-param-driven-not-store-driven) for why it exists as a named, reused type rather than being inlined per-screen:

```ts
export type CheckoutParams = {
  showId: string;
  seatIds: string[];
  seatLabels: string[];
  holdExpiresAt: string;     // ISO — from POST /api/booking/hold's hold_expires_at
  ticketTotal: number;       // sum of seat prices, before fee/GST/discount
  movieId: string;
  movieTitle: string;
  posterUrl?: string;
  cinemaName: string;
  screenName: string;
  showDate: string;
  startTime: string;         // "HH:MM:SS"
  language: string;
};

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: { redirectTo?: string } | undefined;
  Otp: { email: string; type: 'signup' | 'password_reset'; password?: string };
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
  RazorpayWebView: {
    orderId: string; amountPaise: number; currency: string; keyId: string;
    customerName: string; customerEmail: string; customerPhone?: string; description: string;
    checkoutParams: CheckoutParams; offerCode?: string | null;
  };
  BookingSuccess: { paymentId: string };
  BookingFailure: { reason: 'cancelled' | 'failed'; message?: string; checkoutParams: CheckoutParams; offerCode?: string | null };
  TicketDetail: { bookingId: string };
  ChangePassword: undefined;
  SetPassword: undefined;
};

export type TabParamList = {
  Home: undefined;
  SearchTab: undefined;
  Bookings: undefined;
  ProfileTab: undefined;
};
```

---

## The Login-as-modal pattern (`useRequireAuth`)

Navigation params can't carry a function, so `useRequireAuth()` (`src/hooks/useRequireAuth.ts`) queues the pending callback in a module-level array and pushes `Login` as a modal:

```tsx
const requireAuth = useRequireAuth();

function handleProceed() {
  requireAuth(async () => {
    const result = await holdSeats(showId, seatIds);
    navigation.navigate('Checkout', { ... });
  });
}
```

`LoginScreen` (and `OtpScreen`, for the signup-verification path) call `flushPendingAuthCallbacks()` after a successful sign-in, then dismiss themselves — `navigation.goBack()` if reachable, otherwise `reset` to `MainTabs`.

---

## Navigating Between Screens

### From a Stack screen (using props)

```tsx
type Props = NativeStackScreenProps<RootStackParamList, 'MovieDetail'>;

export function MovieDetailScreen({ navigation, route }: Props) {
  const { movieId } = route.params;
  function handleBook() {
    navigation.navigate('Showtimes', { movieId });
  }
}
```

### From a Tab screen that also needs stack routes (composite props)

```tsx
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { RootStackParamList, TabParamList } from '@ctypes/navigation';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function MoviesScreen({ navigation }: Props) {
  function handleSearchPress() {
    navigation.navigate('SearchTab');            // sibling tab
  }
  function handleMoviePress(movie: Movie) {
    navigation.navigate('MovieDetail', { movieId: movie.id }); // parent stack route
  }
}
```

Used by `MoviesScreen`, `SearchScreen`, `MyBookingsScreen`, and `ProfileScreen`.

### Resetting into a specific tab (used after BookingSuccess → "View My Bookings")

```tsx
navigation.reset({
  index: 0,
  routes: [{ name: 'MainTabs', params: { screen: 'Bookings' } as never }],
});
```

### Resetting the stack (used after logout, and after BookingSuccess/BookingFailure "Home")

```tsx
navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
```

Logout resets to `MainTabs`, not `Login` — browsing stays available for a logged-out user.

---

## Screen Transition Animations

| Screen | Animation | Reason |
|---|---|---|
| `Splash` | `fade` | Instant, no back-navigation concept |
| `Login`/`Register`/`Otp`/`ForgotPassword`/`ChangePassword`/`SetPassword` | `presentation: 'modal'` | Raised over whatever screen needed auth, swipe-down dismissible |
| All other stack screens | `slide_from_right` (default) | Standard forward navigation |
| `Payment` | `slide_from_bottom` | Modal-style payment sheet feel |
| `RazorpayWebView` | `presentation: 'fullScreenModal'`, `gestureEnabled: false` | Prevent an accidental swipe-away mid-payment |
| `BookingSuccess` / `BookingFailure` | `fade`, `gestureEnabled: false` | Celebration/error moment, not a drill-down; no swipe-back into Payment |

---

## Files

| File | Purpose |
|---|---|
| [src/app/navigation/RootNavigator.tsx](../src/app/navigation/RootNavigator.tsx) | Root stack — registers every live screen |
| [src/app/navigation/TabNavigator.tsx](../src/app/navigation/TabNavigator.tsx) | Bottom tab bar configuration |
| [src/types/navigation.ts](../src/types/navigation.ts) | All param list type definitions |
| [src/hooks/useRequireAuth.ts](../src/hooks/useRequireAuth.ts) | The login-as-modal guard used across screens |
