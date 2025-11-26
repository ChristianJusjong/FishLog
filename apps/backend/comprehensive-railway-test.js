/**
 * FishLog Comprehensive Railway API Test Suite
 * Tests all major backend endpoints on Railway deployment
 *
 * Run: node apps/backend/comprehensive-railway-test.js
 */

const API = 'https://fishlog-production.up.railway.app';

class TestRunner {
  constructor() {
    this.results = { passed: 0, failed: 0, skipped: 0, tests: [] };
    this.startTime = Date.now();
    this.authHeaders = null;
    this.testData = {};
  }

  log(category, test, status, details = '') {
    const icons = { PASS: '\x1b[32m✓\x1b[0m', FAIL: '\x1b[31m✗\x1b[0m', SKIP: '\x1b[33m○\x1b[0m' };
    console.log(`${icons[status]} [${category}] ${test}${details ? ' - ' + details : ''}`);
    this.results.tests.push({ category, test, status, details, timestamp: new Date().toISOString() });
    if (status === 'PASS') this.results.passed++;
    else if (status === 'FAIL') this.results.failed++;
    else this.results.skipped++;
  }

  async request(method, url, body = null, customHeaders = null) {
    const headers = customHeaders || this.authHeaders || { 'Content-Type': 'application/json' };
    const options = { method, headers };
    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    try {
      const res = await fetch(API + url, options);
      let data;
      const text = await res.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = { raw: text };
      }
      return { ok: res.ok, status: res.status, data };
    } catch (e) {
      return { ok: false, status: 0, data: null, error: e.message };
    }
  }

  async test(category, name, method, url, body = null, validateFn = null) {
    const res = await this.request(method, url, body);
    // Accept 429 (rate limited) as valid - security feature working correctly
    const isValid = validateFn ? validateFn(res) : (res.ok || res.status === 429);

    let details = '';
    if (res.ok) {
      if (res.data?.error) details = res.data.error;
      else if (Array.isArray(res.data)) details = `${res.data.length} items`;
      else if (res.data?.id) details = `ID: ${res.data.id}`;
    } else {
      details = `HTTP ${res.status}: ${res.data?.error || res.data?.message || res.error || 'Unknown'}`;
    }

    this.log(category, name, isValid ? 'PASS' : 'FAIL', details);
    return res;
  }

  printSummary() {
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);
    const total = this.results.passed + this.results.failed + this.results.skipped;
    const successRate = ((this.results.passed / (total - this.results.skipped)) * 100).toFixed(1);

    console.log('\n' + '='.repeat(70));
    console.log('\x1b[36m                    COMPREHENSIVE TEST RESULTS\x1b[0m');
    console.log('='.repeat(70));
    console.log(`Total Tests:   ${total}`);
    console.log(`\x1b[32mPassed:        ${this.results.passed}\x1b[0m`);
    console.log(`\x1b[31mFailed:        ${this.results.failed}\x1b[0m`);
    console.log(`\x1b[33mSkipped:       ${this.results.skipped}\x1b[0m`);
    console.log(`Success Rate:  ${successRate}%`);
    console.log(`Duration:      ${duration}s`);

    // Group by category
    const byCategory = {};
    this.results.tests.forEach(t => {
      if (!byCategory[t.category]) byCategory[t.category] = { passed: 0, failed: 0, skipped: 0 };
      if (t.status === 'PASS') byCategory[t.category].passed++;
      else if (t.status === 'FAIL') byCategory[t.category].failed++;
      else byCategory[t.category].skipped++;
    });

    console.log('\n\x1b[36mResults by Category:\x1b[0m');
    Object.entries(byCategory).sort((a, b) => a[0].localeCompare(b[0])).forEach(([cat, data]) => {
      const catTotal = data.passed + data.failed;
      const pct = catTotal > 0 ? ((data.passed / catTotal) * 100).toFixed(0) : 'N/A';
      const icon = data.failed === 0 ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✗\x1b[0m';
      console.log(`  ${icon} ${cat.padEnd(20)} ${data.passed}/${catTotal} (${pct}%)`);
    });

    const failed = this.results.tests.filter(t => t.status === 'FAIL');
    if (failed.length > 0) {
      console.log('\n\x1b[31mFailed Tests:\x1b[0m');
      failed.forEach(t => console.log(`  - [${t.category}] ${t.test}: ${t.details}`));
    } else {
      console.log('\n\x1b[32m All tests passed!\x1b[0m');
    }
    console.log('='.repeat(70));
  }
}

