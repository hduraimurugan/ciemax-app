# Design System

The design system is implemented from the **CineHall** design (`CineHall.dc.html`, a claude.ai/design prototype) — a 15-screen mobile UI kit with its own dark **and** light palette, typography, and component set. Unlike the previous single-dark-theme version of this app, every token now has two values and the active one is read reactively via a hook, not imported as a static constant.

Source: [`src/constants/theme.ts`](../src/constants/theme.ts), [`src/store/themeStore.ts`](../src/store/themeStore.ts), [`src/hooks/useTheme.ts`](../src/hooks/useTheme.ts), and [`src/shared/ui/`](../src/shared/ui/)

---

## Design Principles

1. **Theme-aware, not dark-only** — every screen and shared component renders correctly in both dark and light mode; there is no hardcoded assumption of a dark background anywhere
2. **Token-only styling** — no hardcoded hex values in components; everything references `colors.*` (from `useTheme()`), `Spacing.*`, etc.
3. **Design parity** — palette, radius scale, and component shapes mirror `CineHall.dc.html`'s `getTheme(mode)` function
4. **Primitive composition** — complex UI is built by composing small primitives (Typography + Card + Badge), never by writing monolithic styled blobs
5. **Consistent spacing scale** — all padding/margin uses `Spacing.*` multiples of 4px

---

## Theming Architecture

### Why a static `Colors` object doesn't work

`StyleSheet.create({ screen: { backgroundColor: Colors.background } })` evaluates `Colors.background` once, at module load, and bakes the resulting string into the style object. Mutating `Colors.background` afterward does not retroactively update already-created styles — a real toggle needs styles **recomputed at render time**.

### The three pieces

1. **`src/constants/theme.ts`** — exports `interface ColorTokens` plus two concrete palettes, `DarkColors: ColorTokens` and `LightColors: ColorTokens`. There is **no flat `Colors` export** — every file that still imports one fails `tsc` immediately, which was used as a build-until-clean checklist while migrating every screen.

2. **`src/store/themeStore.ts`** — a Zustand store (consistent with the existing `bookingStore` convention, no React Context) with `persist` middleware backed by AsyncStorage:
   ```ts
   interface ThemeState {
     mode: 'dark' | 'light';
     colors: ColorTokens;
     toggleTheme: () => void;
     setTheme: (mode: 'dark' | 'light') => void;
   }
   ```
   Only `mode` is persisted (`partialize`); `colors` is re-derived from `mode` on rehydration.

3. **`src/hooks/useTheme.ts`** — the only way components should read colors:
   ```ts
   export const useTheme = () =>
     useThemeStore(s => ({ colors: s.colors, mode: s.mode, toggleTheme: s.toggleTheme }));
   ```

### The conversion pattern

Every themed file wraps its `StyleSheet.create` in a factory function and calls it with `useMemo`:

```tsx
import { ColorTokens } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';

export function Screen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return <View style={styles.screen} />;
}

const makeStyles = (Colors: ColorTokens) =>
  StyleSheet.create({
    screen: { backgroundColor: Colors.background },
  });
```

This is a **pure wrap** — the body of each style object is untouched from the pre-theming version. Applied to all 12 files in `src/shared/ui/` plus every screen.

### Toggling the theme

The only in-app control is **Profile → Dark Mode** (a `Switch` bound to `toggleTheme`). The CineHall design's own theme toggle is dev-tool sidebar chrome (part of the design-preview shell, not an app screen), so this is a considered addition beyond the literal 15 screens, needed to satisfy a real user-facing toggle.

---

## Color Tokens

Both palettes share the same key names (`ColorTokens` interface) so call sites never need renaming — only values change per mode.

### Backgrounds

| Token | Dark | Light | Usage |
|---|---|---|---|
| `background` | `#0C0D11` | `#F9FAFC` | Screen root background |
| `surface` | `#15171D` | `#F1F2F5` | Cards, bottom sheets (the tab bar was transparent since `cca6591`) |
| `surfaceElevated` | `#1E2128` | `#E7E9EE` | Inputs, raised cards |
| `surfaceHighlight` | `#292D36` | `#DDE0E6` | Pressed / hover elevated state |
| `secondary` | `#363B46` | `#DEE1EA` | Cool gray-blue secondary surface, booked seats |

*Dark values were deepened in commit `9887938` for a richer, more cinematic contrast.*

