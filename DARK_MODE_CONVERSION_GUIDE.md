# Dark Mode Conversion Guide

## Overview
This guide documents the systematic conversion of all FishLog mobile app screens from static styles to dynamic theme-aware styles, enabling full dark mode support.

## Conversion Pattern

### BEFORE (Static - doesn't work with dark mode):
```typescript
export default function SomeScreen() {
  const { colors } = useTheme();
  // ... logic
  return <View style={styles.container}>...</View>;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,  // ❌ Static, never changes!
    padding: SPACING.md,
  }
});
```

### AFTER (Dynamic - works with dark mode):
```typescript
const useStyles = () => {
  const { colors } = useTheme();

  return StyleSheet.create({
    container: {
      backgroundColor: colors.background,  // ✅ Dynamic!
      padding: SPACING.md,  // ✅ Static constants OK
    }
  });
};

export default function SomeScreen() {
  const { colors } = useTheme();  // Keep for JSX usage
  const styles = useStyles();  // ✅ NEW: Get dynamic styles
  // ... logic
  return <View style={styles.container}>...</View>;
}
```

## Step-by-Step Conversion Process

### Step 1: Wrap StyleSheet in useStyles Hook

**Find:**
```typescript
const styles = StyleSheet.create({
```

**Replace with:**
```typescript
const useStyles = () => {
  const { colors } = useTheme();

  return StyleSheet.create({
```

### Step 2: Replace COLORS with colors

Within the StyleSheet ONLY, replace all instances:

**Find:** `COLORS.`
**Replace with:** `colors.`

**Examples:**
- `COLORS.background` → `colors.background`
- `COLORS.primary` → `colors.primary`
- `COLORS.textSecondary` → `colors.textSecondary`
- `COLORS.surface` → `colors.surface`

**Keep these constants unchanged:**
- `SPACING.*` (spacing constants)
- `RADIUS.*` (border radius constants)
- `TYPOGRAPHY.*` (typography constants)
- `SHADOWS.*` (shadow constants)
- `BUTTON_STYLES.*` (button style presets)

### Step 3: Close useStyles Function

**Find the closing of StyleSheet:**
```typescript
});
```

**Replace with:**
```typescript
  });
};
```

### Step 4: Add useStyles Call to Component

In the component function, right after `const { colors } = useTheme();`, add:

```typescript
const styles = useStyles();
```

**Complete example:**
```typescript
export default function MyScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useStyles();  // ✅ Add this line

  // ... rest of component
}
```

## Completed Conversions

### Priority 1 Files (Completed)
1. ✅ **apps/mobile/app/login.tsx** - Authentication screen with forms and OAuth
2. ✅ **apps/mobile/app/settings.tsx** - Settings with theme toggle and API keys
3. ✅ **apps/mobile/app/map.tsx** - Complex map screen with 1800+ lines

### Conversion Statistics (First 3 Files)
- **Total lines converted:** ~2,800 lines
- **Color properties made dynamic:** ~85+ color references
- **Files ready for dark mode:** 3/39

## Remaining Files to Convert

### High Priority
- apps/mobile/app/feed.tsx (1346 lines, ~50 color refs)
- apps/mobile/app/profile.tsx (352 lines, ~15 color refs)

### Authentication & Profile
- apps/mobile/app/signup.tsx
- apps/mobile/app/edit-profile.tsx
- apps/mobile/app/auth/callback.tsx

### Catches Management
- apps/mobile/app/catches.tsx
- apps/mobile/app/catch-form.tsx
- apps/mobile/app/catch-detail.tsx
- apps/mobile/app/edit-catch.tsx
- apps/mobile/app/drafts.tsx

### Social Features
- apps/mobile/app/friends.tsx
- apps/mobile/app/groups.tsx
- apps/mobile/app/messages.tsx
- apps/mobile/app/notifications.tsx
- apps/mobile/app/chat/[userId].tsx
- apps/mobile/app/group/[id].tsx

