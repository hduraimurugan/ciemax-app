# Navigation

## Navigator Hierarchy

```
NavigationContainer           (App.tsx)
└── RootNavigator             (NativeStackNavigator)
    ├── MainTabs              (TabNavigator — BottomTabNavigator)
    │   ├── Home              → MoviesScreen
    │   ├── TheatresTab       → AllTheatresScreen
    │   ├── OffersTab         → OffersScreen
    │   └── Bookings          → MyBookingsScreen
    │
    ├── MovieDetail           → MovieDetailScreen
    ├── Theatres              → TheatresScreen
    ├── ShowSelection         → ShowSelectionScreen
    ├── SeatSelection         → SeatSelectionScreen
    ├── OrderSummary          → OrderSummaryScreen
    ├── Payment               → PaymentScreen        (slide_from_bottom)
    ├── BookingSuccess        → BookingSuccessScreen  (fade, no back gesture)
    ├── BookingFailure        → BookingFailureScreen  (fade, no back gesture)
    ├── Profile               → ProfileScreen
    ├── Login                 → LoginScreen
    └── Register              → RegisterScreen
```

---

## Full Booking Flow

```
[Home Tab]
    MoviesScreen  ── avatar icon ──▶  ProfileScreen (stack)
        │  user taps a movie card
        ▼
    MovieDetailScreen  ───── "Book Tickets" ─────▶  TheatresScreen
                                                          │  user selects a theatre
                                                          ▼
                                                     ShowSelectionScreen
                                                          │  user picks a show time
                                                          ▼
                                                     SeatSelectionScreen
                                                          │  user selects seats, taps Continue
                                                          ▼
                                                     OrderSummaryScreen
                                                          │  user applies offer (optional)
                                                          │  user taps "Proceed to Pay"
                                                          ▼
                                                     PaymentScreen  (slides up from bottom)
                                                          │  mock payment succeeds ──▶  BookingSuccessScreen (fade, no back)
                                                          │                                    │  user taps "Back to Home"
                                                          │                                    ▼
                                                          │                              navigation.reset → MainTabs
                                                          │  mock payment fails
                                                          ▼
                                                     BookingFailureScreen (fade, no back)
                                                          │  "Try Again" → goBack to Payment
                                                          │  "Back to Home" → reset → MainTabs
```

---

## Navigation Param Types

Defined in `src/types/navigation.ts`:

```ts
export type RootStackParamList = {
  MainTabs: undefined;
  MovieDetail: { movieId: string };
  Theatres: { movieId: string };
  ShowSelection: { movieId: string; theatreId: string };
  SeatSelection: { showId: string };
  OrderSummary: undefined;
  Payment: undefined;
  BookingSuccess: { bookingId: string };
  BookingFailure: { error?: string };  // New — navigated to on payment error
  Profile: undefined;                  // New — stack screen, accessed via header avatar
  Login: undefined;
  Register: undefined;
};

export type TabParamList = {
  Home: undefined;
  TheatresTab: undefined;
  OffersTab: undefined;   // Replaced Profile tab
  Bookings: undefined;
};
```

---

## Navigating Between Screens

### From a Stack screen (using props)

```tsx
type Props = NativeStackScreenProps<RootStackParamList, 'MovieDetail'>;

export function MovieDetailScreen({ navigation, route }: Props) {
  const { movieId } = route.params;

  function handleBook() {
    navigation.navigate('Theatres', { movieId });
  }
}
```

### From a Tab screen (using useNavigation hook)

Tab screens cannot easily receive a typed `navigation` prop for the root stack. Use the `useNavigation` hook instead:

```tsx
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@ctypes/navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function MoviesScreen() {
  const navigation = useNavigation<NavigationProp>();

  function handleMoviePress(movie: Movie) {
    navigation.navigate('MovieDetail', { movieId: movie.id });
  }
}
```

### Resetting the stack (used after BookingSuccess)

```tsx
navigation.reset({
  index: 0,
  routes: [{ name: 'MainTabs' }],
});
```

This clears the entire booking flow from the history so the user cannot navigate back to the Payment or Seat Selection screens.

---

## Screen Transition Animations

| Screen | Animation | Reason |
|---|---|---|
| All stack screens | `slide_from_right` (default) | Standard forward navigation |
| `Payment` | `slide_from_bottom` | Modal-style payment sheet feel |
| `BookingSuccess` | `fade` | Celebration moment, not a drill-down |
| `BookingSuccess` | `gestureEnabled: false` | Prevent swipe-back to Payment |
| `BookingFailure` | `fade` | Mirror of BookingSuccess |
| `BookingFailure` | `gestureEnabled: false` | Prevent swipe-back to Payment |

---

## Tab Navigator Styling

The tab bar uses cinema dark theme tokens:

```ts
tabBarStyle: {
  backgroundColor: Colors.surface,   // #1A1A2E
  borderTopColor: Colors.border,      // #2A2A3E
}
tabBarActiveTintColor: Colors.accent  // #E50914
tabBarInactiveTintColor: Colors.textMuted
```

---

## Files

| File | Purpose |
|---|---|
| [src/app/navigation/RootNavigator.tsx](../src/app/navigation/RootNavigator.tsx) | Root stack — registers every screen |
| [src/app/navigation/TabNavigator.tsx](../src/app/navigation/TabNavigator.tsx) | Bottom tab bar configuration |
| [src/types/navigation.ts](../src/types/navigation.ts) | All param list type definitions |