### Brand

| Token | Dark | Light | Usage |
|---|---|---|---|
| `accent` | `#E6474E` | `#D93C43` | Primary CTA, selected seats, active tab |
| `accentDim` | `#C93940` | `#B32E34` | Pressed state of accent |
| `accentLight` | `rgba(230,71,78,0.45)` | `rgba(217,60,67,0.25)` | Glow shadows, badge background |

### Launcher branding (platform)

The home-screen label and launcher icons are platform assets, independent of the in-app `ColorTokens`:

| Asset | Value |
|---|---|
| Display name | **Cinemax App** — `app.json` `displayName`, Android `app_name` ([`android/app/src/main/res/values/strings.xml`](../android/app/src/main/res/values/strings.xml)), iOS `CFBundleDisplayName` ([`ios/MyApp/Info.plist`](../ios/MyApp/Info.plist)) |
| Android adaptive icon | [`mipmap-anydpi-v26/ic_launcher.xml`](../android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml) / `ic_launcher_round.xml` — background `#FAB90B` ([`values/colors.xml`](../android/app/src/main/res/values/colors.xml)) + foreground asset at every density (`mipmap-{m,h,x,xx,xxx}hdpi/ic_launcher_foreground.png`); legacy launcher PNGs replaced alongside |
| iOS AppIcon | Full [`AppIcon.appiconset`](../ios/MyApp/Images.xcassets/AppIcon.appiconset) — 20/29/40/60 pt @2x/@3x + 1024×1024 marketing icon |

Added in commit `0e9de4b` (rebrand to **Cinemax App** + launcher icons for both platforms).

### Glass Surfaces

| Token | Dark | Light | Usage |
|---|---|---|---|
| `glassSurface` | `rgba(31,32,36,0.80)` | `rgba(241,242,245,0.85)` | Semi-transparent card overlay (auth screens) |
| `glassBorder` | `rgba(255,255,255,0.08)` | `rgba(0,0,0,0.08)` | Glass border stroke |

### Media (theme-invariant)

Added in commit `9887938`. These tokens are **identical in both modes** — for content that always sits on top of photographic imagery (hero backdrops, banner "AD" labels) or a fixed white surface (QR-code frames) and must never adapt to light/dark mode:

| Token | Value | Usage |
|---|---|---|
| `textOnMedia` | `#FFFFFF` | Text/icons on imagery (`#fff` → `textOnMedia`) |
| `mediaScrim` | `rgba(10,11,14,0.55)` | Semi-transparent scrim behind hero action buttons / badges |
| `mediaGlassSurface` | `rgba(255,255,255,0.18)` | Frosted pill/glass fill over imagery (hero play button, progress-dot track) |
| `mediaGlassBorder` | `rgba(255,255,255,0.5)` | Border of those glass fills |

### Seat Sections

| Token | Dark | Light | Usage |
|---|---|---|---|
| `gold` | `#D9A24A` | `#D9A24A` | Premium seat section, star ratings |
| `goldDim` | `rgba(217,162,74,0.15)` | same | Premium badge/seat background |
| `silver` | `#C0C0C0` | `#9AA0AC` | Unused seat tier (kept for type compatibility) |
| `silverDim` | `rgba(192,192,192,0.15)` | `rgba(154,160,172,0.15)` | — |

### Text

| Token | Dark | Light | Usage |
|---|---|---|---|
| `textPrimary` | `#F8F9FB` | `#1D1F23` | Headings, values |
| `textSecondary` / `textMuted` | `#A6A9B4` | `#6B6F7A` | Body text, captions, placeholders |
| `textInverse` | `#16171B` | `#F9FAFC` | Text on colored/inverse surfaces |

### Semantic

| Token | Dark | Light | Usage |
|---|---|---|---|
| `success` | `#4FB878` | `#4FB878` | Confirmed booking, available seat/showtime |
| `error` | `#F2564A` | `#F2564A` | Errors, destructive, cancel actions |
| `warning` | `#E3A75E` | `#E3A75E` | Fast-filling showtime |
| `info` | `#6C9CEB` | `#6C9CEB` | Info text, format badges |

