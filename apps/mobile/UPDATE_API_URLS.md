# Update API URLs for Production

This guide helps you update all hardcoded API URLs from localhost to production before building your app.

---

## 🎯 Production API URL

Your production backend is at:
```
https://hook-production.up.railway.app
```

---

## 🔍 Files That Need Updating

### Current Hardcoded URLs Found

Based on your codebase, here are the files with hardcoded API URLs:

1. **apps/mobile/app/feed.tsx**
   - Line 10: `const API_URL = 'http://192.168.86.236:3000';`

2. Search all other screens for similar patterns

---

## ✅ Recommended Approach: Use Environment Variables

Instead of hardcoding URLs, use environment variables for better flexibility.

### Step 1: Create Environment Config File

Create a new file: `apps/mobile/config/api.ts`

```typescript
// apps/mobile/config/api.ts

const ENV = {
  development: {
    API_URL: 'http://192.168.86.236:3000', // Your local IP
  },
  production: {
    API_URL: 'https://hook-production.up.railway.app',
  },
};

// Automatically detect environment
const environment = __DEV__ ? 'development' : 'production';

export const API_URL = ENV[environment].API_URL;

// Export other config as needed
export const config = {
  API_URL: ENV[environment].API_URL,
  API_TIMEOUT: 10000,
  // Add other configuration here
};
```

### Step 2: Update All Files to Use Config

**Before:**
```typescript
// apps/mobile/app/feed.tsx
const API_URL = 'http://192.168.86.236:3000';
```

**After:**
```typescript
// apps/mobile/app/feed.tsx
import { API_URL } from '../config/api';

// Now API_URL automatically switches based on __DEV__
```

---

## 🔧 Quick Fix: Search and Replace

If you prefer a quick fix for now, follow these steps:

### Step 1: Find All Occurrences

**Windows (PowerShell):**
```powershell
cd apps\mobile
Get-ChildItem -Recurse -Include *.tsx,*.ts,*.js | Select-String "192.168.86.236:3000" | Select-Object Path,LineNumber,Line
```

**OR** use VS Code:
1. Press `Ctrl+Shift+F` (Windows) or `Cmd+Shift+F` (Mac)
2. Search for: `192.168.86.236:3000`
3. Review all occurrences

### Step 2: Replace for Production Build

**Find:** `http://192.168.86.236:3000`
**Replace with:** `https://hook-production.up.railway.app`

### Step 3: Check for Other Local URLs

Also search for:
- `localhost:3000`
- `127.0.0.1:3000`
- `0.0.0.0:3000`

---

## 📋 Files to Check

Search these directories for API URLs:

```
apps/mobile/app/*.tsx
apps/mobile/contexts/*.tsx
apps/mobile/services/*.ts
apps/mobile/utils/*.ts
```

Common files that may have API URLs:
- `app/feed.tsx` ✅ (confirmed has hardcoded URL)
- `app/add-catch.tsx`
- `app/catches.tsx`
- `app/profile.tsx`
- `app/login.tsx`
- `app/signup.tsx`
- `app/friends.tsx`
- `app/events.tsx`
- `app/catch-detail.tsx`
- `app/edit-catch.tsx`
- `app/edit-profile.tsx`
- `contexts/AuthContext.tsx`

---

## 🚀 Implementation Guide

### Option A: Environment-Based (Recommended)

**1. Create config file:**
```bash
# Create config directory
mkdir apps/mobile/config

# Create the file (use the code from Step 1 above)
# apps/mobile/config/api.ts
```

**2. Update package.json to create the config directory:**
```json
{
  "scripts": {
    "dev": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "build:prod": "eas build --platform android --profile production"
  }
}
```

**3. Update all files:**

Find and update each file that uses `API_URL`:

```typescript
// OLD
const API_URL = 'http://192.168.86.236:3000';

// NEW
import { API_URL } from '@/config/api';
```

**4. Update tsconfig.json paths (if needed):**
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"],
      "@/config/*": ["./config/*"]
    }
  }
}
```

### Option B: Simple Constant (Quick Fix)

**1. Create constants file:**
```typescript
// apps/mobile/constants/api.ts

// Toggle this for development/production
const IS_PRODUCTION = false; // Set to true when building for Play Store

export const API_URL = IS_PRODUCTION
  ? 'https://hook-production.up.railway.app'
  : 'http://192.168.86.236:3000';
