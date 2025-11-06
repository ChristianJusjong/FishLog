# 🚀 Quick Start: Deploy Hook to Google Play Store

This is your express guide to get Hook on the Google Play Store in the shortest time possible.

---

## ⏱️ Estimated Time: 4-6 hours

- Setup & Configuration: 1-2 hours
- Asset Creation: 2-3 hours
- Build & Test: 1 hour
- Submission: 15-30 minutes
- Google Review: 1-7 days (waiting time)

---

## 🎯 Phase 1: Prerequisites (30 minutes)

### 1. Create Google Play Developer Account
- Go to: https://play.google.com/console/signup
- Pay $25 one-time fee
- Complete registration

### 2. Create Expo Account
- Go to: https://expo.dev/signup
- Verify email

### 3. Install EAS CLI
```bash
npm install -g eas-cli
```

✅ **Checkpoint**: You should have access to both consoles

---

## 🎯 Phase 2: Update Code for Production (45 minutes)

### 1. Update API URLs

**Quick method:**
```bash
cd apps/mobile

# Find all occurrences
grep -r "192.168.86.236:3000" app/

# Replace with production URL
# Edit each file and change to:
# https://hook-production.up.railway.app
```

**Files to update:**
- `app/feed.tsx` (confirmed has hardcoded URL at line 10)
- Search all other screens for similar patterns

**Better method (for future):**
Create `config/api.ts`:
```typescript
const API_URL = __DEV__
  ? 'http://192.168.86.236:3000'
  : 'https://hook-production.up.railway.app';

export { API_URL };
```

### 2. Verify app.json
Check that these are correct:
```json
{
  "expo": {
    "name": "Hook",
    "slug": "hook",
    "version": "1.0.0",
    "android": {
      "package": "com.cjusjong.hook",
      "versionCode": 1
    }
  }
}
```

✅ **Checkpoint**: All URLs point to production

---

## 🎯 Phase 3: Configure EAS (15 minutes)

### 1. Login to Expo
```bash
cd apps/mobile
eas login
```

### 2. EAS Configuration Already Created ✅
The `eas.json` file is already created for you.

### 3. Configure Project
```bash
eas build:configure
```

Follow the prompts (press Enter for defaults).

✅ **Checkpoint**: EAS is configured

---

## 🎯 Phase 4: Create Visual Assets (2-3 hours)

This is the most time-consuming part. You have several options:

### Option A: Do It Yourself (2-3 hours)

