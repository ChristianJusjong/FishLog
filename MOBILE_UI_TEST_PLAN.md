# FishLog Mobile UI Test Plan
**Date:** 2025-11-25
**Device:** Android (d0540ecb) via ADB
**Expo Server:** http://localhost:8081
**Backend API:** http://localhost:3000

## 🎯 Test Objectives

This test plan verifies all performance optimizations and features work correctly on a real mobile device:

### Performance Optimizations to Verify
- ✅ FlatList virtualization (smooth 60fps scrolling)
- ✅ Image optimization with expo-image (fast loading, smooth transitions)
- ✅ Location caching with AsyncStorage (instant display of cached locations)
- ✅ Infinite scroll pagination (auto-load more catches)
- ✅ Pull-to-refresh functionality
- ✅ N+1 query elimination (fast API responses)
- ✅ Database indexes (quick data fetching)

---

## 📱 Setup Instructions

### 1. Connect to Expo Server
**Option A: Via ADB (Device connected to computer)**
```bash
# Make sure Expo server is running (already started)
# Open Expo Go app on your phone
# Enter this URL manually: exp://192.168.x.x:8081
# (Check terminal for exact IP address)
```

**Option B: Scan QR Code**
```bash
# The terminal should show a QR code
# Open Expo Go app and scan the QR code
```

### 2. Verify Backend Connection
- Backend should be running on http://localhost:3000
- Test credentials:
  - Email: test_user1@fishlog.test
  - Password: TestPassword123!

---

## 🧪 Test Cases

### TEST 1: Authentication Flow ✅
**Priority:** HIGH
**Objective:** Verify login/signup works correctly

#### Steps:
1. Open app in Expo Go
2. Should see login/welcome screen
3. Try logging in with test credentials:
   - Email: `test_user1@fishlog.test`
   - Password: `TestPassword123!`
4. Should successfully log in and navigate to feed

#### Expected Results:
- [ ] Login screen loads without errors
- [ ] Login button is responsive
- [ ] Login succeeds with correct credentials
- [ ] Navigation to feed occurs automatically
- [ ] Access token is stored

#### Performance Metrics:
- Login response time: < 2 seconds
- Screen transition: smooth, no lag

---

### TEST 2: Feed Performance - Initial Load ⚡
**Priority:** HIGH
**Objective:** Verify feed loads quickly with optimizations

#### Steps:
1. After login, observe feed loading
2. Count number of catches displayed
3. Check if images load smoothly
4. Monitor scrolling performance

#### Expected Results:
- [ ] Feed loads within 3 seconds
- [ ] Shows 10 initial catches (initialNumToRender=10)
- [ ] Images appear with smooth 200ms transitions
- [ ] Loading indicator visible during fetch
- [ ] No "white flash" when images load

#### Performance Metrics:
- Initial load time: < 3 seconds
- Time to first contentful paint: < 1 second
- Images load with fade-in effect

---

### TEST 3: Feed Scrolling - 60fps Performance 🚀
**Priority:** HIGH
**Objective:** Verify FlatList virtualization provides smooth scrolling

#### Steps:
1. Scroll down through feed rapidly
2. Scroll back up
3. Repeat scrolling motion multiple times
4. Monitor for frame drops or lag

#### Expected Results:
- [ ] Scrolling is buttery smooth (60fps)
- [ ] No stuttering or frame drops
- [ ] Items render/unrender smoothly (virtualization working)
- [ ] Memory usage stays low (check device settings)
- [ ] No crashes during rapid scrolling

#### Performance Metrics:
- Scrolling fps: 60fps (use device performance monitor)
- Memory usage: should not increase significantly
- No visible layout shifts

---

### TEST 4: Image Loading & Caching 📸
**Priority:** HIGH
**Objective:** Verify expo-image caching works

#### Steps:
1. Scroll through 20+ catches with images
2. Note which images you saw
3. Scroll back up to previously seen images
4. Check if images load instantly (from cache)
5. Exit app and reopen
6. Check if images are still cached

