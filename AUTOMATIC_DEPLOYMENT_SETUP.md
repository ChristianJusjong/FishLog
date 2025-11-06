# 🤖 Automatic Deployment Setup Guide

This guide will help you set up **fully automatic deployment** of your Hook mobile app to Google Play Internal Testing whenever you push code to the `main` branch.

## 📋 Overview

**What gets automated:**
1. ✅ Detect changes to `apps/mobile/**` or `packages/**`
2. ✅ Build Android App Bundle (AAB) via EAS
3. ✅ Submit to Google Play Internal Testing track
4. ✅ All triggered automatically on push to `main`

**Prerequisites:**
- GitHub repository with Actions enabled
- EAS account (you already have: cjusjong)
- Google Play Console app created
- Google Cloud Project with API access

---

## 🔧 Setup Steps

### Step 1: Create Google Play Service Account

1. **Go to Google Play Console**
   - URL: https://play.google.com/console
   - Select your app (com.cjusjong.hook)

2. **Navigate to API Access**
   - Left sidebar: **Setup → API access**
   - Click **"Create new service account"**

3. **Create Service Account in Google Cloud**
   - Click the link to Google Cloud Console
   - It will open your project
   - Click **"Create Service Account"**
   - Fill in:
     - **Name**: `hook-github-actions`
     - **Description**: `Service account for automatic deployment from GitHub`
   - Click **"Create and Continue"**

4. **Grant Permissions**
   - **Role 1**: Add `Service Account User`
   - **Role 2**: Add `Service Usage Consumer`
   - Click **"Continue"** → **"Done"**

5. **Create JSON Key**
   - Find your new service account in the list
   - Click the three dots (⋮) → **"Manage keys"**
   - Click **"Add Key"** → **"Create new key"**
   - Choose **JSON** format
   - Click **"Create"**
   - A JSON file will download - **SAVE THIS FILE SECURELY**

6. **Grant Access in Play Console**
   - Go back to Play Console → **API access**
   - Find your service account `hook-github-actions@...`
   - Click **"Grant access"**
   - **App permissions**: Select your app
   - **Account permissions**:
     - ✅ View app information and download bulk reports
     - ✅ Create and edit draft apps
     - ✅ Release to testing tracks
     - ✅ Release to production, exclude devices, and use Play App Signing
   - Click **"Invite user"** → **"Send invitation"**

---

### Step 2: Get Your Expo Token

1. **Open terminal** and run:
   ```bash
   npx eas login
   ```

2. **Create an access token**:
   ```bash
   npx eas build:configure
   ```

   Then run:
   ```bash
   npx eas whoami
   ```

   Or go to: https://expo.dev/accounts/cjusjong/settings/access-tokens

3. **Create new token**:
   - Click **"Create Token"**
   - Name: `github-actions-hook`
   - Click **"Create"**
   - **COPY THE TOKEN** - you won't see it again!

---

### Step 3: Configure GitHub Secrets

1. **Go to your GitHub repository**
   - URL: https://github.com/YOUR_USERNAME/FishLog

2. **Navigate to Settings → Secrets and variables → Actions**

3. **Add Repository Secrets**

   **Secret 1: EXPO_TOKEN**
   - Click **"New repository secret"**
   - Name: `EXPO_TOKEN`
   - Value: Paste the Expo token from Step 2
   - Click **"Add secret"**

   **Secret 2: GOOGLE_PLAY_SERVICE_ACCOUNT_JSON**
   - Click **"New repository secret"**
   - Name: `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`
   - Value: Open the JSON file you downloaded in Step 1
   - **Copy the ENTIRE contents** of the JSON file
   - Paste it into the value field
   - Click **"Add secret"**

---

### Step 4: Enable Google Play API

1. **Go to Google Cloud Console**
   - URL: https://console.cloud.google.com/

2. **Select your project**
   - The one linked to your Play Console

3. **Enable Google Play Android Developer API**
   - Search for: "Google Play Android Developer API"
   - Or go to: https://console.cloud.google.com/apis/library/androidpublisher.googleapis.com
   - Click **"Enable"**

---

### Step 5: Test the Workflow

1. **Commit and push the workflow file**:
   ```bash
   git add .github/workflows/deploy-mobile.yml
   git add apps/mobile/.gitignore
   git commit -m "feat: Add automatic deployment workflow"
   git push origin main
   ```

2. **Monitor the workflow**:
   - Go to: https://github.com/YOUR_USERNAME/FishLog/actions
   - You should see "Deploy Mobile App to Google Play" running
   - Click on it to see live logs

3. **Check the build**:
   - Workflow will trigger EAS build
   - Takes ~10-20 minutes
   - Will automatically submit to Play Console

4. **Verify in Play Console**:
   - Go to: https://play.google.com/console
   - Navigate to: **Testing → Internal testing**
   - You should see a new release!

---

## 🚦 How It Works

### Automatic Triggers

