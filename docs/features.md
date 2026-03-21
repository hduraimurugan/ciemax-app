# Feature Modules

Each feature in `src/features/` is a self-contained domain module. It owns its components, screens, and types, and exposes a single `index.ts` barrel. No feature imports from another feature.

---

## movies

**Domain:** Film catalogue — browsing and discovering movies.

| File | Purpose |
|---|---|
| `screens/MoviesScreen.tsx` | Home tab — sticky header, ad banner, horizontal now-showing / coming-soon sections |
| `screens/MovieDetailScreen.tsx` | Full detail view + date selector + "Book Tickets" CTA |
| `components/MovieCard.tsx` | Fixed-width (160px) vertical poster card for horizontal lists |
| `components/MovieFilter.tsx` | Secondary underline-tab row: Movies / Theatres / Offers / Bookings |

**Data flow:**
```
useMovies hook
    → moviesService.getNowShowingMovies()
    → moviesService.getComingSoonMovies()
        → MoviesScreen renders two horizontal sections
```

### MoviesScreen layout

```
┌─────────────────────────────────────────┐
│ CINEBOOK [logo]    [Search] [Mumbai ▾] [●] │  ← sticky header (surface bg)
├─────────────────────────────────────────┤
│ Movies  Theatres  Offers  Bookings       │  ← secondary underline tab bar
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │  Ad Banner (auto-play carousel)     │ │  ← AdBanner, aspect-[5:1]
│ └─────────────────────────────────────┘ │
│ Now Showing                    See all   │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐   │  ← horizontal ScrollView
│ │MovieCard│ │     │ │     │ │     │   │
│ └──────┘ └──────┘ └──────┘ └──────┘   │
│ Coming Soon                    See all   │
│ ┌──────┐ ┌──────┐ ...                   │
└─────────────────────────────────────────┘
```

The avatar button in the header navigates to the `Profile` stack screen.

**MovieCard** (160×240px, aspect-[2:3]):
- Poster image fills the card
- Rating pill: top-right, semi-transparent background
- Genre chips: small `Badge` with semi-transparent black background at bottom
- `onPress` navigates to `MovieDetail`

---

## theatres

**Domain:** Theatre discovery and show time selection.

| File | Purpose |
|---|---|
| `screens/TheatresScreen.tsx` | Theatres showing a specific movie, with 7-day date selector |
| `screens/AllTheatresScreen.tsx` | All theatres (Theatres tab) |
| `screens/ShowSelectionScreen.tsx` | Show times at selected theatre |
| `components/TheatreCard.tsx` | Theatre name, address, amenities, rating, inline showtime buttons, heart toggle |
| `components/ShowTimeChip.tsx` | Time pill with format dot, availability text |
| `types.ts` | `ShowGroup`, `FormatFilter` |

**ShowTimeChip states:**
- Default: dark surface, white time text
- Selected: `Colors.success` border + `Colors.emeraldDim` background, green time text
- Housefull: 40% opacity, `disabled` prop — not tappable

**TheatreCard features:**
- Heart toggle (top-right): filled `Colors.accent` when favourite, `Colors.textMuted` outline when not
- Rating row: `<Star size={12} fill={Colors.star} />` + rating text
- Distance row: `<MapPin size={11} color={Colors.info} />` + distance text
- Inline showtime buttons: horizontal `ScrollView` at card bottom, green border (`Colors.success`), navigate to `SeatSelection` on press

**Availability colouring** uses `getAvailabilityColor()` from `shared/utils/formatters`:
- Housefull → `Colors.error` red
- Fast Filling → `Colors.warning` amber
- Filling Fast → `Colors.info` blue
- Available → `Colors.success` green

---

## seats

**Domain:** Interactive seat selection. The most complex feature in the app.

| File | Purpose |
|---|---|
| `screens/SeatSelectionScreen.tsx` | Sticky header + grid + emerald selection bar |
| `components/SeatGrid.tsx` | Pure grid renderer — no toggle logic |
| `components/SeatItem.tsx` | Single seat circle (30×30px) |
| `components/SeatLegend.tsx` | Available / Selected / Booked colour key |
| `components/SectionHeader.tsx` | PREMIUM / GOLD / SILVER divider with price |
| `types.ts` | `SeatItemState`, `SeatGridProps` |

### SeatGrid Architecture

The critical design decision: `SeatGrid` is a **pure renderer**. It receives:

```tsx
interface SeatGridProps {
  layout: SeatLayout;             // From seatsService (original statuses)
  selectedSeatIds: Set<string>;   // From Zustand store
  onSeatPress: (seat: Seat) => void;
}
```