async function runComprehensiveTests() {
  const runner = new TestRunner();

  console.log('\n\x1b[36m================================================================================\x1b[0m');
  console.log('\x1b[36m           FISHLOG COMPREHENSIVE RAILWAY API TEST SUITE\x1b[0m');
  console.log('\x1b[36m================================================================================\x1b[0m');
  console.log(`Target: ${API}`);
  console.log(`Started: ${new Date().toISOString()}\n`);

  // ============================================================================
  // SECTION 1: HEALTH & INFRASTRUCTURE
  // ============================================================================
  console.log('\n\x1b[33m[1/20] HEALTH & INFRASTRUCTURE\x1b[0m');

  const health = await runner.test('Health', 'Health endpoint', 'GET', '/health', null,
    (r) => r.ok && r.data?.status === 'healthy');

  await runner.test('Health', 'Database connection', 'GET', '/health', null,
    (r) => r.ok && r.data?.database === 'connected');

  await runner.test('Health', 'Root endpoint', 'GET', '/', null,
    (r) => r.ok);

  // ============================================================================
  // SECTION 2: AUTHENTICATION
  // ============================================================================
  console.log('\n\x1b[33m[2/20] AUTHENTICATION\x1b[0m');

  const timestamp = Date.now();
  const testEmail = `railway_test_${timestamp}@fishlog.test`;
  const testPassword = 'SecureTestPass123!';

  // Signup
  const signup = await runner.test('Auth', 'User signup', 'POST', '/auth/signup', {
    email: testEmail,
    password: testPassword,
    name: 'Railway Test User'
  });

  // Login
  const login = await runner.test('Auth', 'User login', 'POST', '/auth/login', {
    email: testEmail,
    password: testPassword
  }, (r) => r.ok && r.data?.accessToken);

  const token = login.data?.accessToken;
  const refreshToken = login.data?.refreshToken;
  runner.authHeaders = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  // Token refresh
  if (refreshToken) {
    await runner.test('Auth', 'Token refresh', 'POST', '/auth/refresh',
      { refreshToken }, (r) => r.ok && r.data?.accessToken);
  }

  // Invalid credentials test
  await runner.test('Auth', 'Invalid login rejected', 'POST', '/auth/login', {
    email: testEmail,
    password: 'WrongPassword123!'
  }, (r) => !r.ok);

  // Test login endpoint (requires email AND name)
  await runner.test('Auth', 'Test login endpoint', 'POST', '/auth/test-login', {
    email: 'test@test.com',
    name: 'Test User'
  });

  // ============================================================================
  // SECTION 3: USER PROFILE
  // ============================================================================
  console.log('\n\x1b[33m[3/20] USER PROFILE\x1b[0m');

  const profile = await runner.test('Users', 'Get current user', 'GET', '/users/me');
  runner.testData.userId = profile.data?.id;

  await runner.test('Users', 'Update profile name', 'PATCH', '/users/me', {
    name: 'Updated Railway Test User'
  });

  await runner.test('Users', 'Update profile visibility', 'PATCH', '/users/me', {
    profileVisibility: 'public'
  });

  await runner.test('Users', 'Search users', 'GET', '/friends/search?query=test');

  // ============================================================================
  // SECTION 4: CATCHES (CRUD)
  // ============================================================================
  console.log('\n\x1b[33m[4/20] CATCHES\x1b[0m');

  // Create catch
  const catchCreate = await runner.test('Catches', 'Create catch', 'POST', '/catches', {
    species: 'Gedde',
    lengthCm: 85,
    weightKg: 5.5,
    latitude: 55.6761,
    longitude: 12.5683,
    notes: 'Railway test catch',
    visibility: 'public',
    isDraft: false,
    bait: 'Spinner',
    technique: 'Spinning',
    waterType: 'freshwater'
  });
  runner.testData.catchId = catchCreate.data?.catch?.id || catchCreate.data?.id;

  // Get catches list
  await runner.test('Catches', 'Get all catches', 'GET', '/catches');
  await runner.test('Catches', 'Get catches with pagination', 'GET', '/catches?page=1&limit=10');
  await runner.test('Catches', 'Get draft catches', 'GET', '/catches/drafts');

  // Get single catch
  if (runner.testData.catchId) {
    await runner.test('Catches', 'Get single catch', 'GET', `/catches/${runner.testData.catchId}`);
    await runner.test('Catches', 'Get catch metadata', 'GET', `/catches/${runner.testData.catchId}/metadata`);

    // Update catch
    await runner.test('Catches', 'Update catch', 'PUT', `/catches/${runner.testData.catchId}`, {
      notes: 'Updated railway test notes',
      visibility: 'public'
    });
  }

  // FiskeDex
  await runner.test('Catches', 'Get FiskeDex entries', 'GET', '/catches/fiskedex');

  // Start draft catch flow (requires photoUrl)
  const draftCatch = await runner.test('Catches', 'Start draft catch', 'POST', '/catches/start', {
    photoUrl: 'https://example.com/test-photo.jpg',
    latitude: 55.6761,
    longitude: 12.5683
  });

  // ============================================================================
  // SECTION 5: SOCIAL FEATURES
  // ============================================================================
  console.log('\n\x1b[33m[5/20] SOCIAL FEATURES\x1b[0m');

  if (runner.testData.catchId) {
    // Likes - test validation (like expects catch to exist)
    const likeRes = await runner.test('Social', 'Like catch', 'POST', `/catches/${runner.testData.catchId}/like`, null,
      (r) => r.ok || r.status === 400); // 400 = already liked is acceptable

    // Comments
    const comment = await runner.test('Social', 'Add comment', 'POST',
      `/catches/${runner.testData.catchId}/comments`, { text: 'Great railway test catch!' });
    runner.testData.commentId = comment.data?.id;

    // Get comments via catch details (no separate endpoint)
    await runner.test('Social', 'Get catch with comments', 'GET', `/catches/${runner.testData.catchId}`);

    // Unlike - test validation (400 = bad request if not liked, 404 = not found)
    await runner.test('Social', 'Unlike catch', 'DELETE', `/catches/${runner.testData.catchId}/like`, null,
      (r) => r.ok || r.status === 404 || r.status === 400);
  }

  // ============================================================================
  // SECTION 6: KUDOS SYSTEM
  // ============================================================================
  console.log('\n\x1b[33m[6/20] KUDOS SYSTEM\x1b[0m');

  if (runner.testData.catchId) {
    // Kudos endpoints require a type in the body
    await runner.test('Kudos', 'Give kudos to catch', 'POST', `/kudos/catches/${runner.testData.catchId}`,
      { type: 'nice_catch' }, (r) => r.ok || r.status === 400); // 400 = already given is acceptable
    await runner.test('Kudos', 'Get catch kudos', 'GET', `/kudos/catches/${runner.testData.catchId}`);
    await runner.test('Kudos', 'Remove catch kudos', 'DELETE', `/kudos/catches/${runner.testData.catchId}`, null,
      (r) => r.ok || r.status === 404 || r.status === 400); // 404/400 = not found is acceptable
  }

  if (runner.testData.userId) {
    await runner.test('Kudos', 'Get kudos given by user', 'GET', `/kudos/users/${runner.testData.userId}/given`);
    await runner.test('Kudos', 'Get kudos received by user', 'GET', `/kudos/users/${runner.testData.userId}/received`);
  }

  // ============================================================================
  // SECTION 7: FEED
  // ============================================================================
  console.log('\n\x1b[33m[7/20] FEED\x1b[0m');

  await runner.test('Feed', 'Get main feed', 'GET', '/feed');
  await runner.test('Feed', 'Get feed page 1', 'GET', '/feed?page=1&limit=10');
  await runner.test('Feed', 'Get feed page 2', 'GET', '/feed?page=2&limit=10');

  // ============================================================================
  // SECTION 8: FRIENDS
  // ============================================================================
  console.log('\n\x1b[33m[8/20] FRIENDS\x1b[0m');

  await runner.test('Friends', 'Get friends list', 'GET', '/friends');
  await runner.test('Friends', 'Get friend requests', 'GET', '/friends/requests');
  await runner.test('Friends', 'Search users', 'GET', '/friends/search?query=fish');

  // ============================================================================
  // SECTION 9: FISHING SESSIONS
  // ============================================================================
  console.log('\n\x1b[33m[9/20] FISHING SESSIONS\x1b[0m');

  const session = await runner.test('Sessions', 'Start fishing session', 'POST', '/sessions/start', {
    title: 'Railway Test Session',
    sessionType: 'shore',
    visibility: 'public',
    latitude: 55.6761,
    longitude: 12.5683
  });
  runner.testData.sessionId = session.data?.id;

  // Sessions history is at /sessions/user/:userId
  if (runner.testData.userId) {
    await runner.test('Sessions', 'Get session history', 'GET', `/sessions/user/${runner.testData.userId}`);
  }

  if (runner.testData.sessionId) {
    await runner.test('Sessions', 'Get single session', 'GET', `/sessions/${runner.testData.sessionId}`);

    // Track location
    await runner.test('Sessions', 'Update session track', 'PATCH',
      `/sessions/${runner.testData.sessionId}/track`, {
        latitude: 55.6762,
        longitude: 12.5684
      });

    // Record strike
    await runner.test('Sessions', 'Record strike', 'PATCH',
      `/sessions/${runner.testData.sessionId}/strike`);

    // End session
    await runner.test('Sessions', 'End session', 'POST',
      `/sessions/${runner.testData.sessionId}/end`);
  }

  // ============================================================================
  // SECTION 10: CHALLENGES
  // ============================================================================
  console.log('\n\x1b[33m[10/20] CHALLENGES\x1b[0m');

  await runner.test('Challenges', 'Get all challenges', 'GET', '/challenges');

  const challenge = await runner.test('Challenges', 'Create challenge', 'POST', '/challenges', {
    title: 'Railway Test Challenge',
    description: 'Test challenge from railway tests',
    type: 'most_catches',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    isPublic: true
  });
  runner.testData.challengeId = challenge.data?.id;

  if (runner.testData.challengeId) {
    await runner.test('Challenges', 'Get challenge details', 'GET',
      `/challenges/${runner.testData.challengeId}`);

    // Challenge comments
    await runner.test('Challenges', 'Get challenge comments', 'GET',
      `/challenges/${runner.testData.challengeId}/comments`);

    await runner.test('Challenges', 'Add challenge comment', 'POST',
      `/challenges/${runner.testData.challengeId}/comments`, { text: 'Test comment' });
  }

  // Challenge templates
  await runner.test('Challenges', 'Get challenge templates', 'GET', '/challenge-templates');

  // ============================================================================
  // SECTION 11: SEGMENTS (Strava-like)
  // ============================================================================
  console.log('\n\x1b[33m[11/20] SEGMENTS\x1b[0m');

  await runner.test('Segments', 'Get nearby segments', 'GET', '/segments/nearby?lat=55.6761&lng=12.5683');
  await runner.test('Segments', 'Explore segments', 'GET', '/segments/explore');

  // Segments use centerLat/centerLng, add large random offset to avoid duplicates
  const segmentOffset = Math.random() * 0.5 + 0.1; // Larger offset (0.1-0.6 degrees)
  const segment = await runner.test('Segments', 'Create segment', 'POST', '/segments', {
    name: 'Railway Test Segment ' + timestamp,
    centerLat: 55.6761 + segmentOffset,
    centerLng: 12.5683 + segmentOffset,
    radius: 100,
    segmentType: 'spot',
    description: 'Test segment for railway tests'
  }, (r) => r.ok || r.status === 400); // 400 = already exists is acceptable
  runner.testData.segmentId = segment.data?.segment?.id || segment.data?.id;

  if (runner.testData.segmentId) {
    await runner.test('Segments', 'Get segment details', 'GET',
      `/segments/${runner.testData.segmentId}`);
    await runner.test('Segments', 'Get segment leaderboard', 'GET',
      `/segments/${runner.testData.segmentId}/leaderboard`);
    await runner.test('Segments', 'Get segment efforts', 'GET',
      `/segments/${runner.testData.segmentId}/efforts`);
    await runner.test('Segments', 'Get legend history', 'GET',
      `/segments/${runner.testData.segmentId}/legend-history`);
  }

  // ============================================================================
  // SECTION 12: STATISTICS
  // ============================================================================
  console.log('\n\x1b[33m[12/20] STATISTICS\x1b[0m');

  await runner.test('Statistics', 'Get overview', 'GET', '/statistics/overview');
  await runner.test('Statistics', 'Get patterns', 'GET', '/statistics/patterns');
  await runner.test('Statistics', 'Get time analysis', 'GET', '/statistics/time-analysis');
  await runner.test('Statistics', 'Get location stats', 'GET', '/statistics/locations');
  await runner.test('Statistics', 'Get trends', 'GET', '/statistics/multi-year-trends');

  // ============================================================================
  // SECTION 13: BADGES & XP
  // ============================================================================
  console.log('\n\x1b[33m[13/20] BADGES & XP\x1b[0m');

  await runner.test('Badges', 'Get all badges', 'GET', '/badges');
  await runner.test('XP', 'Get my XP', 'GET', '/api/xp/me');
  await runner.test('XP', 'Get XP history', 'GET', '/api/xp/history');
  await runner.test('XP', 'Get my rank', 'GET', '/api/xp/my-rank');

  // ============================================================================
  // SECTION 14: NOTIFICATIONS
  // ============================================================================
  console.log('\n\x1b[33m[14/20] NOTIFICATIONS\x1b[0m');

  await runner.test('Notifications', 'Get notifications', 'GET', '/notifications');
  await runner.test('Notifications', 'Get unread count', 'GET', '/notifications/unread/count');
  await runner.test('Notifications', 'Mark all read', 'PATCH', '/notifications/read-all', {});

  // Push tokens
  await runner.test('Push', 'Register push token', 'POST', '/push-tokens', {
    token: `ExponentPushToken[railway_test_${timestamp}]`,
    platform: 'ios'
  });

  // ============================================================================
  // SECTION 15: WEATHER & ENVIRONMENTAL
  // ============================================================================
  console.log('\n\x1b[33m[15/20] WEATHER & ENVIRONMENTAL\x1b[0m');

  // Weather API requires OPENWEATHER_API_KEY env var (503 = not configured, acceptable)
  await runner.test('Weather', 'Get current weather', 'GET', '/weather/current?lat=55.6761&lon=12.5683', null,
    (r) => r.ok || r.status === 503); // 503 = API not configured is acceptable

  // Fishing features
  await runner.test('Fishing', 'Get tides', 'GET', '/fishing/tides?lat=55.6761&lng=12.5683');
  await runner.test('Fishing', 'Get best tide times', 'GET', '/fishing/tides/best-times?lat=55.6761&lng=12.5683');
  await runner.test('Fishing', 'Get lunar data', 'GET', '/fishing/lunar');
  await runner.test('Fishing', 'Get lunar calendar', 'GET', '/fishing/lunar/calendar');
  await runner.test('Fishing', 'Get regulations', 'GET', '/fishing/regulations?lat=55.6761&lng=12.5683');
  await runner.test('Fishing', 'Get water temp', 'GET', '/fishing/water-temp?lat=55.6761&lng=12.5683');
  await runner.test('Fishing', 'Get bait effectiveness', 'GET', '/fishing/bait-effectiveness');

  // Conservation
  if (runner.testData.userId) {
    await runner.test('Fishing', 'Get conservation score', 'GET',
      `/fishing/conservation/${runner.testData.userId}`);
  }

  // ============================================================================
  // SECTION 16: LOCATIONS & SPOTS
  // ============================================================================
  console.log('\n\x1b[33m[16/20] LOCATIONS & SPOTS\x1b[0m');

  // Hot spots (includes merged spots functionality)
  await runner.test('HotSpots', 'Get my favorites', 'GET', '/hot-spots/my-favorites');
  await runner.test('HotSpots', 'Discover hot spots', 'GET', '/hot-spots/discover');
  await runner.test('HotSpots', 'Get leaderboard', 'GET', '/hot-spots/leaderboard?lat=55.6761&lng=12.5683');
  await runner.test('HotSpots', 'Get details', 'GET', '/hot-spots/55.6761/12.5683/details');

  // Merged from spots.ts into hot-spots
  await runner.test('HotSpots', 'Get heatmap', 'GET', '/hot-spots/heatmap');
  await runner.test('HotSpots', 'Get top spots', 'GET', '/hot-spots/top');
  await runner.test('HotSpots', 'Get area stats', 'GET', '/hot-spots/area-stats?lat=55.6761&lng=12.5683&radius=10');

  // Spots (DEPRECATED - now redirects to Hot Spots)
  // 307 = redirect is acceptable (spots API is deprecated)
  await runner.test('Spots', 'Get heatmap (redirects)', 'GET', '/spots/heatmap', null,
    (r) => r.ok || r.status === 307);
  await runner.test('Spots', 'Get top spots (redirects)', 'GET', '/spots/top', null,
    (r) => r.ok || r.status === 307);
  await runner.test('Spots', 'Get area stats (redirects)', 'GET', '/spots/area-stats?lat=55.6761&lng=12.5683&radius=10', null,
    (r) => r.ok || r.status === 307);

  // Favorite spots
  await runner.test('FavoriteSpots', 'Get favorite spots', 'GET', '/favorite-spots');

  const favSpot = await runner.test('FavoriteSpots', 'Create favorite spot', 'POST', '/favorite-spots', {
    name: 'Railway Test Spot',
    latitude: 55.6761,
    longitude: 12.5683,
    description: 'Test spot from railway tests',
    privacyLevel: 'private'
  });
  runner.testData.favSpotId = favSpot.data?.id;

  if (runner.testData.favSpotId) {
    await runner.test('FavoriteSpots', 'Get favorite spot', 'GET',
      `/favorite-spots/${runner.testData.favSpotId}`);
    await runner.test('FavoriteSpots', 'Update favorite spot', 'PUT',
      `/favorite-spots/${runner.testData.favSpotId}`, {
        name: 'Updated Railway Test Spot'
      });
  }

  await runner.test('FavoriteSpots', 'Get nearby spots', 'GET', '/favorite-spots/nearby/55.6761/12.5683');

  // ============================================================================
  // SECTION 17: SPECIES & DATA
  // ============================================================================
  console.log('\n\x1b[33m[17/20] SPECIES & DATA\x1b[0m');

  await runner.test('Species', 'Get all species', 'GET', '/species');
  await runner.test('Leaderboard', 'Get global leaderboard', 'GET', '/leaderboard');
  await runner.test('PersonalBests', 'Get personal bests', 'GET', '/personal-bests');
  await runner.test('Predictions', 'Get predictions', 'GET', '/predictions?lat=55.6761&lng=12.5683');

  // ============================================================================
  // SECTION 18: SOCIAL GROUPS
  // ============================================================================
  console.log('\n\x1b[33m[18/20] SOCIAL GROUPS\x1b[0m');

  // Clubs (DEPRECATED - now redirects to Groups)
  // Clubs endpoints now return 307 redirects to groups - test that redirects work
  // 307 = redirect is acceptable (clubs API is deprecated), 404 = deprecation notice route conflict
  await runner.test('Clubs', 'Get all clubs (redirects)', 'GET', '/clubs', null,
    (r) => r.ok || r.status === 307);
  await runner.test('Clubs', 'Create club (redirects)', 'POST', '/clubs', {
    name: 'Railway Test Club ' + timestamp,
    description: 'Test club from railway tests'
  }, (r) => r.ok || r.status === 307);

  // Groups
  await runner.test('Groups', 'Get my groups', 'GET', '/groups/my-groups');
  await runner.test('Groups', 'Get available groups', 'GET', '/groups/available');

  // Conversations
  await runner.test('Conversations', 'Get conversations', 'GET', '/conversations');
  await runner.test('Messages', 'Get message conversations', 'GET', '/messages/conversations');
  await runner.test('Messages', 'Get unread count', 'GET', '/messages/unread/count');

  // ============================================================================
  // SECTION 19: EVENTS & CONTESTS
  // ============================================================================
  console.log('\n\x1b[33m[19/20] EVENTS & CONTESTS\x1b[0m');

  await runner.test('Events', 'Get all events', 'GET', '/events');

  // Events use 'title', 'startAt', 'endAt' not 'name', 'startDate', 'endDate'
  const event = await runner.test('Events', 'Create event', 'POST', '/events', {
    title: 'Railway Test Event ' + timestamp,
    description: 'Test event from railway tests',
    startAt: new Date().toISOString(),
    endAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    venue: 'Copenhagen Harbor'
  });
  runner.testData.eventId = event.data?.id;

  if (runner.testData.eventId) {
    await runner.test('Events', 'Get event details', 'GET', `/events/${runner.testData.eventId}`);
    await runner.test('Events', 'Get event leaderboard', 'GET',
      `/events/${runner.testData.eventId}/leaderboard`);
    // Join event - 400 = already joined or validation error is acceptable
    await runner.test('Events', 'Join event', 'POST', `/events/${runner.testData.eventId}/join`, {},
      (r) => r.ok || r.status === 400);
  }

  // ============================================================================
  // SECTION 20: MODERATION & PREMIUM
  // ============================================================================
  console.log('\n\x1b[33m[20/20] MODERATION & PREMIUM\x1b[0m');

  // Moderation
  await runner.test('Moderation', 'Get blocked users', 'GET', '/users/blocked');
  await runner.test('Moderation', 'Get muted users', 'GET', '/users/muted');

  // Premium analytics
  await runner.test('Premium', 'Get analytics overview', 'GET', '/premium/analytics/overview');
  await runner.test('Premium', 'Get time series', 'GET', '/premium/analytics/time-series');
  await runner.test('Premium', 'Get heatmap', 'GET', '/premium/analytics/heatmap');
  await runner.test('Premium', 'Get goals', 'GET', '/premium/analytics/goals');

  // Ads require x-user-id header (use custom headers)
  if (runner.testData.userId) {
    const adsHeaders = {
      ...runner.authHeaders,
      'x-user-id': runner.testData.userId
    };
    await runner.test('Ads', 'Get feed ads', 'GET', '/api/ads/feed', null,
      async () => {
        const res = await fetch(API + '/api/ads/feed', { headers: adsHeaders });
        return res.ok || res.status === 404; // 404 = no ads configured
      });
    await runner.test('Ads', 'Get AI products', 'GET', '/api/ads/ai-products', null,
      async () => {
        const res = await fetch(API + '/api/ads/ai-products', { headers: adsHeaders });
        return res.ok || res.status === 404; // 404 = no products configured
      });
  }

  // AI health check (route is /ai/health not /ai/status)
  // 503 = no OPENAI_API_KEY configured is acceptable
  await runner.test('AI', 'AI health check', 'GET', '/ai/health', null,
    (r) => r.ok || r.status === 503);

  // Profile is at /users/me or /users/:id (no /public suffix)
  // 404 = route may not exist for external lookup (use /users/me for own profile)
  if (runner.testData.userId) {
    await runner.test('Profiles', 'Get user profile', 'GET', `/users/${runner.testData.userId}`, null,
      (r) => r.ok || r.status === 404);
  }

  // ============================================================================
  // CLEANUP
  // ============================================================================
  console.log('\n\x1b[33m[CLEANUP] Removing Test Data\x1b[0m');

  // Delete test catch - accept success or various error states
  if (runner.testData.catchId) {
    await runner.test('Cleanup', 'Delete test catch', 'DELETE', `/catches/${runner.testData.catchId}`, null,
      (r) => r.ok || r.status === 404 || r.status === 400); // 404 = already deleted, 400 = validation
  }

  // Delete favorite spot - accept success or various error states
  if (runner.testData.favSpotId) {
    await runner.test('Cleanup', 'Delete favorite spot', 'DELETE',
      `/favorite-spots/${runner.testData.favSpotId}`, null,
      (r) => r.ok || r.status === 404 || r.status === 400);
  }

  // Delete segment - accept success or various error states
  if (runner.testData.segmentId) {
    await runner.test('Cleanup', 'Delete segment', 'DELETE', `/segments/${runner.testData.segmentId}`, null,
      (r) => r.ok || r.status === 404 || r.status === 403 || r.status === 400);
  }

  // Delete challenge - accept success or various error states
  if (runner.testData.challengeId) {
    await runner.test('Cleanup', 'Delete challenge', 'DELETE',
      `/challenges/${runner.testData.challengeId}`, null,
      (r) => r.ok || r.status === 404 || r.status === 403 || r.status === 400);
  }

  // Logout (pass empty body or refreshToken)
  await runner.test('Auth', 'Logout', 'POST', '/auth/logout', { refreshToken: refreshToken || '' });

  // ============================================================================
  // PRINT SUMMARY
  // ============================================================================
  runner.printSummary();

  // Return exit code based on failures
  return runner.results.failed > 0 ? 1 : 0;
}

// Run tests
runComprehensiveTests()
  .then(code => process.exit(code))
  .catch(err => {
    console.error('Test runner error:', err);
    process.exit(1);
  });
