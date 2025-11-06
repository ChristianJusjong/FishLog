# 🚀 Complete Play Store Submission Guide for Hook

This is your step-by-step guide to submit Hook to the Google Play Store.

---

## ✅ What You Already Have

- [x] **AAB File**: Downloaded from https://expo.dev/artifacts/eas/qh49PA3bq2i3dAhQAQpPs1.aab
- [x] **Privacy Policy**: Live at https://fishlog-production.up.railway.app/privacy-policy.html
- [x] **Store Listing Text**: Ready in PLAY_STORE_ASSETS.md
- [x] **App Branding**: Hook with fishing hook logo
- [x] **Package Name**: com.cjusjong.hook

---

## 📝 Part 1: Store Listing Text (Copy-Paste Ready)

### Short Description (80 chars)
```
Log dine fangster, del oplevelser og bliv en bedre fisker
```

### Full Description
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

OM HOOK

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

### Promotional Text (170 chars)
```
Den ultimative app til sportsfiskere. Log fangster, del oplevelser, og find de bedste fiskespots med GPS og vejrdata.
```

---

## 🎨 Part 2: Create Feature Graphic (1024x500px)

### Option A: Use Canva (Easiest - 15 minutes)

1. **Go to Canva**: https://www.canva.com/
2. **Sign up/Login** (free account)
3. **Search for**: "Google Play Feature Graphic" or create custom size 1024 x 500 px
4. **Design your graphic**:

   **Suggested Layout**:
   ```
   ┌──────────────────────────────────────────────────────────┐
   │  Background: Dark Petrol (#1E3F40)                       │
   │                                                           │
   │   🎣 [Hook Logo]              HOOK                       │
   │                               Din digitale fiskebog      │
   │                                                           │
   │   [Small app screenshot or fishing imagery]              │
   └──────────────────────────────────────────────────────────┘
   ```

   **Colors to use**:
   - Background: Dark Petrol (#1E3F40)
   - Text: White (#FFFFFF)
   - Accent: Vivid Orange (#FF7F3F)

5. **Add elements**:
   - Your Hook logo (from Images folder)
   - Text: "Hook" and "Din digitale fiskebog"
   - Optional: Small screenshot or fishing-related image

6. **Download**:
   - File type: PNG
   - Size: 1024 x 500 px
   - Name it: `hook-feature-graphic.png`

### Option B: Use Your Logo Directly

You can use one of the logos from your Images folder as a starting point:
- `Images/Gemini_Generated_Image_3y5kjf3y5kjf3y5k.png` - Hook with text

Resize it to 1024x500px using:
- **Photoshop**
- **GIMP** (free)
- **Online tool**: https://www.iloveimg.com/resize-image

---

## 📸 Part 3: Capture Screenshots (1-2 hours)

You need **2-8 screenshots** at 1080 x 2340 px.

### Recommended Screenshots (in order):

1. **Feed/Home Screen** - Shows catches from community
2. **Add Catch Form** - Show how easy it is to log a catch
3. **Catch Detail** - Individual catch with photo and details
4. **Map View** - Interactive map with fishing spots
5. **Profile Screen** - User stats and achievements
6. **Login Screen** - Clean welcome screen

### How to Capture Screenshots:

#### Step 1: Run the App in Emulator

```bash
cd apps/mobile
npm run android
```

**Emulator Setup**:
- Device: Pixel 5 or Pixel 6
- Resolution: 1080 x 2340 px
- Android 12 or newer

#### Step 2: Capture Each Screen

**Method 1: Android Studio Emulator**
- Click the camera icon in emulator toolbar
- Or press `Ctrl+S` (Windows) / `Cmd+S` (Mac)
- Screenshots save to your Pictures folder

**Method 2: ADB Command**
```bash
adb shell screencap -p /sdcard/screenshot1.png
adb pull /sdcard/screenshot1.png ./screenshots/
```

#### Step 3: Add Device Frames (Optional but Recommended)

Use these free tools:
- **MockUPhone**: https://mockuphone.com/
- **Screenshots.pro**: https://screenshots.pro/
- **Hotpot.ai**: https://hotpot.ai/mockup/google-play

Upload your screenshots and add Pixel device frames.

#### Step 4: Optimize Images

- Use **TinyPNG**: https://tinypng.com/
- Keep under 8MB each
- Save as PNG or JPEG

### Quick Alternative: Use App in Browser

If emulator is slow, you can run the web version:
```bash
cd apps/mobile
npm run web
```

Take screenshots at 1080 x 2340 px resolution.

---

## 🏪 Part 4: Create Play Console Listing

### Step 1: Go to Play Console

**URL**: https://play.google.com/console

### Step 2: Create New App

1. Click **"Create app"**
2. Fill in details:
   - **App name**: Hook
   - **Default language**: Danish (da-DK)
   - **App or game**: App
   - **Free or paid**: Free
   - **Declarations**: Check all boxes

3. Click **"Create app"**

### Step 3: Complete Store Listing

Navigate to: **Store Listing** in left sidebar

#### App Details

**Short description** (paste from above):
```
Log dine fangster, del oplevelser og bliv en bedre fisker
```

**Full description** (paste from above - see Part 1)

#### Graphics

Upload these files:

| Asset | Size | File |
|-------|------|------|
| **App icon** | 512x512 | Use: `apps/mobile/assets/icon.png` (resize to 512x512) |
| **Feature graphic** | 1024x500 | Create using Canva (see Part 2) |
| **Phone screenshots** | 1080x2340 | Capture from emulator (see Part 3) |

**Required**: At least 2 screenshots
**Recommended**: 6-8 screenshots

#### Categorization

- **App category**: Sports
- **Tags**: Add keywords like: fishing, outdoor, sports

#### Contact Details

- **Email**: support@hook.app
- **Website**: https://fishlog-production.up.railway.app (or your custom domain)
- **Privacy policy**: https://fishlog-production.up.railway.app/privacy-policy.html

Click **"Save"**

---

## 📋 Part 5: Complete App Content

### Privacy Policy

1. Go to: **Policy → Privacy policy**
2. **Enter URL**: `https://fishlog-production.up.railway.app/privacy-policy.html`
3. Click **"Save"**

### App Access

1. Go to: **Policy → App access**
2. Select: **"All functionality is available without restrictions"**
   - Or if you require login: Provide test credentials
3. Click **"Save"**

### Ads

1. Go to: **Policy → Ads**
2. Answer: **"No, my app does not contain ads"** (or Yes if you have ads)
3. Click **"Save"**

### Content Rating

1. Go to: **Policy → Content rating**
2. Click **"Start questionnaire"**
3. **Select category**: Apps
4. **Answer questions**:
   - Violence: No
   - Sexual content: No
   - Profanity: No
   - Controlled substances: No
   - User interaction: **Yes** (users can share content)
   - Location sharing: **Yes** (optional GPS tracking)
   - Personal info collection: **Yes** (name, email)

5. Review rating (should be **Everyone/PEGI 3**)
6. Click **"Submit"**

### Target Audience

1. Go to: **Policy → Target audience**
2. **Age groups**: Select "13+" (or specify)
3. **Appeal to children**: No
4. Click **"Save"**

### News App

1. Go to: **Policy → News app**
2. Answer: **"No"**
3. Click **"Save"**

### Data Safety

1. Go to: **Policy → Data safety**
2. Click **"Start"**
3. **Answer form**:

   **Data collection**:
   - Location: **Yes** (Approximate location, optional)
     - Purpose: App functionality
     - User control: User can choose

   - Personal info: **Yes**
     - Name: Required
     - Email: Required
     - User IDs: Yes

   - Photos: **Yes**
     - User photos: Optional

   - App activity: **Yes**
     - App interactions: Yes

   **Data sharing**: None (or specify if using analytics)

   **Security practices**:
   - ✅ Data encrypted in transit
   - ✅ Data encrypted at rest (select if your DB is encrypted)
   - ✅ Users can request data deletion
   - ✅ Committed to Google Play Families Policy (if targeting children)

4. Review and **submit**

---

## 🌍 Part 6: Store Settings

### Countries & Regions

1. Go to: **Release → Production → Countries/regions**
2. **Select countries**:
   - Start with: Denmark, Sweden, Norway, Germany
   - Or select "All countries"
3. Click **"Save"**

### Pricing

1. Go to: **Monetize → Pricing**
2. Select: **Free**
3. Click **"Save"**

---

## 📦 Part 7: Upload AAB File

### Step 1: Create Production Release

1. Go to: **Release → Production**
2. Click **"Create new release"**

### Step 2: Upload AAB

1. Click **"Upload"**
2. **Select file**: `hook-v1.0.0.aab` (your downloaded AAB)
3. Wait for upload to complete
4. Google will analyze the file

### Step 3: Release Notes

**Add release notes** (what's new):
```
Hook 1.0.0 - Lancering! 🎣

Velkommen til Hook - din digitale fiskebog!

Features:
• Log dine fangster med foto og placering
• Del dine oplevelser med fællesskabet
• Se fangster fra andre fiskere i feed
• Interaktivt kort med alle dine fiskespots
• GPS lokations tracking
• Vejr information
• Sociale funktioner (likes, kommentarer)

God fisketur! 🐟
```

### Step 4: Review and Rollout

1. **Review** all information
2. Click **"Review release"**
3. Fix any errors or warnings
4. Click **"Start rollout to Production"**

---

## ⏱️ Part 8: Wait for Review

### What Happens Next

1. **Submission confirmation** - You'll see "In review"
2. **Google reviews** - Typically 1-7 days (usually 2-3 days)
3. **Possible outcomes**:
   - ✅ **Approved** - App goes live!
   - ⚠️ **Changes needed** - Fix issues and resubmit
   - ❌ **Rejected** - Review rejection reason and appeal or fix

### While Waiting

- Check your email for updates
- Monitor Play Console dashboard
- Prepare marketing materials
- Set up social media accounts

---

## 🎉 Part 9: After Approval

### Your App Goes Live!

1. **Notification email** from Google
2. **App appears** on Play Store within hours
3. **Share the link**:
   ```
   https://play.google.com/store/apps/details?id=com.cjusjong.hook
   ```

### Post-Launch Tasks

- [ ] Respond to user reviews
- [ ] Monitor crash reports
- [ ] Track analytics
- [ ] Plan first update
- [ ] Marketing and promotion

---

## 📊 Submission Checklist

Before clicking "Submit", verify:

- [ ] AAB file uploaded successfully
- [ ] Feature graphic uploaded (1024x500)
- [ ] At least 2 screenshots uploaded
- [ ] App icon uploaded (512x512)
- [ ] Short description added
- [ ] Full description added
- [ ] Privacy policy URL added
- [ ] Contact email added
- [ ] Content rating completed
- [ ] Data safety completed
- [ ] Target audience selected
- [ ] Countries selected
- [ ] Pricing set to Free
- [ ] Release notes written
- [ ] All sections show green checkmarks

---

## 🆘 Common Issues

### Issue: "Privacy policy URL not accessible"
**Solution**: Test URL in incognito browser: https://fishlog-production.up.railway.app/privacy-policy.html

### Issue: "Screenshots don't meet requirements"
**Solution**: Ensure 1080x2340 px, PNG/JPEG, under 8MB

### Issue: "Feature graphic wrong size"
**Solution**: Must be exactly 1024x500 px

### Issue: "Data safety incomplete"
**Solution**: Answer all questions about data collection

---

## 📞 Need Help?

- **Play Console Help**: https://support.google.com/googleplay/android-developer
- **This guide**: Read PLAY_STORE_CHECKLIST.md for detailed info
- **Screenshots**: See SCREENSHOT_GUIDE.md

---

**Good luck with your submission!** 🚀🎣

Your Hook app is ready to launch!