It derives the visual state at render time:
```tsx
const effectiveStatus =
  selectedSeatIds.has(seat.id) ? 'selected' : seat.status;
```

This means:
- `SeatGrid` never mutates data
- Toggle logic lives entirely in `useBookingStore.toggleSeat`
- The component can be tested in isolation with any `layout` + `selectedSeatIds`

### Seat States

| State | Visual |
|---|---|
| Available | Transparent fill, `Colors.border` hairline border |
| Selected | `Colors.emerald` fill (bright green) |
| Booked | `Colors.surfaceHighlight` fill (medium gray) — not tappable |

### SeatSelectionScreen layout

```
┌─────────────────────────────────────────┐
│ [← Back]  [Poster 40×60]  Movie / Show  │  ← sticky header
├─────────────────────────────────────────┤
│           ── SCREEN ──                  │  ← blue info bar (Colors.info)
│        SeatLegend                       │
│                                         │
│  A  [1][2][3]...[12]  A   PREMIUM       │
│  ...                                    │
│  D  [1][2][3]...[14]  D   GOLD          │
│  ...                                    │
│  H  [1][2][3]...[16]  H   SILVER        │
├─────────────────────────────────────────┤
│ Seats: [A3] [A4] [A5]   (zinc pills)    │  ← seat pills (if any selected)
│ Total: ₹1,200          [Proceed] emerald│  ← bottom bar
└─────────────────────────────────────────┘
```

### Seat Generation

`seatsService.generateSeatLayout(showId)` produces a deterministic layout:
- ~28% of seats are pre-booked using a hash of `showId + rowIndex + seatNumber`
- Same show ID always produces the same layout
- No randomness between renders

---

## booking

**Domain:** Order review and payment confirmation.

| File | Purpose |
|---|---|
| `screens/OrderSummaryScreen.tsx` | Review details, apply offers, countdown timer |
| `screens/PaymentScreen.tsx` | Payment method selection (UPI / Card / Net Banking / Wallet) |
| `screens/BookingSuccessScreen.tsx` | Ticket card with QR code, download/share/home actions |
| `screens/BookingFailureScreen.tsx` | Error screen with try-again and home actions |
| `components/PriceBreakdown.tsx` | Subtotal / fee / GST / discount / grand total rows |

### OrderSummaryScreen

- Sticky header includes a `CountdownTimer` (10-minute session). On expiry, resets to `MainTabs`.
- Offers panel: horizontal `ScrollView` of mini offer cards (width 180px, violet top bar); applying an offer shows a green `Badge` + dismiss
- Price rows: subtotal → convenience fee (₹15/seat) → GST (18% of fee) → discount (green, if offer applied) → **Grand Total**

### PaymentScreen

- 4 payment methods: UPI (`Smartphone` icon), Card (`CreditCard`), Net Banking (`Landmark`), Wallet (`Wallet`)
- Selected method: `borderLeftWidth: 3, borderLeftColor: Colors.accent` + `accentLight` background + radio button with filled dot
- Bottom bar: two-line total (`Caption "Grand Total"` + `Heading2 price` + GST breakdown `Caption`)
- On success: `setBookingDetails(booking)` → `navigate('BookingSuccess')`
- On error: `navigate('BookingFailure', { error: e.message })`

### BookingSuccessScreen

Displays a styled ticket card:

```
┌─────────────────────────────────────────┐
│  CINEBOOK            [Red gradient header]│
│  Movie Title                             │
│  Date · Time                             │
├ · · · · · · · · · · · · · · · · · · · · ┤  ← perforated divider
│  Booking ID    #BK1JKXZ4AB              │
│  Theatre       PVR Phoenix              │
│  Date          Sat, 21 Mar 2026         │
│  Time          01:00 PM                 │
│  Seats         [A3] [A4] [A5]           │
│  Amount        ₹1,308                   │
│                                         │
│           ┌─────────┐                   │
│           │  QR Code │                  │
│           └─────────┘                   │
│        Scan at theatre entrance         │
└─────────────────────────────────────────┘
   [↓ Download]  [⤴ Share]  [Home →]
```

- Entry animation: `Animated.spring` scale + `Animated.timing` opacity on the check icon circle
- `resetBookingFlow()` called after 3 seconds to clean up store state
- Action icons from `lucide-react-native`: `Download`, `Share2`, `Check`

### BookingFailureScreen

