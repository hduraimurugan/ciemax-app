# Data Models

Two type layers, kept deliberately separate — see [docs/architecture.md](architecture.md#srctypes):

- **`src/types/api.ts`** — exact, snake_case cinema-hall-api DTOs (`ApiMovie`, `ApiSeat`, `ApiBooking`, `ApiError`, ...). Only `src/services/*` and `src/services/mappers.ts` should ever import from here.
- **`src/types/models.ts`** — camelCase app-facing interfaces documented below. Every screen, hook, and store imports from `@ctypes/models`.

`src/services/mappers.ts` is the *only* file that converts one into the other.

---

## Movie

```ts
interface CastMember {
  name: string;
  initials: string;        // fallback avatar when no photo is available
  character?: string;      // real API data
  profilePath?: string | null;  // resolved TMDB photo URL, or null
}

interface Movie {
  id: string;
  title: string;
  posterUrl: string;
  backdropUrl: string;
  genre: string[];
  rating: number;          // 0–10, from vote_average
  duration: number;        // minutes, from duration_mins
  language: string;        // first entry of the API's language[] array
  releaseDate: string;
  synopsis: string;        // from the API's `description`
  cast: CastMember[];
  director: string;
  format: ShowFormat[];    // always ['2D'] — the API has no per-movie format; real format comes from the show/screen
  isNowShowing: boolean;   // status === 'now_showing'
  isComingSoon: boolean;   // status === 'upcoming'
  trailerUrl?: string | null;
}
```

`mapMovie()` resolves `posterUrl`/`backdropUrl`/cast `profilePath` through `resolveImageUrl()` — bare TMDB paths (`/abc123.jpg`) get `https://image.tmdb.org/t/p/w500` prefixed; full URLs pass through unchanged.

---

## Theatre

```ts
interface Theatre {
  id: string;
  name: string;
  address: string;
  city: string;
  distance?: string;
  amenities?: TheatreAmenity[];  // API has no amenities data — only populated by the mock service
  rating?: number;               // same — API has no rating
  latitude?: number | null;
  longitude?: number | null;
}
```

**Two different mappers feed this one type**, because cinema-hall-api uses different field names per endpoint:

| Endpoint | Fields | Mapper |
|---|---|---|
| `GET /api/user/movies/:movieId/showtimes` | `cinema_hall_id`, `cinema_hall_name`, `cinema_hall_location` | `mapShowtimeHall()` |
| `GET /api/user/movies/location/theatres` | `hall_id`, `hall_name`, `location` | `mapTheatreHall()` |

---

## Show

```ts
type ShowFormat = '2D' | '3D' | 'IMAX' | '4DX';

interface Show {
  id: string;
  movieId: string;
  theatreId: string;
  date: string;             // show_date
  time: string;              // display-formatted via formatShowTime(), e.g. "10:30 AM"
  format: ShowFormat;        // always '2D' — no per-show format field in the API
  language: string;          // language_version
  availableSeats?: number;   // not known without fetching the seat map — mock-only
  totalSeats?: number;       // same
  priceMultiplier?: number;  // mock-only, unused by real pricing (server computes per-seat prices directly)
  screenName?: string;
  rawStartTime?: string;     // API's "HH:MM:SS" — needed verbatim for hold/create-order calls
}
```

Real availability isn't a single number — it's derived from the actual seat map (`GET /api/shows/get/:id`), not stored on the `Show` summary the browse endpoints return.

---

## Seat / SeatLayout

```ts
type SeatStatus  = 'available' | 'selected' | 'held' | 'booked' | 'blocked';
type SeatSection = 'premium' | 'gold' | 'silver' | 'passage';

interface Seat {
  id: string;
  row: string;
  number: number;           // column
  section: SeatSection;
  status: SeatStatus;
  price: number;             // resolved: price_override[type] ?? layout.pricing[type] ?? 0
  label?: string;            // server's "A1" row+column label — what /hold and /create-order key on
  isBlocked?: boolean;
}

interface SeatLayout {
  showId: string;
  sections: { premium: SeatRow[]; gold: SeatRow[]; silver: SeatRow[] };  // grouped by type, for SeatCountModal's per-category stats
  screenPosition?: 'top' | 'bottom';
  aisleAfterColumns?: number[];
  aisleAfterRows?: string[];
  allSeats?: Seat[];         // the FULL grid including passage seats — SeatGrid renders from this, not `sections`
}
```

`SeatGrid` deliberately does **not** render from `sections` — that grouping filters out `passage`-type seats entirely, which would break column alignment for aisle gaps. It builds its own row/section grouping from `allSeats` instead (see `src/features/seats/components/SeatGrid.tsx`).

Server statuses `HELD`/`BOOKED`/`blocked` map to lowercase `held`/`booked`/`blocked`; `selected` is local-only UI state layered on top of `available` by `SeatSelectionScreen`.

### Auto-adjacent selection

Tapping an available seat doesn't just toggle it — `findBestAdjacentSeats()` (`src/features/seats/utils/seatSelection.ts`, ported verbatim from the web app) auto-selects a contiguous block of `seatCount` seats in that row, preferring blocks that contain the tapped seat and extend to the right. See [docs/features.md](features.md#seats) for the full algorithm walkthrough.

---

## Booking

```ts
type BookingStatus = 'confirmed' | 'cancelled' | 'pending';
type RefundStatus  = 'initiated' | 'settled' | 'failed';

interface Booking {
  id: string;
  movieId: string; movieTitle: string;
  theatreId: string; theatreName: string;
  theatreLatitude?: number | null; theatreLongitude?: number | null;
  showId: string; showTime: string; showDate: string; showFormat: ShowFormat;
  seats: Seat[]; seatLabels?: string[];
  subtotal: number;          // total_amount + discount_amount − convenience_fee − gst_amount
  convenienceFee: number; gstAmount?: number;
  offerCode?: string | null; discountAmount?: number;
  totalAmount: number;       // what was actually charged
  bookingDate: string;
  status: BookingStatus;
  paymentId?: string | null;
  posterUrl?: string;
  // Refunds are admin-initiated — there is no customer cancellation endpoint.
  refundStatus?: RefundStatus | null;
  refundAmount?: number | null;
  razorpayRefundId?: string | null;
  refundInitiatedAt?: string | null; refundSettledAt?: string | null;
  refundFailureReason?: string | null;
}
```

A booking is only ever created server-side, by `POST /api/payment/verify` after a successful Razorpay checkout — there is no client-side "create booking" call. `mapBooking()` reconstructs `subtotal` from the other server-provided totals since the API doesn't return it directly.

---

## Offer

```ts
interface Offer {
  id: string; code: string; title: string; description: string;
  discountType: 'percentage' | 'flat';   // mapped from the server's 'percentage' | 'fixed'
  discountValue: number;
  minOrderAmount: number; maxDiscount: number;
  validUntil: string; isActive: boolean;
  isRedeemed?: boolean;      // per-customer — a used one-time offer shows as struck-through
  hallScoped?: boolean; hallName?: string | null;
}
```

Applying a coupon at checkout does **not** reuse this type — `POST /api/offers/validate` takes `{offer_code, show_id, total_amount}` and returns a server-computed discount amount directly (`offersService.CouponValidation`), since the discount can depend on the specific show/hall.

---

## User

```ts
interface User {
  id: string; name: string; email: string; phone?: string; avatarUrl?: string;
  district?: string; state?: string;
  isVerified?: boolean;
  authProviders?: Array<'local' | 'google'>;
  hasPassword?: boolean;     // false for Google-only accounts — drives Change vs Set Password in Profile
  createdAt?: string;
}
```

Populated from `GET /api/customer/me` via `authStore`, not a hardcoded placeholder.

---

## Entity Relationships

```
Movie  1──*  Show  1──1  SeatLayout (fetched, not stored)  1──*  Seat
              │
              │ held via POST /booking/hold, then paid via POST /payment/verify
              ▼
           Booking ──* Seat (snapshot: seat_labels)
              │
              │ belongs to
              ▼
             User

Theatre  1──*  Show
```

---

## Adding a New Domain Type

1. Add the exact server shape to `src/types/api.ts`.
2. Add or extend the camelCase interface in `src/types/models.ts`.
3. Add the mapper function to `src/services/mappers.ts`.
4. Wire it into the relevant `src/services/*.ts` function.