#### Expected Results:
- [ ] First-time images load with smooth transition
- [ ] Previously seen images load instantly (from cache)
- [ ] No "white flash" on cached images
- [ ] Disk cache persists after app restart
- [ ] contentFit="contain" works correctly

#### Performance Metrics:
- First load: ~500ms per image
- Cached load: instant (<50ms)
- Cache hit rate: >80% on second scroll

---

### TEST 5: Location Caching 📍
**Priority:** HIGH
**Objective:** Verify location names are cached and display instantly

#### Steps:
1. Observe location names as you scroll
2. Note catches with location names displayed
3. Scroll away and back to same catches
4. Check if location names appear instantly
5. Exit app and reopen
6. Check if cached locations still work

#### Expected Results:
- [ ] Location names appear for catches with lat/lng
- [ ] First-time locations load with staggered delay (100ms between requests)
- [ ] Cached locations display instantly
- [ ] Location cache persists after app restart
- [ ] Rounded coordinates used (1km precision)

#### Performance Metrics:
- Cached location display: instant
- Geocoding API calls reduced by 80%
- AsyncStorage read time: <50ms

---

### TEST 6: Pull-to-Refresh 🔄
**Priority:** MEDIUM
**Objective:** Verify refresh functionality works

#### Steps:
1. At top of feed, pull down
2. Release to trigger refresh
3. Observe loading indicator
4. Check if feed updates

#### Expected Results:
- [ ] Pull gesture is smooth
- [ ] Refresh indicator shows
- [ ] Feed refreshes with latest data
- [ ] Scroll position resets to top
- [ ] Refresh completes within 2 seconds

#### Performance Metrics:
- Refresh time: < 2 seconds
- No duplicate catches displayed
- Smooth animation

---

### TEST 7: Infinite Scroll - Auto Load More ♾️
**Priority:** HIGH
**Objective:** Verify pagination and infinite scroll

#### Steps:
1. Scroll to bottom of feed
2. Observe when "Load More" triggers
3. Check if new catches load automatically
4. Continue scrolling to trigger multiple page loads
5. Verify page numbers increment

#### Expected Results:
- [ ] "Load More" triggers at 50% from bottom (onEndReachedThreshold=0.5)
- [ ] Loading indicator appears at bottom
- [ ] New catches append to list (no duplicates)
- [ ] Smooth transition between pages
- [ ] "No more catches" message when hasMore=false

#### Performance Metrics:
- Load time per page: < 1 second
- No duplicate catches
- Memory usage stays stable

---

### TEST 8: Error Handling & Retry 🔧
**Priority:** MEDIUM
**Objective:** Verify error states and retry functionality

#### Steps:
1. Turn off Wi-Fi on phone
2. Try to refresh feed
3. Check error message
4. Turn Wi-Fi back on
5. Tap "Retry" button

#### Expected Results:
- [ ] Network error detected
- [ ] User-friendly error message displayed
- [ ] "Retry" button appears
- [ ] Retry button works correctly
- [ ] Feed loads successfully after retry

#### Error Messages:
- Network error: "Tjek din internetforbindelse og prøv igen"
- Actionable retry option provided

---

### TEST 9: Catch Creation with Camera 📷
**Priority:** HIGH
**Objective:** Verify catch creation flow works

#### Steps:
1. Tap "Create Catch" or + button
2. Allow camera permissions
3. Take a photo of something
4. Fill in catch details:
   - Species: "Gedde" (Pike)
   - Length: 50 cm
   - Weight: 2.5 kg
   - Location: Use current GPS
5. Select visibility: "Public"
6. Save catch

#### Expected Results:
- [ ] Camera opens correctly
- [ ] Photo is captured successfully
- [ ] Species picker works
- [ ] All form fields accept input
- [ ] GPS location detected
- [ ] Catch saves successfully
- [ ] New catch appears in feed

#### Performance Metrics:
- Camera launch time: < 1 second
- Form submission time: < 2 seconds
- Upload time: < 5 seconds

---

### TEST 10: Map Features 🗺️
**Priority:** MEDIUM
**Objective:** Verify map functionality works

#### Steps:
1. Navigate to Map tab
2. Check if map loads
3. Verify catch markers appear
4. Tap on a marker
5. Check marker callout details

