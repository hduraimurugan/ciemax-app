# Data Models

All TypeScript interfaces are defined in [`src/types/models.ts`](../src/types/models.ts). Every layer — services, hooks, store, and UI — imports from `@ctypes/models`.

---

## Movie

Represents a film in the catalogue.

```ts
interface CastMember {
  name: string;
  initials: string;       // e.g. 'RM' for 'R. Menon' — rendered in the Cast avatar circle
}

interface Movie {
  id: string;
  title: string;
  posterUrl: string;       // Portrait image (400×600)
  backdropUrl: string;     // Landscape image (800×450)
  genre: string[];         // e.g. ['Action', 'Sci-Fi']
  rating: number;          // 0–10 (IMDb-style)
  duration: number;        // Total runtime in minutes
  language: string;        // Primary language e.g. 'English'
  releaseDate: string;     // ISO date string  e.g. '2026-07-10'
  synopsis: string;
  cast: CastMember[];
  director: string;
  format: ShowFormat[];    // Formats available: '2D' | '3D' | 'IMAX' | '4DX'
  isNowShowing: boolean;
  isComingSoon: boolean;
}
```

**Notes:**
- `isNowShowing` and `isComingSoon` are mutually exclusive in practice
- `cast` changed from `string[]` to `CastMember[]` for the CineHall redesign — `MovieDetailScreen`'s Cast row renders each member's `initials` in a circular avatar and `name` below it, matching the design (the old plain-string list had no initials to show)
- Mock catalog (`moviesService.ts`) ships 3 movies matching the CineHall design's sample content: `spiderman` (Spider-Man: Brand New Day), `odyssey` (Odyssey) — both now-showing — and `jananayagan` (Jana Nayagan) — coming soon

---

## Theatre

A physical cinema location.

```ts
interface Theatre {
  id: string;
  name: string;            // e.g. 'Grand Vista Cinemas'
  address: string;         // repurposed to hold the screen/format string, e.g. 'Screen 3 · Dolby Atmos'
  city: string;
  distance?: string;       // e.g. '2.4 km' — optional, from user location (unused by ShowtimesScreen)
  amenities: TheatreAmenity[];
  rating: number;          // 0–5 user rating
}

type TheatreAmenity =
  | 'Parking'
  | 'Food Court'
  | 'Wheelchair'
  | 'Dolby'
  | 'IMAX'
  | '4DX';
```

Mock catalog (`theatresService.ts`) ships 3 cinemas matching the CineHall design: `Grand Vista Cinemas`, `Skyline Multiplex` (IMAX), `Cineplex Prime - Forum Mall`, all in Bengaluru.

---

## Show

A specific screening — a movie at a theatre at a date and time.

```ts
type ShowFormat = '2D' | '3D' | 'IMAX' | '4DX';

interface Show {
  id: string;
  movieId: string;
  theatreId: string;
  date: string;            // ISO date  e.g. '2026-08-09'
  time: string;            // Display time  e.g. '10:30 AM'
  format: ShowFormat;
  language: string;        // Language of the screening
  availableSeats: number;  // Real-time availability
  totalSeats: number;
  priceMultiplier: number; // 1.0 for 2D, 1.8 for IMAX
}
```

