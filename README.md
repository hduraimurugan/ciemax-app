# CineBook — Cinema Ticket Booking App

A production-grade **React Native** mobile application for cinema ticket booking. Built with a feature-sliced architecture, a custom dark-theme design system, and fully mocked services — no backend required.

> Inspired by a React web application using shadcn/ui + Tailwind CSS, this mobile counterpart replicates the same domain structure and UX flows in a native mobile experience.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native 0.84.1 (New Architecture / Fabric) |
| Language | TypeScript 5.8 |
| Navigation | React Navigation v7 (Native Stack + Bottom Tabs) |
| State Management | Zustand v5 |
| Animations | React Native Reanimated v3 |
| Gestures | React Native Gesture Handler v2 |
| Storage | @react-native-async-storage/async-storage |
| Runtime | Hermes JS Engine |

---

## Booking Flow

```
Movies → Movie Details → Theatres → Show Selection → Seat Selection → Order Summary → Payment → Booking Confirmed
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

### Reset Metro cache (after changing babel.config.js or tsconfig.json)

```bash
npm start -- --reset-cache
```

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
│   │   ├── theme.ts               # Design tokens: Colors, Spacing, Radius, FontSize, Shadow
│   │   └── config.ts              # App config, seat pricing, mock flags
│   ├── types/
│   │   ├── models.ts              # Movie, Theatre, Show, Seat, Booking, Offer, User
│   │   └── navigation.ts          # RootStackParamList, TabParamList
│   ├── store/
│   │   └── bookingStore.ts        # Zustand: full booking flow state + computed getters
│   ├── services/                  # Mocked async data layer (swap-ready for real API)
│   │   ├── moviesService.ts       # 8 mock movies, search, now-showing / coming-soon
│   │   ├── theatresService.ts     # 5 theatres, 17 shows, grouped by movie+theatre
│   │   ├── seatsService.ts        # Deterministic seat grid generator
│   │   ├── bookingService.ts      # In-memory booking CRUD
│   │   └── offersService.ts       # 4 coupons, coupon validator
│   ├── hooks/                     # Shared data-fetching hooks (loading + error state)
│   │   ├── useMovies.ts
│   │   ├── useTheatres.ts
│   │   └── useSeatLayout.ts
│   ├── shared/
│   │   ├── ui/                    # Design system components
│   │   │   ├── Typography.tsx     # Heading1-3, Body, BodySmall, Caption, Label
│   │   │   ├── Button.tsx         # primary / secondary / ghost / danger, 3 sizes
│   │   │   ├── Card.tsx           # Surface card with optional press + shadow
│   │   │   ├── Badge.tsx          # 8 colour variants
│   │   │   ├── Input.tsx          # Controlled input with label, error, icons
│   │   │   ├── Modal.tsx          # Fade overlay modal
│   │   │   ├── BottomSheet.tsx    # Spring-animated slide-up panel
│   │   │   └── Loader.tsx         # Full-screen or inline activity indicator
│   │   └── utils/
│   │       └── formatters.ts      # formatPrice, formatDuration, formatDate, formatSeatList…
│   └── features/                  # Domain-based feature modules (self-contained)
│       ├── movies/                # MovieCard, MoviesScreen, MovieDetailScreen
│       ├── theatres/              # TheatreCard, ShowTimeChip, TheatresScreen, ShowSelectionScreen
│       ├── seats/                 # SeatGrid, SeatItem, SeatLegend, SeatSelectionScreen
│       ├── booking/               # OrderSummaryScreen, PaymentScreen, BookingSuccessScreen
│       ├── auth/                  # LoginScreen, RegisterScreen
│       ├── profile/               # ProfileScreen, MyBookingsScreen
│       └── offers/                # OffersScreen
```

---

## Path Aliases

Configured in both `tsconfig.json` and `babel.config.js` via `babel-plugin-module-resolver`:

| Alias | Resolves to |
|---|---|
| `@app/*` | `src/app/*` |
| `@features/*` | `src/features/*` |
| `@shared/*` | `src/shared/*` |
| `@services/*` | `src/services/*` |
| `@hooks/*` | `src/hooks/*` |
| `@store/*` | `src/store/*` |
| `@constants/*` | `src/constants/*` |
| `@ctypes/*` | `src/types/*` |
| `@assets/*` | `src/assets/*` |

---

## Design System

Cinema-inspired dark theme. All values live in `src/constants/theme.ts`.

| Token | Value | Usage |
|---|---|---|
| `Colors.background` | `#0D0D0D` | Screen backgrounds |
| `Colors.surface` | `#1A1A2E` | Cards, bottom sheets |
| `Colors.surfaceElevated` | `#252540` | Inputs, raised surfaces |
| `Colors.accent` | `#E50914` | CTAs, selected seats, active states |
| `Colors.gold` | `#FFD700` | Gold seat section |
| `Colors.silver` | `#C0C0C0` | Silver seat section |
| `Colors.textPrimary` | `#FFFFFF` | Primary text |
| `Colors.textSecondary` | `#A0A0A0` | Supporting text |
| `Colors.border` | `#2A2A3E` | Dividers, card borders |

---

## Documentation

| Document | Description |
|---|---|
| [Architecture](docs/architecture.md) | Folder structure, module boundaries, scaling guide |
| [Navigation](docs/navigation.md) | Screen map, navigator hierarchy, navigation patterns |
| [Design System](docs/design-system.md) | Theme tokens, component API, usage examples |
| [Data Models](docs/data-models.md) | TypeScript interface reference for all domain types |
| [State Management](docs/state-management.md) | Zustand store structure and booking flow state |
| [Features](docs/features.md) | Feature module breakdown and seat grid architecture |

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
- **Mock-first services** — all service functions are `async` and return typed data; replacing them with real API calls requires no changes to hooks, store, or UI
- **Dumb seat grid** — `SeatGrid` is a pure renderer; all selection logic lives in Zustand's `toggleSeat`, keeping the component reusable and testable in isolation
- **`useNavigation` hook for tab screens** — tab screens use `useNavigation<NativeStackNavigationProp>()` instead of prop-drilling, allowing them to navigate to stack routes without type conflicts
- **`@ctypes` alias** — the types path alias uses `@ctypes` (not `@types`) to avoid conflict with TypeScript's reserved `@types` namespace for `node_modules/@types/`