#### Expected Results:
- [ ] Map loads correctly
- [ ] Markers show catch locations
- [ ] Tapping marker shows catch details
- [ ] Map is responsive (pan, zoom)
- [ ] Current location marker visible

#### Performance Metrics:
- Map load time: < 3 seconds
- Marker tap response: instant
- Smooth pan/zoom

---

### TEST 11: Social Features - Like & Comment 💬
**Priority:** MEDIUM
**Objective:** Verify social interactions work

#### Steps:
1. Find a catch in feed
2. Tap the heart/like button
3. Check if like count increases
4. Tap comment button
5. Add a comment: "Great catch!"
6. Submit comment
7. Verify comment appears

#### Expected Results:
- [ ] Like button is responsive
- [ ] Like count updates immediately
- [ ] Comment input opens
- [ ] Comment submits successfully
- [ ] Comment appears under catch
- [ ] User name shows on comment

#### Performance Metrics:
- Like response time: instant (optimistic update)
- Comment submission: < 1 second

---

### TEST 12: Feed Tabs - Catches vs Messages 📑
**Priority:** LOW
**Objective:** Verify tab navigation works

#### Steps:
1. Note you're on "Catches" tab (🐟)
2. Tap "Messages" tab (💬)
3. Check if messages/conversations load
4. Tap back to "Catches" tab
5. Verify catches are still loaded (not refetched)

#### Expected Results:
- [ ] Tab navigation is instant
- [ ] Active tab is highlighted
- [ ] Content persists when switching tabs
- [ ] No unnecessary refetches

#### Performance Metrics:
- Tab switch time: instant
- No layout shifts

---

### TEST 13: Statistics Dashboard 📊
**Priority:** LOW
**Objective:** Verify statistics aggregations work

#### Steps:
1. Navigate to Statistics/Profile tab
2. Check total catches count
3. Verify species breakdown
4. Check biggest fish record
5. Verify longest fish record

#### Expected Results:
- [ ] Statistics load within 2 seconds
- [ ] Numbers are accurate
- [ ] Charts/graphs display correctly
- [ ] Personal records show

#### Performance Metrics:
- Load time: < 2 seconds (thanks to DB aggregations)
- No N+1 queries

---

### TEST 14: Session Tracking with GPS 🛤️
**Priority:** MEDIUM
**Objective:** Verify GPS session tracking

#### Steps:
1. Navigate to Sessions tab
2. Tap "Start New Session"
3. Allow location permissions
4. Name session: "Test Session"
5. Walk around for 1 minute
6. Create a catch during session
7. End session
8. View session details

#### Expected Results:
- [ ] Session starts successfully
- [ ] GPS tracking active
- [ ] Route is recorded on map
- [ ] Catch linked to session
- [ ] Session summary shows distance, duration

#### Performance Metrics:
- GPS accuracy: < 10 meters
- Battery usage: reasonable
- Session data persists

---

### TEST 15: Segment Competition 🏆
**Priority:** LOW
**Objective:** Verify segment functionality

#### Steps:
1. Navigate to Segments tab
2. Browse available segments
3. Tap on a segment
4. View leaderboard
5. Check your position

#### Expected Results:
- [ ] Segments list loads
- [ ] Leaderboard displays correctly
- [ ] User position shown
- [ ] Top anglers listed

---

### TEST 16: Hot Spots Discovery 🔥
**Priority:** MEDIUM
**Objective:** Verify hot spot detection

#### Steps:
1. Navigate to Hot Spots tab
2. Check "My Favorites" section
3. Browse "Discover" hot spots
4. Tap on a hot spot
5. View details and leaderboard

#### Expected Results:
- [ ] Hot spots load (may be empty if no data)
- [ ] Map shows hot spot locations
- [ ] Tapping hot spot shows details
- [ ] Statistics are calculated correctly

#### Performance Metrics:
- Load time: < 2 seconds
- Geospatial queries optimized

---

### TEST 17: Memory & Performance Monitoring 🔍
**Priority:** HIGH
**Objective:** Monitor overall app performance

