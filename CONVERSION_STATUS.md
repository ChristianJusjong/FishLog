# Dark Mode Conversion Status

## Successfully Converted Files (4/8)

### ✅ 1. apps/mobile/app/signup.tsx
- Added `useStyles()` hook at module level
- Added `const styles = useStyles()` in component
- Removed old StyleSheet definition
- All COLORS.* references converted to colors.* in StyleSheet

### ✅ 2. apps/mobile/app/catches.tsx
- Added `useStyles()` hook at module level (393 lines of styles)
- Added `const styles = useStyles()` in component
- Removed old StyleSheet definition
- All COLORS.* references converted to colors.* in StyleSheet
- Removed COLORS from imports (kept others from theme.ts)

### ✅ 3. apps/mobile/app/catch-form.tsx
- Added `useStyles()` hook at module level (207 lines of styles)
- Added `const styles = useStyles()` in component
- Removed old StyleSheet definition
- All COLORS.* references converted to colors.* in StyleSheet
- Removed COLORS from imports (kept others from branding.ts)

### ✅ 4. apps/mobile/app/catch-detail.tsx
- Added `useStyles()` hook at module level (271 lines of styles)
- Added `const styles = useStyles()` in component
- Removed old StyleSheet definition
- All COLORS.* references converted to colors.* (36 references) in StyleSheet
- Removed COLORS from imports (kept others from branding.ts)

## Remaining Files to Convert (4/8)

### 🔄 5. apps/mobile/app/edit-profile.tsx
- StyleSheet starts at line 274
- 16 COLORS references to convert
- Import from branding.ts

### 🔄 6. apps/mobile/app/friends.tsx
- StyleSheet starts at line 462
- 15 COLORS references to convert
- Import from branding.ts

### 🔄 7. apps/mobile/app/groups.tsx
- StyleSheet starts at line 424
- 20 COLORS references to convert
- Import from branding.ts

### 🔄 8. apps/mobile/app/messages.tsx
- StyleSheet starts at line 284
- 15 COLORS references to convert
- Import from branding.ts

## Conversion Pattern

For each remaining file:

1. **At the top of the file** (after imports):
   - Remove `COLORS` from the import statement
   - Add `useStyles()` hook:
     ```typescript
     const useStyles = () => {
       const { colors } = useTheme();

       return StyleSheet.create({
         // ... paste the existing styles here
         // Replace all COLORS.* with colors.*
       });
     };
     ```

2. **In the component function**:
   - Keep existing: `const { colors } = useTheme();` (for JSX usage)
   - Add below it: `const styles = useStyles();`

3. **At the end of the file**:
   - Remove the old `const styles = StyleSheet.create({ ... });` block

4. **In the StyleSheet only**:
   - Replace all `COLORS.` with `colors.`
   - Keep JSX color references as `colors.*` (already correct)

## Quick Conversion Script

Use find/replace in your editor for the StyleSheet block only:
- Find: `COLORS\.`
- Replace: `colors.`
- Scope: Only within the StyleSheet.create block

## Testing

After conversion, verify:
1. No TypeScript errors
2. App builds successfully
3. Dark mode toggle works correctly
4. All colors respond to theme changes
