# 🔑 Google Play Service Account - Detailed Setup Guide

This guide helps you create a service account for automatic app deployment.

## 🎯 Prerequisites

Before starting, make sure:
- ✅ You have a Google Play Console account
- ✅ You've paid the $25 one-time developer fee
- ✅ You have **Admin** or **Owner** access to your developer account

---

## 📱 Step 1: Create Your App in Play Console (If Not Done Yet)

**Why do this first?** The API access section only appears after you create at least one app.

1. **Go to**: https://play.google.com/console

2. **Click "All apps"** in left sidebar

3. **Click "Create app"** (blue button, top right)

4. **Fill in the form**:
   ```
   App name: Hook
   Default language: Danish (da-DK)
   App or game: App
   Free or paid: Free

   Developer Program Policies: ✓ Check
   US export laws: ✓ Check
   ```

5. **Click "Create app"**

6. You'll see a dashboard with % completion - **don't worry about completing everything yet**

---

## 🔧 Step 2: Navigate to API Access

### Method 1: Using Sidebar Navigation

1. **Stay in Play Console** (you should see your Hook app)

2. **Look at the LEFT SIDEBAR**:
   ```
   📊 Dashboard
   📱 All apps

   SETUP                    ← Look for this section
   ├── 🔧 App setup
   ├── 🔐 API access        ← This is what you need!
   └── ...

   RELEASE
   ├── Production
   └── ...
   ```

3. **Click on "Setup"** to expand (if collapsed)

4. **Click on "API access"**

### Method 2: Direct URL

If you can't find it in the sidebar:

1. **Go to**: https://play.google.com/console/u/0/developers

2. **Find your developer account** and click it

3. **In the address bar**, you'll see a URL like:
   ```
   https://play.google.com/console/u/0/developers/1234567890123456789/
   ```

4. **Add `/api-access` to the end**:
   ```
   https://play.google.com/console/u/0/developers/1234567890123456789/api-access
   ```

### Method 3: Search Function

1. In Play Console, look for a **search icon** 🔍 (usually top right)

2. Type: **"API access"**

3. Click the result

---

## 🏗️ Step 3: Link to Google Cloud Project

When you open API access for the first time, you'll see:

**Option 1: "No linked Google Cloud project"**
1. Click **"Link a Google Cloud project"**
2. Click **"I agree"** to terms
3. A Google Cloud project will be created automatically

**Option 2: Already have a linked project**
- You'll see a project name
- Proceed to Step 4

---

## 👤 Step 4: Create Service Account

1. **You should now see the API access page** with:
   - OAuth clients
   - Service accounts section
   - "Create new service account" button

2. **Click "Create new service account"**

3. **A popup appears** with instructions and a link:
   ```
   "Follow the instructions on Google Cloud Console to create a service account"
   ```

4. **Click the "Google Cloud Console" link** (opens in new tab)

5. **You're now in Google Cloud Console** at:
   ```
   https://console.cloud.google.com/iam-admin/serviceaccounts
   ```

---

## ☁️ Step 5: Create Service Account in Google Cloud

You should see the **Service Accounts** page:

1. **Click "CREATE SERVICE ACCOUNT"** (top of page)

2. **Fill in Step 1 - Service account details**:
   ```
   Service account name: hook-github-actions
   Service account ID: hook-github-actions (auto-filled)
   Description: Service account for automatic deployment from GitHub Actions
   ```
   Click **"CREATE AND CONTINUE"**

3. **Fill in Step 2 - Grant access**:
   - **Select a role**: Click the dropdown
   - Search for: **"Service Account User"**
   - Click to add it
   - Click **"+ ADD ANOTHER ROLE"**
   - Search for: **"Service Usage Consumer"**
   - Click to add it
   - Click **"CONTINUE"**

4. **Step 3 - Grant users access**:
   - Leave blank (optional)
   - Click **"DONE"**

5. **You should now see your service account** in the list:
   ```
   hook-github-actions@YOUR-PROJECT.iam.gserviceaccount.com
   ```

---

## 🔑 Step 6: Create and Download JSON Key

1. **Find your service account** in the list:
   ```
   hook-github-actions@...
   ```

2. **Click on the service account email** (the blue link)

3. **Go to the "KEYS" tab** (top of page)

4. **Click "ADD KEY" → "Create new key"**

5. **Choose key type**:
   - Select: **JSON** ✓
   - Click **"CREATE"**

6. **A JSON file downloads automatically**:
   ```
   YOUR-PROJECT-abc123.json
   ```

7. **⚠️ SAVE THIS FILE SECURELY**:
   - You'll need it for GitHub secrets
   - Can't download again (but can create new key)
   - Contains sensitive credentials

---

## 🔐 Step 7: Enable Google Play Android Developer API

Still in Google Cloud Console:

