# FishLog - Branding & Visual Identity Guide

## 🎣 App Identity

**App Name:** FishLog
**Tagline:** Din digitale fiskebog
**Description:** Log dine fangster, del oplevelser, og bliv en bedre fisker

---

## 🎨 Logo

### Concept
Det primære logo er en **stiliseret fiskekrog (fish hook)** med moderne, line-baseret design.

### Design Elements
- **Hook Shape:** J-formet krog med simpel linjeføring
- **Hook Eye:** Cirkel/loop i toppen (hvor linen fæstnes)
- **Hook Point:** Spids i enden med lille barb/modhage
- **Water Waves:** Subtile bølgelinjer under krogen (valgfrit)

### Logo Variants

```tsx
import { Logo, LogoIcon } from '@/components/Logo';

// Full logo with text
<Logo size={48} variant="color" showText={true} />

// Icon only (no text)
<LogoIcon size={32} variant="dark" />

// Variants:
// - 'color': Orange (#FF6B35) - Primary brand variant
// - 'dark': Dark Petrol (#1A3A3A) - For light backgrounds
// - 'light': White (#FFFFFF) - For dark backgrounds
```

### Usage Guidelines

**Color Variant (Orange):**
- Primary brand representation
- Splash screens, onboarding
- Marketing materials
- Social media

**Dark Variant (Petrol):**
- App navigation bar
- Light backgrounds
- Documents, printables

**Light Variant (White):**
- Dark backgrounds
- Overlays
- Photos with dark subjects

---

## 🎨 Color Palette

### Primary Colors

```tsx
import { COLORS } from '@/constants/branding';

// Dark Petrol - Baggrund, store elementer (dybt vand/skov)
COLORS.primary = '#1E3F40'
COLORS.primaryLight = '#2D5555'
COLORS.primaryDark = '#0F2525'
```

**Usage:**
- Navigation bars
- Headers
- Dark backgrounds
- Main UI elements
- Symboliserer dybt vand og skov

### Accent Colors

```tsx
// Vivid Orange - CTA, vigtige ikoner (solnedgang/liv)
COLORS.accent = '#FF7F3F'
COLORS.accentLight = '#FF9966'
COLORS.accentDark = '#E66A2C'
```

**Usage:**
- Call-to-action buttons
- Active states (valgt/aktiv)
- Highlights and badges
- Important notifications
- Logo primary color
- Interaktive ikoner
- Symboliserer solnedgang og liv

### Background Colors

```tsx
// Light Grey - Kort baggrunde, sektioner
COLORS.backgroundLight = '#F0F2F5'
COLORS.background = '#FFFFFF'        // Main white
COLORS.backgroundDark = '#1E3F40'    // Dark petrol
```

**Usage:**
- Card backgrounds
- Section backgrounds
- Clean, neutral areas
- Content containers

### Text Colors

```tsx
// Primary Text - Overskrifter, hovedtekst (mørkegrå)
COLORS.text = '#333333'

// Secondary Text - Undertekster, datoer, metadata
COLORS.textSecondary = '#666666'

// Tertiary Text - Ikke-interaktive ikoner
COLORS.textTertiary = '#999999'

// White Text - På mørke baggrunde
COLORS.textInverse = '#FFFFFF'
```

**Usage:**
- `#333333` - Headings, main content
- `#666666` - Subtitles, dates, metadata
- `#999999` - Inactive icons, less important text
- `#FFFFFF` - Text on dark backgrounds

### Icon Colors

```tsx
// Ikke-interaktive ikoner (mellemgrå)
COLORS.iconDefault = '#999999'

// Interaktive ikoner (valgt/aktiv)
COLORS.iconActive = '#FF7F3F'
```

**Usage:**
- Default icons: `#999999` (inactive/neutral)
- Active/selected icons: `#FF7F3F` (accent orange)

### Secondary Colors

```tsx
// Lyseblå/Turkis - Vand elementer
COLORS.secondary = '#4A90A4'
COLORS.secondaryLight = '#6BACC0'
COLORS.secondaryDark = '#347A8D'
```

**Usage:**
- Water-related elements
- Info messages
- Supporting UI components

### Nature Colors

```tsx
// Skov Grøn (Forest Green)
COLORS.forest = '#2F5233'

// Sand/Beige
COLORS.sand = '#D4C5A9'
```

**Usage:**
- Nature-themed sections
- Outdoor/environment elements
- Warm neutrals

---

## 📐 Typography

### Font Familie

**Primary:** Open Sans (eller Roboto som fallback)
**System Font:** Bruger system fonts for bedre performance og automatisk OS-integration

Valgt for fremragende læsbarhed på digitale skærme og moderne, ren æstetik.

### Typography System

