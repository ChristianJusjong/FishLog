# ⚡ Quick Start - Deploy Hook to Google Play

**Goal**: Get your Hook app on Google Play Store as fast as possible.

**Time**: ~1-2 hours for first submission

---

## 🎯 Current Status

✅ You have:
- Android App Bundle (AAB) ready: https://expo.dev/artifacts/eas/tfHFfcgqpCiZNwWFcMpCMS.aab
- Package name: `com.cjusjong.hook`
- Privacy policy live: https://fishlog-production.up.railway.app/privacy-policy.html
- All store text prepared

🔲 You need:
- Google Play Console app created
- Screenshots (6-8 images)
- Feature graphic (1024x500px)
- Service account (for automation)

---

## 🚀 Fast Track: Manual First Submission

**Skip automation for now**, get the app submitted first:

### 1. Create Play Console App (5 min)

1. Go to: https://play.google.com/console
2. Click **"All apps"** → **"Create app"**
3. Fill in:
   - Name: **Hook**
   - Language: **Danish**
   - Type: **App**
   - Price: **Free**
   - Check all boxes
4. Click **"Create app"**

### 2. Store Listing (10 min)

In Play Console → **Store presence** → **Main store listing**:

**Short description** (copy-paste):
```
Log dine fangster, del oplevelser og bliv en bedre fisker
```

**Full description** (copy from `apps/mobile/PLAY_STORE_SUBMISSION_GUIDE.md` lines 25-99)

**Contact**:
- Email: `your-email@example.com`
- Website: `https://fishlog-production.up.railway.app`
- Privacy policy: `https://fishlog-production.up.railway.app/privacy-policy.html`

**Category**: Sports

### 3. Graphics - Quick Method (20 min)

**App icon** (512x512):
1. Go to: https://www.iloveimg.com/resize-image
2. Upload: `apps/mobile/assets/icon.png`
3. Resize to 512x512
4. Download and upload to Play Console

**Feature graphic** (1024x500):
1. Go to: https://www.canva.com/create/feature-graphics/
2. Use template or create custom size: 1024x500
3. Add your logo from `apps/mobile/assets/icon.png`
4. Add text: "Hook - Din digitale fiskebog"
5. Background color: #1E3F40 (dark petrol)
6. Download PNG and upload to Play Console

**Screenshots** (1080x2340) - SKIP FOR NOW:
- You can upload screenshots later
- Or use these temporary placeholder methods:
  - Take screenshots from web version
  - Use example images from similar apps
  - Create mockups at: https://mockuphone.com/

**Minimum**: Upload at least 2 screenshots (required)

### 4. App Content (15 min)

**Privacy policy**:
- Go to: **Policy** → **Privacy policy**
- URL: `https://fishlog-production.up.railway.app/privacy-policy.html`
- Save

**App access**:
- Select: "All functionality available without restrictions"
- Save

**Ads**:
- Select: "No, my app doesn't contain ads"
- Save

**Content rating**:
- Click "Start questionnaire"
- Category: Apps
- Answer questions (mostly No, Yes for user interaction and location)
- Submit

**Target audience**:
- Age: 13+
- Not designed for children: Yes
- Save

**News app**:
- No
- Save

**Data safety**:
- Location: Yes (optional, approximate)
- Personal info: Yes (name, email)
- Photos: Yes (optional)
- Data encrypted in transit: Yes
- Users can request deletion: Yes
- Submit

### 5. Upload AAB (2 min)

1. Download AAB: https://expo.dev/artifacts/eas/tfHFfcgqpCiZNwWFcMpCMS.aab
2. Go to: **Release** → **Production** → **Create new release**
3. Upload AAB file
4. **Release notes** (copy-paste):
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
5. Click **"Review release"**
6. Fix any errors (red X's)
7. Click **"Start rollout to Production"**

### 6. Wait for Review (1-7 days)

Google will review your app. Check your email for updates.

---

## 🤖 After Manual Submission: Set Up Automation

Once your app is approved, set up automatic deployment:

**Why wait?**
- First submission requires manual store setup (screenshots, etc.)
- Automation only handles updates, not initial setup
- Easier to troubleshoot after first success

**To set up automation after approval:**

1. Follow: `GOOGLE_PLAY_SERVICE_ACCOUNT_GUIDE.md`
2. Create service account
3. Add GitHub secrets
4. All future updates will deploy automatically!

---

## 📋 Checklist

Before submitting, verify:

- [ ] App created in Play Console
- [ ] Short description added
- [ ] Full description added
- [ ] Privacy policy URL added
- [ ] App icon uploaded (512x512)
- [ ] Feature graphic uploaded (1024x500)
- [ ] At least 2 screenshots uploaded
- [ ] Content rating completed
- [ ] Data safety completed
- [ ] Target audience selected
- [ ] AAB file uploaded
- [ ] Release notes written
- [ ] All sections have green checkmarks

---

## 🆘 Stuck?

**Can't find API access?**
→ See: `GOOGLE_PLAY_SERVICE_ACCOUNT_GUIDE.md`

**Need screenshots?**
→ See: `PLAY_STORE_SUBMISSION_GUIDE.md` (Part 3)

**Want automation now?**
→ See: `AUTOMATIC_DEPLOYMENT_SETUP.md`

**Need detailed store listing text?**
→ See: `PLAY_STORE_SUBMISSION_GUIDE.md` (Part 1)

---

## ⏭️ Next Steps

1. ✅ **Today**: Submit manually using this guide
2. ⏳ **Wait 1-7 days**: Google reviews app
3. 🎉 **After approval**: Set up automation
4. 🔄 **Forever after**: Push code → auto-deploy

---

**Let's get your app submitted! Start with Step 1.** 🚀
