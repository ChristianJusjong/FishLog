# Complete Google Play Store Deployment Checklist

Use this checklist to ensure you have everything ready for a successful Play Store launch.

---

## 🎯 Pre-Deployment Phase

### App Configuration

- [ ] **Update API URL to production**
  - File: `apps/mobile/app/feed.tsx` (and other screens)
  - Change: `const API_URL = 'http://192.168.86.236:3000';`
  - To: `const API_URL = 'https://hook-production.up.railway.app';`
  - Search all files for hardcoded local URLs

- [ ] **Verify app.json configuration**
  - App name: "Hook" ✅
  - Version: "1.0.0" ✅
  - Version code: 1 ✅
  - Package: "com.cjusjong.hook" ✅
  - Permissions configured ✅

- [ ] **Environment variables**
  - Production API URL set
  - OAuth credentials configured
  - No development/test keys in production build

### Backend Configuration

- [ ] **Railway backend is live**
  - URL: https://hook-production.up.railway.app ✅
  - Health check passing ✅
  - Database connected ✅

- [ ] **OAuth configured** (from previous guide)
  - [ ] Google OAuth credentials added to Railway
  - [ ] Facebook OAuth credentials added to Railway
  - [ ] Callback URLs configured correctly
  - [ ] Test OAuth flows work

### Developer Accounts

- [ ] **Google Play Developer Account**
  - Create account at: https://play.google.com/console/signup
  - Pay $25 one-time registration fee
  - Verify email and identity
  - Accept Developer Distribution Agreement

- [ ] **Expo Account**
  - Sign up at: https://expo.dev/signup
  - Verify email
  - Create organization (optional)

---

## 📱 Build Phase

### EAS Setup

- [ ] **Install EAS CLI**
  ```bash
  npm install -g eas-cli
  ```

- [ ] **Login to Expo**
  ```bash
  cd apps/mobile
  eas login
  ```

- [ ] **Configure EAS**
  - eas.json created ✅
  - Build profiles configured ✅

- [ ] **Update production API URL**
  ```bash
  # Find all occurrences
  # Replace with production URL
  ```

### Build Process

- [ ] **Build for testing (APK)**
  ```bash
  eas build --platform android --profile preview
  ```
  - Download and test on real device
  - Verify all features work
  - Test OAuth login flows
  - Check location services
  - Test camera/photo upload
  - Verify offline handling

- [ ] **Build for production (AAB)**
  ```bash
  eas build --platform android --profile production
  ```
  - Build completes successfully
  - Download .aab file
  - Note build number/hash

### Build Verification

- [ ] **Test production build**
  - Install on real Android device
  - Create account via Google/Facebook OAuth
  - Log a catch with photo
  - Add location to catch
  - View feed
  - Like and comment on posts
  - Test map view
  - Check profile screen
  - Verify logout/login

- [ ] **Performance checks**
  - App launches quickly
  - No crashes or freezes
  - Images load properly
  - Maps render correctly
  - Smooth scrolling

---

## 🎨 Assets Phase

### Required Visual Assets

- [ ] **App Icon** ✅
  - 512x512px PNG
  - Already created: `./assets/icon.png`

- [ ] **Adaptive Icon** ✅
  - Already created: `./assets/adaptive-icon.png`

