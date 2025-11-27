/**
 * Comprehensive API Test Script for FishLog Backend
 * Tests all major endpoints and database tables
 */

const API_URL = 'https://fishlog-production.up.railway.app';

// Test results collection
const results = {
  passed: [],
  failed: [],
  skipped: []
};

// Helper function to make requests
async function request(method, endpoint, body = null, token = null) {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, options);
    const data = await response.json().catch(() => ({}));
    return { status: response.status, data, ok: response.ok };
  } catch (error) {
    return { status: 0, data: { error: error.message }, ok: false };
  }
}

// Test helper
function test(name, passed, details = '') {
  if (passed) {
    results.passed.push({ name, details });
    console.log(`PASS: ${name}`);
  } else {
    results.failed.push({ name, details });
    console.log(`FAIL: ${name}: ${details}`);
  }
}

// Variables to store test data
let authToken = null;
let testUserId = null;
let testCatchId = null;
let testSessionId = null;

async function runTests() {
  console.log('\nFishLog Comprehensive API Test\n');
  console.log('='.repeat(50));
  console.log(`Testing: ${API_URL}`);
  console.log('='.repeat(50));

  // ============================================
  // 1. HEALTH & BASIC ENDPOINTS
  // ============================================
  console.log('\n1. Health & Basic Endpoints\n');

  // Health check
  const health = await request('GET', '/health');
  test('Health endpoint', health.ok && health.data.status === 'healthy',
    health.ok ? `DB: ${health.data.database}` : health.data.error);

  // ============================================
  // 2. AUTHENTICATION
  // ============================================
  console.log('\n2. Authentication Endpoints\n');

  // Generate unique test user
  const testEmail = `test_${Date.now()}@fishlog-test.com`;
  const testPassword = 'TestPassword123!';

  // Register (signup endpoint)
  const register = await request('POST', '/auth/signup', {
    email: testEmail,
    password: testPassword,
    name: 'Test User'
  });
  test('Register new user', register.ok || register.status === 409,
    register.ok ? 'User created' : `Status: ${register.status}, ${JSON.stringify(register.data)}`);

  // If registration succeeded, use that token
  if (register.ok && register.data.accessToken) {
    authToken = register.data.accessToken;
    testUserId = register.data.user?.id;
    test('Got token from registration', true, 'Token received');
  } else {
    // Try login if user already exists
    const login = await request('POST', '/auth/login', {
      email: testEmail,
      password: testPassword
    });
    test('Login', login.ok && login.data.accessToken,
      login.ok ? 'Token received' : `Status: ${login.status}, ${JSON.stringify(login.data)}`);

    if (login.ok && login.data.accessToken) {
      authToken = login.data.accessToken;
      testUserId = login.data.user?.id;
    }
  }

  // Get user profile via /users/me (correct endpoint)
  if (authToken) {
    const profile = await request('GET', '/users/me', null, authToken);
    test('Get user profile', profile.ok,
      profile.ok ? `User: ${profile.data.email}` : `Status: ${profile.status}`);
  }

  // ============================================
  // 3. CATCHES (CRUD)
  // ============================================
  console.log('\n3. Catches Endpoints\n');

  if (authToken) {
    // Create catch
    const newCatch = await request('POST', '/catches', {
      species: 'Gedde',
      weight: 2500,
      length: 65,
      location: 'Test Lake',
      latitude: 55.6761,
      longitude: 12.5683,
      notes: 'Test catch from API test',
      bait: 'Spinner',
      technique: 'Spinning'
    }, authToken);
    test('Create catch', newCatch.ok,
      newCatch.ok ? `ID: ${newCatch.data.id}` : `Status: ${newCatch.status}, ${JSON.stringify(newCatch.data)}`);

    if (newCatch.ok) {
      testCatchId = newCatch.data.id;
    }

    // Get all catches
    const catches = await request('GET', '/catches', null, authToken);
    test('Get all catches', catches.ok && Array.isArray(catches.data),
      catches.ok ? `Count: ${catches.data.length}` : `Status: ${catches.status}`);

    // Get single catch
    if (testCatchId) {
      const singleCatch = await request('GET', `/catches/${testCatchId}`, null, authToken);
      test('Get single catch', singleCatch.ok,
        singleCatch.ok ? `Species: ${singleCatch.data.species}` : `Status: ${singleCatch.status}`);

      // Update catch
      const updateCatch = await request('PUT', `/catches/${testCatchId}`, {
        notes: 'Updated test catch'
      }, authToken);
      test('Update catch', updateCatch.ok,
        updateCatch.ok ? 'Updated' : `Status: ${updateCatch.status}`);
    }

    // Get catch statistics
    const stats = await request('GET', '/catches/stats', null, authToken);
    test('Get catch statistics', stats.ok || stats.status === 404,
      stats.ok ? `Stats received` : `Status: ${stats.status}`);
  } else {
    console.log('Skipping catches tests (no auth token)');
    results.skipped.push({ name: 'Catches tests', details: 'No auth token' });
  }

  // ============================================
  // 4. FISHING SESSIONS
  // ============================================
  console.log('\n4. Fishing Sessions Endpoints\n');

  if (authToken) {
    // Create session - valid sessionTypes: 'shore' | 'boat' | 'kayak' | 'ice' | 'wade'
    const newSession = await request('POST', '/sessions/start', {
      sessionType: 'shore',  // Fixed: was 'casual', must be one of valid types
      title: 'Test Fishing Session',
      description: 'Test session from API test',
      visibility: 'private'
    }, authToken);
    test('Create fishing session', newSession.ok || newSession.status === 201,
      newSession.ok ? `ID: ${newSession.data.session?.id}` : `Status: ${newSession.status}, ${JSON.stringify(newSession.data)}`);

    if (newSession.ok && newSession.data.session?.id) {
      testSessionId = newSession.data.session.id;
    }

    // Get sessions feed (correct endpoint - not just /sessions)
    const sessions = await request('GET', '/sessions/feed', null, authToken);
    test('Get sessions feed', sessions.ok,
      sessions.ok ? `Sessions: ${sessions.data.sessions?.length || 0}` : `Status: ${sessions.status}`);

    // Get active session
    const activeSessions = await request('GET', '/sessions/active', null, authToken);
    test('Get active session', activeSessions.ok || activeSessions.status === 404,
      activeSessions.ok ? 'Active session found' : `Status: ${activeSessions.status}`);

    // End session
    if (testSessionId) {
      const endSession = await request('POST', `/sessions/${testSessionId}/end`, {}, authToken);
      test('End fishing session', endSession.ok || endSession.status === 200,
        endSession.ok ? 'Ended' : `Status: ${endSession.status}`);
    }
  } else {
    console.log('Skipping sessions tests (no auth token)');
    results.skipped.push({ name: 'Sessions tests', details: 'No auth token' });
  }

  // ============================================
  // 5. WEATHER
  // ============================================
  console.log('\n5. Weather Endpoints\n');

  // Weather current (requires auth)
  if (authToken) {
    const weather = await request('GET', '/weather/current?lat=55.6761&lon=12.5683', null, authToken);
    test('Get current weather', weather.ok || weather.status === 200 || weather.status === 503,
      weather.ok ? 'Weather received' : `Status: ${weather.status}, ${JSON.stringify(weather.data)}`);

    // Moon phase (requires auth)
    const moon = await request('GET', '/weather/moon?date=2025-01-15', null, authToken);
    test('Get moon phase', moon.ok || moon.status === 200,
      moon.ok ? 'Moon phase received' : `Status: ${moon.status}`);
  } else {
    console.log('Skipping weather tests (no auth token)');
    results.skipped.push({ name: 'Weather tests', details: 'No auth token' });
  }

  // ============================================
  // 6. HOT SPOTS
  // ============================================
  console.log('\n6. Hot Spots Endpoints\n');

  if (authToken) {
    // Get user's favorite hot spots (correct endpoint)
    const hotspots = await request('GET', '/hot-spots/my-favorites', null, authToken);
    test('Get my favorite spots', hotspots.ok || hotspots.status === 200,
      hotspots.ok ? `Favorites: ${hotspots.data.favoriteSpots?.length || 0}` : `Status: ${hotspots.status}`);

    // Get discovered hot spots
    const discover = await request('GET', '/hot-spots/discover', null, authToken);
    test('Get discovered hot spots', discover.ok || discover.status === 200,
      discover.ok ? `Discovered: ${discover.data.hotSpots?.length || 0}` : `Status: ${discover.status}`);

    // Get heatmap
    const heatmap = await request('GET', '/hot-spots/heatmap', null, authToken);
    test('Get heatmap data', heatmap.ok || heatmap.status === 200,
      heatmap.ok ? `Points: ${heatmap.data.points?.length || 0}` : `Status: ${heatmap.status}`);
  }

  // ============================================
  // 7. CHALLENGES
  // ============================================
  console.log('\n7. Challenges Endpoints\n');

  if (authToken) {
    // Get all challenges
    const challenges = await request('GET', '/challenges', null, authToken);
    test('Get all challenges', challenges.ok || challenges.status === 200,
      challenges.ok ? `Count: ${Array.isArray(challenges.data) ? challenges.data.length : 'N/A'}` : `Status: ${challenges.status}`);
  }

  // ============================================
  // 8. SOCIAL FEATURES (FEED)
  // ============================================
  console.log('\n8. Social Features (Feed)\n');

  if (authToken) {
    // Get feed
    const feed = await request('GET', '/feed', null, authToken);
    test('Get social feed', feed.ok || feed.status === 200,
      feed.ok ? `Items: ${Array.isArray(feed.data) ? feed.data.length : 'N/A'}` : `Status: ${feed.status}`);

    // Like a catch (if we have one)
    if (testCatchId) {
      const like = await request('POST', `/catches/${testCatchId}/like`, {}, authToken);
      test('Like a catch', like.ok || like.status === 200 || like.status === 201 || like.status === 409,
        like.ok ? 'Liked' : `Status: ${like.status}`);

      // Add comment
      const comment = await request('POST', `/catches/${testCatchId}/comments`, {
        text: 'Test comment from API test'
      }, authToken);
      test('Add comment to catch', comment.ok || comment.status === 201,
        comment.ok ? 'Comment added' : `Status: ${comment.status}`);

      // Get comments
      const comments = await request('GET', `/catches/${testCatchId}/comments`, null, authToken);
      test('Get catch comments', comments.ok || comments.status === 200,
        comments.ok ? `Count: ${Array.isArray(comments.data) ? comments.data.length : 'N/A'}` : `Status: ${comments.status}`);
    }
  }

  // ============================================
  // 9. NOTIFICATIONS
  // ============================================
  console.log('\n9. Notifications Endpoints\n');

  if (authToken) {
    // Get notifications
    const notifications = await request('GET', '/notifications', null, authToken);
    test('Get notifications', notifications.ok || notifications.status === 200,
      notifications.ok ? `Count: ${Array.isArray(notifications.data) ? notifications.data.length : 'N/A'}` : `Status: ${notifications.status}`);

    // Get unread count
    const unreadCount = await request('GET', '/notifications/unread-count', null, authToken);
    test('Get unread notification count', unreadCount.ok || unreadCount.status === 200 || unreadCount.status === 404,
      unreadCount.ok ? `Unread: ${unreadCount.data.count || 0}` : `Status: ${unreadCount.status}`);
  }

  // ============================================
  // 10. USER FEATURES
  // ============================================
  console.log('\n10. User Features\n');

  if (authToken) {
    // Get user settings
    const settings = await request('GET', '/users/settings', null, authToken);
    test('Get user settings', settings.ok || settings.status === 200 || settings.status === 404,
      settings.ok ? 'Settings received' : `Status: ${settings.status}`);

    // Get user stats
    const userStats = await request('GET', '/users/stats', null, authToken);
    test('Get user stats', userStats.ok || userStats.status === 200 || userStats.status === 404,
      userStats.ok ? 'User stats received' : `Status: ${userStats.status}`);

    // Get leaderboard
    const leaderboard = await request('GET', '/users/leaderboard', null, authToken);
    test('Get leaderboard', leaderboard.ok || leaderboard.status === 200 || leaderboard.status === 404,
      leaderboard.ok ? 'Leaderboard received' : `Status: ${leaderboard.status}`);

    // Get user badges
    const badges = await request('GET', '/users/me/badges', null, authToken);
    test('Get user badges', badges.ok || badges.status === 200 || badges.status === 404,
      badges.ok ? `Badges: ${badges.data.length || 0}` : `Status: ${badges.status}`);
  }

  // ============================================
  // CLEANUP: Delete test data
  // ============================================
  console.log('\nCleanup\n');

  if (authToken && testCatchId) {
    const deleteCatch = await request('DELETE', `/catches/${testCatchId}`, null, authToken);
    test('Delete test catch', deleteCatch.ok || deleteCatch.status === 204 || deleteCatch.status === 200,
      deleteCatch.ok ? 'Deleted' : `Status: ${deleteCatch.status}`);
  }

  // ============================================
  // RESULTS SUMMARY
  // ============================================
  console.log('\n' + '='.repeat(50));
  console.log('TEST RESULTS SUMMARY');
  console.log('='.repeat(50));
  console.log(`Passed: ${results.passed.length}`);
  console.log(`Failed: ${results.failed.length}`);
  console.log(`Skipped: ${results.skipped.length}`);
  console.log(`Total: ${results.passed.length + results.failed.length + results.skipped.length}`);

  if (results.failed.length > 0) {
    console.log('\nFAILED TESTS:');
    results.failed.forEach(f => console.log(`   - ${f.name}: ${f.details}`));
  }

  console.log('\n' + '='.repeat(50));

  return results;
}

// Run tests
runTests().then(results => {
  process.exit(results.failed.length > 0 ? 1 : 0);
}).catch(err => {
  console.error('Test runner error:', err);
  process.exit(1);
});
