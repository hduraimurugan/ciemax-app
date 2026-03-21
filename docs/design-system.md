# Design System

The design system is a **custom, hand-crafted layer** that mirrors the visual identity of the `cinema-hall-users` web app (Tailwind CSS v4 + oklch color tokens), adapted for React Native's styling constraints. All tokens and components are tailored to the cinema booking domain.

Source: [`src/constants/theme.ts`](../src/constants/theme.ts) and [`src/shared/ui/`](../src/shared/ui/)

---

## Design Principles

1. **Dark-first** — cinema-native: dark environments, high contrast, accent-forward
2. **Token-only styling** — no hardcoded hex values in components; everything references `Colors.*`, `Spacing.*`, etc.
3. **Web parity** — color palette, radius scale, font, and utility effects directly mirror `cinema-hall-users/src/index.css`
4. **Primitive composition** — complex UI is built by composing small primitives (Typography + Card + Badge), never by writing monolithic styled blobs
5. **Consistent spacing scale** — all padding/margin uses `Spacing.*` multiples of 4px

---

## Color Tokens

All defined in `Colors` in `src/constants/theme.ts`. The palette is derived from the web app's `oklch` dark-mode tokens converted to hex.

### Backgrounds

| Token | Hex | Web source (`oklch` dark) | Usage |
|---|---|---|---|
| `Colors.background` | `#141A21` | `oklch(0.14 0.01 240)` | Screen root background |
| `Colors.surface` | `#1C2330` | `oklch(0.18 0.01 240)` | Cards, tab bar, bottom sheets |
| `Colors.surfaceElevated` | `#242D3A` | `oklch(0.22 0.01 240)` | Inputs, raised cards |
| `Colors.surfaceHighlight` | `#303D4F` | `oklch(0.30 0.01 250)` | Pressed / hover elevated state |
| `Colors.secondary` | `#343E4E` | `oklch(0.30 0.02 240)` | Cool gray-blue secondary surface |

> All backgrounds carry a subtle navy/blue tint (hue 240–250) — this is the defining characteristic of the cinema-hall-users dark theme vs. a pure black palette.

### Brand

| Token | Hex | Usage |
|---|---|---|
| `Colors.accent` | `#E50914` | Primary CTA, selected seats, active tab (`--primary` cinema red) |
| `Colors.accentDim` | `#B20710` | Pressed state of accent |
| `Colors.accentLight` | `rgba(229,9,20,0.15)` | Badge background, selected chip bg |

### Glass Surfaces

Web equivalent of `.glass-effect { backdrop-filter: blur(12px); background: card/80% }`.

| Token | Value | Usage |
|---|---|---|
| `Colors.glassSurface` | `rgba(28,35,48,0.80)` | Semi-transparent card overlay |
| `Colors.glassBorder` | `rgba(255,255,255,0.08)` | Glass border stroke |

### Seat Sections

| Token | Hex | Usage |
|---|---|---|
| `Colors.gold` | `#FFD700` | Gold section label, border |
| `Colors.goldDim` | `rgba(255,215,0,0.15)` | Gold badge background |
| `Colors.silver` | `#C0C0C0` | Silver section label |
| `Colors.silverDim` | `rgba(192,192,192,0.15)` | Silver badge background |

### Text

| Token | Hex | Web source (`oklch` dark) | Usage |
|---|---|---|---|
| `Colors.textPrimary` | `#F4F6F9` | `oklch(0.98 0.01 240)` | Headings, values — cool off-white |
| `Colors.textSecondary` | `#8895A6` | `oklch(0.68 0.02 250)` | Body text, descriptions |
| `Colors.textMuted` | `#636D7A` | `oklch(0.55 0.02 250)` | Captions, placeholders |
| `Colors.textInverse` | `#141A21` | — | Text on light backgrounds |

### Semantic

| Token | Hex | Usage |
|---|---|---|
| `Colors.success` | `#22C55E` | Confirmed booking, available |
| `Colors.error` | `#EF4444` | Errors, destructive (`oklch(0.7 0.21 27)`) |
| `Colors.warning` | `#F59E0B` | Fast filling |
| `Colors.info` | `#3B82F6` | Distance, info text |

### UI Chrome

