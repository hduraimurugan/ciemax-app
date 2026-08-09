# Navigation

## Navigator Hierarchy

```
NavigationContainer           (App.tsx)
└── RootNavigator             (NativeStackNavigator, initialRouteName="Splash")
    ├── Splash                → SplashScreen           (fade; auto-advances after 2.2s)
    ├── Onboarding            → OnboardingScreen
    ├── Login                 → LoginScreen
    ├── Otp                   → OtpScreen
    │
    ├── MainTabs              (TabNavigator — BottomTabNavigator)
    │   ├── Home              → MoviesScreen
    │   ├── SearchTab         → SearchScreen
    │   ├── Bookings          → MyBookingsScreen
    │   └── ProfileTab        → ProfileScreen
    │
    ├── MovieDetail           → MovieDetailScreen
    ├── Showtimes             → ShowtimesScreen
    ├── SeatSelection         → SeatSelectionScreen
    ├── Checkout              → CheckoutScreen
    ├── Payment               → PaymentScreen          (slide_from_bottom)
    ├── BookingSuccess        → BookingSuccessScreen    (fade, no back gesture)
    ├── BookingFailure        → BookingFailureScreen    (fade, no back gesture)
    └── TicketDetail          → TicketDetailScreen
```

**Not registered in either navigator** (kept on disk, unrouted — see [docs/architecture.md](architecture.md)): `RegisterScreen`, `TheatresScreen`, `AllTheatresScreen`, `ShowSelectionScreen`, `OrderSummaryScreen`, `OffersScreen`. None of the CineHall design's 15 screens map to these, so they were superseded rather than restyled.

---

## Full App Flow

```
Splash  ── 2.2s auto-advance ──▶  Onboarding
                                       │  3 slides, "Skip" or "Get Started"
                                       ▼
                                    Login  ── stack root, no back button ──▶  Otp
                                                                                │  Verify & Continue
                                                                                ▼
                                                                     navigation.reset → MainTabs

[MainTabs: Home]
    MoviesScreen  ── search icon ──▶  SearchTab (sibling tab)
        │  user taps a movie card (Now Showing / Coming Soon / Recommended)
        ▼
    MovieDetailScreen  ── "Book Tickets" ──▶  ShowtimesScreen
                                                    │  user picks a date, taps an available/fast showtime chip
                                                    │  (sets selectedMovie/selectedTheatre/selectedShow in bookingStore)
                                                    ▼
                                               SeatSelectionScreen
                                                    │  user selects seats (max 8), taps Proceed
                                                    ▼
                                               CheckoutScreen  ── 300s session countdown
                                                    │  user optionally applies a promo code (e.g. FIRST50)
                                                    │  taps "Pay Now"
                                                    ▼
                                               PaymentScreen  (slides up from bottom)
                                                    │  Card / UPI / Wallet tabs → Pay
                                                    │  processing sub-state (~1.8s spinner)
                                                    ├─ success ──▶  BookingSuccessScreen (fade, no back)
                                                    │                    │  "View My Bookings"
                                                    │                    ▼
                                                    │              reset → MainTabs (Bookings tab focused)
                                                    │                    │  "Home"
                                                    │                    ▼
                                                    │              reset → MainTabs
                                                    └─ failure ──▶  BookingFailureScreen (fade, no back)
                                                                         │  "Try Again" → goBack to Payment
                                                                         │  "Back to Home" → reset → MainTabs

[MainTabs: Bookings]
    MyBookingsScreen  ── tap a booking card ──▶  TicketDetailScreen
                                                       │  "Cancel Booking" → inline confirm panel → cancelBooking()
                                                       │  back → MyBookingsScreen

[MainTabs: Profile]
    ProfileScreen  ── Dark Mode switch ──▶  toggleTheme() (no navigation, whole tree re-renders)
                   ── "Logout" ──▶  resetBookingFlow() + navigation.getParent().reset → Login
```

---

## Navigation Param Types

Defined in `src/types/navigation.ts`:

```ts
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
```

Removed from the pre-CineHall version: `Theatres`, `ShowSelection` (merged into `Showtimes`), `OrderSummary` (renamed `Checkout`), `Profile` (moved from the root stack into `TabParamList` as `ProfileTab`), `Register`, `TheatresTab`, `OffersTab`.

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

Tab screens that navigate to both sibling tabs (e.g. Search) *and* root-stack routes (e.g. MovieDetail, TicketDetail) use `CompositeScreenProps` instead of the bare `useNavigation` hook:

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

### Reaching the parent stack navigator explicitly

`ProfileScreen`'s Logout button needs to `reset()` the **root stack** (back to `Login`), not the tab navigator it's rendered inside of — calling `navigation.reset(...)` directly would reset the tab navigator's own state instead. Use `getParent()`:

```tsx
navigation.getParent<NativeStackNavigationProp<RootStackParamList>>()?.reset({
  index: 0,
  routes: [{ name: 'Login' }],
});
```

### Resetting into a specific tab (used after BookingSuccess → "View My Bookings")

```tsx
navigation.reset({
  index: 0,
  routes: [{ name: 'MainTabs', params: { screen: 'Bookings' } as never }],
});
```

React Navigation forwards `params: { screen, params }` to configure the initial state of the nested `TabNavigator`.

### Resetting the stack (used after Login/Otp success, and after BookingSuccess/BookingFailure "Home")

```tsx
navigation.reset({
  index: 0,
  routes: [{ name: 'MainTabs' }],
});
```

This clears the entire preceding flow from history so the user cannot navigate back into it.

---

## Screen Transition Animations

| Screen | Animation | Reason |
|---|---|---|
| `Splash` | `fade` | Instant, no back-navigation concept |
| All other stack screens | `slide_from_right` (default) | Standard forward navigation |
| `Payment` | `slide_from_bottom` | Modal-style payment sheet feel |
| `BookingSuccess` | `fade` | Celebration moment, not a drill-down |
| `BookingSuccess` | `gestureEnabled: false` | Prevent swipe-back to Payment |
| `BookingFailure` | `fade` | Mirror of BookingSuccess |
| `BookingFailure` | `gestureEnabled: false` | Prevent swipe-back to Payment |

---

## Tab Navigator Styling

The tab bar reads the active theme via `useTheme()` inside `TabNavigator` (not a static import):

```ts
const { colors } = useTheme();
const styles = useMemo(() => makeStyles(colors), [colors]);

tabBarStyle: styles.tabBar,              // backgroundColor: colors.surface, borderTopColor: colors.border
tabBarActiveTintColor: colors.accent,
tabBarInactiveTintColor: colors.textMuted,
```

Icons: `Home`, `Search`, `Ticket`, `User` from `lucide-react-native`, each wrapped in a small named function component (not an inline arrow) to satisfy `react/no-unstable-nested-components`.

---

## Files

| File | Purpose |
|---|---|
| [src/app/navigation/RootNavigator.tsx](../src/app/navigation/RootNavigator.tsx) | Root stack — registers every live screen |
| [src/app/navigation/TabNavigator.tsx](../src/app/navigation/TabNavigator.tsx) | Bottom tab bar configuration |
| [src/types/navigation.ts](../src/types/navigation.ts) | All param list type definitions |