Each semantic color has a matching **dim** background token (`successDim`, `errorDim`, `warningDim`, `infoDim`, plus `emeraldDim`/`violetDim`) for tinted pill/chip backgrounds. `warningDim` (`rgba(227,167,94,0.15)`) and `infoDim` (`rgba(108,156,235,0.15)`, both modes) replaced the hardcoded `rgba` values in `Badge`, `CountdownTimer`, and `ShowtimesScreen`'s fast-filling chip in commit `9887938`.

### UI Chrome

| Token | Dark | Light | Usage |
|---|---|---|---|
| `border` | `rgba(255,255,255,0.10)` | `#CCCFD6` | All borders — hairline |
| `borderFocus` | `#E6474E` | `#D93C43` | Input focus ring (= accent) |
| `divider` | `rgba(255,255,255,0.08)` | `#E2E4E9` | Section dividers |
| `overlay` | `rgba(0,0,0,0.7)` | `rgba(0,0,0,0.5)` | Modal scrim |
| `navbarBorder` | `rgba(255,255,255,0.06)` | `rgba(0,0,0,0.06)` | Header bottom border (subtler than `border`) |

### Seat States

| Token | Dark | Light | Usage |
|---|---|---|---|
| `seatAvailable` | `#26282E` | `#E7E9EE` | Default seat colour (= surfaceElevated) |
| `seatSelected` | `#E6474E` | `#D93C43` | User-selected seat (= accent) |
| `seatBooked` | `#383A42` | `#DEE1EA` | Pre-booked (not tappable, = secondary) |
| `seatBookedBorder` | `#383A42` | `#DEE1EA` | Border around booked seat |

### Extended Palette

| Token | Dark | Light | Usage |
|---|---|---|---|
| `star` | `#D9A24A` | `#D9A24A` | Star rating icon fill (= gold) |
| `emerald` | `#4FB878` | `#4FB878` | Legacy `Button variant="emerald"` (= success) |
| `violet` | `#A97EE0` | `#A97EE0` | Offer card accent bar and badge |
| `zinc` | `#A6A9B4` | `#6B6F7A` | Seat pill text/border on ticket (= textMuted) |
| `zincSurface` | `#26282E` | `#E7E9EE` | Seat pill background on ticket |

---

## Spacing Scale

```ts
Spacing.xs          = 4
Spacing.sm          = 8
Spacing.md          = 16
Spacing.lg          = 24
Spacing.xl          = 32
Spacing.xxl         = 48
Spacing.xxxl        = 64
Spacing.tabBarHeight = 64   // Bottom tab bar's own content height — the rendered bar is
                            // taller than this on gesture-nav devices; see note below
```

Not theme-dependent — imported directly from `@constants/theme` as before.

`TabNavigator`'s `tabBarStyle.height`/`paddingBottom` add `useSafeAreaInsets().bottom` on top of `Spacing.tabBarHeight`/`Spacing.xs`, so the bar clears the OS gesture indicator instead of sitting under it. A fixed `tabBarStyle.height` opts the bar out of React Navigation's own safe-area handling, which is why this has to be done manually rather than left to the default. Since `cca6591` the tab bar uses `backgroundColor: 'transparent'` with `elevation: 0` / `shadowOpacity: 0` / `shadowColor: 'transparent'` — no elevated surface or drop shadow, so the bar visually recedes behind the screen content. Any screen that pads its own scroll content to clear the tab bar (none currently do) should add the same `insets.bottom`, not just `Spacing.tabBarHeight`.

---

## Border Radius Scale

```ts
Radius.xs   = 6
Radius.sm   = 8
Radius.md   = 10
Radius.lg   = 14
Radius.xl   = 18
Radius.xxl  = 22
Radius.full = 9999 // Pill / circle
```

---

## Typography

### Font Family — JetBrains Mono + system fallback

The CineHall design pairs **JetBrains Mono** (headings, mono numerals, prices) with **Inter** (body text). Inter `.ttf` files are not linked in this project, so the implementation makes a deliberate trade-off:

- **Headings/labels/mono numerals/prices** — `FontFamily.*` still resolves to JetBrains Mono, exactly as before
- **Body text** (`Body`, `BodySmall`, `BodyLarge`, `Caption` in `Typography.tsx`) — the explicit `fontFamily` was dropped, so React Native falls back to the platform system sans (San Francisco / Roboto), which reads visually close to Inter with zero new native linking or rebuild step

