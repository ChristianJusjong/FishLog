# Completion Guide for Remaining 4 Files

## Status: 50% Complete (4/8 files done)

### ✅ Completed Files
1. signup.tsx
2. catches.tsx
3. catch-form.tsx
4. catch-detail.tsx

### 🔄 Partially Completed (StyleSheet COLORS → colors done)
5. edit-profile.tsx - StyleSheet updated, needs hook + component changes
6. friends.tsx - StyleSheet updated, needs hook + component changes
7. groups.tsx - StyleSheet updated, needs hook + component changes
8. messages.tsx - StyleSheet updated, needs hook + component changes

## What's Already Done for Files 5-8

✅ All `COLORS.` references in StyleSheet blocks converted to `colors.`
✅ Backup files created (*.backup_*)

## What Still Needs to Be Done for Files 5-8

For EACH of the 4 remaining files, you need to:

### Step 1: Update Imports (at top of file)

**Find:**
```typescript
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/constants/branding';
```

**Replace with:**
```typescript
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/constants/branding';
```

### Step 2: Extract and Move StyleSheet

1. **Find** the `const styles = StyleSheet.create({ ... });` block near the end of the file
2. **Cut** the entire block (from `const styles =` to the closing `});`)
3. **Create** a new `useStyles` hook BEFORE `export default function`:

```typescript
const useStyles = () => {
  const { colors } = useTheme();

  return StyleSheet.create({
    // PASTE THE STYLES HERE (everything inside StyleSheet.create)
    // The COLORS.* should already be converted to colors.*
  });
};

export default function YourComponentName() {
  ...
}
```

### Step 3: Update Component Function

**Find:** (usually near top of component function)
```typescript
const { colors } = useTheme();
```

**Add immediately after:**
```typescript
const { colors } = useTheme();
const styles = useStyles();  // ADD THIS LINE
```

### Step 4: Remove Old StyleSheet

Delete the old `const styles = StyleSheet.create({ ... });` block that you cut in Step 2.

## Detailed Line Numbers for Each File

### edit-profile.tsx
- Import to update: Line 20
- Component function: Line 25
- Add `const styles = useStyles()` after: Line 26 (after `const { colors } = useTheme()`)
- StyleSheet to extract: Lines 274-382 (109 lines)
- Insert useStyles hook before: Line 25 (`export default function EditProfileScreen()`)

### friends.tsx
- Import to update: Line 8
- Component function: Line 40
- Add `const styles = useStyles()` after: Line 42 (after `const { colors } = useTheme()`)
- StyleSheet to extract: Lines 462-633 (172 lines)
- Insert useStyles hook before: Line 40 (`export default function FriendsScreen()`)

### groups.tsx
- Import to update: Line 18
- Component function: Line 37
- Add `const styles = useStyles()` after: Line 39 (after `const { colors } = useTheme()`)
- StyleSheet to extract: Lines 424-704 (281 lines)
- Insert useStyles hook before: Line 37 (`export default function GroupsScreen()`)

### messages.tsx
- Import to update: Line 17
- Component function: Line 44
- Add `const styles = useStyles()` after: Line 45 (after `const { colors } = useTheme()`)
- StyleSheet to extract: Lines 284-446 (163 lines)
- Insert useStyles hook before: Line 44 (`export default function MessagesScreen()`)

## Quick Verification Checklist

After editing each file, verify:
- [ ] No COLORS import at top
- [ ] useStyles() hook exists before export default
- [ ] `const styles = useStyles()` in component
- [ ] No old StyleSheet at end of file
- [ ] All colors.* references work (not COLORS.*)
- [ ] File has no TypeScript errors

## Testing

After all conversions:
```bash
# Check for any remaining COLORS references in StyleSheet blocks
grep -A 300 "const styles = StyleSheet.create" apps/mobile/app/{edit-profile,friends,groups,messages}.tsx | grep "COLORS\."

# Should return nothing if conversion is complete

# Build and test
npm run ios  # or npm run android
```

## Why This Approach?

The dynamic useStyles() hook pattern ensures:
- Styles react to theme changes
- Dark mode works automatically
- No need for StyleSheet recreation
- Follows the established pattern from login.tsx, settings.tsx, etc.
