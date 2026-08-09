# CineHall — Cinema Ticket Booking App

A production-grade **React Native** mobile application for cinema ticket booking. Built with a feature-sliced architecture, a dark/light dual-theme design system, and fully mocked services — no backend required.

> UI and content are implemented from the **CineHall** design (`CineHall.dc.html`, a claude.ai/design prototype) — a 15-screen mobile UI kit covering onboarding, auth, discovery, booking, and account flows, with an in-app dark/light theme toggle.

---

## Tech Stack


| Layer            | Technology                                                            |
| ------------------ | ----------------------------------------------------------------------- |
| Framework        | React Native 0.84.1 (New Architecture / Fabric)                       |
| Language         | TypeScript 5.8                                                        |
| Navigation       | React Navigation v7 (Native Stack + Bottom Tabs)                      |
| State Management | Zustand v5 (+`persist` middleware for theme)                          |
| Animations       | React Native`Animated` API (Reanimated is installed but not yet used) |
| Gestures         | React Native Gesture Handler v2                                       |
| Storage          | `@react-native-async-storage/async-storage` (persists theme mode)     |
| Icons            | lucide-react-native + react-native-svg                                |
| Gradients        | react-native-linear-gradient                                          |
| QR Codes         | react-native-qrcode-svg + react-native-svg                            |
| Runtime          | Hermes JS Engine                                                      |

---

## App Flow

```
Splash → Onboarding → Login → Otp → Home
                                       │
                    ┌──────────────────┼───────────────────┐
                    ▼                  ▼                   ▼
                Search Tab       Bookings Tab          Profile Tab
                                       │                     │
                                  TicketDetail          Dark Mode toggle

Home → Movie Details → Showtimes → Seat Selection → Checkout → Payment → Booking Confirmed
                                                                              └─ (on failure) → Booking Failed
```

---

## Quick Start

### Prerequisites

