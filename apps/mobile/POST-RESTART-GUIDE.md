# Post-Restart Build Guide

After restarting your computer, follow these steps to build your first Hook APK locally.

## Step 1: Verify Installations (2 minutes)

Open a **NEW** Command Prompt or PowerShell:

```cmd
# Check Java
java -version

# Check Android SDK (via adb)
adb version

# Check environment variables
echo %ANDROID_HOME%
echo %JAVA_HOME%
```

### Expected Results:
```
✅ java version "17.0.x"
✅ Android Debug Bridge version x.x.x
✅ ANDROID_HOME = C:\Users\YourName\AppData\Local\Android\Sdk
✅ JAVA_HOME = C:\Program Files\Eclipse Adoptium\jdk-17.x.x-hotspot
```

### If anything fails:

Run the setup script in PowerShell as Administrator:
```powershell
cd C:\ClaudeCodeProject\FishLog\apps\mobile
.\setup-env.ps1
```

Then restart again and retest.

---

## Step 2: Build Your First APK (10-15 minutes)

### Quick Build (Recommended):

Open Command Prompt or PowerShell:

```cmd
cd C:\ClaudeCodeProject\FishLog\apps\mobile
build-android.bat
```

The script will automatically:
1. Check if `android` folder exists
2. Run `expo prebuild` if needed (first time only - takes 3-5 minutes)
3. Build release APK with Gradle (5-10 minutes)
4. Copy APK to `hook-release.apk` in project root

### Manual Build (Alternative):

If you prefer step-by-step:

```cmd
# 1. Navigate to mobile app
cd C:\ClaudeCodeProject\FishLog\apps\mobile

# 2. Generate Android project (first time only)
npx expo prebuild --platform android --clean

# 3. Build APK
cd android
gradlew.bat assembleRelease

# 4. Find your APK
cd app\build\outputs\apk\release
dir app-release.apk
```

---

## Step 3: Find Your APK

After successful build, your APK will be at:

**Using build script:**
```
C:\ClaudeCodeProject\FishLog\hook-release.apk
```

**Manual build:**
```
C:\ClaudeCodeProject\FishLog\apps\mobile\android\app\build\outputs\apk\release\app-release.apk
```

---

## Step 4: Test on Android Device

### Transfer to Phone:

**Option 1: USB Cable**
1. Connect phone via USB
2. Enable "File Transfer" mode on phone
3. Copy `hook-release.apk` to phone's Downloads folder

**Option 2: Cloud Storage**
1. Upload APK to Google Drive / Dropbox / OneDrive
2. Download on your phone

**Option 3: Email**
1. Email the APK to yourself
2. Open on phone and download

### Install:

1. Open the APK file on your phone
2. If prompted, enable "Install from Unknown Sources" or "Install Unknown Apps"
3. Tap "Install"
4. Wait for installation to complete
5. Tap "Open" to launch Hook!

---

## Troubleshooting

### "java is not recognized"

**Problem:** Java not in PATH

**Solution:**
1. Open Environment Variables:
   - Press `Win + R`
   - Type: `sysdm.cpl`
   - Advanced tab → Environment Variables
2. Under User variables, add to PATH:
   - `C:\Program Files\Eclipse Adoptium\jdk-17.x.x-hotspot\bin`
3. Restart terminal

### "ANDROID_HOME is not set"

**Problem:** Android SDK path not configured

**Solution:**
1. Find Android SDK location:
   - Open Android Studio
   - More Actions → SDK Manager
   - Note the "Android SDK Location"
2. Set environment variable:
   ```cmd
   setx ANDROID_HOME "C:\Users\YourName\AppData\Local\Android\Sdk"
   ```
3. Restart terminal

### "gradlew is not recognized"

**Problem:** Not in android folder or android folder doesn't exist

**Solution:**
```cmd
cd C:\ClaudeCodeProject\FishLog\apps\mobile
npx expo prebuild --platform android --clean
cd android
gradlew.bat assembleRelease
```

### Build fails with "Out of memory"

**Problem:** Not enough heap space for Gradle

**Solution:**

Create/edit `apps\mobile\android\gradle.properties`:
```properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=512m
org.gradle.daemon=true
org.gradle.parallel=true
```

### "SDK location not found"

**Problem:** Android SDK not installed or location incorrect

**Solution:**
1. Open Android Studio
2. Complete the setup wizard
3. Go to SDK Manager and ensure these are installed:
   - Android SDK Platform 33
   - Android SDK Build-Tools
   - Android SDK Platform-Tools
   - Android SDK Command-line Tools

---

## Build Time Estimates

| Task | First Time | Subsequent Builds |
|------|------------|-------------------|
| Prebuild | 3-5 minutes | Skipped (cached) |
| Gradle Build | 10-15 minutes | 5-8 minutes |
| **Total** | **15-20 minutes** | **5-8 minutes** |

---

## Future Builds

After your first successful build, subsequent builds are much faster:

```cmd
cd C:\ClaudeCodeProject\FishLog\apps\mobile
build-android.bat
```

That's it! Just one command.

---

## Quick Reference Commands

```cmd
# Full rebuild (if things break)
cd apps\mobile
npx expo prebuild --platform android --clean
cd android
gradlew.bat clean assembleRelease

# Just rebuild APK (after code changes)
cd apps\mobile\android
gradlew.bat assembleRelease

# Debug build (for testing)
gradlew.bat assembleDebug

# Bundle for Play Store (AAB format)
gradlew.bat bundleRelease
```

---

## App Version Info

**Current Build:**
- Version: 1.1.0
- Version Code: 2
- Package: com.cjusjong.hook

**Features:**
- Live Contest Leaderboard
- EXIF Metadata Validation
- Club Chat with Real-time Messaging
- Catch Sharing in Clubs
- Admin Validation System

---

## Need Help?

If you encounter issues:

1. Check the full setup guide: `SETUP-WINDOWS.md`
2. Check the build guide: `BUILD.md`
3. Make sure you've restarted after installing Java/Android Studio
4. Try running `.\setup-env.ps1` again
5. Check GitHub Actions for pre-built APK: https://github.com/ChristianJusjong/FishLog/actions

---

**Happy Building! 🎣**