```ts
FontFamily.regular   = 'JetBrainsMono-Regular'
FontFamily.medium    = 'JetBrainsMono-Medium'
FontFamily.semibold  = 'JetBrainsMono-SemiBold'
FontFamily.bold      = 'JetBrainsMono-Bold'
FontFamily.extrabold = 'JetBrainsMono-ExtraBold'
```

**If you later add Inter:** drop the `.ttf` files into `src/assets/fonts/`, add `FontFamily.interRegular` (etc.) entries, run `npx react-native-asset`, and swap the relevant lines back into `Typography.tsx`'s `body`/`bodySmall`/`bodyLarge`/`caption` styles. No architecture change is required.

### Type Scale

Defined in `FontSize` (px) and exposed as semantic components via [`src/shared/ui/Typography.tsx`](../src/shared/ui/Typography.tsx).

| Component | Size | Weight | Font | Usage |
|---|---|---|---|---|
| `DisplayText` | 36 | 800 | JetBrains Mono ExtraBold | Hero numbers, booking confirmation |
| `Heading1` | 28 | 700 | JetBrains Mono Bold | Screen titles |
| `Heading2` | 22 | 700 | JetBrains Mono Bold | Section headings |
| `Heading3` | 18 | 600 | JetBrains Mono SemiBold | Card titles, item names |
| `BodyLarge` | 15 | 500 | System sans | Prominent descriptions |
| `Body` | 13 | 400 | System sans | Standard body copy |
| `BodySmall` | 12 | 400 | System sans | Supporting details |
| `Caption` | 11 | 400 | System sans | Metadata, timestamps |
| `Label` | 11 | 600 | JetBrains Mono SemiBold | UPPERCASE section labels |

**Usage:**
```tsx
import { Heading2, Body, Caption } from '@shared/ui';

<Heading2>Select Showtime</Heading2>
<Body>Choose your preferred cinema</Body>
<Caption color={colors.textMuted}>2.4 km away</Caption>
```

The optional `color` prop overrides the default colour — pull it from `useTheme().colors`, not a static import:
```tsx
const { colors } = useTheme();
<Body color={colors.accent}>Fast Filling</Body>
```

---

## Icons

Icons use **`lucide-react-native`** — a React Native port of Lucide Icons backed by `react-native-svg`.

```tsx
import { ArrowLeft, Search, Ticket, Heart } from 'lucide-react-native';
const { colors } = useTheme();

// Basic usage
<ArrowLeft size={18} color={colors.textPrimary} />

// Fill state (Heart, Star)
<Heart size={20} color={colors.accent} fill={isFav ? colors.accent : 'none'} />
<Star size={12} color={colors.star} fill={colors.star} />
```

**Standard sizes:**
| Context | Size |
|---|---|
| Back buttons / header | `18` |
| Header toolbar (Search, Bell) | `20` |
| Tab bar | `22` (managed by React Navigation) |
| Menu items | `18–20` |
| Meta rows (Caption-level) | `11–14` |

**Metro config note:** Metro 0.80+ picks up `package.json` `exports.browser` which points to an ESM-only build of `lucide-react-native` that Hermes cannot process. `metro.config.js` sets `resolver.unstable_enablePackageExports: false` to force Metro to use the `main` (CJS) field instead.

**Tab bar icons** must be defined as **named functions** outside the navigator component to avoid the `react/no-unstable-nested-components` lint warning:

```tsx
// ✅ Correct — named function outside the component
function HomeIcon({ color, size }: { color: string; size: number }) {
  return <Home color={color} size={size} />;
}
// Used as:
options={{ tabBarIcon: HomeIcon }}

// ❌ Incorrect — inline arrow function triggers lint warning
options={{ tabBarIcon: ({ color, size }) => <Home color={color} size={size} /> }}
```

---

## Onboarding Illustrations

The onboarding artwork is implemented as local `react-native-svg` scenes in `OnboardingScreen.tsx`, not as remote images. Each slide has a distinct cinema visual — marquee/posters, a selected seat map, and a QR e-ticket — while the accent, surface, border, and gold tokens follow the active theme. Keep new onboarding artwork vector-based so the screen remains offline-safe and scales cleanly across device sizes.

---

## UI Components

All 14 components in `src/shared/ui/` follow the `useTheme()` + `makeStyles(colors)` pattern described above. The last two — `ScreenHeader` and `EmptyState` — were added in commit `382310a` to replace hand-rolled per-screen chrome.

### Button