- Node.js >= 22.11.0
- React Native development environment ([setup guide](https://reactnative.dev/docs/set-up-your-environment))
- Android Studio (for Android) or Xcode (for iOS)

### Installation

```bash
# 1. Install JS dependencies
npm install

# 2. iOS only — install native pods
cd ios && pod install && cd ..
```

### Running the App

```bash
# Start Metro bundler
npm start

# Run on Android (new terminal)
npm run android

# Run on iOS (new terminal)
npm run ios
```

### Reset Metro cache

Required after changing `babel.config.js`, `tsconfig.json`, `metro.config.js`, or adding native packages:

```bash
npm start -- --reset-cache
```

> `lucide-react-native` requires `metro.config.js` to set `resolver.unstable_enablePackageExports: false`. Without this, Metro picks up the ESM build which Hermes cannot process. See [`metro.config.js`](metro.config.js) and [`docs/design-system.md`](docs/design-system.md#icons) for details.

---

## Project Structure

```
MyApp/
├── App.tsx                        # Root: providers only (NavigationContainer, SafeAreaProvider)
├── index.js                       # Entry — gesture handler import must be first
├── src/
│   ├── app/
│   │   └── navigation/            # RootNavigator (Stack) + TabNavigator (Bottom Tabs)
│   ├── constants/
│   │   ├── theme.ts               # Design tokens: DarkColors/LightColors, Spacing, Radius, FontSize, Shadow
│   │   └── config.ts              # App config, seat pricing, mock flags
│   ├── types/
│   │   ├── models.ts              # Movie, Theatre, Show, Seat, Booking, Offer, User, CastMember
│   │   └── navigation.ts          # RootStackParamList, TabParamList
│   ├── store/
│   │   ├── bookingStore.ts        # Zustand: full booking flow state + computed getters
│   │   └── themeStore.ts          # Zustand + persist: dark/light mode + active ColorTokens
│   ├── services/                  # Mocked async data layer (swap-ready for real API)
│   │   ├── moviesService.ts       # 3 mock movies (Spider-Man/Odyssey/Jana Nayagan)
│   │   ├── theatresService.ts     # 3 cinemas × 7 days, generated showtimes
│   │   ├── seatsService.ts        # Deterministic seat grid (premium + standard rows)
│   │   ├── bookingService.ts      # In-memory booking CRUD
│   │   └── offersService.ts       # FIRST50 + 3 other coupons, coupon validator
│   ├── hooks/                     # Shared data-fetching hooks (loading + error state)
│   │   ├── useMovies.ts
│   │   ├── useTheatres.ts         # useTheatresForMovie, useShowsForMovie, useShowsForMovieTheatre
│   │   ├── useSeatLayout.ts
│   │   ├── useTheme.ts            # Reads the active ColorTokens + mode + toggleTheme from themeStore
│   │   └── useCountdown.ts        # Shared tick-down timer hook (Otp resend, Checkout session)
│   ├── shared/
│   │   ├── ui/                    # Design system components — all theme-aware (useTheme + makeStyles factory)
│   │   │   ├── Typography.tsx     # Heading1-3, Body, BodySmall, Caption, Label
│   │   │   ├── Button.tsx         # primary / secondary / ghost / danger / emerald, 3 sizes
│   │   │   ├── Card.tsx           # variant: default | glass | neon
│   │   │   ├── Badge.tsx          # default / accent / success / error / warning / info / violet / zinc / gold / silver / premium
│   │   │   ├── Input.tsx          # Controlled input with label, error, icons
│   │   │   ├── Modal.tsx          # Fade overlay modal
│   │   │   ├── BottomSheet.tsx    # Spring-animated slide-up panel
│   │   │   ├── Loader.tsx         # Full-screen or inline activity indicator
│   │   │   ├── AdBanner.tsx       # Auto-playing carousel (aspect-[5/1], dot indicators)
│   │   │   ├── CountdownTimer.tsx # Amber→red pulsing countdown (built on useCountdown)
│   │   │   └── QRCode.tsx         # Wraps react-native-qrcode-svg
│   │   └── utils/
│   │       └── formatters.ts      # formatPrice, formatDuration, formatDate, formatSeatList…
│   └── features/                  # Domain-based feature modules (self-contained)
│       ├── onboarding/            # SplashScreen, OnboardingScreen (3-slide carousel)
│       ├── auth/                  # LoginScreen (email), OtpScreen — RegisterScreen unrouted
│       ├── movies/                # MovieCard, MoviesScreen (Home tab), MovieDetailScreen
│       ├── search/                # SearchScreen (Recent/Trending, live results grid)
│       ├── theatres/              # ShowtimesScreen (date strip + cinema/showtime chips)
│       ├── seats/                 # SeatGrid, SeatItem, SeatLegend, SeatSelectionScreen
│       ├── booking/                # CheckoutScreen, PaymentScreen, BookingSuccessScreen, BookingFailureScreen
│       ├── profile/               # ProfileScreen (+ Dark Mode toggle), MyBookingsScreen, TicketDetailScreen
│       └── offers/                # OffersScreen — unrouted (promo codes live in Checkout)
```

Files/screens marked **unrouted** above (`RegisterScreen`, `OffersScreen`, plus the pre-CineHall `TheatresScreen`/`ShowSelectionScreen`/`AllTheatresScreen`/`OrderSummaryScreen`) remain on disk for reference but are not registered in either navigator — see [docs/navigation.md](docs/navigation.md).

---

## Path Aliases

Configured in both `tsconfig.json` and `babel.config.js` via `babel-plugin-module-resolver`:


| Alias          | Resolves to       |
| ---------------- | ------------------- |
| `@app/*`       | `src/app/*`       |
| `@features/*`  | `src/features/*`  |
| `@shared/*`    | `src/shared/*`    |
| `@services/*`  | `src/services/*`  |
| `@hooks/*`     | `src/hooks/*`     |
| `@store/*`     | `src/store/*`     |
| `@constants/*` | `src/constants/*` |
| `@ctypes/*`    | `src/types/*`     |
| `@assets/*`    | `src/assets/*`    |

---

## Design System

Dual dark/light theme, both derived from the CineHall design. All tokens live in `src/constants/theme.ts` as `DarkColors`/`LightColors`; the active palette is read via `useTheme()`, never imported statically.


| Token                         | Dark                     | Light     | Usage                           |
| ------------------------------- | -------------------------- | ----------- | --------------------------------- |
| `background`                  | `#16171B`                | `#F9FAFC` | Screen backgrounds              |
| `surface`                     | `#1F2024`                | `#F1F2F5` | Cards, bottom sheets, tab bar   |
| `accent`                      | `#E6474E`                | `#D93C43` | CTAs, active tab, selected seat |
| `success`                     | `#4FB878`                | `#4FB878` | Confirmed / available           |
| `gold`                        | `#D9A24A`                | `#D9A24A` | Premium seat section            |
| `violet`                      | `#A97EE0`                | `#A97EE0` | Offer accents                   |
| `textPrimary`                 | `#F8F9FB`                | `#1D1F23` | Primary text                    |
| `textSecondary` / `textMuted` | `#A6A9B4`                | `#6B6F7A` | Supporting text                 |
| `border`                      | `rgba(255,255,255,0.10)` | `#CCCFD6` | Dividers, card borders          |

Toggle it from **Profile → Dark Mode** (persisted via AsyncStorage). See [docs/design-system.md](docs/design-system.md) for the full token table and theming architecture.

---

## Documentation


| Document                                     | Description                                          |
| ---------------------------------------------- | ------------------------------------------------------ |
| [Architecture](docs/architecture.md)         | Folder structure, module boundaries, scaling guide   |
| [Navigation](docs/navigation.md)             | Screen map, navigator hierarchy, navigation patterns |
| [Design System](docs/design-system.md)       | Theme tokens, theming architecture, component API    |
| [Data Models](docs/data-models.md)           | TypeScript interface reference for all domain types  |
| [State Management](docs/state-management.md) | Zustand stores (booking flow + theme)                |
| [Features](docs/features.md)                 | Feature module breakdown and seat grid architecture  |

---

## Scripts

```bash
npm start              # Start Metro bundler
npm run android        # Build + run on Android emulator/device
npm run ios            # Build + run on iOS simulator/device
npm run lint           # ESLint
npm test               # Jest
npx tsc --noEmit       # TypeScript type check (0 errors)
```

---

## Key Design Decisions

- **Feature-sliced architecture** — each domain (movies, seats, booking…) is self-contained with its own components, screens, and types, exported via a single `index.ts` barrel
- **Themed-StyleSheet-factory theming** — `src/constants/theme.ts` exports `DarkColors`/`LightColors` (no static `Colors` export). Every `StyleSheet.create` call is wrapped in a `makeStyles(colors)` factory invoked with `useTheme().colors` inside the component via `useMemo`, so the whole tree re-renders correctly when the theme toggles. This mirrors the existing `useBookingStore` Zustand convention instead of introducing React Context.
- **Mock-first services** — all service functions are `async` and return typed data; replacing them with real API calls requires no changes to hooks, store, or UI
- **Dumb seat grid** — `SeatGrid` is a pure renderer; all selection logic lives in Zustand's `toggleSeat`, keeping the component reusable and testable in isolation
- **Login → Otp is the only auth path** — the CineHall design has no signup screen. `RegisterScreen` (two-step form + inline OTP) is kept on disk, unrouted, rather than deleted.
- **`Showtimes` merges theatre + show-time selection** into one screen (date strip + per-cinema showtime chips) to match the design; the older two-screen `Theatres`/`ShowSelection` flow is kept on disk, unrouted.
- **`@ctypes` alias** — the types path alias uses `@ctypes` (not `@types`) to avoid conflict with TypeScript's reserved `@types` namespace for `node_modules/@types/`
- **Profile lives in the tab bar** (Home / Search / Bookings / Profile) rather than the root stack, per the design's persistent 4-tab bottom nav
- **Convenience fee is ₹30 per seat**, with 18% GST applied to `(subtotal + fee)` — computed once in `bookingStore`'s getters and passed pre-computed into `bookingService.createBooking`, so the formula lives in exactly one place instead of being re-derived per call site
- **Perforated ticket card** — `BookingSuccessScreen` simulates a dashed divider using a `FlatList` of small dash `View` elements rather than `borderStyle:'dashed'` which is unreliable on Android
- **No Inter font** — the CineHall design pairs JetBrains Mono (headings/prices/mono numerals) with Inter (body text). Inter `.ttf` files aren't linked in this project, so body text falls back to the platform system sans instead of adding a new font-loading step. See [docs/design-system.md](docs/design-system.md#typography).
