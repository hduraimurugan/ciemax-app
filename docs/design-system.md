# Design System

The design system is a **custom, hand-crafted layer** that replaces shadcn/ui + Tailwind from the web reference app. All tokens and components are tailored to the cinema booking domain and React Native's styling constraints.

Source: [`src/constants/theme.ts`](../src/constants/theme.ts) and [`src/shared/ui/`](../src/shared/ui/)

---

## Design Principles

1. **Dark-first** — the app is cinema-native: dark environments, high contrast, accent-forward
2. **Token-only styling** — no hardcoded hex values in components; everything references `Colors.*`, `Spacing.*`, etc.
3. **Primitive composition** — complex UI is built by composing small primitives (Typography + Card + Badge), never by writing monolithic styled blobs
4. **Consistent spacing scale** — all padding/margin uses `Spacing.*` multiples of 4px

---

## Color Tokens

All defined in `Colors` in `src/constants/theme.ts`.

### Backgrounds

| Token | Hex | Usage |
|---|---|---|
| `Colors.background` | `#0D0D0D` | Screen root background |
| `Colors.surface` | `#1A1A2E` | Cards, tab bar, bottom sheets |
| `Colors.surfaceElevated` | `#252540` | Inputs, raised cards |
| `Colors.surfaceHighlight` | `#2E2E50` | Hover/pressed elevated state |

### Brand

| Token | Hex | Usage |
|---|---|---|
| `Colors.accent` | `#E50914` | Primary CTA, selected seats, active tab |
| `Colors.accentDim` | `#B20710` | Pressed state of accent |
| `Colors.accentLight` | `rgba(229,9,20,0.15)` | Badge background, selected chip bg |

### Seat Sections

| Token | Hex | Usage |
|---|---|---|
| `Colors.gold` | `#FFD700` | Gold section label, border |
| `Colors.goldDim` | `rgba(255,215,0,0.15)` | Gold badge background |
| `Colors.silver` | `#C0C0C0` | Silver section label |
| `Colors.silverDim` | `rgba(192,192,192,0.15)` | Silver badge background |

### Text

| Token | Hex | Usage |
|---|---|---|
| `Colors.textPrimary` | `#FFFFFF` | Headings, values, active labels |
| `Colors.textSecondary` | `#A0A0A0` | Body text, descriptions |
| `Colors.textMuted` | `#666666` | Captions, placeholders |
| `Colors.textInverse` | `#0D0D0D` | Text on light backgrounds |

### Semantic

| Token | Hex | Usage |
|---|---|---|
| `Colors.success` | `#22C55E` | Confirmed booking, available seats |
| `Colors.error` | `#EF4444` | Errors, housefull seats |
| `Colors.warning` | `#F59E0B` | Fast filling seats |
| `Colors.info` | `#3B82F6` | Theatre distance, info text |

### Seat States

| Token | Hex | Usage |
|---|---|---|
| `Colors.seatAvailable` | `#374151` | Default seat colour |
| `Colors.seatSelected` | `#E50914` | User-selected seat (same as accent) |
| `Colors.seatBooked` | `#1F2937` | Pre-booked (not tappable) |

---

## Spacing Scale

```ts
Spacing.xs  = 4
Spacing.sm  = 8
Spacing.md  = 16
Spacing.lg  = 24
Spacing.xl  = 32
Spacing.xxl = 48
Spacing.xxxl = 64
```

All component padding/margin uses these values. Never use raw numbers in component styles.

---

## Border Radius Scale

```ts
Radius.xs   = 2    // Very subtle rounding (seat items)
Radius.sm   = 4    // Small tags
Radius.md   = 8    // Default (buttons, inputs)
Radius.lg   = 12   // Cards
Radius.xl   = 16   // Large cards
Radius.xxl  = 24   // Bottom sheet top corners
Radius.full = 9999 // Pill / circle
```

---

## Typography Scale

Defined in `FontSize` (px) and exposed as semantic components via `src/shared/ui/Typography.tsx`.

| Component | Size | Weight | Usage |
|---|---|---|---|
| `DisplayText` | 36 | 800 | Hero numbers, booking confirmation |
| `Heading1` | 28 | 700 | Screen titles |
| `Heading2` | 22 | 700 | Section headings |
| `Heading3` | 18 | 600 | Card titles, item names |
| `BodyLarge` | 15 | 500 | Prominent descriptions |
| `Body` | 13 | 400 | Standard body copy |
| `BodySmall` | 12 | 400 | Supporting details |
| `Caption` | 11 | 400 | Metadata, timestamps |
| `Label` | 11 | 600 | UPPERCASE section labels |

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
- Accent border on focus
- Supports `leftIcon` and `rightIcon` nodes

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
Shadow.sm   // elevation: 2   — subtle (labels, chips)
Shadow.md   // elevation: 5   — default (elevated cards)
Shadow.lg   // elevation: 10  — strong (modals, sheets)
```

Apply to any `ViewStyle`:
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
<View style={{ backgroundColor: '#1A1A2E' }} />
```