- [ ] **Feature Graphic**
  - Size: 1024 x 500 px
  - Format: PNG or JPEG
  - Max 1MB
  - **ACTION NEEDED**: Create using Canva/Figma
  - Use colors: Dark Petrol (#1E3F40), Orange (#FF7F3F)

- [ ] **Screenshots (6-8 required)**
  - [ ] Screenshot 1: Feed/Home screen
  - [ ] Screenshot 2: Add catch form
  - [ ] Screenshot 3: Catch detail view
  - [ ] Screenshot 4: Map view
  - [ ] Screenshot 5: Profile screen
  - [ ] Screenshot 6: Login screen
  - [ ] (Optional) Screenshot 7: Badges/achievements
  - [ ] (Optional) Screenshot 8: Friends/social

  Specifications:
  - Resolution: 1080 x 2340 px
  - Format: PNG or JPEG
  - Max 8MB each
  - Add device frames (use mockuphone.com)

- [ ] **Promotional Video** (optional but recommended)
  - 30 seconds to 2 minutes
  - YouTube upload required
  - Shows key features

### Text Content

- [ ] **Short description** ✅
  - Created in PLAY_STORE_ASSETS.md
  - 58/80 characters

- [ ] **Full description** ✅
  - Created in PLAY_STORE_ASSETS.md
  - ~2,340/4,000 characters
  - Includes keywords for ASO

- [ ] **Promotional text** ✅
  - Created in PLAY_STORE_ASSETS.md
  - 136/170 characters

### Legal Documents

- [ ] **Privacy Policy**
  - Document created ✅ (PRIVACY_POLICY.md)
  - **ACTION NEEDED**: Host at production URL
  - Suggested: https://hook-production.up.railway.app/privacy-policy
  - Or use free hosting: https://www.privacypolicies.com/

- [ ] **Terms of Service** (optional but recommended)
  - Create document
  - Host publicly
  - Link in app and Play Store

---

## 🏪 Play Console Setup

### Create App Listing

- [ ] **Go to Play Console**
  - Visit: https://play.google.com/console
  - Click "Create app"

- [ ] **App Details**
  - App name: "Hook"
  - Default language: Danish (da-DK)
  - App or game: App
  - Free or paid: Free

- [ ] **Store Listing**
  - Short description: ✅ (from PLAY_STORE_ASSETS.md)
  - Full description: ✅ (from PLAY_STORE_ASSETS.md)
  - App icon: ✅ (upload icon.png)
  - Feature graphic: ⚠️ (create and upload)
  - Screenshots: ⚠️ (capture and upload 6-8)
  - App category: Sports
  - Email: support@hook.app
  - Privacy policy URL: ⚠️ (host and add URL)

### App Content

- [ ] **Privacy Policy**
  - URL added to store listing

- [ ] **App Access**
  - Select: "All functionality is available without special access"
  - Or provide test credentials if needed

- [ ] **Ads Declaration**
  - Does your app contain ads? No (or Yes if you added ads)

- [ ] **Content Rating**
  - Complete questionnaire
  - Expected rating: Everyone (PEGI 3)
  - Questions to answer:
    - Violence: No
    - Sexual content: No
    - Profanity: No
    - User interaction: Yes
    - User-generated content: Yes
    - Location sharing: Yes
    - Personal info required: Yes

- [ ] **Target Audience**
  - Age group: 13+ (or specify)
  - Appeal to children: No

- [ ] **News App**
  - Is this a news app: No

- [ ] **Data Safety**
  - Complete data safety form
  - Types of data collected:
    - Location (optional, user-controlled)
    - Personal info (name, email)
    - Photos (catches)
    - App activity
  - Data sharing: None (or specify third parties)
  - Security practices:
    - Data encrypted in transit ✅
    - Data encrypted at rest ✅
    - Users can request deletion ✅

### Store Settings

- [ ] **Countries/Regions**
  - Select countries for distribution
  - Recommended start: Denmark, Nordic countries, Europe
  - Can expand later

- [ ] **Pricing**
  - Set as: Free
  - In-app purchases: None (or add if planning)

---

## 🚀 Release Phase

### Prepare Release

- [ ] **Upload AAB**
  - Go to: Production → Releases
  - Create new release
  - Upload .aab file from EAS build

- [ ] **Release Name**
  - Example: "1.0.0 - Initial Release"

- [ ] **Release Notes** (what's new)
  ```
  Hook 1.0.0 - Lancering! 🎣

  Velkommen til Hook - din digitale fiskebog!

  Features:
  • Log dine fangster med foto og placering
  • Del dine oplevelser med fællesskabet
  • Se fangster fra andre fiskere
  • Interaktivt kort med alle dine spots
  • GPS lokations tracking
  • Vejr information
  • Sociale funktioner (likes, kommentarer)

  God fisketur! 🐟
  ```

### Pre-Launch Testing (Recommended)

- [ ] **Internal Testing Track**
  - Add 10-20 testers
  - Upload AAB to internal track
  - Share link with testers
  - Collect feedback
  - Fix critical bugs

- [ ] **Closed Testing (Beta)**
  - Create beta track
  - Add 50-100 testers
  - Run for 1-2 weeks
  - Monitor crash reports
  - Fix issues

- [ ] **Open Testing** (optional)
  - Public beta
  - Unlimited users
  - Final testing before production

### Production Release

- [ ] **Review Checklist**
  - All store listing sections complete ✅
  - Privacy policy URL working ✅
  - Screenshots uploaded ✅
  - Feature graphic uploaded ✅
  - Content rating received ✅
  - Data safety completed ✅
  - AAB uploaded ✅
  - Release notes added ✅

- [ ] **Submit for Review**
  - Click "Review release"
  - Review all information
  - Click "Start rollout to Production"

- [ ] **Wait for Review**
  - Typical review time: 1-7 days
  - Monitor email for updates
  - Be ready to respond to questions

---

## 📊 Post-Launch Phase

### Monitor Launch

- [ ] **Check Play Console**
  - Monitor installation numbers
  - Check crash reports
  - Read user reviews
  - Monitor ratings

- [ ] **Analytics Setup** (if not done)
  - [ ] Add Firebase Analytics
  - [ ] Track key events:
    - User signups
    - Catches logged
    - Photos uploaded
    - Social interactions

- [ ] **User Support**
  - Monitor support email
  - Respond to reviews
  - Fix critical bugs quickly

### Marketing

- [ ] **Announce Launch**
  - Social media posts
  - Fishing forums/communities
  - Email existing contacts
  - Press release (optional)

- [ ] **App Store Optimization (ASO)**
  - Monitor keyword rankings
  - Adjust description based on performance
  - A/B test screenshots
  - Respond to all reviews

### Updates

- [ ] **Plan First Update**
  - Fix bugs found in production
  - Add requested features
  - Improve based on user feedback
  - Increment version to 1.0.1

---

## 🔧 Technical Checklist

### Code Quality

- [ ] **Remove debug code**
  - No console.logs in production
  - Remove test/development code
  - Clean up commented code

- [ ] **Error Handling**
  - All API calls have error handling
  - User-friendly error messages
  - Offline mode handled gracefully

- [ ] **Performance**
  - Images optimized
  - Lazy loading implemented
  - No memory leaks
  - Smooth animations

- [ ] **Security**
  - No API keys in code
  - All API calls use HTTPS
  - User authentication secured
  - Data validation on all inputs

### API Configuration

- [ ] **Production URLs**
  - All hardcoded URLs updated
  - Environment variables used
  - No localhost references

- [ ] **OAuth Redirect URIs**
  - Google: Add package name to authorized apps
  - Facebook: Add package hash to authorized apps

### Database

- [ ] **Railway Database**
  - Backups enabled
  - Performance monitored
  - Scaling plan ready

---

## 📞 Support & Resources

### Documentation Created ✅

- [x] PLAY_STORE_ASSETS.md - All text content and specifications
- [x] PRIVACY_POLICY.md - Complete privacy policy
- [x] SCREENSHOT_GUIDE.md - How to capture screenshots
- [x] PLAY_STORE_CHECKLIST.md - This document

### Quick Links

- **Play Console**: https://play.google.com/console
- **EAS Build Dashboard**: https://expo.dev/accounts/[your-account]/projects/hook/builds
- **Railway Dashboard**: https://railway.app/dashboard
- **Production API**: https://hook-production.up.railway.app

### Support Contacts

- **Expo Support**: https://expo.dev/support
- **Play Console Help**: https://support.google.com/googleplay/android-developer
- **Railway Support**: https://railway.app/help

---

## ⚠️ Common Issues & Solutions

### Build Fails
```bash
# Clear cache and rebuild
eas build:configure
eas build --platform android --profile production --clear-cache
```

### OAuth Not Working in Production
- Verify package name matches: com.cjusjong.hook
- Check OAuth redirect URIs in Google/Facebook console
- Add SHA-1 fingerprint if required

### App Rejected by Google
- Review email carefully
- Common issues:
  - Missing privacy policy
  - Incomplete data safety section
  - Inappropriate content
  - Misleading description
- Fix issues and resubmit

---

## 🎯 Priority Actions

**MUST DO BEFORE SUBMISSION:**

1. ⚠️ **Update all API URLs from localhost to production**
2. ⚠️ **Create and upload Feature Graphic (1024x500px)**
3. ⚠️ **Capture and upload 6-8 Screenshots**
4. ⚠️ **Host Privacy Policy at public URL**
5. ⚠️ **Build production AAB with EAS**
6. ⚠️ **Test production build on real device**
7. ⚠️ **Complete all Play Console sections**

**RECOMMENDED:**

1. Run internal testing phase
2. Create promotional video
3. Set up Firebase Analytics
4. Prepare marketing materials
5. Create social media accounts

---

## ✅ Final Sign-Off

Before clicking "Submit for Review":

- [ ] I have tested the production build on a real device
- [ ] All API endpoints point to production backend
- [ ] OAuth login works with Google and Facebook
- [ ] Privacy policy is hosted and accessible
- [ ] All Play Console sections are complete
- [ ] Screenshots accurately represent the app
- [ ] App complies with Google Play policies
- [ ] I'm ready to respond to user reviews and support requests

**Estimated time to complete**: 4-8 hours
**Review time**: 1-7 days
**Total time to launch**: 1-2 weeks

---

*Good luck with your launch! 🚀🎣*

**Questions?** Review the documentation files created or reach out for help.
