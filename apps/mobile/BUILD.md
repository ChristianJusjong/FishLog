# Hook - Mobile App Build Guide

This guide explains how to build the Hook mobile app **without using Expo's paid EAS Build service**.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Local Builds](#local-builds)
- [GitHub Actions (Automated)](#github-actions-automated)
- [Publishing to Google Play Store](#publishing-to-google-play-store)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### For Local Builds:

**Windows:**
- [Node.js 18+](https://nodejs.org/)
- [Java JDK 17](https://adoptium.net/)
- [Android Studio](https://developer.android.com/studio) (for Android SDK)
- Set `ANDROID_HOME` environment variable

**Mac/Linux:**
```bash
# Install Java 17
brew install openjdk@17

# Install Android SDK (via Android Studio or command line tools)
brew install android-sdk
```

### Environment Variables:

Add to your `.bashrc`, `.zshrc`, or Windows Environment Variables:

```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

---

## Local Builds

### Quick Start

**Windows:**
```bash
cd apps/mobile
build-android.bat
```

**Mac/Linux:**
```bash
cd apps/mobile
chmod +x build-android.sh
./build-android.sh
```

### Manual Build Steps

1. **Generate native Android folder:**
   ```bash
   cd apps/mobile
   npx expo prebuild --platform android --clean
   ```

2. **Build the APK:**
   ```bash
   cd android
   ./gradlew assembleRelease  # Mac/Linux
   gradlew.bat assembleRelease  # Windows
   ```

3. **Find your APK:**
   ```
   apps/mobile/android/app/build/outputs/apk/release/app-release.apk
   ```

### Build Variants

```bash
# Debug build (for development)
./gradlew assembleDebug

# Release build (for distribution)
./gradlew assembleRelease

# Bundle for Play Store (AAB format)
./gradlew bundleRelease
```

---

## GitHub Actions (Automated)

The project includes a GitHub Actions workflow that automatically builds Android APKs.

### Trigger Build Manually:

1. Go to your GitHub repository
2. Click **Actions** tab
3. Select **Android Build** workflow
4. Click **Run workflow**

### Download Built APK:

1. After workflow completes, click on the workflow run
2. Scroll to **Artifacts** section
3. Download `app-release` artifact

### Automatic Builds:

Builds trigger automatically when you push changes to `apps/mobile/**` on the `main` branch.

---

## Publishing to Google Play Store

### 1. Generate Signing Key

**First time only:**
```bash
keytool -genkeypair -v -storetype PKCS12 \
  -keystore hook-release.keystore \
  -alias hook-key \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

**IMPORTANT:** Save your keystore file and passwords securely! You'll need them for all future updates.

### 2. Configure Gradle Signing

Create `apps/mobile/android/gradle.properties`:

```properties
HOOK_UPLOAD_STORE_FILE=hook-release.keystore
HOOK_UPLOAD_KEY_ALIAS=hook-key
HOOK_UPLOAD_STORE_PASSWORD=your_keystore_password
HOOK_UPLOAD_KEY_PASSWORD=your_key_password
```

**Add to `.gitignore`:**
```
# Signing keys
*.keystore
*.jks
gradle.properties
```

Update `apps/mobile/android/app/build.gradle`:

```gradle
android {
    ...
    signingConfigs {
        release {
            if (project.hasProperty('HOOK_UPLOAD_STORE_FILE')) {
                storeFile file(HOOK_UPLOAD_STORE_FILE)
                storePassword HOOK_UPLOAD_STORE_PASSWORD
                keyAlias HOOK_UPLOAD_KEY_ALIAS
                keyPassword HOOK_UPLOAD_KEY_PASSWORD
            }
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            ...
        }
    }
}
```

### 3. Build Production Bundle

```bash
cd apps/mobile/android
./gradlew bundleRelease
```

Output: `android/app/build/outputs/bundle/release/app-release.aab`

### 4. Upload to Play Console

1. Go to [Google Play Console](https://play.google.com/console)
2. Create new app or select existing
3. Navigate to **Production** → **Create new release**
4. Upload `app-release.aab`
5. Complete store listing, pricing, and content rating
6. Submit for review

---

## Troubleshooting

### Build Fails with "SDK not found"

**Solution:** Install Android SDK via Android Studio or set `ANDROID_HOME`:
```bash
export ANDROID_HOME=$HOME/Android/Sdk  # Mac/Linux
set ANDROID_HOME=C:\Users\YourName\AppData\Local\Android\Sdk  # Windows
```

### Gradle Build Fails

**Solution:** Clear Gradle cache:
```bash
cd apps/mobile/android
./gradlew clean
./gradlew assembleRelease --refresh-dependencies
```

### Out of Memory During Build

**Solution:** Increase heap size in `apps/mobile/android/gradle.properties`:
```properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=512m
```

### "Android folder not found"

**Solution:** Run prebuild first:
```bash
npx expo prebuild --platform android --clean
```

### Metro Bundler Port Conflict

**Solution:** Kill existing Metro process:
```bash
# Mac/Linux
killall node

# Windows
taskkill /F /IM node.exe
```

---

## Comparing to EAS Build

| Feature | EAS Build | Local/GitHub Actions |
|---------|-----------|---------------------|
| Cost | $29-99/month | Free |
| Build Time | ~10-15 min | ~5-10 min (local), ~10 min (GitHub) |
| Setup | Easy | Moderate |
| Maintenance | Managed | Self-managed |
| iOS Builds | Included | Requires Mac |
| OTA Updates | Included | Need custom solution |

---

## Next Steps

- [ ] Set up code signing for production releases
- [ ] Configure app versioning in `app.json`
- [ ] Set up Fastlane for deployment automation
- [ ] Configure ProGuard for code obfuscation
- [ ] Add crashlytics and analytics

---

## Support

For issues or questions:
- Open an issue on GitHub
- Check [Expo documentation](https://docs.expo.dev/workflow/prebuild/)
- Review [React Native docs](https://reactnative.dev/docs/signed-apk-android)