**1. Feature Graphic (30 minutes)**
- Use Canva: https://www.canva.com/
- Size: 1024 x 500 px
- Template: "Google Play Feature Graphic"
- Colors: Dark Petrol (#1E3F40), Orange (#FF7F3F)
- Text: "Hook - Din digitale fiskebog"

**2. Screenshots (1-2 hours)**

Run the app and capture 6 screenshots:

```bash
# Start Android emulator (Pixel 5 or 6)
cd apps/mobile
npm run android
```

Capture these screens:
1. Feed with catches
2. Add catch form
3. Catch detail
4. Map view
5. Profile
6. Login screen

Add device frames using: https://mockuphone.com/

**3. Optimize Images**
- Use TinyPNG: https://tinypng.com/
- Keep under 8MB each

### Option B: Skip for Now (15 minutes)

Minimum requirements:
- Feature Graphic: Use a simple design tool
- Screenshots: 2 minimum (just capture feed and add catch)

You can update assets later after initial submission.

✅ **Checkpoint**: You have feature graphic + 2-6 screenshots

---

## 🎯 Phase 5: Host Privacy Policy (30 minutes)

### Quick Option: Use Railway Backend

**1. Install static file serving:**
```bash
cd apps/backend
npm install @fastify/static
```

**2. Create public directory and add privacy policy:**
```bash
mkdir public
# Copy privacy policy HTML to: public/privacy-policy.html
```

**3. Update src/index.ts:**
```typescript
import fastifyStatic from '@fastify/static';
import path from 'path';

server.register(fastifyStatic, {
  root: path.join(__dirname, '../public'),
  prefix: '/',
});

server.get('/privacy-policy', async (request, reply) => {
  return reply.sendFile('privacy-policy.html');
});
```

**4. Deploy:**
```bash
git add .
git commit -m "Add privacy policy"
git push
```

**5. Verify:**
Visit: `https://hook-production.up.railway.app/privacy-policy`

**Alternative**: Use TermsFeed.com (5 minutes)
- Generate at: https://www.termsfeed.com/
- They host for free
- Copy the URL they provide

✅ **Checkpoint**: Privacy policy accessible at public URL

---

## 🎯 Phase 6: Build for Production (30 minutes)

### 1. Build Production AAB
```bash
cd apps/mobile
eas build --platform android --profile production
```

This will:
- Upload your code to Expo
- Build Android App Bundle (.aab)
- Take 10-20 minutes

While building, continue to next phase...

### 2. Download Build
When complete:
- Check email for build notification
- Or visit: https://expo.dev/
- Download the .aab file

✅ **Checkpoint**: You have a .aab file ready

---

## 🎯 Phase 7: Create Play Store Listing (45 minutes)

### 1. Go to Play Console
https://play.google.com/console

### 2. Create New App
- Click "Create app"
- App name: **Hook**
- Language: Danish (da-DK)
- Type: App
- Free or paid: Free
- Accept declarations

### 3. Store Listing

**App Details:**
```
Short description (80 chars):
Log dine fangster, del oplevelser og bliv en bedre fisker

Full description:
(Copy from PLAY_STORE_ASSETS.md)
```

**Graphics:**
- App icon: Upload from `assets/icon.png`
- Feature graphic: Upload your created 1024x500 image
- Screenshots: Upload 2-8 screenshots

**Categorization:**
- App category: Sports
- Tags: fishing, outdoor, sports

**Contact details:**
- Email: support@hook.app
- Website: https://hook-production.up.railway.app
- Privacy policy: (Your hosted URL)

### 4. App Content

**Privacy Policy:**
- Add your hosted URL

**App Access:**
- All features available without login: No
- Provide instructions: "Users must create account via Google/Facebook"

**Ads:**
- Contains ads: No

**Content Rating:**
Complete questionnaire:
- Target age: 13+
- Violence: No
- Sexual content: No
- User interaction: Yes
- Location sharing: Yes

**Target Audience:**
- Age: 13+

**Data Safety:**
- Location: Yes (optional, user-controlled)
- Personal info: Yes (name, email)
- Photos: Yes
- Data encrypted: Yes
- Users can request deletion: Yes

### 5. Store Settings

**Countries:**
- Select Denmark (or all countries)

**Pricing:**
- Free

✅ **Checkpoint**: Store listing is complete

---

## 🎯 Phase 8: Upload & Submit (15 minutes)

### 1. Go to Production Release
- Production → Releases
- Create new release

### 2. Upload AAB
- Upload the .aab file from EAS build
- Or use automatic submission (see below)

### 3. Release Notes
```
Hook 1.0.0 - Lancering! 🎣

Velkommen til Hook - din digitale fiskebog!

Features:
• Log dine fangster med foto og placering
• Del dine oplevelser med fællesskabet
• Interaktivt kort med fiskespots
• GPS tracking og vejr information

God fisketur! 🐟
```

### 4. Review & Submit
- Review all information
- Click "Review release"
- Click "Start rollout to Production"

✅ **Checkpoint**: App submitted for review!

---

## 🎯 Automatic Submission (Advanced)

If you want to automate uploads:

```bash
# Build and submit in one command
eas build --platform android --profile production --auto-submit
```

For this to work, you need to set up Google Play Service Account (see PLAY_STORE_CHECKLIST.md).

---

## ⚡ Super Quick Path (Minimal Viable Submission)

If you want to submit TODAY with minimal effort:

**1. Update code (15 min)**
- Change API URLs to production

**2. Build (20 min)**
```bash
eas login
eas build --platform android --profile production
```

**3. Quick assets (30 min)**
- Feature graphic: Use Canva template
- Screenshots: Capture 2 screens (feed + login)

**4. Privacy policy (10 min)**
- Use TermsFeed.com generator + hosting

**5. Play Console (30 min)**
- Create app listing
- Fill required fields only
- Upload AAB
- Submit

**Total: ~2 hours for bare minimum submission**

---

## 📋 Final Checklist

Before submitting, verify:

- [ ] All API URLs updated to production
- [ ] EAS build completed successfully
- [ ] Feature graphic uploaded
- [ ] At least 2 screenshots uploaded
- [ ] Privacy policy URL added
- [ ] Content rating completed
- [ ] Data safety completed
- [ ] AAB uploaded
- [ ] Release notes added
- [ ] Submission clicked

---

## 🎯 What Happens Next?

1. **Google Review**: 1-7 days (typically 2-3 days)
2. **They'll check**:
   - App functionality
   - Privacy policy
   - Content rating accuracy
   - Policy compliance

3. **Possible outcomes**:
   - ✅ Approved → App goes live!
   - ⚠️ Changes needed → Fix and resubmit
   - ❌ Rejected → Review reason and appeal

4. **When approved**:
   - App appears on Play Store within hours
   - You'll receive email confirmation
   - Users can download immediately

---

## 🆘 Common Issues

### Build fails
```bash
# Clear cache and retry
eas build --platform android --profile production --clear-cache
```

### "Network request failed" in production build
- API URLs not updated properly
- Search all files for localhost/192.168

### App rejected: "Privacy policy not accessible"
- Test URL in incognito mode
- Must be HTTPS
- Must not require login

---

## 📞 Quick Links

- **Play Console**: https://play.google.com/console
- **Expo Dashboard**: https://expo.dev/
- **Railway Dashboard**: https://railway.app/dashboard
- **Canva**: https://www.canva.com/
- **MockUPhone**: https://mockuphone.com/
- **TermsFeed**: https://www.termsfeed.com/

---

## 📚 Detailed Guides

For more detailed information, see:
- `PLAY_STORE_CHECKLIST.md` - Complete checklist
- `PLAY_STORE_ASSETS.md` - All text content
- `SCREENSHOT_GUIDE.md` - How to capture screenshots
- `UPDATE_API_URLS.md` - Update code for production
- `HOST_PRIVACY_POLICY.md` - Privacy policy hosting options
- `PRIVACY_POLICY.md` - Privacy policy content

---

## 🎉 You're Ready!

Follow this guide step by step, and you'll have your app on the Play Store soon!

**Good luck with your launch!** 🚀🎣

---

*Estimated total time: 4-6 hours (excluding Google review wait time)*