| Token | Value | Web source | Usage |
|---|---|---|---|
| `Colors.border` | `rgba(255,255,255,0.10)` | `oklch(1 0 0 / 10%)` | All borders — white hairline |
| `Colors.borderFocus` | `#E50914` | `--ring: --primary` | Input focus ring |
| `Colors.divider` | `rgba(255,255,255,0.08)` | — | Section dividers |
| `Colors.overlay` | `rgba(0,0,0,0.7)` | — | Modal scrim |

### Seat States

| Token | Hex | Usage |
|---|---|---|
| `Colors.seatAvailable` | `#2D3748` | Default seat colour |
| `Colors.seatSelected` | `#E50914` | User-selected seat |
| `Colors.seatBooked` | `#1A2332` | Pre-booked (not tappable) |
| `Colors.seatBookedBorder` | `#2D3748` | Border around booked seat |

---

## Spacing Scale

```ts
Spacing.xs   = 4
Spacing.sm   = 8
Spacing.md   = 16
Spacing.lg   = 24
Spacing.xl   = 32
Spacing.xxl  = 48
Spacing.xxxl = 64
```

All component padding/margin uses these values. Never use raw numbers in component styles.

---

## Border Radius Scale

Aligned to the web app's `--radius: 0.625rem` (10px) base:

```ts
Radius.xs   = 6    // --radius-sm  (base - 4px)
Radius.sm   = 8    // --radius-md  (base - 2px)
Radius.md   = 10   // --radius     (base = 10px)
Radius.lg   = 14   // --radius-xl  (base + 4px)
Radius.xl   = 18   // --radius-2xl (base + 8px)
Radius.xxl  = 22   // --radius-3xl (base + 12px)
Radius.full = 9999 // Pill / circle
```

---

## Typography

### Font Family — JetBrains Mono

Matches the web app's `--font-sans: 'JetBrains Mono Variable', monospace`. Defined in `FontFamily` and applied in all `Typography` components.

```ts
FontFamily.regular   = 'JetBrainsMono-Regular'
FontFamily.medium    = 'JetBrainsMono-Medium'
FontFamily.semibold  = 'JetBrainsMono-SemiBold'
FontFamily.bold      = 'JetBrainsMono-Bold'
FontFamily.extrabold = 'JetBrainsMono-ExtraBold'
```

