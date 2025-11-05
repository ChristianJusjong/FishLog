# FishLog - Typography Guide

## 📝 Font Familie

**Primary Font:** Open Sans
**Fallback:** Roboto, System Sans-Serif

**Valgt for:**
- Fremragende læsbarhed på digitale skærme
- Moderne, ren æstetik
- God support på tværs af platforme

---

## 📏 Typography Skala

### H1 - Titel/Sidehoved

```tsx
import { TYPOGRAPHY } from '@/constants/branding';

<Text style={TYPOGRAPHY.styles.h1}>
  Velkommen til FishLog
</Text>

// Or manually:
<Text style={{
  fontFamily: 'System',  // Open Sans Semibold
  fontSize: 24,
  fontWeight: '600',
  lineHeight: 30,        // 1.25 ratio
  color: '#333333',
}}>
  Page Title
</Text>
```

**Specifikationer:**
- **Font:** Open Sans Semibold
- **Size:** 24px
- **Weight:** 600 (Semibold)
- **Color:** `#333333` (eller `#FFFFFF` på mørke baggrunde)
- **Line Height:** 1.25 (tight)

**Brug:**
- Page titles
- Screen headers
- Main headlines

---

### H2 - Sektions-overskrifter

```tsx
<Text style={TYPOGRAPHY.styles.h2}>
  Mine Fangster
</Text>

// Or manually:
<Text style={{
  fontFamily: 'System',  // Open Sans Semibold
  fontSize: 18,
  fontWeight: '600',
  lineHeight: 22.5,      // 1.25 ratio
  color: '#333333',
}}>
  Section Title
</Text>
```

**Specifikationer:**
- **Font:** Open Sans Semibold
- **Size:** 18px
- **Weight:** 600 (Semibold)
- **Color:** `#333333` (eller `#FFFFFF` på mørke baggrunde)
- **Line Height:** 1.25 (tight)

**Brug:**
- Section headers
- Card titles
- Subsection titles

---

### Body Text - Generel Tekst

```tsx
<Text style={TYPOGRAPHY.styles.body}>
  Jeg fangede en gedde på 3,5 kg i dag ved Silkeborg Søerne.
</Text>

// Or manually:
<Text style={{
  fontFamily: 'System',  // Open Sans Regular
  fontSize: 16,
  fontWeight: '400',
  lineHeight: 24,        // 1.5 ratio
  color: '#333333',
}}>
  Body content goes here...
</Text>
```

**Specifikationer:**
- **Font:** Open Sans Regular
- **Size:** 16px
- **Weight:** 400 (Regular)
- **Color:** `#333333`
- **Line Height:** 1.5 (normal)

**Brug:**
- Main content text
- Descriptions
- Paragraphs
- Form labels

---

### Small Text - Metadata, Datoer

```tsx
<Text style={TYPOGRAPHY.styles.small}>
  Posted 2 timer siden
</Text>

// Or manually:
<Text style={{
  fontFamily: 'System',  // Open Sans Regular
  fontSize: 14,
  fontWeight: '400',
  lineHeight: 21,        // 1.5 ratio
  color: '#666666',
}}>
  15. Januar 2025
</Text>
```

**Specifikationer:**
- **Font:** Open Sans Regular
- **Size:** 14px
- **Weight:** 400 (Regular)
- **Color:** `#666666` (Secondary text)
- **Line Height:** 1.5 (normal)

**Brug:**
- Timestamps
- Dates
- Metadata
- Captions
- Secondary information

---

### Button Text - CTA

```tsx
<TouchableOpacity style={styles.button}>
  <Text style={TYPOGRAPHY.styles.button}>
    Opret Fangst
  </Text>
</TouchableOpacity>

// Or manually:
<Text style={{
  fontFamily: 'System',  // Open Sans Semibold
  fontSize: 18,
  fontWeight: '600',
  lineHeight: 22.5,      // 1.25 ratio
  color: '#FFFFFF',
}}>
  Log ind
</Text>
```

**Specifikationer:**
- **Font:** Open Sans Semibold
- **Size:** 18px
- **Weight:** 600 (Semibold)
- **Color:** `#FFFFFF` (White on colored backgrounds)
- **Line Height:** 1.25 (tight)

