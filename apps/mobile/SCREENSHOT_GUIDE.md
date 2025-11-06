# Screenshot Capture Guide for Google Play Store

This guide will help you capture professional screenshots for your Play Store listing.

## 📱 Device Setup

### Recommended Emulator
- **Device**: Pixel 5 or Pixel 6
- **Resolution**: 1080 x 2340 px (optimal for Play Store)
- **Android Version**: Android 12 or newer
- **Density**: 440 dpi

### Setting Up Android Emulator

1. Open Android Studio or install Android SDK command line tools
2. Open AVD Manager
3. Create a new virtual device:
   - Choose **Pixel 5** or **Pixel 6**
   - Select **Android 12** (API 31) or newer
   - Click Finish

## 🎯 Screenshots to Capture

You need **minimum 2, recommended 6-8** screenshots.

### Screenshot 1: Feed/Home Screen
**Screen**: Feed with multiple catches

**Setup**:
1. Make sure you have test data with catches
2. Navigate to Feed screen
3. Ensure Weather/Location card is visible at top
4. Show at least 2-3 catch cards with photos

**What to show**:
- Weather location card
- Feed with catch photos
- User names and dates
- Like and comment counts

**Caption for Play Store**:
> "Browse and discover amazing catches from fellow anglers"

---

### Screenshot 2: Add Catch Screen
**Screen**: Create new catch form

**Setup**:
1. Navigate to "Add Catch" screen
2. Fill in some example data:
   - Species: "Gedde" (Pike)
   - Weight: "2.5 kg"
   - Length: "65 cm"
   - Location selected on map

**What to show**:
- Form fields partially filled
- Photo upload area (with or without photo)
- Location map with pin
- Clean, organized layout

**Caption for Play Store**:
> "Log your catches with photos, location, and detailed information"

---

### Screenshot 3: Catch Detail View
**Screen**: Individual catch with full details

**Setup**:
1. Click on a catch from feed
2. Show catch with:
   - Photo
   - All details (species, weight, bait, technique)
   - Location on map
   - Likes and comments

**What to show**:
- Beautiful catch photo
- Complete information displayed
- Social interaction (likes/comments)
- Location map

**Caption for Play Store**:
> "Share your catches and engage with the fishing community"

---

### Screenshot 4: Map View
**Screen**: Map showing multiple catches

**Setup**:
1. Navigate to Map screen
2. Ensure multiple pins are visible
3. Zoom to show good geographic coverage

**What to show**:
- Interactive map
- Multiple catch location pins
- Clean map interface

**Caption for Play Store**:
> "Track and visualize your fishing spots on an interactive map"

---

### Screenshot 5: Profile Screen
**Screen**: User profile with statistics

**Setup**:
1. Navigate to Profile screen
2. Ensure profile has:
   - Profile photo
   - User name
   - Catch count
   - Badges (if implemented)

**What to show**:
- User information
- Statistics
- List of catches
- Achievement badges

**Caption for Play Store**:
> "Track your progress, view statistics, and earn badges"

---

### Screenshot 6: Login/Welcome Screen
**Screen**: Clean login interface

**Setup**:
1. Log out if needed
2. Navigate to login screen

**What to show**:
- Hook logo/branding
- Social login buttons (Google, Facebook)
- Clean, inviting design

**Caption for Play Store**:
> "Get started with Hook - Sign up in seconds"

---

## 📸 How to Capture Screenshots

### Method 1: Using Android Studio Emulator
1. Start the emulator with your app running
2. Navigate to the desired screen
3. Click the **Camera** icon in the emulator toolbar
4. Or press `Ctrl+S` (Windows) / `Cmd+S` (Mac)
5. Screenshots save to: `C:\Users\[YourName]\Pictures\Screenshots\`

### Method 2: Using ADB Commands
```bash
# Capture screenshot
adb shell screencap -p /sdcard/screenshot_feed.png

# Pull to computer
adb pull /sdcard/screenshot_feed.png ./screenshots/

