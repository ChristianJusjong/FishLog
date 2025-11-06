#!/bin/bash

# Hook - Android Build Script
# Alternative to EAS Build - builds APK locally

set -e

echo "🚀 Building Android APK for Hook..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if android folder exists
if [ ! -d "android" ]; then
  echo -e "${BLUE}📦 Android folder not found. Running prebuild...${NC}"
  npx expo prebuild --platform android --clean
fi

# Navigate to android folder
cd android

# Make gradlew executable
chmod +x ./gradlew

# Build release APK
echo -e "${BLUE}🔨 Building release APK...${NC}"
./gradlew assembleRelease

# Get output path
APK_PATH="app/build/outputs/apk/release/app-release.apk"

if [ -f "$APK_PATH" ]; then
  echo -e "${GREEN}✅ Build successful!${NC}"
  echo -e "${GREEN}📱 APK location: android/$APK_PATH${NC}"

  # Get file size
  SIZE=$(du -h "$APK_PATH" | cut -f1)
  echo -e "${GREEN}📦 APK size: $SIZE${NC}"

  # Optional: Copy to root for easier access
  cp "$APK_PATH" ../../hook-release.apk
  echo -e "${GREEN}📋 Copied to: hook-release.apk${NC}"
else
  echo "❌ Build failed - APK not found"
  exit 1
fi