**Availability states** (derived at read time, never stored — see `theatresService.ts`'s `statusOf()` / `ShowtimesScreen.tsx`):
- `availableSeats === 0` → **soldout** (chip disabled)
- `availableSeats / totalSeats < 0.2` → **fast** (amber "filling fast" chip)
- otherwise → **available** (green chip)

`theatresService.getShowsForMovie()` generates shows programmatically: for each now-showing movie × each of the 3 cinemas × the next 7 dates × that cinema's fixed showtime list, deriving `availableSeats` from the CineHall design's per-slot status (`available`/`fast`/`soldout`). Movies with `isComingSoon: true` have no generated shows.

---

## Seat

An individual seat within a show's layout.

```ts
type SeatStatus  = 'available' | 'selected' | 'booked';
type SeatSection = 'premium' | 'gold' | 'silver';

interface Seat {
  id: string;              // Unique: `{showId}-{row}{number}`  e.g. 's1-A3'
  row: string;             // Row label  e.g. 'A', 'B', 'C'
  number: number;          // Seat number within the row  e.g. 7
  section: SeatSection;
  status: SeatStatus;
  price: number;           // Base price in INR (from SeatPricing config)
}
```

**Section mapping** (from `src/constants/config.ts`), matching the CineHall design's 2-tier layout:
```ts
SeatPricing.premium = 350   // Rows A–C, 12 seats per row (gold-tinted in the UI)
SeatPricing.gold    = 220   // Rows D–J, 12 seats per row — displayed as "STANDARD"
SeatPricing.silver  = 220   // Unused — kept only so SeatSection stays a 3-value union
```

The `silver` tier is intentionally never populated (`seatsService.ts` returns `sections.silver: []`) — the design has only two visual seat tiers (premium/standard). Renaming the `SeatSection` type itself to drop `'silver'` was avoided because `SeatGrid`/`SeatItem`/`SectionHeader` all branch on the 3-value union; leaving `silver` as a always-empty array was the lower-risk option.

**Pre-booked seats** are a fixed list matching the CineHall design exactly (not randomly generated per show):
```ts
BOOKED = ['A3','A4','B7','B8','C1','D5','D6','D7','E10','E11','F2','G9','H4','H5','I8','J1','J2','J12']
```

---

## SeatRow / SeatLayout

Grouping types used by the seat grid.

```ts
interface SeatRow {
  row: string;
  section: SeatSection;
  seats: Seat[];
}

interface SeatLayout {
  showId: string;
  sections: {
    premium: SeatRow[];
    gold: SeatRow[];
    silver: SeatRow[];   // always []
  };
}
```

`SeatLayout` is the complete data structure consumed by `SeatGrid`. It is generated by `seatsService.getSeatLayout(showId)` and stored locally — never in Zustand.

---

## Booking

A completed booking record.

```ts
type BookingStatus  = 'confirmed' | 'cancelled' | 'pending';
type PaymentMethod  = 'upi' | 'card' | 'netbanking' | 'wallet';

interface Booking {
  id: string;              // e.g. 'CH20938' — 'CH' prefix + random 5-digit number, per the design
  movieId: string;
  movieTitle: string;      // Denormalised for display without extra lookups
  theatreId: string;
  theatreName: string;
  showId: string;
  showTime: string;        // e.g. '01:00 PM'
  showDate: string;        // ISO date
  showFormat: ShowFormat;
  seats: Seat[];           // Snapshot of selected seats at booking time
  subtotal: number;        // Sum of seat prices
  convenienceFee: number;  // ₹30 per seat (flat) — pre-computed by bookingStore, not re-derived here
  totalAmount: number;     // subtotal + convenienceFee + GST(18% of subtotal+fee) − discount, pre-computed by bookingStore
  bookingDate: string;     // ISO datetime of when booking was created
  status: BookingStatus;
  paymentMethod?: PaymentMethod;
  posterUrl?: string;      // For display in booking history
}
```

**Note:** `Booking` has no separate `gst`/`discount` fields — those are intermediate values computed by `bookingStore`'s getters (`getGST()`, `getAppliedDiscount()`) and folded into `totalAmount` before `bookingService.createBooking()` is called. See [docs/state-management.md](state-management.md) for the exact formula and why it's computed in exactly one place.

Seat data is snapshotted at booking time. Even if the seat layout changes, the booking record preserves what was booked.

---

## Offer

A discount coupon.

```ts
interface Offer {
  id: string;
  code: string;              // e.g. 'FIRST50'
  title: string;
  description: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;     // % or INR depending on discountType
  minOrderAmount: number;    // Minimum subtotal to apply
  maxDiscount: number;       // Cap on discount amount (for percentage type)
  validUntil: string;        // ISO date
  isActive: boolean;
}
```

`FIRST50` matches the CineHall design exactly: `discountType: 'flat'`, `discountValue: 50`, `minOrderAmount: 0`, `maxDiscount: 50` — i.e. a flat ₹50 off with no minimum order, entered directly in `CheckoutScreen`'s promo-code field (there is no offer-browsing screen in the CineHall design; `OffersScreen` is unrouted, see [docs/navigation.md](navigation.md)).

---

## User

```ts
interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
}
```

Currently UI-only; no auth service is wired. `ProfileScreen` shows a hardcoded sample user ("Aditi Sharma") matching the CineHall design's placeholder content.

---

## Entity Relationships

```
Movie  1──*  Show  1──1  SeatLayout  1──*  SeatRow  1──*  Seat
              │
              │ booked via
              ▼
           Booking ──* Seat (snapshot)
              │
              │ belongs to
              ▼
             User
```

```
Theatre  1──*  Show
```

One show belongs to exactly one movie and one theatre. One booking contains a snapshot of one or more seats from one show.

---

## Adding a New Domain Type

1. Add the interface to `src/types/models.ts`
2. Add mock data to the relevant service in `src/services/`
3. Export from `src/types/index.ts` if not already covered by `export * from './models'`
4. No other files need to change