**Font setup (one-time):**
1. Download static TTF files from [JetBrains/JetBrainsMono releases](https://github.com/JetBrains/JetBrainsMono/releases)
2. Place in `src/assets/fonts/`
3. Run `npx react-native-asset` to link to Android/iOS
4. Rebuild the app

Until the font files are added, React Native falls back to the system font — all other tokens are active immediately.

### Type Scale

Defined in `FontSize` (px) and exposed as semantic components via [`src/shared/ui/Typography.tsx`](../src/shared/ui/Typography.tsx).

| Component | Size | Weight | Font | Usage |
|---|---|---|---|---|
| `DisplayText` | 36 | 800 | ExtraBold | Hero numbers, booking confirmation |
| `Heading1` | 28 | 700 | Bold | Screen titles |
| `Heading2` | 22 | 700 | Bold | Section headings |
| `Heading3` | 18 | 600 | SemiBold | Card titles, item names |
| `BodyLarge` | 15 | 500 | Medium | Prominent descriptions |
| `Body` | 13 | 400 | Regular | Standard body copy |
| `BodySmall` | 12 | 400 | Regular | Supporting details |
| `Caption` | 11 | 400 | Regular | Metadata, timestamps |
| `Label` | 11 | 600 | SemiBold | UPPERCASE section labels |

**Usage:**
```tsx
import { Heading2, Body, Caption } from '@shared/ui';

<Heading2>Select Theatre</Heading2>
<Body>Choose your preferred location</Body>
<Caption color={Colors.textMuted}>2.4 km away</Caption>
```

The optional `color` prop overrides the default colour:
```tsx
<Body color={Colors.accent}>Fast Filling</Body>
```

---

## UI Components

### Button

```tsx
import { Button } from '@shared/ui';

<Button label="Book Tickets" onPress={handleBook} />
<Button label="Cancel" variant="secondary" onPress={handleCancel} />
<Button label="Remove" variant="ghost" size="sm" onPress={handleRemove} />
<Button label="Delete" variant="danger" onPress={handleDelete} />
<Button label="Loading..." loading onPress={() => {}} />
<Button label="Full width" fullWidth onPress={() => {}} size="lg" />
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | required | Button text |
| `onPress` | `() => void` | required | Tap handler |
| `variant` | `primary \| secondary \| ghost \| danger` | `primary` | Visual style |
| `size` | `sm \| md \| lg` | `md` | Height and font size |
| `disabled` | `boolean` | `false` | Disables interaction |
| `loading` | `boolean` | `false` | Shows ActivityIndicator |
| `fullWidth` | `boolean` | `false` | Stretches to container width |
| `leftIcon` | `ReactNode` | — | Icon rendered before label |

---

### Card

```tsx
import { Card } from '@shared/ui';

<Card padding="md">
  <Body>Content here</Body>
</Card>

<Card elevated onPress={handlePress} padding="lg">
  <Heading3>Pressable card</Heading3>
</Card>
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `padding` | `none \| sm \| md \| lg` | `md` | Inner padding |
| `elevated` | `boolean` | `false` | Adds shadow + elevated border |
| `onPress` | `() => void` | — | Makes card pressable |
| `style` | `StyleProp<ViewStyle>` | — | Custom overrides (accepts arrays) |

---

### Badge

```tsx
import { Badge } from '@shared/ui';

<Badge label="IMAX" variant="accent" />
<Badge label="Confirmed" variant="success" />
<Badge label="Cancelled" variant="error" />
<Badge label="GOLD" variant="gold" />
<Badge label="Tamil" variant="default" />
```

**Variants:** `default`, `accent`, `success`, `warning`, `error`, `gold`, `silver`, `premium`

---

### Input

```tsx
import { Input } from '@shared/ui';

<Input
  label="Email"
  value={email}
  onChangeText={setEmail}
  placeholder="you@example.com"
  keyboardType="email-address"
  error={emailError}
/>
```

- Shows a red border + error text when `error` prop is set
- Accent border on focus (`Colors.borderFocus`)
- Supports `leftIcon` and `rightIcon` nodes
- Background: `Colors.surfaceElevated`

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

---

### BottomSheet

```tsx
import { BottomSheet } from '@shared/ui';

<BottomSheet
  visible={showFilters}
  onClose={() => setShowFilters(false)}
  snapHeight={400}>
  <Heading3>Filter Shows</Heading3>
  {/* filter content */}
</BottomSheet>
```

- Spring-animated slide-up using `Animated` API
- Default snap height: 55% of screen
- Drag handle rendered automatically

---

### Loader

```tsx
import { Loader } from '@shared/ui';

// Full screen loading state
<Loader fullScreen message="Loading movies..." />

// Inline (inside a scroll view)
<Loader size="small" />
```

---

## Shadow Tokens

```ts
Shadow.sm   // elevation: 2  — subtle (chips, labels)
Shadow.md   // elevation: 5  — default (elevated cards)
Shadow.lg   // elevation: 10 — strong (modals, sheets)
Shadow.neon // cinema red glow — web .neon-glow equivalent
```

**Neon glow** — apply to primary action elements (confirm buttons, selected state indicators):
```tsx
<View style={[styles.confirmBtn, Shadow.neon]}>
```

Apply any shadow to a `ViewStyle`:
```tsx
<View style={[styles.card, Shadow.md]}>
```

---

## Adding New Tokens

Edit `src/constants/theme.ts` only. Never add one-off values inside component files.

```ts
// ✅ Good
<View style={{ backgroundColor: Colors.surface }} />

// ❌ Bad
<View style={{ backgroundColor: '#1C2330' }} />
```

---

## Web ↔ Native Token Mapping

For reference when porting UI from `cinema-hall-users`:

| Web CSS variable | React Native token |
|---|---|
| `--background` | `Colors.background` |
| `--card` | `Colors.surface` |
| `--input` | `Colors.surfaceElevated` |
| `--muted` | `Colors.surfaceHighlight` |
| `--secondary` | `Colors.secondary` |
| `--primary` | `Colors.accent` |
| `--foreground` | `Colors.textPrimary` |
| `--muted-foreground` | `Colors.textSecondary` |
| `--border` | `Colors.border` |
| `--destructive` | `Colors.error` |
| `.glass-effect` | `Colors.glassSurface` + `Colors.glassBorder` |
| `.neon-glow` | `Shadow.neon` |
| `--radius` (10px base) | `Radius.md` |
| `--font-sans` (JetBrains Mono) | `FontFamily.*` |

---

*Last updated: March 21, 2026 — palette migrated to cinema-hall-users oklch dark tokens; radius realigned to 10px base; FontFamily (JetBrains Mono) and Shadow.neon added.*