**Brug:**
- Call-to-action buttons
- Primary buttons
- Submit buttons
- Important actions

---

### Tab Bar Labels

```tsx
// Inactive tab
<Text style={TYPOGRAPHY.styles.tabLabel}>
  Profil
</Text>

// Active tab
<Text style={TYPOGRAPHY.styles.tabLabelActive}>
  Feed
</Text>

// Or manually:
// Inactive:
<Text style={{
  fontFamily: 'System',  // Open Sans Regular
  fontSize: 12,
  fontWeight: '400',
  lineHeight: 15,        // 1.25 ratio
  color: '#999999',
}}>
  Hjem
</Text>

// Active:
<Text style={{
  fontFamily: 'System',
  fontSize: 12,
  fontWeight: '400',
  lineHeight: 15,
  color: '#FF7F3F',      // Vivid Orange
}}>
  Feed
</Text>
```

**Specifikationer:**
- **Font:** Open Sans Regular
- **Size:** 12px
- **Weight:** 400 (Regular)
- **Color:**
  - Inactive: `#999999` (Grey)
  - Active: `#FF7F3F` (Vivid Orange)
- **Line Height:** 1.25 (tight)

**Brug:**
- Bottom navigation labels
- Tab bar text
- Navigation items

---

## 📊 Typography Hierarchy

| Element | Size | Weight | Color | Usage |
|---------|------|--------|-------|-------|
| **H1** | 24px | Semibold (600) | `#333333` | Page titles |
| **H2** | 18px | Semibold (600) | `#333333` | Section headers |
| **Body** | 16px | Regular (400) | `#333333` | Main content |
| **Small** | 14px | Regular (400) | `#666666` | Metadata |
| **Button** | 18px | Semibold (600) | `#FFFFFF` | CTA buttons |
| **Tab Label** | 12px | Regular (400) | `#999999`/`#FF7F3F` | Navigation |

---

## 🎨 Typography Examples

### Card with Title and Description

```tsx
import { TYPOGRAPHY, COLORS } from '@/constants/branding';

<View style={styles.card}>
  <Text style={TYPOGRAPHY.styles.h2}>
    Gedde - 3.5 kg
  </Text>
  <Text style={TYPOGRAPHY.styles.small}>
    Fanget 15. Januar 2025, 14:30
  </Text>
  <Text style={TYPOGRAPHY.styles.body}>
    Fanget ved Silkeborg Søerne med spinner. Perfekt vejr!
  </Text>
</View>
```

### Button with CTA Text

```tsx
<TouchableOpacity style={{
  backgroundColor: COLORS.accent,
  padding: 16,
  borderRadius: 8,
}}>
  <Text style={TYPOGRAPHY.styles.button}>
    Opret Fangst
  </Text>
</TouchableOpacity>
```

### Header with Dark Background

```tsx
<View style={{
  backgroundColor: COLORS.primary,
  padding: 16,
}}>
  <Text style={TYPOGRAPHY.styles.h1Dark}>
    FishLog
  </Text>
</View>
```

### Tab Bar Navigation

```tsx
<View style={styles.tabBar}>
  <View style={styles.tab}>
    <Icon name="home" color={COLORS.iconDefault} />
    <Text style={TYPOGRAPHY.styles.tabLabel}>
      Hjem
    </Text>
  </View>

  <View style={styles.tab}>
    <Icon name="feed" color={COLORS.iconActive} />
    <Text style={TYPOGRAPHY.styles.tabLabelActive}>
      Feed
    </Text>
  </View>
</View>
```

---

## 💡 Best Practices

### ✅ Do's

✅ **Use predefined text styles:**
```tsx
<Text style={TYPOGRAPHY.styles.h1}>Title</Text>
```

✅ **Maintain hierarchy:**
- H1 for page titles
- H2 for sections
- Body for content
- Small for metadata

✅ **Use appropriate colors:**
- `#333333` for primary content
- `#666666` for secondary content
- `#999999` for tertiary/inactive
- `#FFFFFF` on dark backgrounds

✅ **Keep line heights consistent:**
- Headings: 1.25 (tight)
- Body: 1.5 (normal)

✅ **Use semibold for emphasis:**
- Headings
- Buttons
- Important labels

---