```

**2. Import in all files:**
```typescript
import { API_URL } from '@/constants/api';
```

**3. Before building for production:**
- Change `IS_PRODUCTION` to `true`
- Build app
- Change back to `false` for local development

---

## ✅ Verification Checklist

After updating URLs:

- [ ] All API calls use the config/constant
- [ ] No hardcoded URLs remain in code
- [ ] Production URL is correct: `https://hook-production.up.railway.app`
- [ ] Test in development mode (should use local URL)
- [ ] Test in production build (should use production URL)

### Test Commands

```bash
# Search for remaining hardcoded URLs
cd apps/mobile
grep -r "192.168.86.236" app/
grep -r "localhost:3000" app/
grep -r "http://" app/ | grep -v "https://"

# Should return no results (or only comments)
```

---

## 🔍 How to Verify Production Build Uses Correct URL

### Method 1: Console Logs (Temporary)

Add temporary logging:
```typescript
import { API_URL } from '@/config/api';

console.log('🔗 Using API URL:', API_URL);
```

Then check logs in production build.

### Method 2: Test the Build

1. Build production APK:
   ```bash
   eas build --platform android --profile preview
   ```

2. Install on device

3. Try to login/fetch data:
   - If it works → Production URL is correct ✅
   - If it fails → Check URL configuration ❌

4. Use React Native Debugger to inspect network calls

---

## 📝 Quick Reference

### Search Commands

**Find all API URL occurrences:**
```bash
cd apps/mobile
find . -type f \( -name "*.tsx" -o -name "*.ts" \) -exec grep -l "API_URL\|api_url\|localhost:3000\|192.168" {} \;
```

**Count occurrences:**
```bash
grep -r "192.168.86.236:3000" app/ | wc -l
```

### Replace Commands (use with caution!)

**Backup first:**
```bash
cp -r apps/mobile apps/mobile.backup
```

**Replace all at once (Unix/Mac):**
```bash
cd apps/mobile
find . -type f -name "*.tsx" -exec sed -i '' 's|http://192.168.86.236:3000|https://hook-production.up.railway.app|g' {} \;
```

**Replace all at once (Windows - PowerShell):**
```powershell
cd apps\mobile
Get-ChildItem -Recurse -Include *.tsx,*.ts | ForEach-Object {
  (Get-Content $_.FullName) -replace 'http://192.168.86.236:3000', 'https://hook-production.up.railway.app' | Set-Content $_.FullName
}
```

---

## 🎯 Recommended Next Steps

1. **Create the config file** (Option A above)
2. **Update feed.tsx** to use config
3. **Search and update all other files**
4. **Test locally** that everything still works
5. **Build production APK**
6. **Test production build** on real device
7. **Proceed with Play Store submission**

---

## ⚠️ Important Notes

### DO NOT Commit API Keys

If you add API keys or secrets:
```typescript
// ❌ WRONG - Never commit secrets
export const API_KEY = 'sk_live_abc123...';

// ✅ CORRECT - Use environment variables
export const API_KEY = process.env.EXPO_PUBLIC_API_KEY || '';
```

### Expo Environment Variables

For Expo apps, use the `EXPO_PUBLIC_` prefix:

**Create `.env` file:**
```bash
EXPO_PUBLIC_API_URL=https://hook-production.up.railway.app
```

**Use in code:**
```typescript
const API_URL = process.env.EXPO_PUBLIC_API_URL;
```

**Install expo-constants:**
```bash
npx expo install expo-constants
```

---

## 🐛 Troubleshooting

### Issue: "Network request failed"

**Cause**: App is using localhost URL in production
**Solution**: Verify all URLs are updated to production

### Issue: "Connection refused"

**Cause**: Firewall or incorrect URL
**Solution**:
1. Test production URL in browser
2. Check for typos
3. Verify Railway backend is running

### Issue: "CORS error"

**Cause**: Backend not configured for mobile app
**Solution**: Check backend CORS settings allow your domain

---

## ✅ Final Check Before Build

```bash
# Run this before building for Play Store
cd apps/mobile

# 1. Search for local URLs
echo "Searching for local URLs..."
grep -r "localhost" app/ || echo "✅ No localhost found"
grep -r "192.168" app/ || echo "✅ No local IPs found"
grep -r "127.0.0.1" app/ || echo "✅ No 127.0.0.1 found"

# 2. Verify production URL is present
echo "Checking for production URL..."
grep -r "hook-production.up.railway.app" app/ && echo "✅ Production URL found" || echo "❌ Production URL NOT found"

echo "Done! Review results above."
```

---

*Remember: Always test your production build on a real device before submitting to Play Store!*
