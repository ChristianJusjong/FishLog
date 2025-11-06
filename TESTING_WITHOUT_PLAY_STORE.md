# 🧪 Testing Hook Without Play Store

You don't need to wait for Play Store approval to test your app! Here are multiple ways to test right now.

---

## 🚀 Option 1: Expo Go (FASTEST - 2 minutes)

**Perfect for:** Quick testing, instant updates, iterative development

### Setup:

1. **Install Expo Go on your Android phone:**
   - Open Google Play Store
   - Search: "Expo Go"
   - Install the app

2. **Development server is already running!**
   - Server: http://localhost:8081
   - Running in background

3. **Connect your phone:**

   **If on same WiFi network:**
   - Open Expo Go app on phone
   - Look for "Hook" under "Recently opened"
   - Or tap "Scan QR code" and scan from terminal

   **If you see a QR code in terminal:**
   - Open terminal where `npx expo start` is running
   - Use Expo Go to scan the QR code

   **Alternative - Manual URL:**
   - In Expo Go, tap "Enter URL manually"
   - Type: `exp://YOUR_COMPUTER_IP:8081`
   - Replace YOUR_COMPUTER_IP with your PC's local IP
   - Find your IP: Run `ipconfig` in terminal, look for IPv4 Address

### Pros:
- ✅ Instant updates (just save file, app reloads)
- ✅ No installation needed
- ✅ Great for development
- ✅ Works on multiple devices simultaneously

### Cons:
- ❌ Requires Expo Go app
- ❌ Some native features might behave differently
- ❌ Requires same network (or tunnel)

---

## 📦 Option 2: APK Install (BUILDING NOW)

**Perfect for:** Testing the actual production build, sharing with testers

### Status:
- ⏳ APK is currently building on EAS
- 📊 Track progress: https://expo.dev/accounts/cjusjong/projects/hook/builds/09b1e87e-d913-4f32-8389-dd3a537790ad
- ⏱️ Estimated time: 10-20 minutes

### When Ready:

1. **Download APK:**
   - Build will complete soon
   - You'll get a download URL (ends in `.apk`)
   - Download on phone or PC

2. **Install on Android:**
   - Transfer APK to phone (if downloaded on PC)
   - Open APK file on phone
   - Tap "Install"
   - Allow "Install from unknown sources" if prompted
   - App installs like any normal app!

3. **Test fully:**
   - Works exactly like Play Store version
   - No Expo Go needed
   - Can share APK with others

### Pros:
- ✅ Real production build
- ✅ No dependencies
- ✅ Easy to share with testers
- ✅ Exactly like Play Store version

### Cons:
- ❌ Takes 10-20 minutes to build
- ❌ Need to rebuild for each update
- ❌ Requires "Install from unknown sources" permission

---

## 🌐 Option 3: Web Browser (INSTANT)

**Perfect for:** Testing UI/UX, quick checks, no phone needed

### Run:

```bash
cd C:\ClaudeCodeProject\FishLog\apps\mobile
npx expo start --web
```

### Access:
- Opens automatically in browser
- URL: http://localhost:8081
- Works on any device on same network

### Pros:
- ✅ Instant access
- ✅ No phone needed
- ✅ Easy to test on multiple screen sizes (browser dev tools)
- ✅ Great for debugging

### Cons:
- ❌ Camera won't work
- ❌ GPS/location features limited
- ❌ Some mobile-specific features won't work
- ❌ Layout might differ slightly

---

## 🖥️ Option 4: Android Emulator

**Perfect for:** Full featured testing, screenshot capture, no phone needed

### Prerequisites:
- Android Studio installed
- Android Virtual Device (AVD) configured
- ~8GB free disk space

### Run:

```bash
cd C:\ClaudeCodeProject\FishLog\apps\mobile
npm run android
```

### Setup Emulator (if not done):

1. **Install Android Studio:**
   - Download: https://developer.android.com/studio
   - Install with default settings

2. **Create AVD:**
   - Open Android Studio
   - Tools → AVD Manager
   - Create Virtual Device
   - Choose: Pixel 5 or Pixel 6
   - Download system image (Android 12+)
   - Finish

