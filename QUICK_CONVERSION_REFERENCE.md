# Quick Conversion Reference Card

## 🎯 Convert Any Screen in 5 Steps

### Step 1: Wrap StyleSheet
```typescript
// FIND:
const styles = StyleSheet.create({

// REPLACE WITH:
const useStyles = () => {
  const { colors } = useTheme();

  return StyleSheet.create({
```

### Step 2: Replace Colors
```typescript
// IN STYLESHEET ONLY - Find/Replace All:
COLORS.background    → colors.background
COLORS.surface       → colors.surface
COLORS.primary       → colors.primary
COLORS.accent        → colors.accent
COLORS.text          → colors.text
COLORS.textPrimary   → colors.textPrimary
COLORS.textSecondary → colors.textSecondary
COLORS.textTertiary  → colors.textTertiary
COLORS.border        → colors.border
COLORS.error         → colors.error
COLORS.success       → colors.success
COLORS.white         → colors.white
// ... etc (replace ALL COLORS. with colors.)
```

### Step 3: Close useStyles
```typescript
// FIND (at end of StyleSheet):
});

// REPLACE WITH:
  });
};
```

### Step 4: Use Styles in Component
```typescript
export default function MyScreen() {
  const { colors } = useTheme();  // Usually already there
  const styles = useStyles();      // ✅ ADD THIS LINE

  // ... rest of component
}
```

### Step 5: Verify
```bash
# Check syntax
npm run type-check

# Test in app
npm start
```

## ⚠️ DON'T Touch These

### ✅ Keep Unchanged
```typescript
// Spacing constants
padding: SPACING.md,
margin: SPACING.xl,

// Border radius
borderRadius: RADIUS.lg,

// Typography
fontSize: TYPOGRAPHY.fontSize.xl,
fontWeight: TYPOGRAPHY.fontWeight.bold,

// Shadows
...SHADOWS.md,

// Button styles
...BUTTON_STYLES.accent.container,
```

### ✅ Keep Inline JSX Styles
```typescript
// These are ALREADY dynamic - don't touch!
<View style={{ backgroundColor: colors.surface }}>
<Text style={{ color: colors.primary }}>
<View style={[styles.card, { borderColor: colors.border }]}>
```

## 📋 Checklist Per File

- [ ] Found StyleSheet.create
- [ ] Wrapped in useStyles hook
- [ ] Added const { colors } = useTheme() to hook
- [ ] Replaced ALL COLORS. with colors. in StyleSheet
- [ ] Closed useStyles with }};
- [ ] Added const styles = useStyles() to component
- [ ] TypeScript compiles without errors
- [ ] Tested in light mode
- [ ] Tested in dark mode
- [ ] Committed changes

## 🚀 Quick Commands

```bash
# Find files with StyleSheet
grep -l "StyleSheet.create" apps/mobile/app/*.tsx

# Count COLORS references in a file
grep -c "COLORS\." apps/mobile/app/FILE.tsx

# Search for specific color usage
grep "COLORS.primary" apps/mobile/app/**/*.tsx

# Type check
cd apps/mobile && npm run type-check

# Start dev server
cd apps/mobile && npm start
```

## 📊 Progress Tracker

### Completed (5/39)
- [x] login.tsx
- [x] settings.tsx
- [x] map.tsx
- [x] feed.tsx
- [x] profile.tsx

### Next Up (High Priority)
- [ ] signup.tsx
- [ ] catches.tsx
- [ ] catch-form.tsx
- [ ] catch-detail.tsx
- [ ] friends.tsx

### Remaining (34 files)
See `CONVERSION_SUMMARY.md` for full list

## 🔍 Common Patterns

### Simple Screen (< 500 lines)
**Time:** 5-10 minutes
**Example:** profile.tsx, signup.tsx

### Medium Screen (500-1000 lines)
**Time:** 10-15 minutes
**Example:** settings.tsx, catches.tsx

### Complex Screen (1000+ lines)
**Time:** 15-20 minutes
**Example:** map.tsx, feed.tsx

## 💡 Pro Tips

1. **Use sed for bulk replacement:**
   ```bash
   sed -i 's/COLORS\./colors./g' file.tsx
   ```

2. **Process similar files together:**
   - All auth screens
   - All catch screens
   - All social screens

3. **Test frequently:**
   - Convert 2-3 files
   - Test all together
   - Commit working changes

4. **Copy from examples:**
   - Look at completed files
   - Copy useStyles pattern
   - Adapt to your file

## 🎨 Theme Color Reference

```typescript
// Available in colors object:
colors.primary          // Blue
colors.accent           // Orange/Action
colors.secondary        // Teal
colors.background       // Main bg
colors.backgroundLight  // Lighter bg
colors.surface          // Cards/panels
colors.text             // Primary text
colors.textPrimary      // Same as text
colors.textSecondary    // Lighter text
colors.textTertiary     // Lightest text
colors.border           // Borders
colors.error            // Red
colors.success          // Green
colors.warning          // Yellow
colors.white            // White
colors.black            // Black
```

## 🆘 Troubleshooting

### Error: "colors is not defined"
✅ Add `const { colors } = useTheme();` to useStyles hook

### Error: "styles is not defined"
✅ Add `const styles = useStyles();` to component

### Colors not changing
✅ Make sure using `colors.` not `COLORS.` in StyleSheet

### TypeScript errors
✅ Check you closed useStyles with `});` and `};`

### Can't find pattern
✅ Look at login.tsx, settings.tsx for reference

---

**Keep this card handy while converting!**
**Refer to DARK_MODE_CONVERSION_GUIDE.md for details**
