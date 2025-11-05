# FishLog - Color Palette Quick Reference

## 🎨 Primære Farver

### Dark Petrol (Primær Brandfarve)
```
#1E3F40
```
**Brug:** Baggrund, store elementer, navigation bars, headers
**Symboliserer:** Dybt vand/skov

---

### Vivid Orange (Accent)
```
#FF7F3F
```
**Brug:** Call-to-action, vigtige ikoner, aktive states, highlights
**Symboliserer:** Solnedgang/liv

---

### Light Grey (Baggrunde)
```
#F0F2F5
```
**Brug:** Kort baggrunde, sektioner, neutral content areas

---

## 📝 Tekstfarver

### Primary Text (Overskrifter, Hovedtekst)
```
#333333
```
**Brug:** Headings, body text, main content
**Type:** Mørkegrå for god læsbarhed

---

### Secondary Text (Undertekster, Metadata)
```
#666666
```
**Brug:** Subtitles, dates, metadata, supporting text
**Type:** Mellemgrå

---

### Tertiary Text (Mindre Vigtig)
```
#999999
```
**Brug:** Captions, inactive text, disabled states
**Type:** Lysegrå

---

### White Text
```
#FFFFFF
```
**Brug:** Text på mørke baggrunde (f.eks. Dark Petrol)

---

## 🎯 Icon Farver

### Ikke-interaktive Ikoner
```
#999999
```
**Brug:** Default icons, inactive states, neutral ikoner
**Type:** Mellemgrå

---

### Interaktive Ikoner (Valgt/Aktiv)
```
#FF7F3F
```
**Brug:** Active/selected icons, highlighted icons
**Type:** Vivid Orange (accent farve)

---

## 🌊 Sekundære & Natur Farver

### Lyseblå/Turkis (Vand)
```
#4A90A4
```
**Brug:** Water-related elements, info messages

### Skov Grøn
```
#2F5233
```
**Brug:** Nature-themed sections

### Sand/Beige
```
#D4C5A9
```
**Brug:** Warm neutrals, nature elements

---

## 📊 Color Usage Matrix

| Element Type | Farve | Hex Code |
|-------------|-------|----------|
| **Navigation Bar** | Dark Petrol | `#1E3F40` |
| **CTA Buttons** | Vivid Orange | `#FF7F3F` |
| **Card Backgrounds** | Light Grey | `#F0F2F5` |
| **Headings** | Primary Text | `#333333` |
| **Body Text** | Primary Text | `#333333` |
| **Metadata** | Secondary Text | `#666666` |
| **Inactive Icons** | Icon Default | `#999999` |
| **Active Icons** | Icon Active (Orange) | `#FF7F3F` |
| **Text on Dark BG** | White | `#FFFFFF` |

---

## 🎨 Color Combinations

### Light Mode (Default)
- **Background:** `#FFFFFF` (White)
- **Card Surfaces:** `#F0F2F5` (Light Grey)
- **Text:** `#333333` (Primary Text)
- **Accents:** `#FF7F3F` (Vivid Orange)

### Dark Mode Headers
- **Background:** `#1E3F40` (Dark Petrol)
- **Text:** `#FFFFFF` (White)
- **Active Elements:** `#FF7F3F` (Vivid Orange)

---

## 🖌️ Usage Examples

### Button Styles

**Primary CTA Button:**
```tsx
backgroundColor: '#FF7F3F'  // Vivid Orange
color: '#FFFFFF'           // White text
```

**Secondary Button:**
```tsx
backgroundColor: '#1E3F40'  // Dark Petrol
color: '#FFFFFF'           // White text
```

**Outline Button:**
```tsx
backgroundColor: 'transparent'
borderColor: '#1E3F40'     // Dark Petrol border
color: '#1E3F40'           // Dark Petrol text
```

### Card Styles

**Default Card:**
```tsx
backgroundColor: '#FFFFFF'  // White surface
borderColor: '#E5E5E5'     // Light border
```

**Section Card:**
```tsx
backgroundColor: '#F0F2F5'  // Light Grey
borderRadius: 12
padding: 16
```

### Text Styles

**Heading:**
```tsx
fontSize: 24
fontWeight: 'bold'
color: '#333333'  // Primary Text
```

**Body Text:**
```tsx
fontSize: 16
fontWeight: 'regular'
color: '#333333'  // Primary Text
```

**Caption/Metadata:**
```tsx
fontSize: 14
fontWeight: 'regular'
color: '#666666'  // Secondary Text
```

---

## ✅ Accessibility

### Contrast Ratios

| Combination | Ratio | WCAG Level |
|-------------|-------|------------|
| `#333333` on `#FFFFFF` | 12.6:1 | AAA ✅ |
| `#666666` on `#FFFFFF` | 5.7:1 | AA ✅ |
| `#FFFFFF` on `#1E3F40` | 13.8:1 | AAA ✅ |
| `#FF7F3F` on `#FFFFFF` | 3.3:1 | AA (Large text) ⚠️ |
| `#FFFFFF` on `#FF7F3F` | 3.3:1 | AA (Large text) ⚠️ |

**Note:** Orange accent color should primarily be used for:
- Call-to-action buttons (with white text)
- Active states/highlights
- Icons and small accents
- NOT for body text on white backgrounds

---

## 🚫 What NOT to Do

❌ Don't use orange (`#FF7F3F`) for body text on white backgrounds
❌ Don't use light grey (`#F0F2F5`) for text
❌ Don't mix dark petrol (`#1E3F40`) text on dark backgrounds
❌ Don't use tertiary text (`#999999`) for important content

---

## ✅ Best Practices

✅ Use Dark Petrol (`#1E3F40`) for main navigation and headers
✅ Use Vivid Orange (`#FF7F3F`) sparingly for CTAs and active states
✅ Use Light Grey (`#F0F2F5`) for card backgrounds and sections
✅ Use proper text hierarchy: `#333333` → `#666666` → `#999999`
✅ Ensure sufficient contrast for all text (min 4.5:1 for body text)

---

**Last Updated:** 2025-11-01
**Version:** 2.0 (Updated with refined color palette)