- Entry animation: same spring + fade as success screen
- `X` icon (`lucide-react-native`) in a red circle (`Colors.errorDim` bg, `Colors.error` border)
- Error message from `route.params?.error` with fallback generic text
- "No amount has been charged. Please try again." hint
- Two CTAs: "Try Again" (secondary, `navigation.goBack()`) and "Back to Home" (`navigation.reset`)

---

## auth

**Domain:** Authentication UI (no backend — UI only).

| File | Purpose |
|---|---|
| `screens/LoginScreen.tsx` | Email + password form, tab header to switch to Register |
| `screens/RegisterScreen.tsx` | Name, email, phone, password form + OTP verification step |

Both screens have a **tab header** at the top:
- Active tab: `borderBottomWidth: 2, borderBottomColor: Colors.accent`
- Inactive tab: `color: Colors.textMuted`, pressing navigates to the other screen

`RegisterScreen` has a **two-step flow**:
1. **Form step** — name, email, phone, password fields. "Create Account" advances to OTP step.
2. **OTP step** — `Heading2 "Verify Phone"` + 6 individual `TextInput` boxes (44×54px each), auto-focuses next box on input. "Resend OTP" link with 60-second countdown.

Form submission currently calls `navigation.goBack()` as a placeholder (no real auth backend).

---

## profile

**Domain:** User account and booking history.

| File | Purpose |
|---|---|
| `screens/ProfileScreen.tsx` | Avatar, user info, menu items with Lucide icons |
| `screens/MyBookingsScreen.tsx` | Upcoming / Past tabs, booking cards with QR modal |

### ProfileScreen

- Avatar: `LinearGradient` (`react-native-linear-gradient`) from `Colors.accent` to `Colors.accentDim`, 80×80px circle with initials
- User info: name (`Heading2`), email (`Body`), phone (`Body`), "Edit Profile" secondary button
- Menu items — each in a `Card` with a 40×40 icon container (`Colors.surfaceElevated`) and `ChevronRight` icon:
  - My Bookings — `Ticket` icon, `Colors.accent`
  - Offers & Coupons — `Tag` icon, `Colors.violet`
  - Saved Theatres — `MapPin` icon, `Colors.info`
  - Notifications — `Bell` icon, `Colors.warning`
  - Settings — `Settings` icon, `Colors.textSecondary`
  - Help & Support — `HelpCircle` icon, `Colors.textSecondary`
- "Sign Out" text in `Colors.error` at bottom

### MyBookingsScreen

- **Tab switcher**: Upcoming / Past tabs with count badges, active tab has `borderBottomWidth: 2, borderBottomColor: Colors.accent`
- Filter logic:
  - Upcoming: `status === 'confirmed'` AND `showDate >= today`
  - Past: all others

Each **booking card** shows:
- Poster thumbnail (48×72px) on the left, or `Film` icon placeholder
- `borderLeftWidth: 3` accent: confirmed → `Colors.success`, cancelled → `Colors.error`, pending → `Colors.info`
- Metadata rows with icons: `MapPin` (theatre), `Calendar` (date), `Clock` (time), `Monitor` (format)
- Seat pills as `Badge variant="default"`
- Status badge + booking ID + amount
- "View QR" ghost button

**QR modal**: tapping "View QR" opens a `Modal` with `<QRCode value={booking.id} size={150} />` + Caption + close button.

---

## offers

**Domain:** Discount coupons and promotional offers.

| File | Purpose |
|---|---|
| `screens/OffersScreen.tsx` | 2-column grid of offer cards |

Each **offer card**:
- Violet top accent bar: `height: 4, backgroundColor: Colors.violet`
- Offer code: `Heading3`, letter-spaced, with `Badge variant="accent"` for discount amount (top-right)
- Status badge: `Badge label="ACTIVE" variant="success"` or `label="EXPIRED" variant="error"`
- "Copy" ghost button — shows "✓ COPIED" for 2 seconds on press

Offers include: `FIRST50`, `IMAX100`, `WEEKEND20`, `FDFS200`.

---

## Adding a New Feature

1. Create the folder:
   ```
   src/features/<name>/
   ├── components/
   ├── screens/
   ├── types.ts
   └── index.ts
   ```

2. Add mock data to a new or existing service in `src/services/`

3. Add any data fetching to a hook in `src/hooks/` (or a feature-local hook)

4. Register screens in `src/app/navigation/RootNavigator.tsx` or `TabNavigator.tsx`

5. Add param types to `src/types/navigation.ts`

6. Export public surface from `index.ts`:
   ```ts
   export { MyNewScreen } from './screens/MyNewScreen';
   export { MyNewCard } from './components/MyNewCard';
   ```

The rest of the codebase imports only from `@features/<name>` — never from internal paths.