```tsx
import { Button } from '@shared/ui';

<Button label="Book Tickets" onPress={handleBook} />
<Button label="Cancel" variant="secondary" onPress={handleCancel} />
<Button label="Remove" variant="ghost" size="sm" onPress={handleRemove} />
<Button label="Delete" variant="danger" onPress={handleDelete} />
<Button label="Proceed" variant="emerald" onPress={handleContinue} />
<Button label="Loading..." loading onPress={() => {}} />
<Button label="Full width" fullWidth onPress={() => {}} size="lg" />
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | required | Button text |
| `onPress` | `() => void` | required | Tap handler |
| `variant` | `primary \| secondary \| ghost \| danger \| emerald` | `primary` | Visual style |
| `size` | `sm \| md \| lg` | `md` | Height and font size |
| `disabled` | `boolean` | `false` | Disables interaction |
| `loading` | `boolean` | `false` | Shows ActivityIndicator |
| `fullWidth` | `boolean` | `false` | Stretches to container width |
| `leftIcon` | `ReactNode` | — | Icon rendered before label |

Enriched in commit `382310a`: `primary` renders a diagonal `LinearGradient` (`colors.accent` → `colors.accentDim`) behind its label (clipped to the border radius), and the `primary`/`danger`/`emerald` variants get a neutral shadow (`Shadow.sm` for `size="sm"`, `Shadow.md` for `md`/`lg`). `secondary`/`ghost` stay flat, and shadows are skipped while `disabled`/`loading` so they don't look muddy at low opacity.

---

### Card

```tsx
import { Card } from '@shared/ui';

<Card padding="md">
  <Body>Content here</Body>
</Card>

<Card variant="glass" elevated onPress={handlePress} padding="lg">
  <Heading3>Pressable glass card</Heading3>
</Card>
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `default \| glass \| neon` | `default` | Visual style |
| `padding` | `none \| sm \| md \| lg` | `md` | Inner padding |
| `elevated` | `boolean` | `false` | Adds shadow + elevated border |
| `onPress` | `() => void` | — | Makes card pressable |
| `style` | `StyleProp<ViewStyle>` | — | Custom overrides (accepts arrays) |

- `glass` — uses `colors.glassSurface` background and `colors.glassBorder` border
- `neon` — applies `makeNeonShadow(colors)` (glow color follows the active `accent`, not hardcoded red)

Since commit `382310a` every `Card` gets a baseline `Shadow.sm` (no longer opt-in); `elevated` overrides it with `Shadow.md`, and `neon` uses `makeNeonShadow`. Because a shadow and `overflow:'hidden'` (needed to clip content to the rounded corners) can't coexist on the same iOS view — `overflow:'hidden'` clips the shadow away — `Card` now renders the shadow on an **outer wrapper** view while background/border/padding/clipping live on an **inner content** view.

---

### Badge

```tsx
import { Badge } from '@shared/ui';

<Badge label="IMAX" variant="accent" />
<Badge label="Confirmed" variant="success" />
<Badge label="Cancelled" variant="error" />
<Badge label="PREMIUM" variant="gold" />
<Badge label="Tamil" variant="default" />
<Badge label="Offer" variant="violet" />
<Badge label="A4" variant="zinc" />
```

**Variants:** `default`, `accent`, `success`, `warning`, `error`, `gold`, `silver`, `premium`, `violet`, `zinc`, `info`

Enriched in commit `382310a`: every variant now has a `1px` border in its **solid** token color (`success`→`Colors.success`, `warning`→`Colors.warning`, `gold`→`Colors.gold`, …) while the background stays on the existing dim token. A new optional `glow?: boolean` prop adds a soft shadow in the variant's own color — deliberately reserved for a single standout badge (used by `OffersScreen`'s gold "HALL OFFER" badge), not every instance.

---

### Input

```tsx
import { Input } from '@shared/ui';

<Input
  label="EMAIL ADDRESS"
  value={email}
  onChangeText={setEmail}
  placeholder="you@example.com"
  keyboardType="email-address"
  error={emailError}
/>
```

- Shows a red border + error text when `error` prop is set
- Accent border on focus (`colors.borderFocus`) — **border-only, intentionally no glow**
- Supports `leftIcon` and `rightIcon` nodes
- Background: `colors.surfaceElevated`