FishLog bruger et præ-defineret typography system med 6 hovedstile:

```tsx
import { TYPOGRAPHY } from '@/constants/branding';

// H1 - Titel/Sidehoved
<Text style={TYPOGRAPHY.styles.h1}>Page Title</Text>
// Open Sans Semibold, 24px, #333333

// H2 - Sektions-overskrifter
<Text style={TYPOGRAPHY.styles.h2}>Section Header</Text>
// Open Sans Semibold, 18px, #333333

// Body Text - Generel tekst
<Text style={TYPOGRAPHY.styles.body}>Main content...</Text>
// Open Sans Regular, 16px, #333333

// Small Text - Metadata, datoer
<Text style={TYPOGRAPHY.styles.small}>15. Januar 2025</Text>
// Open Sans Regular, 14px, #666666

// Button Text - CTA
<Text style={TYPOGRAPHY.styles.button}>Opret Fangst</Text>
// Open Sans Semibold, 18px, #FFFFFF

// Tab Bar Labels
<Text style={TYPOGRAPHY.styles.tabLabel}>Profil</Text>
<Text style={TYPOGRAPHY.styles.tabLabelActive}>Feed</Text>
// Open Sans Regular, 12px, #999999 / #FF7F3F
```

### Typography Hierarchy

| Element | Font | Size | Weight | Color | Usage |
|---------|------|------|--------|-------|-------|
| **H1** | Open Sans | 24px | Semibold (600) | `#333333` | Page titles, main headlines |
| **H2** | Open Sans | 18px | Semibold (600) | `#333333` | Section headers, card titles |
| **Body** | Open Sans | 16px | Regular (400) | `#333333` | Main content, descriptions |
| **Small** | Open Sans | 14px | Regular (400) | `#666666` | Metadata, timestamps, captions |
| **Button** | Open Sans | 18px | Semibold (600) | `#FFFFFF` | CTA buttons, actions |
| **Tab Label** | Open Sans | 12px | Regular (400) | `#999999`/`#FF7F3F` | Navigation labels |

### Dark Background Variants

For tekst på mørke baggrunde (f.eks. Dark Petrol):

```tsx
// H1 on dark background
<Text style={TYPOGRAPHY.styles.h1Dark}>Title</Text>

// H2 on dark background
<Text style={TYPOGRAPHY.styles.h2Dark}>Section</Text>

// Or use textInverse color
<Text style={{
  ...TYPOGRAPHY.styles.body,
  color: COLORS.textInverse,  // #FFFFFF
}}>
  Content on dark background
</Text>
```

### Font Sizes & Weights

```tsx
// Font Sizes
TYPOGRAPHY.fontSize.xs    // 12px - Tab labels
TYPOGRAPHY.fontSize.sm    // 14px - Small text, metadata
TYPOGRAPHY.fontSize.base  // 16px - Body text
TYPOGRAPHY.fontSize.lg    // 18px - H2, buttons
TYPOGRAPHY.fontSize['2xl'] // 24px - H1

// Font Weights
TYPOGRAPHY.fontWeight.regular   // 400 - Body, small, tabs
TYPOGRAPHY.fontWeight.semibold  // 600 - H1, H2, buttons

// Line Heights
TYPOGRAPHY.lineHeight.tight    // 1.25 - Headings
TYPOGRAPHY.lineHeight.normal   // 1.5 - Body text
```

### Complete Example

```tsx
import { TYPOGRAPHY, COLORS } from '@/constants/branding';

<View style={styles.card}>
  {/* H2 Section Header */}
  <Text style={TYPOGRAPHY.styles.h2}>
    Gedde - 3.5 kg
  </Text>

  {/* Small metadata */}
  <Text style={TYPOGRAPHY.styles.small}>
    Fanget 15. Januar 2025, 14:30
  </Text>

  {/* Body content */}
  <Text style={TYPOGRAPHY.styles.body}>
    Fanget ved Silkeborg Søerne med spinner.
  </Text>

  {/* CTA Button */}
  <TouchableOpacity style={{
    backgroundColor: COLORS.accent,
    padding: 16,
    borderRadius: 8,
  }}>
    <Text style={TYPOGRAPHY.styles.button}>
      Se Detaljer
    </Text>
  </TouchableOpacity>
</View>
```

**For mere detaljeret information, se:** `TYPOGRAPHY_GUIDE.md`

---

## 📏 Spacing & Layout

### Spacing Scale (4px grid system)

```tsx
import { SPACING } from '@/constants/branding';

SPACING.xs   // 4px  - Tight spacing, inline elements
SPACING.sm   // 8px  - Small gaps, compact layouts
SPACING.md   // 16px - Default spacing, cards
SPACING.lg   // 24px - Section spacing
SPACING.xl   // 32px - Large sections
SPACING['2xl'] // 48px - Major sections
SPACING['3xl'] // 64px - Hero sections
```