### Events & Challenges
- apps/mobile/app/events.tsx
- apps/mobile/app/challenges.tsx
- apps/mobile/app/create-event.tsx
- apps/mobile/app/event/[id].tsx
- apps/mobile/app/challenge/[id].tsx

### Features
- apps/mobile/app/ai-guide.tsx
- apps/mobile/app/fiskedex.tsx
- apps/mobile/app/statistics.tsx
- apps/mobile/app/favorite-spots.tsx
- apps/mobile/app/compare-stats.tsx
- apps/mobile/app/predictions.tsx
- apps/mobile/app/blocked-muted-users.tsx
- apps/mobile/app/multi-year-trends.tsx
- apps/mobile/app/badges.tsx

### Other
- apps/mobile/app/index.tsx
- apps/mobile/app/contest/[id]/leaderboard.tsx
- apps/mobile/app/contest/[id]/validate.tsx
- apps/mobile/app/club/[id]/chat.tsx
- apps/mobile/app/branding-demo.tsx
- apps/mobile/app/camera-capture.tsx

## Testing Checklist

After converting each file:

1. ✅ File compiles without TypeScript errors
2. ✅ No undefined `colors` references
3. ✅ `useStyles()` is called in component
4. ✅ All COLORS.* replaced with colors.* in StyleSheet
5. ✅ Static constants (SPACING, RADIUS, etc.) unchanged
6. ✅ Component exports correctly
7. ✅ Screen renders correctly in light mode
8. ✅ Screen renders correctly in dark mode
9. ✅ Theme toggle works without crashes
10. ✅ All interactive elements visible in both modes

## Common Pitfalls to Avoid

### ❌ DON'T: Replace COLORS in JSX
```typescript
// DON'T touch these - they're already dynamic!
<Text style={{ color: colors.primary }}>Hello</Text>
<View style={{ backgroundColor: colors.surface }}>...</View>
```

### ❌ DON'T: Replace spacing/sizing constants
```typescript
// DON'T change these!
padding: SPACING.md,  // ✅ Keep as-is
borderRadius: RADIUS.lg,  // ✅ Keep as-is
fontSize: TYPOGRAPHY.fontSize.xl,  // ✅ Keep as-is
```

### ❌ DON'T: Forget to add styles = useStyles()
```typescript
export default function MyScreen() {
  const { colors } = useTheme();
  // ❌ Missing: const styles = useStyles();

  return <View style={styles.container}>...</View>;  // Will crash!
}
```

### ✅ DO: Keep inline JSX styles using colors
```typescript
// ✅ These are already dynamic, leave them alone
<View style={[styles.card, { backgroundColor: colors.surface }]}>
<Text style={{ color: colors.primary }}>Title</Text>
```

## Bulk Conversion Script

For quick conversion of multiple files, use this pattern:

```bash
# 1. Find the StyleSheet
# 2. Wrap in useStyles
# 3. Replace COLORS. with colors.
# 4. Close useStyles
# 5. Add const styles = useStyles() to component
```

## Expected Outcome

After converting all 39 files:

1. **Full dark mode support** - All screens will respect theme changes
2. **Consistent theming** - Colors come from centralized theme
3. **Runtime theme switching** - Users can toggle light/dark modes
4. **No breaking changes** - All existing functionality preserved
5. **Type-safe** - TypeScript ensures correct color usage

## Next Steps

1. Complete remaining 36 file conversions
2. Test each screen in light and dark modes
3. Fix any edge cases or issues
4. Update design system documentation
5. Add dark mode screenshots to app store

## Resources

- **Theme Context:** `apps/mobile/contexts/ThemeContext.tsx`
- **Color Definitions:** `apps/mobile/constants/theme.ts`
- **Completed Examples:** See login.tsx, settings.tsx, map.tsx

---

**Status:** 3/39 files converted (7.7% complete)
**Estimated remaining work:** ~36 files, ~500 color references
**Priority:** High - Required for dark mode feature completion
