const API = 'https://fishlog-production.up.railway.app';

async function runComprehensiveTests() {
  const results = { passed: 0, failed: 0, tests: [] };
  const allEndpoints = [];

  function log(category, test, status, details = '') {
    const icon = status === 'PASS' ? '✓' : '✗';
    console.log(`${icon} [${category}] ${test}${details ? ' - ' + details : ''}`);
    results.tests.push({ category, test, status, details });
    if (status === 'PASS') results.passed++; else results.failed++;
  }

  async function testEndpoint(category, name, url, options = {}, validateFn = null) {
    allEndpoints.push({ category, name, url, method: options.method || 'GET' });
    try {
      const res = await fetch(API + url, options);
      let data;
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      const isValid = validateFn ? validateFn(res, data) : res.ok;
      log(category, name, isValid ? 'PASS' : 'FAIL',
        res.ok ? (data.error || JSON.stringify(data).substring(0, 100)) : `HTTP ${res.status}: ${data.error || data.message || 'Unknown error'}`);
      return { ok: res.ok, data, status: res.status };
    } catch (e) {
      log(category, name, 'FAIL', e.message);
      return { ok: false, data: null, error: e.message };
    }
  }

  console.log('\n🧪 FishLog Comprehensive Railway API Test Suite');
  console.log('='.repeat(60));
  console.log(`Testing: ${API}\n`);

  // ==================== HEALTH & DATABASE ====================
  console.log('\n📋 HEALTH & DATABASE CONNECTION');
  const health = await testEndpoint('Health', 'Health check', '/health', {},
    (res, data) => res.ok && data.database === 'connected');

  // ==================== AUTHENTICATION ====================
  console.log('\n📋 AUTHENTICATION');
  const timestamp = Date.now();
  const testEmail = `comprehensive_test_${timestamp}@fishlog.test`;

  const signupResult = await testEndpoint('Auth', 'User signup', '/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: 'TestPass123!', name: 'Comprehensive Test User' })
  });

  const loginResult = await testEndpoint('Auth', 'User login', '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: 'TestPass123!' })
  }, (res, data) => res.ok && data.accessToken);

  const token = loginResult.data?.accessToken;
  const authHeaders = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  // Test token refresh
  if (loginResult.data?.refreshToken) {
    await testEndpoint('Auth', 'Token refresh', '/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: loginResult.data.refreshToken })
    });
  }

  // ==================== USER PROFILE ====================
  console.log('\n📋 USER PROFILE');
  const profileResult = await testEndpoint('Users', 'Get current user profile', '/users/me', { headers: authHeaders });
  const userId = profileResult.data?.id;

  await testEndpoint('Users', 'Update user profile', '/users/me', {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({ name: 'Updated Test User', profileVisibility: 'public' })
  });

  await testEndpoint('Users', 'Search users', '/users/search?query=test', { headers: authHeaders });

  // ==================== CATCHES ====================
  console.log('\n📋 CATCHES');
  const catchResult = await testEndpoint('Catches', 'Create catch', '/catches', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      species: 'Gedde',
      lengthCm: 85,
      weightKg: 5.5,
      latitude: 55.6761,
      longitude: 12.5683,
      notes: 'Comprehensive test catch',
      visibility: 'public',
      isDraft: false,
      bait: 'Worm',
      technique: 'Spinning'
    })
  });
  const catchId = catchResult.data?.catch?.id || catchResult.data?.id;

  await testEndpoint('Catches', 'Get all catches', '/catches', { headers: authHeaders });

  if (catchId) {
    await testEndpoint('Catches', 'Get single catch', `/catches/${catchId}`, { headers: authHeaders });
    await testEndpoint('Catches', 'Update catch', `/catches/${catchId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ notes: 'Updated test catch' })
    });
  }

  // ==================== SOCIAL FEATURES ====================
  console.log('\n📋 SOCIAL (LIKES, COMMENTS, KUDOS)');
  if (catchId) {
    await testEndpoint('Social', 'Like catch', `/catches/${catchId}/like`, { method: 'POST', headers: authHeaders });
    await testEndpoint('Social', 'Add comment to catch', `/catches/${catchId}/comments`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ text: 'Great catch!' })
    });
    await testEndpoint('Social', 'Get catch comments', `/catches/${catchId}/comments`, { headers: authHeaders });
    await testEndpoint('Social', 'Give kudos to catch', `/kudos/catch/${catchId}`, { method: 'POST', headers: authHeaders });
  }

  // ==================== FEED ====================
  console.log('\n📋 FEED');
  await testEndpoint('Feed', 'Get feed', '/feed', { headers: authHeaders });
  await testEndpoint('Feed', 'Get feed with pagination', '/feed?page=1&limit=10', { headers: authHeaders });
  await testEndpoint('Feed', 'Get discovery feed', '/feed/discover', { headers: authHeaders });

  // ==================== FRIENDS ====================
  console.log('\n📋 FRIENDS');
  await testEndpoint('Friends', 'Get friends list', '/friends', { headers: authHeaders });
  await testEndpoint('Friends', 'Get friend requests', '/friends/requests', { headers: authHeaders });
  await testEndpoint('Friends', 'Get pending requests', '/friends/pending', { headers: authHeaders });

  // ==================== STATISTICS ====================
  console.log('\n📋 STATISTICS');
  await testEndpoint('Statistics', 'Get overview', '/statistics/overview', { headers: authHeaders });
  await testEndpoint('Statistics', 'Get species stats', '/statistics/species', { headers: authHeaders });
  await testEndpoint('Statistics', 'Get time stats', '/statistics/time', { headers: authHeaders });
  await testEndpoint('Statistics', 'Get all stats', '/statistics/all', { headers: authHeaders });

  // ==================== SESSIONS ====================
  console.log('\n📋 FISHING SESSIONS');
  const sessionResult = await testEndpoint('Sessions', 'Start session', '/sessions/start', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      title: 'Test Session',
      sessionType: 'shore',
      visibility: 'public'
    })
  });
  const sessionId = sessionResult.data?.id;

  await testEndpoint('Sessions', 'Get active session', '/sessions/active', { headers: authHeaders });
  await testEndpoint('Sessions', 'Get user sessions', '/sessions', { headers: authHeaders });

  if (sessionId) {
    await testEndpoint('Sessions', 'Get single session', `/sessions/${sessionId}`, { headers: authHeaders });
    await testEndpoint('Sessions', 'End session', `/sessions/${sessionId}/end`, { method: 'PUT', headers: authHeaders });
  }

  // ==================== CHALLENGES ====================
  console.log('\n📋 CHALLENGES');
  await testEndpoint('Challenges', 'Get challenges', '/challenges', { headers: authHeaders });
  await testEndpoint('Challenges', 'Get my challenges', '/challenges/mine', { headers: authHeaders });
  await testEndpoint('Challenges', 'Get challenge templates', '/challenges/templates', { headers: authHeaders });
  await testEndpoint('Challenges', 'Get active challenges', '/challenges/active', { headers: authHeaders });

  // ==================== BADGES ====================
  console.log('\n📋 BADGES & XP');
  await testEndpoint('Badges', 'Get all badges', '/badges', { headers: authHeaders });
  await testEndpoint('Badges', 'Get my badges', '/badges/mine', { headers: authHeaders });
  await testEndpoint('XP', 'Get XP status', '/api/xp/me', { headers: authHeaders });
  await testEndpoint('XP', 'Get XP leaderboard', '/api/xp/leaderboard', { headers: authHeaders });

  // ==================== NOTIFICATIONS ====================
  console.log('\n📋 NOTIFICATIONS');
  await testEndpoint('Notifications', 'Get notifications', '/notifications', { headers: authHeaders });
  await testEndpoint('Notifications', 'Get unread count', '/notifications/unread-count', { headers: authHeaders });

  // ==================== PUSH TOKENS ====================
  console.log('\n📋 PUSH TOKENS');
  await testEndpoint('Push', 'Register push token', '/push-tokens/register', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ token: 'ExponentPushToken[test123]', device: 'test' })
  });

  // ==================== WEATHER ====================
  console.log('\n📋 WEATHER');
  await testEndpoint('Weather', 'Get weather', '/weather?lat=55.6761&lon=12.5683', { headers: authHeaders });
  await testEndpoint('Weather', 'Get weather forecast', '/weather/forecast?lat=55.6761&lon=12.5683', { headers: authHeaders });

  // ==================== HOT SPOTS ====================
  console.log('\n📋 HOT SPOTS');
  await testEndpoint('HotSpots', 'Get hot spots', '/hot-spots', { headers: authHeaders });
  await testEndpoint('HotSpots', 'Get my favorites', '/hot-spots/my-favorites', { headers: authHeaders });
  await testEndpoint('HotSpots', 'Get nearby hot spots', '/hot-spots/nearby?lat=55.6761&lng=12.5683', { headers: authHeaders });

  // ==================== FAVORITE SPOTS ====================
  console.log('\n📋 FAVORITE SPOTS');
  await testEndpoint('FavoriteSpots', 'Get favorite spots', '/favorite-spots', { headers: authHeaders });
  const favSpotResult = await testEndpoint('FavoriteSpots', 'Create favorite spot', '/favorite-spots', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      name: 'Test Spot',
      latitude: 55.6761,
      longitude: 12.5683,
      description: 'A great fishing spot'
    })
  });

  // ==================== SPECIES ====================
  console.log('\n📋 SPECIES');
  await testEndpoint('Species', 'Get all species', '/species', { headers: authHeaders });
  await testEndpoint('Species', 'Search species', '/species/search?query=gedde', { headers: authHeaders });
  await testEndpoint('Species', 'Get FiskeDex', '/species/fiskedex', { headers: authHeaders });

  // ==================== LEADERBOARD ====================
  console.log('\n📋 LEADERBOARD');
  await testEndpoint('Leaderboard', 'Get global leaderboard', '/leaderboard', { headers: authHeaders });
  await testEndpoint('Leaderboard', 'Get weekly leaderboard', '/leaderboard/weekly', { headers: authHeaders });
  await testEndpoint('Leaderboard', 'Get monthly leaderboard', '/leaderboard/monthly', { headers: authHeaders });

  // ==================== PERSONAL BESTS ====================
  console.log('\n📋 PERSONAL BESTS');
  await testEndpoint('PersonalBests', 'Get personal bests', '/personal-bests', { headers: authHeaders });

  // ==================== CONVERSATIONS/MESSAGES ====================
  console.log('\n📋 CONVERSATIONS & MESSAGES');
  await testEndpoint('Conversations', 'Get conversations', '/conversations', { headers: authHeaders });
  await testEndpoint('Messages', 'Get messages', '/messages', { headers: authHeaders });

  // ==================== EVENTS ====================
  console.log('\n📋 EVENTS');
  await testEndpoint('Events', 'Get all events', '/events', { headers: authHeaders });
  await testEndpoint('Events', 'Get my events', '/events/mine', { headers: authHeaders });
  await testEndpoint('Events', 'Get upcoming events', '/events/upcoming', { headers: authHeaders });

  // ==================== CLUBS ====================
  console.log('\n📋 CLUBS');
  await testEndpoint('Clubs', 'Get all clubs', '/clubs', { headers: authHeaders });
  await testEndpoint('Clubs', 'Get my clubs', '/clubs/mine', { headers: authHeaders });

  // ==================== GROUPS ====================
  console.log('\n📋 GROUPS');
  await testEndpoint('Groups', 'Get all groups', '/groups', { headers: authHeaders });
  await testEndpoint('Groups', 'Get my groups', '/groups/mine', { headers: authHeaders });

  // ==================== SEGMENTS ====================
  console.log('\n📋 SEGMENTS');
  await testEndpoint('Segments', 'Get segments', '/segments', { headers: authHeaders });
  await testEndpoint('Segments', 'Get nearby segments', '/segments/nearby?lat=55.6761&lng=12.5683', { headers: authHeaders });

  // ==================== PREDICTIONS ====================
  console.log('\n📋 PREDICTIONS');
  await testEndpoint('Predictions', 'Get fishing predictions', '/predictions?lat=55.6761&lng=12.5683', { headers: authHeaders });

  // ==================== AI FEATURES ====================
  console.log('\n📋 AI FEATURES');
  await testEndpoint('AI', 'AI status', '/ai/status', { headers: authHeaders });

  // ==================== MODERATION ====================
  console.log('\n📋 MODERATION');
  await testEndpoint('Moderation', 'Get blocked users', '/moderation/blocked', { headers: authHeaders });
  await testEndpoint('Moderation', 'Get muted users', '/moderation/muted', { headers: authHeaders });

  // ==================== PUBLIC PROFILE ====================
  console.log('\n📋 PUBLIC PROFILES');
  if (userId) {
    await testEndpoint('Profiles', 'Get public profile', `/profile/${userId}`, { headers: authHeaders });
  }

  // ==================== FISHING FEATURES ====================
  console.log('\n📋 FISHING FEATURES');
  await testEndpoint('FishingFeatures', 'Get regulations', '/fishing/regulations', { headers: authHeaders });
  await testEndpoint('FishingFeatures', 'Get tides', '/fishing/tides?lat=55.6761&lng=12.5683', { headers: authHeaders });
  await testEndpoint('FishingFeatures', 'Get bait effectiveness', '/fishing/bait-effectiveness', { headers: authHeaders });

  // ==================== PREMIUM ANALYTICS ====================
  console.log('\n📋 PREMIUM ANALYTICS');
  await testEndpoint('Premium', 'Get advanced stats', '/premium/analytics/advanced', { headers: authHeaders });
  await testEndpoint('Premium', 'Get subscription status', '/premium/status', { headers: authHeaders });

  // ==================== NATIVE ADS ====================
  console.log('\n📋 NATIVE ADS');
  await testEndpoint('Ads', 'Get feed ads', '/ads/feed', { headers: authHeaders });
  await testEndpoint('Ads', 'Get map ads', '/ads/map?lat=55.6761&lng=12.5683', { headers: authHeaders });

  // ==================== CLEANUP ====================
  console.log('\n📋 CLEANUP');
  if (catchId) {
    await testEndpoint('Cleanup', 'Delete test catch', `/catches/${catchId}`, { method: 'DELETE', headers: authHeaders });
  }

  // ==================== SUMMARY ====================
  console.log('\n' + '='.repeat(60));
  console.log(`📊 COMPREHENSIVE TEST RESULTS`);
  console.log('='.repeat(60));
  console.log(`Total tests: ${results.passed + results.failed}`);
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);

  // Group results by category
  const byCategory = {};
  results.tests.forEach(t => {
    if (!byCategory[t.category]) byCategory[t.category] = { passed: 0, failed: 0, tests: [] };
    byCategory[t.category].tests.push(t);
    if (t.status === 'PASS') byCategory[t.category].passed++;
    else byCategory[t.category].failed++;
  });

  console.log('\n📈 Results by Category:');
  Object.entries(byCategory).forEach(([cat, data]) => {
    const pct = ((data.passed / (data.passed + data.failed)) * 100).toFixed(0);
    const icon = data.failed === 0 ? '✅' : '⚠️';
    console.log(`  ${icon} ${cat}: ${data.passed}/${data.passed + data.failed} (${pct}%)`);
  });

  const failed = results.tests.filter(t => t.status === 'FAIL');
  if (failed.length > 0) {
    console.log('\n❌ Failed Tests:');
    failed.forEach(t => console.log(`  - [${t.category}] ${t.test}: ${t.details}`));
  } else {
    console.log('\n✅ All tests passed!');
  }

  // List endpoints tested
  console.log(`\n📋 Total endpoints tested: ${allEndpoints.length}`);
}

runComprehensiveTests().catch(console.error);