The workflow runs automatically when:
- You push code to `main` branch
- Changes are in `apps/mobile/**` or `packages/**` directories

### Manual Trigger

You can also trigger manually:
1. Go to: https://github.com/YOUR_USERNAME/FishLog/actions
2. Select "Deploy Mobile App to Google Play"
3. Click **"Run workflow"**
4. Choose branch and click **"Run workflow"**

---

## 📝 Workflow Steps

Here's what happens when the workflow runs:

1. **Checkout code** - Gets your latest code
2. **Setup Node.js** - Installs Node.js 20
3. **Install dependencies** - Runs `npm ci`
4. **Setup Expo/EAS** - Configures EAS CLI
5. **Create service account key** - Writes the JSON key temporarily
6. **Build AAB** - Runs `eas build --platform android --profile production`
7. **Wait for build** - Polls EAS until build completes (~10-20 min)
8. **Submit to Play Store** - Runs `eas submit --platform android --latest`
9. **Clean up** - Removes service account key
10. **Notify** - Logs success or failure

---

## 🔒 Security Notes

**Important:**
- ✅ Service account JSON is stored as GitHub secret (encrypted)
- ✅ JSON key is created temporarily during workflow, then deleted
- ✅ `google-play-service-account.json` is in `.gitignore`
- ❌ **NEVER** commit the service account JSON to your repository

**If you accidentally commit it:**
1. Delete the service account in Google Cloud Console
2. Create a new one
3. Update GitHub secret
4. Remove from git history:
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch apps/mobile/google-play-service-account.json" \
     --prune-empty --tag-name-filter cat -- --all
   git push origin --force --all
   ```

---

## 🐛 Troubleshooting

### Issue: "Build failed with expo-doctor error"
**Solution**: This is already fixed in your metro.config.js

### Issue: "Unauthorized: Invalid credentials"
**Solution**:
- Check EXPO_TOKEN is correct
- Generate new token: https://expo.dev/accounts/cjusjong/settings/access-tokens
- Update GitHub secret

### Issue: "Google Play API error: The caller does not have permission"
**Solution**:
- Verify service account has correct permissions in Play Console
- Make sure Google Play Android Developer API is enabled
- Check service account JSON is complete in GitHub secret

### Issue: "App not found in Play Console"
**Solution**:
- You must manually create the app listing first
- The workflow only submits to existing apps
- Follow: `PLAY_STORE_SUBMISSION_GUIDE.md`

### Issue: "Workflow not triggering"
**Solution**:
- Check you pushed to `main` branch
- Verify changes are in `apps/mobile/**` or `packages/**`
- Check GitHub Actions is enabled: Settings → Actions → Allow all actions

---

## 📊 What's Deployed

**Track**: Internal Testing (not production)

**What this means:**
- App is uploaded to Play Console
- Available to internal testers only
- NOT live in the public Play Store
- You control when to promote to production

**To promote to production:**
1. Go to Play Console
2. Testing → Internal testing
3. Select the release
4. Click **"Promote release"** → **"Production"**

---

## 🎯 Next Steps After Setup

Once automation is working:

1. **Add internal testers**:
   - Play Console → Testing → Internal testing
   - Click **"Testers"** tab
   - Add email addresses

2. **Test the app**:
   - Testers receive email with download link
   - Verify app works on real devices

3. **Create production release**:
   - Once tested, promote to production
   - Complete store listing (screenshots, etc.)
   - Submit for Google review

4. **Monitor deployments**:
   - GitHub Actions tab shows all deployments
   - Play Console shows all releases
   - Set up email notifications in GitHub

---

## 🔄 Deployment Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│  Developer pushes code to main branch                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  GitHub Actions detects changes in apps/mobile/**           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  Install dependencies and setup EAS                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  EAS Build: Create Android App Bundle (AAB)                 │
│  ~10-20 minutes                                              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  EAS Submit: Upload to Google Play Internal Testing         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  ✅ App available for internal testers!                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 📚 Additional Resources

- **EAS Build docs**: https://docs.expo.dev/build/introduction/
- **EAS Submit docs**: https://docs.expo.dev/submit/introduction/
- **GitHub Actions docs**: https://docs.github.com/en/actions
- **Play Console help**: https://support.google.com/googleplay/android-developer

---

## ✅ Checklist

Before your first automatic deployment:

- [ ] Google Play service account created
- [ ] Service account JSON downloaded
- [ ] Service account granted access in Play Console
- [ ] Google Play Android Developer API enabled
- [ ] Expo access token created
- [ ] `EXPO_TOKEN` secret added to GitHub
- [ ] `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` secret added to GitHub
- [ ] Workflow file committed to repository
- [ ] GitHub Actions enabled in repository settings
- [ ] App listing created in Play Console (com.cjusjong.hook)

---

**🎉 You're all set!** Every push to `main` will now automatically build and deploy your app to Google Play Internal Testing.

For questions or issues, refer to the troubleshooting section or check the GitHub Actions logs.