1. **Go to APIs & Services**:
   - Click the hamburger menu (☰) top left
   - Click **"APIs & Services"** → **"Library"**

2. **Search for**: "Google Play Android Developer API"

3. **Click on it** in the results

4. **Click "ENABLE"** button

5. **Wait** for confirmation (few seconds)

6. You should see: ✓ "API enabled"

---

## ✅ Step 8: Grant Permissions Back in Play Console

1. **Go back to Play Console** → **API access**
   (You may still have the tab open)

2. **You should now see** your service account listed under "Service accounts":
   ```
   hook-github-actions@YOUR-PROJECT.iam.gserviceaccount.com
   ```

3. **Click "Manage Play Console permissions"** (or "Grant access")

4. **Invite user page opens**:

   **App permissions**:
   - Click **"Add app"**
   - Select: ✓ **Hook** (com.cjusjong.hook)

   **Account permissions** (scroll down):
   - ✓ View app information and download bulk reports (read-only)
   - ✓ Create and edit draft apps
   - ✓ Release to testing tracks
   - ✓ Release to production, exclude devices, and use Play App Signing

   Leave others unchecked unless you need them.

5. **Click "Invite user"** (bottom right)

6. **Click "Send invitation"** to confirm

7. **Done!** The service account now has access.

---

## 📄 Step 9: Prepare the JSON for GitHub

You downloaded a JSON file in Step 6. It looks like this:

```json
{
  "type": "service_account",
  "project_id": "your-project-123456",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "hook-github-actions@your-project.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/..."
}
```

**To add to GitHub**:

1. Open the JSON file in a text editor (Notepad, VS Code, etc.)
2. **Select ALL the contents** (Ctrl+A)
3. **Copy** (Ctrl+C)
4. Keep it ready for the next step

---

## 🐙 Step 10: Add to GitHub Secrets

1. **Go to your GitHub repository**:
   ```
   https://github.com/YOUR_USERNAME/FishLog
   ```

2. **Click "Settings"** tab (top right)

3. **Click "Secrets and variables"** → **"Actions"** (in left sidebar under Security)

4. **Add Secret 1 - Service Account**:
   - Click **"New repository secret"**
   - Name: `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`
   - Value: **Paste the entire JSON contents** from Step 9
   - Click **"Add secret"**

5. **Add Secret 2 - Expo Token**:
   - Click **"New repository secret"**
   - Name: `EXPO_TOKEN`
   - Value: Get from https://expo.dev/accounts/cjusjong/settings/access-tokens
     - Click "Create Token"
     - Name: `github-actions-hook`
     - Copy the token
     - Paste here
   - Click **"Add secret"**

---

## ✅ Verification Checklist

Make sure you have:

- [x] App created in Play Console (Hook / com.cjusjong.hook)
- [x] Service account created in Google Cloud
- [x] JSON key downloaded
- [x] Google Play Android Developer API enabled
- [x] Service account granted permissions in Play Console
- [x] `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` secret in GitHub
- [x] `EXPO_TOKEN` secret in GitHub

---

## 🐛 Common Issues

### "I don't see API access in the sidebar"

**Solution 1**: Create an app first (Step 1)
**Solution 2**: Check you have Admin/Owner role
**Solution 3**: Try the direct URL method (Step 2, Method 2)

### "Can't find service accounts in Play Console"

You're looking in the wrong place. Service accounts are created in **Google Cloud Console**, then they appear in **Play Console API access**.

### "API not enabled error when deploying"

Go back to Google Cloud Console and enable:
- Google Play Android Developer API
- Cloud Resource Manager API (if needed)

### "Unauthorized error when submitting"

1. Check service account has correct permissions in Play Console
2. Verify JSON is complete in GitHub secret (no truncation)
3. Make sure you granted "Release to testing tracks" permission

### "App not found in Play Console"

The service account can't see apps it doesn't have permission for. Make sure you selected your app (Hook) when granting permissions in Step 8.

---

## 🔒 Security Best Practices

✅ **DO**:
- Keep the JSON file secure
- Add to GitHub secrets (encrypted)
- Add to `.gitignore` if used locally
- Create service account with minimal permissions
- Rotate keys every 90 days

❌ **DON'T**:
- Commit JSON to repository
- Share JSON file
- Give service account more permissions than needed
- Reuse personal credentials

---

## 🎉 You're Done!

Once all secrets are configured, push to GitHub and your workflow will automatically deploy to Google Play Internal Testing!

```bash
git push origin main
```

Watch the deployment at:
```
https://github.com/YOUR_USERNAME/FishLog/actions
```

---

## 📞 Need More Help?

- **Google Cloud IAM docs**: https://cloud.google.com/iam/docs/service-accounts
- **Play Console help**: https://support.google.com/googleplay/android-developer
- **EAS Submit docs**: https://docs.expo.dev/submit/android/