A focus glow was considered but deliberately dropped in `382310a`: on Fabric (new architecture) toggling any shadow prop on a `TextInput`'s direct parent promotes it to a new native layer at the moment it gains focus, which remounts the field mid-focus and kicks focus to the next input (reproduced on-device; see the comment in `src/shared/ui/Input.tsx`). Errors also stay border-only — errors shouldn't glow.

---

### ScreenHeader

Shared screen chrome that replaces the hand-rolled back-button headers (added in `382310a`; adopted by `TheatresScreen`, `ShowtimesScreen`, `CheckoutScreen`, `PaymentScreen`, `TicketDetailScreen`, `OffersScreen`, `ChangePasswordScreen`, `SetPasswordScreen`, and `NotificationsScreen`).

```tsx
import { ScreenHeader } from '@shared/ui';

<ScreenHeader title="My Bookings" onBack={() => navigation.goBack()} />
<ScreenHeader title="Notifications" rightLabel="Mark all read" onRightPress={markAllRead} />
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `string` | required | Heading text — `Heading2`, or `Heading3` when `subtitle` is given |
| `subtitle` | `string` | — | Optional second line under the title |
| `onBack` | `() => void` | — | Renders the 34×34 back button (`surfaceElevated` bg + `Shadow.sm`) |
| `backLoading` | `boolean` | `false` | Renders an `ActivityIndicator` instead of the back arrow (used by `CheckoutScreen` while releasing seats) |
| `rightIcon` / `rightLabel` / `onRightPress` | | — | Optional right-aligned action |
| `rightSlot` | `ReactNode` | — | Arbitrary right content (e.g. `CheckoutScreen`'s countdown) — takes precedence over `rightIcon`/`rightLabel` |
| `variant` | `'default' \| 'onMedia'` | `'default'` | `onMedia` swaps to `mediaGlassSurface`/`mediaGlassBorder`/`textOnMedia` for headers over photos |

`MovieDetailScreen` keeps its bespoke hero header (extra heart/share/play controls), and `OtpScreen`/`ForgotPasswordScreen` use `AuthCard` instead of this component.

---

### EmptyState

Standardized empty/error states (added in `382310a`; adopted by `MyBookingsScreen`, `NotificationsScreen`, `OffersScreen`, `TheatresScreen`, `ShowtimesScreen`, and `SearchScreen`).

```tsx
import { EmptyState } from '@shared/ui';

<EmptyState
  icon={<Ticket size={48} color={colors.textMuted} />}
  title="No bookings yet"
  message="Bookings you make will appear here"
  actionLabel="Find shows"
  onAction={browse}