#### Tools:
- Android: Settings > Developer Options > Show Layout Bounds
- Memory: Settings > Developer Options > Memory
- FPS: Enable "Profile GPU Rendering"

#### Metrics to Check:
- [ ] Memory usage: < 200MB during normal use
- [ ] Memory usage: stable during scrolling (no leaks)
- [ ] FPS: consistent 60fps during scrolling
- [ ] No ANR (Application Not Responding) errors
- [ ] No crashes during 10-minute test session

---

### TEST 18: Offline Behavior 📵
**Priority:** LOW
**Objective:** Verify app handles offline gracefully

#### Steps:
1. Turn off Wi-Fi and mobile data
2. Open app (if not already open)
3. Try to refresh feed
4. Try to create a catch
5. Turn connectivity back on

#### Expected Results:
- [ ] Cached content still visible
- [ ] Error messages are user-friendly
- [ ] Retry buttons appear
- [ ] App doesn't crash
- [ ] Data syncs when back online

---

## 📊 Performance Benchmarks

### Before Optimizations (Baseline)
| Metric | Before | Target | Status |
|--------|--------|--------|---------|
| App startup | 5-7s | 2-3s | 🔄 Testing |
| Feed scroll FPS | ~20fps | 60fps | 🔄 Testing |
| Database queries | 50+ per page | 3 per page | ✅ Implemented |
| Memory usage | High | Low (50-70% less) | 🔄 Testing |
| Location API calls | Every time | 80% cached | 🔄 Testing |
| Image load (first) | Slow | 40% faster | 🔄 Testing |
| Image load (cached) | N/A | Instant | 🔄 Testing |

### Test Results (To be filled during testing)
- [ ] Startup time: _____ seconds
- [ ] Feed scroll FPS: _____ fps
- [ ] Memory usage: _____ MB
- [ ] Location cache hit rate: _____ %
- [ ] Image cache hit rate: _____ %

---

## 🐛 Bug Tracking

### Issues Found During Testing
| # | Test | Issue Description | Severity | Status |
|---|------|-------------------|----------|---------|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |

### Severity Levels:
- **CRITICAL**: App crashes, data loss, cannot proceed
- **HIGH**: Feature doesn't work, major performance issue
- **MEDIUM**: Feature partially works, minor performance issue
- **LOW**: Cosmetic issue, minor inconvenience

---

## ✅ Test Completion Checklist

### Core Features
- [ ] Authentication (login/signup)
- [ ] Feed loading and display
- [ ] Smooth 60fps scrolling
- [ ] Image loading and caching
- [ ] Location caching
- [ ] Pull-to-refresh
- [ ] Infinite scroll pagination
- [ ] Catch creation
- [ ] Camera functionality

### Performance Optimizations
- [ ] FlatList virtualization verified
- [ ] expo-image caching verified
- [ ] AsyncStorage caching verified
- [ ] No N+1 queries confirmed
- [ ] Database indexes effective
- [ ] Memory usage acceptable

### Social Features
- [ ] Like/unlike catches
- [ ] Comment on catches
- [ ] View friends' catches
- [ ] Messages/conversations

### Advanced Features
- [ ] GPS session tracking
- [ ] Map functionality
- [ ] Hot spots
- [ ] Segments
- [ ] Statistics dashboard

---

## 📝 Test Report Template

### Summary
- **Date:** 2025-11-25
- **Tester:** [Your Name]
- **Device:** Android (d0540ecb)
- **App Version:** [From package.json]
- **Duration:** _____ minutes

### Results
- **Tests Passed:** _____ / 18
- **Tests Failed:** _____ / 18
- **Critical Issues:** _____
- **High Priority Issues:** _____
- **Performance:** ⭐⭐⭐⭐⭐ (rate 1-5 stars)

### Notable Observations
1.
2.
3.

### Recommendations
1.
2.
3.

---

## 🚀 Next Steps

After completing all tests:
1. Document all findings in this file
2. Report any bugs or issues
3. Verify all performance metrics meet targets
4. Create summary report
5. Update TEST_RESULTS.md with mobile test results

---

**Happy Testing! 🐟📱**
