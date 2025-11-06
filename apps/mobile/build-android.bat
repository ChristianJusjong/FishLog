@echo off
REM Hook - Android Build Script for Windows
REM Alternative to EAS Build - builds APK locally

echo Building Android APK for Hook...

REM Check if android folder exists
if not exist "android" (
  echo Android folder not found. Running prebuild...
  call npx expo prebuild --platform android --clean
)

REM Navigate to android folder
cd android

REM Build release APK
echo Building release APK...
call gradlew.bat assembleRelease

REM Check if build succeeded
if exist "app\build\outputs\apk\release\app-release.apk" (
  echo Build successful!
  echo APK location: android\app\build\outputs\apk\release\app-release.apk

  REM Copy to root for easier access
  copy "app\build\outputs\apk\release\app-release.apk" "..\..\hook-release.apk"
  echo Copied to: hook-release.apk
) else (
  echo Build failed - APK not found
  exit /b 1
)

cd ..
