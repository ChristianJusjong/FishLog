# Google Play Store Assets for Hook

This document contains all required assets and content for publishing Hook to Google Play Store.

---

## 📱 App Information

**App Name**: Hook
**Package Name**: com.cjusjong.hook
**Category**: Sports
**Content Rating**: Everyone
**Version**: 1.0.0
**Version Code**: 1

---

## 🎨 Required Visual Assets

### 1. App Icon
- **Status**: ✅ Already created
- **Location**: `./assets/icon.png`
- **Specifications**: 1024x1024px PNG (already provided)

### 2. Feature Graphic
- **Status**: ⚠️ NEEDS CREATION
- **Specifications**: 1024 x 500 px
- **Format**: PNG or JPEG
- **File size**: Max 1MB
- **Design suggestion**:
  - Background: Dark Petrol (#1E3F40)
  - Include fish hook icon/logo
  - Text: "Hook - Din digitale fiskebog"
  - Accent color: Vivid Orange (#FF7F3F)

**Tool to create**: Use Canva, Figma, or Photoshop
**Template URL**: https://www.canva.com/create/google-play-feature-graphic/

### 3. Screenshots (REQUIRED - minimum 2, max 8)
**Specifications**:
- Minimum dimension: 320px
- Maximum dimension: 3840px
- Recommended: 1080 x 2340 px (9:19.5 ratio for modern phones)
- Format: PNG or JPEG

**Screenshots to capture** (in order of priority):

#### Screenshot 1: Feed/Home Screen
- Show the feed with catch cards
- Weather location card visible
- Multiple catches with photos
- **Caption**: "Browse and discover amazing catches from fellow anglers"

#### Screenshot 2: Add Catch Screen
- Log new catch screen
- Show form fields (species, weight, length)
- Photo upload area
- Location map
- **Caption**: "Log your catches with photos, location, and detailed information"

#### Screenshot 3: Catch Detail
- Individual catch with photo
- All details visible (species, weight, bait, technique)
- Location on map
- Likes and comments
- **Caption**: "Share your catches and engage with the fishing community"

#### Screenshot 4: Map View
- Map showing catch locations
- Multiple pins
- **Caption**: "Track and visualize your fishing spots"

#### Screenshot 5: Profile Screen
- User profile
- Catch statistics
- Badges/achievements
- **Caption**: "Track your progress and earn badges"

#### Screenshot 6: Login Screen
- Clean login interface
- Social login buttons
- **Caption**: "Get started with Hook - Sign up in seconds"

**How to capture screenshots**:

1. Run the app in Android emulator:
   ```bash
   cd apps/mobile
   npm run android
   ```

2. Use a Pixel 5 or Pixel 6 emulator (1080 x 2340 resolution)

3. Navigate to each screen and press `Ctrl+S` (or Cmd+S on Mac) to save screenshot

4. Or use ADB:
   ```bash
   adb shell screencap -p /sdcard/screenshot.png
   adb pull /sdcard/screenshot.png
   ```

5. Edit screenshots to add device frames using:
   - https://mockuphone.com/
   - https://screenshots.pro/
   - https://hotpot.ai/mockup/google-play

### 4. Adaptive Icon
- **Status**: ✅ Already created
- **Location**: `./assets/adaptive-icon.png`
- **Specifications**: 512x512px PNG (already provided)

---

## 📝 Text Content

### Short Description (Max 80 characters)
```
Log dine fangster, del oplevelser og bliv en bedre fisker
```
**Character count**: 58/80 ✅

### Full Description (Max 4000 characters)

```
Hook - Din digitale fiskebog 🐟

Tag din fiskeoplevelse til næste niveau med Hook! Den ultimative app for sportsfiskere, der ønsker at logge deres fangster, dele oplevelser med andre fiskere, og forbedre deres færdigheder.

🎣 HOVED FUNKTIONER

📸 Log Dine Fangster
• Tag billeder af dine fangster med ét tryk
• Registrer art, vægt, længde og andre detaljer
• Tilføj information om agn, grej og teknik
• Gem noter om vejr, vandtemperatur og forhold

📍 GPS Lokationssporing
• Automatisk GPS-registrering af fangststedet
• Interaktivt kort med alle dine fangster
• Find tilbage til dine bedste spots
• Del lokationer med andre fiskere

👥 Socialt Netværk for Fiskere
• Del dine fangster med fællesskabet
• Følg andre fiskere og se deres fangster
• Like og kommenter på opslag
• Få inspiration og tips fra erfarne fiskere

📊 Statistik og Indsigt
• Spor din udvikling over tid
• Se statistikker over arter, vægt og længde
• Identificer dine bedste fiskespots
• Analyser mønstre i dine fangster

🏆 Badges og Udfordringer
• Lås op for achievements
• Deltag i fællesskabsudfordringer
• Sammenlign dine resultater med venner
• Bliv motiveret til at fiske mere

🌤️ Vejr Information
• Se aktuelle vejrforhold
• Planlæg dine fisketure bedre
• Få vejrdata for hver fangst

OM FISHLOG

Hook er udviklet af fiskere til fiskere. Vi ved, hvor vigtigt det er at dokumentere sine oplevelser ved vandet, dele dem med ligesindede, og lære af hinanden.

Uanset om du fisker i søer, åer, havet eller put-and-take, så er Hook den perfekte companion til at:
• Huske dine bedste fangster
• Forbedre dine færdigheder
• Finde nye fiskespots
• Bygge et netværk af fiskekammerater

PERFEKT TIL

✓ Sportsfiskere på alle niveauer
✓ Lystfiskere der ønsker at tracke fremgang
✓ Fiskeforeninger og klubber
✓ Familie og venner der fisker sammen
✓ Alle der elsker at være ved vandet

GRATIS AT BRUGE

Hook er helt gratis at downloade og bruge. Log alle dine fangster, del med fællesskabet, og få adgang til alle funktioner uden begrænsninger.

PRIVATLIVSBESKYTTELSE

Vi tager dit privatliv seriøst. Dine personlige data er sikre, og du har fuld kontrol over hvad du deler. Læs mere i vores privatlivspolitik.

SUPPORT

Har du spørgsmål eller forslag? Vi er her for at hjælpe!
Email: support@hook.app

Download Hook i dag og tag din fiskeoplevelse til næste niveau! 🎣
```
**Character count**: ~2,340/4,000 ✅

### Promotional Text (Max 170 characters - appears at top of listing)
```
Den ultimative app til sportsfiskere. Log fangster, del oplevelser, og find de bedste fiskespots med GPS og vejrdata.
```
**Character count**: 136/170 ✅

---

## 🔐 Privacy & Legal

### Privacy Policy URL
You need to create and host a privacy policy. Here's a template location:
**Suggested URL**: `https://hook-production.up.railway.app/privacy-policy`

See `PRIVACY_POLICY.md` (will be created separately)

### App Category
**Primary**: Sports
**Secondary**: Social

### Content Rating
**Rating**: Everyone (PEGI 3, ESRB E)

Questionnaire answers:
- Violence: No
- Sexuality: No
- Profanity: No
- Controlled Substances: No
- Gambling: No
- User Interaction: Yes (users can share content)
- Location Sharing: Yes (optional GPS tracking)
- Personal Info Required: Yes (name, email for registration)

---

## 🌍 Localization

### Default Language: Danish (da-DK)
All content above is in Danish as this is your primary market.

### Additional Languages (Future):
- English (en-US)
- Swedish (sv-SE)
- Norwegian (nb-NO)
- German (de-DE)

---

## 📋 Pre-Launch Checklist

Before submitting to Play Store:

- [ ] Create Feature Graphic (1024x500px)
- [ ] Capture 6-8 Screenshots (1080x2340px)
- [ ] Add device frames to screenshots
- [ ] Create and host Privacy Policy
- [ ] Update API_URL in app to production: `https://hook-production.up.railway.app`
- [ ] Test OAuth flows (Google/Facebook login)
- [ ] Complete Content Rating Questionnaire in Play Console
- [ ] Set up Google Play Service Account (for automatic submission)
- [ ] Build production APK/AAB with EAS
- [ ] Test build on real device
- [ ] Complete Store Listing in Play Console
- [ ] Set pricing (Free)
- [ ] Add promotional video (optional)
- [ ] Submit for review

---

## 📊 App Analytics Setup (Recommended)

Consider adding analytics before launch:
- Google Analytics for Firebase
- Mixpanel
- Amplitude

This helps you understand:
- User engagement
- Feature usage
- Crash reports
- User demographics

---

## 🚀 Launch Strategy

### Soft Launch (Recommended)
1. **Internal Testing**: Share with 10-20 testers
2. **Closed Beta**: 50-100 users
3. **Open Beta**: Unlimited users
4. **Production**: Full release

### Marketing Checklist
- [ ] Create social media accounts (Instagram, Facebook)
- [ ] Join fishing communities and forums
- [ ] Reach out to fishing influencers
- [ ] Create launch announcement
- [ ] Prepare press kit
- [ ] Set up landing page/website

---

## 📱 Contact Information

**Developer Name**: Your Name/Company
**Developer Email**: support@hook.app
**Developer Website**: https://hook-production.up.railway.app
**Support Email**: support@hook.app
**Privacy Policy**: https://hook-production.up.railway.app/privacy-policy

---

## 🎯 Keywords for ASO (App Store Optimization)

Use these in your description naturally:
- fiskebog
- fiskelog
- fishing log
- fangstjournal
- sportsfiskeri
- lystfiskeri
- fiske app
- fishing tracker
- catch log
- fishing diary
- GPS fishing
- fishing spots
- fishing map
- fiskekort
- fiskesteder

---

*Last updated: 2025-11-06*