/>
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `icon` | `ReactNode` | required | Icon — standardized to 48px across the migrated screens |
| `title` | `string` | — | Optional `Heading3` heading |
| `message` | `string` | required | `Body` copy |
| `actionLabel` / `onAction` / `actionIcon` | | — | Optional `Button` (inherits the enriched gradient/shadow automatically) |
| `fill` | `boolean` | `true` | `flex:1` centered full-screen state; `false` for an inline state (e.g. `SearchScreen`'s no-results, which sits below the search bar) |

---

### AdBanner

Auto-playing image carousel.

```tsx
import { AdBanner } from '@shared/ui';

<AdBanner imageUrls={['https://...', 'https://...', 'https://...']} />
```

- Optional `width` controls the carousel viewport and each page's snap distance; it defaults to the device width
- Aspect ratio 3.5:1 (height = `Math.round(width / 3.5)`)
- Autoplay every 3 seconds, loops
- Dot indicators below the image
- Displays an `AD` label in the top-right corner
- Gracefully handles 0–5 images (hides when empty)

On `MoviesScreen`, the banner passes the content width (`deviceWidth - Spacing.lg * 2`) and the wrapper uses matching horizontal margins so its edges align with the hero card and movie sections.

Note: `MoviesScreen`'s CineHall-style hero banner (rating/tag/title overlay + segmented progress-bar dots) is a **separate**, screen-local implementation, not `AdBanner` — see [docs/features.md](features.md#movies).

---

### CountdownTimer

Pulsing countdown, now built on the shared `useCountdown` hook.

```tsx
import { CountdownTimer } from '@shared/ui';

<CountdownTimer
  initialSeconds={300}
  onExpire={() => navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] })}
/>
```

- Displays `MM:SS` format
- Text color: `colors.warning` (amber) when > 120s remaining, `colors.error` (red) when ≤ 120s
- Pulses (opacity animation) when in the red zone
- Calls `onExpire` when it reaches `00:00`
- Used with `initialSeconds={300}` on `CheckoutScreen` (5-minute seat hold) and with the standalone `useCountdown` hook (not this component) for `OtpScreen`'s 30-second resend timer

---

### QRCode

Thin wrapper around `react-native-qrcode-svg`.

```tsx
import { QRCode } from '@shared/ui';

<QRCode value="CH20938" size={90} />
```

- Default size: 90px
- Colors follow the active theme (`colors.textPrimary` squares on `colors.surface` background)
- Falls back to the literal string `'CINEHALL'` if `value` is falsy
- Used on `BookingSuccessScreen` (90px) and `TicketDetailScreen` (160px)

---

### Modal

```tsx
import { Modal } from '@shared/ui';

<Modal visible={showModal} onClose={() => setShowModal(false)} title="Confirm">
  <View style={{ padding: 16 }}>
    <Body>Are you sure you want to cancel?</Body>
    <Button label="Yes, Cancel" onPress={handleCancel} />
  </View>
</Modal>
```

- Tap outside (overlay) dismisses
- `title` renders a header row with a divider
- No longer used by `MyBookingsScreen` (its QR modal was replaced by `TicketDetailScreen`) — still available for other use cases

---

### BottomSheet

```tsx
import { BottomSheet } from '@shared/ui';

<BottomSheet
  visible={showFilters}
  onClose={() => setShowFilters(false)}
  snapHeight={400}>
  <Heading3>Filter Shows</Heading3>
</BottomSheet>
```

- Spring-animated slide-up using the `Animated` API
- Default snap height: 55% of screen
- Drag handle rendered automatically

---

### Loader

```tsx
import { Loader } from '@shared/ui';

<Loader fullScreen message="Loading movies..." />
<Loader size="small" />
```

---

### Skeleton

Shimmer loading placeholders shown while data fetches, built from `Skeleton.tsx` in `src/shared/ui/`. A single module-scope Reanimated shared value drives every shimmer band on screen (and across screens), so N skeletons cost one UI-thread animation and stay perfectly in phase with each other.

```tsx
import { Skeleton, SkeletonText, SkeletonCircle, SkeletonPoster, SkeletonGroup } from '@shared/ui';

<SkeletonGroup label="Loading cinemas">
  <SkeletonPoster />
  <SkeletonText lines={3} />
  <SkeletonCircle size={40} />
</SkeletonGroup>
```

| Component | Purpose |
|---|---|
| `Skeleton` | Base block — themed fill (`colors.surfaceElevated`) with a `surfaceHighlight` band sweeping across; `width`/`height`/`radius` props |
| `SkeletonText` | Stacked bars mimicking wrapped text; the last line defaults shorter (`lines`, `lastLineWidth`, `lineHeight`, `gap`) |
| `SkeletonCircle` | Circular placeholder for avatars / cast photos |
| `SkeletonPoster` | Mirrors `MovieCard.tsx`'s 128×184 poster + two text lines exactly |
| `SkeletonGroup` | Screen-root wrapper marking the whole block as a single accessibility loading region (`progressbar` role, `label` prop) |

The shimmer loop starts once at module load (a `withRepeat`/`withTiming` driven `makeMutable`), so there is nothing to start/stop per component. Screens render a skeleton only while there is **no data at all** — a background revalidation of already-visible data never flashes one (see [docs/features.md](features.md) and [`queryCache`](architecture.md#srcservicesquerycachets)).

---

## SafeAreaView

Always import `SafeAreaView` from `react-native-safe-area-context`, **never** from `react-native`. The built-in `SafeAreaView` is deprecated in RN 0.84 (New Architecture / Fabric) and causes a `TypeError: Cannot call a class as a function` crash at the `ReadOnlyText` level.

```tsx
// ✅ Correct
import { SafeAreaView } from 'react-native-safe-area-context';

// ❌ Incorrect — deprecated, crashes on Fabric
import { SafeAreaView } from 'react-native';
```

`App.tsx` wraps the entire app in `<SafeAreaProvider>` from `react-native-safe-area-context`, which is required for `SafeAreaView` to work.

The four tab screens — `MoviesScreen`, `SearchScreen`, `MyBookingsScreen`, and `ProfileScreen` — pass `edges={['top', 'left', 'right']}` (`cca6591`): they exclude the **bottom** edge because `TabNavigator`'s tab bar already owns the bottom inset (`useSafeAreaInsets().bottom`). This clears the status bar/notch without double-padding above the tab bar.

---

## Shadow Tokens

```ts
Shadow.sm   // elevation: 3  — subtle (chips, labels), not theme-dependent
Shadow.md   // elevation: 6  — default (elevated cards), not theme-dependent
Shadow.lg   // elevation: 12 — strong (modals, sheets), not theme-dependent
```

`sm`/`md`/`lg` are plain black shadows and can be spread directly. The design's "neon glow" depends on the active `accent` color, so it's computed per-render instead of being a static export:

```ts
import { makeNeonShadow } from '@constants/theme';

const { colors } = useTheme();
<View style={[styles.confirmBtn, makeNeonShadow(colors)]}>
```

Commit `9887938` deepened all three neutral shadows (larger offset/opacity/radius, `elevation` 2→3 / 5→6 / 10→12) and extended `makeNeonShadow` usage to `SeatItem`'s selected seat and `MovieDetailScreen`'s bottom CTA bar.

---

## Adding New Tokens

Edit `src/constants/theme.ts` only — add the key to `ColorTokens` and give it a value in **both** `DarkColors` and `LightColors`. Never add one-off hex values inside component files.

```ts
// ✅ Good
const { colors } = useTheme();
<View style={{ backgroundColor: colors.surface }} />

// ❌ Bad
<View style={{ backgroundColor: '#1C2330' }} />
```

---

## Source: CineHall Design Tokens

For reference, the raw tokens from `CineHall.dc.html`'s `getTheme(mode)` (mapped onto `ColorTokens` above):

**Dark:** `bg:#0C0D11, surface:#15171D, surfaceAlt:#1E2128, fg:#F8F9FB, muted:#A6A9B4, border:rgba(255,255,255,0.10), primary:#E6474E, primaryGlow:rgba(230,71,78,0.45), secondary:#363B46, destructive:#F2564A, success:#4FB878, warning:#E3A75E, info:#6C9CEB, offer:#A97EE0, gold:#D9A24A`

**Light:** `bg:#F9FAFC, surface:#F1F2F5, surfaceAlt:#E7E9EE, fg:#1D1F23, muted:#6B6F7A, border:#CCCFD6, primary:#D93C43, primaryGlow:rgba(217,60,67,0.25), secondary:#DEE1EA, destructive:#F2564A, success:#4FB878, warning:#E3A75E, info:#6C9CEB, offer:#A97EE0, gold:#D9A24A`

---

*Last updated after the CineHall redesign — replaced the single static dark `Colors` object with `DarkColors`/`LightColors` + `useTheme()`, added the Profile Dark Mode toggle, dropped the Inter body-font requirement in favor of the system sans, and switched the neon shadow to be computed per-theme via `makeNeonShadow`.*

*Later: rebranded the launcher to **Cinemax App** — display name in `app.json` / Android strings / iOS `Info.plist`, Android adaptive launcher icons (`#FAB90B` background) and the full iOS `AppIcon` set (commit `0e9de4b`).*

*Later still: theme consistency pass (`9887938`) — deepened the dark backgrounds, added the `warningDim`/`infoDim` and media (`textOnMedia`/`mediaScrim`/`mediaGlassSurface`/`mediaGlassBorder`) tokens, swapped remaining hardcoded hex/`rgba` values for tokens across screens and `shared/ui` (movie/seat/profile/theatres/booking components), switched hero backdrops from a flat overlay to a `transparent → overlay` `LinearGradient`, and deepened the neutral shadows. `razorpayCheckoutHtml`'s WebView background is kept in sync with the dark `background`.*

*Then: the shared-UI refactor (`382310a`) — new `ScreenHeader` and `EmptyState` primitives plus feature-local `AuthCard` (Login/Register/OTP/ForgotPassword) and `TheatreCard` (Theatres/Showtimes); `Button` gained a `primary` gradient + shadows on `primary`/`danger`/`emerald`; every `Card` now carries a baseline `Shadow.sm` (restructured into outer-shadow/inner-content views to fix the iOS `overflow:'hidden'` conflict); `Badge` variants got `1px` solid borders and an opt-in `glow` prop; `Input` focus was deliberately kept border-only (Fabric remount-on-focus bug, documented in `Input.tsx`).*