### Border Radius

```tsx
import { RADIUS } from '@/constants/branding';

RADIUS.none  // 0
RADIUS.sm    // 4px  - Small elements
RADIUS.md    // 8px  - Buttons, inputs
RADIUS.lg    // 12px - Cards
RADIUS.xl    // 16px - Large cards
RADIUS['2xl'] // 24px - Modals
RADIUS.full  // 9999px - Pills, circles
```

---

## 🌑 Shadows

```tsx
import { SHADOWS } from '@/constants/branding';

// Subtle shadow for cards
style={[styles.card, SHADOWS.md]}

// Elevated modals
style={[styles.modal, SHADOWS.xl]}
```

Available shadows: `none`, `sm`, `md`, `lg`, `xl`

---

## 🎨 Component Examples

### Primary Button

```tsx
import { COLORS, RADIUS, SPACING, SHADOWS } from '@/constants/branding';

const styles = StyleSheet.create({
  primaryButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    ...SHADOWS.md,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
```

### Card Component

```tsx
const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
});
```

### Header with Logo

```tsx
import { Logo } from '@/components/Logo';
import { COLORS, SPACING } from '@/constants/branding';

<View style={styles.header}>
  <Logo size={32} variant="light" showText={true} />
  <Text style={styles.headerTitle}>FishLog</Text>
</View>

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '700',
  },
});
```

---

## 🖼️ App Icon & Splash Screen

### App Icon Specifications

**iOS:**
- 1024x1024px for App Store
- Uses orange hook on dark petrol background
- Simplified version of main logo

**Android:**
- Adaptive icon (foreground + background)
- Foreground: Orange hook
- Background: Dark petrol gradient

### Splash Screen
- Dark petrol background (#1A3A3A)
- Centered logo (color variant)
- "FishLog" text below logo
- Subtle water wave animation (optional)

---

## 📱 UI Patterns

### Navigation Bar
- Background: `COLORS.primary` (Dark Petrol)
- Text: `COLORS.white`
- Active tab: `COLORS.accent` (Orange)

### Cards
- Background: `COLORS.surface`
- Border radius: `RADIUS.lg`
- Shadow: `SHADOWS.md`
- Padding: `SPACING.md`

### Input Fields
- Border: `COLORS.border`
- Focus: `COLORS.accent`
- Border radius: `RADIUS.md`
- Padding: `SPACING.sm`

### Buttons
- **Primary:** Orange background, white text
- **Secondary:** Dark petrol background, white text
- **Outline:** Transparent bg, primary border
- **Ghost:** Transparent bg, primary text

---

## 🎯 Brand Personality

**Modern & Professional**
- Clean lines, minimal clutter
- Professional feel for serious anglers

**Approachable & Friendly**
- Warm accent color (orange)
- Rounded corners, soft shadows
- Nature-inspired palette

**Outdoor & Adventure**
- Nature colors (forest green, water blue)
- Hook symbolizes fishing tradition
- Connection to water and nature

---

## ✅ Do's and Don'ts

### ✅ Do's
- Use orange accent color for important actions
- Maintain consistent spacing (4px grid)
- Keep logo clean and uncluttered
- Use shadows subtly for depth
- Prefer system fonts for performance

### ❌ Don'ts
- Don't use bright/neon colors outside palette
- Don't stretch or distort the logo
- Don't place logo on busy backgrounds
- Don't mix warm and cool colors randomly
- Don't use multiple accent colors

---

## 📦 File Structure

```
apps/mobile/
├── components/
│   └── Logo.tsx          # Logo component
├── constants/
│   └── branding.ts       # All branding constants
└── assets/
    ├── icon.png          # App icon
    ├── splash.png        # Splash screen
    └── adaptive-icon.png # Android adaptive icon
```

---

## 🚀 Getting Started

```tsx
// Import branding constants
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  RADIUS,
  SHADOWS,
  BRANDING,
} from '@/constants/branding';

// Import logo
import { Logo, LogoIcon } from '@/components/Logo';

// Example usage
export function MyScreen() {
  return (
    <View style={styles.container}>
      <Logo size={64} variant="color" showText={true} />
      <Text style={styles.title}>{BRANDING.appName}</Text>
      <Text style={styles.tagline}>{BRANDING.tagline}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize['4xl'],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primary,
    marginTop: SPACING.md,
  },
  tagline: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
});
```

---

## 📞 Support

For questions or suggestions about branding:
- Review this guide
- Check `components/Logo.tsx` for implementation
- Check `constants/branding.ts` for all values

**Maintain consistency across all screens and components!** 🎣