3. **Start emulator and run:**
   ```bash
   npm run android
   ```

### Pros:
- ✅ Full Android environment
- ✅ Easy to capture screenshots
- ✅ Debugging tools
- ✅ Multiple device configurations

### Cons:
- ❌ Requires Android Studio (~4GB download)
- ❌ Uses significant RAM (4GB+)
- ❌ Slower than real device
- ❌ Some hardware features emulated

---

## 🎯 Recommended Approach

### For Quick Testing (Now):
1. **Use Expo Go** - Install on phone, connect to dev server
2. Make changes, see updates instantly
3. Perfect for iterative development

### For Real Testing (When APK Ready):
1. **Download and install APK**
2. Test all features thoroughly
3. Share with friends/testers
4. Get feedback before Play Store submission

### For Screenshots (For Play Store):
1. **Use Android Emulator**
2. Pixel 5 device (1080x2340)
3. Capture screenshots with emulator toolbar
4. Add device frames with mockuphone.com

---

## 📱 Current Status

### ✅ Ready Now:
- **Expo Go testing**: Development server running on port 8081
- **Web version**: Run `npx expo start --web`

### ⏳ Building:
- **APK file**: In progress, ~10-20 minutes
- **Track**: https://expo.dev/accounts/cjusjong/projects/hook/builds/09b1e87e-d913-4f32-8389-dd3a537790ad

### 📦 Already Built:
- **AAB file** (for Play Store): https://expo.dev/artifacts/eas/tfHFfcgqpCiZNwWFcMpCMS.aab
  - Note: AAB can't be installed directly, need APK or convert to APK

---

## 🔧 Troubleshooting

### "Can't connect in Expo Go"

**Solution 1: Check WiFi**
- Phone and PC must be on same network
- Disable VPN if active

**Solution 2: Use tunnel mode**
```bash
npx expo start --tunnel
```
- Requires @expo/ngrok package
- Works across different networks

**Solution 3: Manual URL**
- Find your PC IP: `ipconfig` in terminal
- Look for "IPv4 Address" (e.g., 192.168.1.100)
- In Expo Go: Enter URL manually → `exp://192.168.1.100:8081`

### "Can't install APK"

**Solution:**
- Enable "Install unknown apps" for your file manager
- Settings → Apps → Special access → Install unknown apps
- Find your file manager (Files, Chrome, etc.)
- Toggle "Allow from this source"

### "Expo Go shows error"

**Solution:**
- Check terminal for error messages
- Common issue: Backend not running
- Make sure Railway backend is accessible
- Update API URL in app if needed

---

## 💡 Tips

### Sharing with Testers:

**APK Distribution:**
1. Upload APK to Google Drive/Dropbox
2. Share link with testers
3. Include installation instructions

**Expo Go Sharing:**
1. Use tunnel mode: `npx expo start --tunnel`
2. Share the expo URL with testers
3. They need Expo Go installed

### Testing Checklist:

Before Play Store submission, test:
- [ ] User registration and login
- [ ] Add new catch with photo
- [ ] GPS location capture
- [ ] View catch on map
- [ ] Social feed
- [ ] Like and comment features
- [ ] Profile editing
- [ ] Weather information
- [ ] Push notifications (if implemented)
- [ ] Offline functionality
- [ ] Camera permissions
- [ ] Location permissions

---

## 🆘 Need Help?

**Development server not starting?**
```bash
# Clean and restart
cd apps/mobile
npx expo start -c
```

**Port 8081 already in use?**
```bash
# Use different port
npx expo start --port 8082
```

**Want to stop dev server?**
- Press `Ctrl+C` in terminal
- Or close terminal window

---

## 📞 Next Steps

1. **Test now** with Expo Go
2. **Wait for APK** to complete (check build URL)
3. **Install APK** and do full testing
4. **Capture screenshots** if needed
5. **Submit to Play Store** when developer account is verified

Your app is ready to test - no Play Store needed! 🎉