# Delete from device
adb shell rm /sdcard/screenshot_feed.png
```

### Method 3: Using Expo CLI (if available)
Some Expo versions support screenshot capture:
```bash
# While running: press 's' to save screenshot
npm run android
# Then press 's' when on desired screen
```

---

## 🎨 Post-Processing Screenshots

### 1. Add Device Frames (Recommended)

Use one of these free tools to add professional device frames:

**MockUPhone** (https://mockuphone.com/)
- Upload your screenshot
- Choose device: Pixel 5 or Pixel 6
- Download with frame

**Screenshots.pro** (https://screenshots.pro/)
- More customization options
- Add backgrounds
- Professional templates

**Hotpot.ai** (https://hotpot.ai/mockup/google-play)
- AI-powered
- Multiple device options
- Quick processing

### 2. Optimize Images

After adding frames:
- **Format**: PNG or JPEG
- **Size**: Keep under 8MB each
- **Resolution**: 1080 x 2340 px recommended
- **Quality**: High (90%+)

Use tools like:
- **TinyPNG** (https://tinypng.com/) - Compress without quality loss
- **Squoosh** (https://squoosh.app/) - Google's image optimizer

---

## 📐 Screenshot Specifications

### Google Play Requirements

| Specification | Requirement |
|--------------|-------------|
| Minimum screenshots | 2 |
| Maximum screenshots | 8 |
| Minimum dimension | 320px |
| Maximum dimension | 3840px |
| Aspect ratio | Between 16:9 and 9:16 |
| Format | PNG or JPEG |
| Max file size | 8MB per image |

### Recommended Sizes

| Device Type | Resolution | Aspect Ratio |
|-------------|------------|--------------|
| Phone | 1080 x 2340 px | 9:19.5 |
| Tablet | 2048 x 2732 px | 3:4 |

---

## 🎯 Screenshot Checklist

Before uploading to Play Store:

- [ ] Captured 6-8 high-quality screenshots
- [ ] Screenshots show key app features:
  - [ ] Feed/Home screen
  - [ ] Add catch form
  - [ ] Catch detail view
  - [ ] Map with locations
  - [ ] Profile/stats
  - [ ] Login screen
- [ ] All screenshots are clear and in focus
- [ ] No personal/sensitive information visible
- [ ] Consistent branding across all screenshots
- [ ] Device frames added (optional but recommended)
- [ ] Images optimized and compressed
- [ ] File size under 8MB each
- [ ] Resolution: 1080 x 2340 px
- [ ] Format: PNG or JPEG
- [ ] Captions prepared for each screenshot

---

## 🎨 Feature Graphic Guide

### Specifications
- **Size**: 1024 x 500 px
- **Format**: PNG or JPEG
- **File size**: Max 1MB

### Design Recommendations

**Color Scheme** (from your branding):
- Background: Dark Petrol (#1E3F40)
- Accent: Vivid Orange (#FF7F3F)
- Text: White (#FFFFFF)

**Content**:
- App name: "Hook"
- Tagline: "Din digitale fiskebog"
- Fish hook icon/logo
- Maybe: Small screenshot preview

**Tools to Create**:

1. **Canva** (Easiest - Recommended)
   - Go to: https://www.canva.com/
   - Search for "Google Play Feature Graphic"
   - Use template: 1024 x 500 px
   - Customize with your colors and text

2. **Figma** (For designers)
   - Create 1024 x 500 px frame
   - Design with your branding
   - Export as PNG

3. **Photoshop**
   - Create new file: 1024 x 500 px
   - Design and export

**Template Ideas**:
```
┌───────────────────────────────────────────────────┐
│  🎣                                               │
│  Hook                                          │
│  Din digitale fiskebog                            │
│                                                   │
│  [Small screenshot preview]                       │
└───────────────────────────────────────────────────┘
Dark Petrol Background with Orange Accents
```

---

## 📁 Recommended Folder Structure

Create this folder structure to organize your assets:

```
apps/mobile/play-store-assets/
├── screenshots/
│   ├── 01-feed.png
│   ├── 02-add-catch.png
│   ├── 03-catch-detail.png
│   ├── 04-map.png
│   ├── 05-profile.png
│   └── 06-login.png
├── feature-graphic/
│   └── feature-graphic-1024x500.png
├── icon/
│   └── app-icon-512x512.png (already have)
└── promo-video/ (optional)
    └── promo.mp4
```

---

## 🚀 Quick Start Commands

```bash
# Navigate to mobile app
cd apps/mobile

# Create assets folder
mkdir -p play-store-assets/screenshots
mkdir -p play-store-assets/feature-graphic

# Start Android emulator
npm run android

# After capturing, organize
# Move screenshots to: ./play-store-assets/screenshots/
```

---

## ✅ Final Checklist Before Upload

All assets ready:
- [ ] 6-8 screenshots captured and processed
- [ ] Feature graphic created (1024x500px)
- [ ] App icon ready (512x512px) ✅ Already have
- [ ] All images optimized
- [ ] Captions written for each screenshot
- [ ] Assets organized in proper folders

---

## 📞 Need Help?

If you encounter issues:
1. Check that emulator is running Android 12+
2. Ensure app is properly compiled
3. Verify test data exists (catches, users, etc.)
4. Check screen resolution matches recommendations

**Tips**:
- Take screenshots in portrait mode only
- Use real-looking test data
- Keep UI elements visible and clear
- Show diverse app features
- Highlight social and mapping features

---

*Good luck with your Play Store submission!* 🎣