### ❌ Don'ts

❌ **Don't use random font sizes:**
```tsx
// Bad
<Text style={{ fontSize: 19 }}>Random size</Text>

// Good
<Text style={{ fontSize: TYPOGRAPHY.fontSize.lg }}>Consistent size</Text>
```

❌ **Don't mix too many weights:**
Stick to Regular (400) and Semibold (600)

❌ **Don't use small text for important content:**
```tsx
// Bad
<Text style={TYPOGRAPHY.styles.small}>
  Critical error message!
</Text>

// Good
<Text style={TYPOGRAPHY.styles.body}>
  Critical error message!
</Text>
```

❌ **Don't use light colors on light backgrounds:**
```tsx
// Bad - poor contrast
<Text style={{ color: '#999999', backgroundColor: '#FFFFFF' }}>
  Hard to read
</Text>

// Good
<Text style={{ color: '#333333', backgroundColor: '#FFFFFF' }}>
  Easy to read
</Text>
```

---

## 🔤 Font Loading (Custom Fonts)

If you want to use actual Open Sans font (not system font):

### 1. Install Font Package

```bash
npx expo install expo-font @expo-google-fonts/open-sans
```

### 2. Load Fonts in App

```tsx
import { useFonts } from 'expo-font';
import {
  OpenSans_400Regular,
  OpenSans_600SemiBold,
  OpenSans_700Bold,
} from '@expo-google-fonts/open-sans';

export default function App() {
  let [fontsLoaded] = useFonts({
    OpenSans_400Regular,
    OpenSans_600SemiBold,
    OpenSans_700Bold,
  });

  if (!fontsLoaded) {
    return <AppLoading />;
  }

  return <YourApp />;
}
```

### 3. Update Typography Constants

```tsx
export const TYPOGRAPHY = {
  fontFamily: {
    regular: 'OpenSans_400Regular',
    semibold: 'OpenSans_600SemiBold',
    bold: 'OpenSans_700Bold',
  },
  // ... rest of config
};
```

---

## 📱 Platform-Specific Considerations

### iOS
- Uses San Francisco font by default
- Good fallback for Open Sans
- Supports dynamic type sizing

### Android
- Uses Roboto font by default
- Excellent Open Sans alternative
- Supports Material Design guidelines

### System Font Benefits
- Zero load time
- Consistent with OS
- Automatic accessibility support
- Smaller app size

---

## ♿ Accessibility

### Font Size Scaling

Support dynamic font scaling for accessibility:

```tsx
import { Text, StyleSheet, Platform } from 'react-native';

<Text
  style={styles.body}
  allowFontScaling={true}  // Enable system font scaling
  maxFontSizeMultiplier={1.5}  // Max 150% scaling
>
  Content that respects user font size preferences
</Text>
```

### Contrast Ratios

All typography colors meet WCAG AA standards:

| Text Color | Background | Ratio | Level |
|------------|-----------|-------|-------|
| `#333333` | `#FFFFFF` | 12.6:1 | AAA ✅ |
| `#666666` | `#FFFFFF` | 5.7:1 | AA ✅ |
| `#FFFFFF` | `#1E3F40` | 13.8:1 | AAA ✅ |
| `#FFFFFF` | `#FF7F3F` | 3.3:1 | AA (Large) ⚠️ |

---

## 🚀 Quick Start

```tsx
import { Text, View } from 'react-native';
import { TYPOGRAPHY, COLORS } from '@/constants/branding';

export function MyScreen() {
  return (
    <View style={{ padding: 16 }}>
      {/* Page Title */}
      <Text style={TYPOGRAPHY.styles.h1}>
        Mine Fangster
      </Text>

      {/* Section Header */}
      <Text style={TYPOGRAPHY.styles.h2}>
        Seneste Fangst
      </Text>

      {/* Body Content */}
      <Text style={TYPOGRAPHY.styles.body}>
        Jeg fangede en flot gedde i dag!
      </Text>

      {/* Metadata */}
      <Text style={TYPOGRAPHY.styles.small}>
        Posted 2 timer siden
      </Text>

      {/* Button */}
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
  );
}
```

---

**Last Updated:** 2025-11-01
**Version:** 2.0 (Updated with Open Sans typography system)
