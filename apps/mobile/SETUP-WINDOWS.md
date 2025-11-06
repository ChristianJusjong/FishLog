# Windows Setup Guide for Local Android Builds

Complete step-by-step guide to set up your Windows machine for building Hook Android APKs locally.

## Table of Contents
- [Prerequisites Check](#prerequisites-check)
- [Step 1: Install Java JDK 17](#step-1-install-java-jdk-17)
- [Step 2: Install Android Studio](#step-2-install-android-studio)
- [Step 3: Configure Environment Variables](#step-3-configure-environment-variables)
- [Step 4: Verify Installation](#step-4-verify-installation)
- [Step 5: Build Your First APK](#step-5-build-your-first-apk)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites Check

**What you already have:**
- ✅ Node.js (required for React Native)
- ✅ Git
- ✅ Hook project cloned

**What you need to install:**
- ❌ Java JDK 17
- ❌ Android Studio
- ❌ Android SDK

**Estimated setup time:** 30-45 minutes

---

## Step 1: Install Java JDK 17

### Option A: Using Installer (Recommended)

1. **Download Java 17:**
   - Go to: https://adoptium.net/temurin/releases/?version=17
   - Select:
     - Operating System: **Windows**
     - Architecture: **x64**
     - Package Type: **JDK**
     - Version: **17 (LTS)**
   - Click download `.msi` file

2. **Install:**
   - Run the downloaded `.msi` installer
   - Click "Next" through the wizard
   - ⚠️ **IMPORTANT:** Check "Add to PATH" option
   - Click "Install"
   - Wait for installation to complete

3. **Verify Installation:**
   Open **new** Command Prompt or PowerShell:
   ```cmd
   java -version
   ```

   Expected output:
   ```
   openjdk version "17.0.x"
   OpenJDK Runtime Environment Temurin-17+x
   ```

### Option B: Using Chocolatey (Alternative)

If you have Chocolatey installed:

```cmd
choco install temurin17 -y
```

---

## Step 2: Install Android Studio

### Download and Install

1. **Download Android Studio:**
   - Go to: https://developer.android.com/studio
   - Click "Download Android Studio"
   - Accept terms and click "Download"
   - File size: ~1 GB

2. **Run Installer:**
   - Run the downloaded `.exe` file
   - Click "Next"
   - Select components:
     - ✅ Android Studio
     - ✅ Android Virtual Device (optional, for emulator)
   - Choose installation location (default is fine)
   - Click "Install"

3. **First Launch Setup:**
   - Launch Android Studio
   - Choose "Standard" installation type
   - Select UI theme (Light or Dark)
   - Click "Next" and "Finish"

4. **SDK Manager Setup:**
   - Android Studio will download SDK components
   - This takes 10-15 minutes
   - Wait for "Downloading Components" to complete

### Configure SDK

1. **Open SDK Manager:**
   - In Android Studio, click **More Actions** → **SDK Manager**
   - Or: **File** → **Settings** → **Appearance & Behavior** → **System Settings** → **Android SDK**

2. **Install Required SDK Components:**

   **SDK Platforms tab:**
   - ✅ Android 13.0 (API 33) - Recommended
   - ✅ Android 12.0 (API 31)
   - ✅ Android 11.0 (API 30)

   **SDK Tools tab:**
   - ✅ Android SDK Build-Tools
   - ✅ Android SDK Command-line Tools
   - ✅ Android Emulator (optional)
   - ✅ Android SDK Platform-Tools
   - ✅ Intel x86 Emulator Accelerator (HAXM) - optional
   - ✅ Google Play Services

3. **Note SDK Location:**
   - At the top of SDK Manager, note the "Android SDK Location"
   - Default: `C:\Users\YourUsername\AppData\Local\Android\Sdk`
   - **Copy this path - you'll need it next!**

---

## Step 3: Configure Environment Variables

### Automated Setup (PowerShell Script)

1. **Open PowerShell as Administrator:**
   - Press `Win + X`
   - Select "Windows PowerShell (Admin)" or "Terminal (Admin)"

2. **Run this script:**

```powershell
# Set ANDROID_HOME (replace with your actual SDK path if different)
$androidHome = "$env:LOCALAPPDATA\Android\Sdk"
[System.Environment]::SetEnvironmentVariable('ANDROID_HOME', $androidHome, 'User')

# Set JAVA_HOME
$javaPath = (Get-Command java).Path
$javaHome = Split-Path (Split-Path $javaPath)
[System.Environment]::SetEnvironmentVariable('JAVA_HOME', $javaHome, 'User')

# Add Android tools to PATH
$currentPath = [System.Environment]::GetEnvironmentVariable('PATH', 'User')
$newPaths = @(
    "$androidHome\platform-tools",
    "$androidHome\tools",
    "$androidHome\tools\bin"
)

foreach ($path in $newPaths) {
    if ($currentPath -notlike "*$path*") {
        $currentPath = "$currentPath;$path"
    }
}

[System.Environment]::SetEnvironmentVariable('PATH', $currentPath, 'User')

Write-Host "Environment variables configured!" -ForegroundColor Green
Write-Host "ANDROID_HOME = $androidHome" -ForegroundColor Cyan
Write-Host "JAVA_HOME = $javaHome" -ForegroundColor Cyan
Write-Host ""
Write-Host "Please RESTART your terminal/IDE for changes to take effect!" -ForegroundColor Yellow
```

### Manual Setup (Alternative)

If you prefer to do it manually:

1. **Open Environment Variables:**
   - Press `Win + R`
   - Type: `sysdm.cpl`
   - Click "Advanced" tab
   - Click "Environment Variables"

2. **Add ANDROID_HOME:**
   - Under "User variables", click "New"
   - Variable name: `ANDROID_HOME`
   - Variable value: `C:\Users\YourUsername\AppData\Local\Android\Sdk`
   - Click "OK"

3. **Add JAVA_HOME:**
   - Click "New" again
   - Variable name: `JAVA_HOME`
   - Variable value: `C:\Program Files\Eclipse Adoptium\jdk-17.x.x-hotspot`
   - Click "OK"

4. **Update PATH:**
   - Select "Path" under User variables
   - Click "Edit"
   - Click "New" and add:
     - `%ANDROID_HOME%\platform-tools`
     - `%ANDROID_HOME%\tools`
     - `%ANDROID_HOME%\tools\bin`
   - Click "OK" on all dialogs

5. **RESTART YOUR COMPUTER** (or at least all terminals/IDE)

---

## Step 4: Verify Installation

Open a **NEW** Command Prompt or PowerShell and run:

```cmd
# Check Java
java -version

# Check ANDROID_HOME
echo %ANDROID_HOME%

# Check Android tools
adb version

# Check Gradle (will be downloaded when needed)
cd C:\ClaudeCodeProject\FishLog\apps\mobile\android
gradlew -version
```

**Expected Results:**
```
✅ java version "17.0.x"
✅ C:\Users\YourUsername\AppData\Local\Android\Sdk
✅ Android Debug Bridge version x.x.x
✅ Gradle 8.x
```

If any command fails, double-check the environment variables and **restart your terminal**.

---

## Step 5: Build Your First APK

Now you're ready to build!

### Using the Build Script (Easiest)

```cmd
cd C:\ClaudeCodeProject\FishLog\apps\mobile
build-android.bat
```

The script will:
1. Run `expo prebuild` (generates Android project)
2. Build release APK with Gradle
3. Copy APK to `hook-release.apk`

**Build time:** 5-10 minutes (first time is slower)

### Manual Build Steps

If you want to run commands manually:

```cmd
# 1. Generate Android project
cd C:\ClaudeCodeProject\FishLog\apps\mobile
npx expo prebuild --platform android --clean

# 2. Build APK
cd android
gradlew.bat assembleRelease

# 3. Find your APK
cd app\build\outputs\apk\release
dir app-release.apk
```

### Your APK Location

After successful build:
```
C:\ClaudeCodeProject\FishLog\apps\mobile\android\app\build\outputs\apk\release\app-release.apk
```

Or if using the script:
```
C:\ClaudeCodeProject\FishLog\hook-release.apk
```

---

## Troubleshooting

### "ANDROID_HOME is not set"

**Solution:**
1. Make sure you ran the PowerShell script
2. Restart your terminal/IDE
3. Verify: `echo %ANDROID_HOME%`

### "Java version is incorrect"

**Solution:**
```cmd
# Uninstall other Java versions
# Keep only JDK 17
java -version
# Should show version 17.x.x
```

### "SDK location not found"

**Solution:**
1. Open Android Studio
2. Go to SDK Manager
3. Note the exact SDK path
4. Update ANDROID_HOME to match that path

### "Gradle build failed"

**Solution:**
```cmd
cd apps\mobile\android
gradlew.bat clean
gradlew.bat assembleRelease --refresh-dependencies
```

### "Out of memory" during build

**Solution:**

Create/edit `apps\mobile\android\gradle.properties`:
```properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=512m
```

### "Cannot find gradlew.bat"

**Solution:**
1. Make sure you ran `npx expo prebuild` first
2. The android folder must exist before running gradle

---

## Next Steps

Once you have a successful build:

1. **Test the APK:**
   - Transfer to Android phone
   - Enable "Install from Unknown Sources"
   - Install and test

2. **Set up code signing** (for Play Store):
   - See main BUILD.md guide
   - Generate keystore
   - Configure gradle signing

3. **Automate with scripts:**
   - Use `build-android.bat` for quick builds
   - Set up keyboard shortcuts in your IDE

---

## Quick Reference

**Build Commands:**
```cmd
# Full build
apps\mobile\build-android.bat

# Prebuild only
npx expo prebuild --platform android

# APK only
cd apps\mobile\android
gradlew.bat assembleRelease

# AAB for Play Store
gradlew.bat bundleRelease

# Clean build
gradlew.bat clean assembleRelease
```

**File Locations:**
- SDK: `%LOCALAPPDATA%\Android\Sdk`
- APK: `apps\mobile\android\app\build\outputs\apk\release\`
- Logs: `apps\mobile\android\app\build\outputs\logs\`

---

## Getting Help

If you encounter issues:

1. Check the [Expo Prebuild docs](https://docs.expo.dev/workflow/prebuild/)
2. Check [React Native docs](https://reactnative.dev/docs/environment-setup)
3. Search error messages on Stack Overflow
4. Open an issue on GitHub

---

**Setup Time Summary:**
- Java Install: 5 minutes
- Android Studio: 15-20 minutes
- Environment Variables: 5 minutes
- First Build: 10-15 minutes
- **Total: ~40 minutes**

After initial setup, builds take only 5-10 minutes!
