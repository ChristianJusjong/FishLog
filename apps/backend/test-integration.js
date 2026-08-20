/**
 * FishLog Integration Test Suite
 * Tests all major app functionality end-to-end
 */

const API_URL = process.env.API_URL || 'http://localhost:3000';

// Test utilities
let testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',    // Cyan
    success: '\x1b[32m', // Green
    error: '\x1b[31m',   // Red
    warning: '\x1b[33m', // Yellow
    reset: '\x1b[0m'
  };
  console.log(`${colors[type]}${message}${colors.reset}`);
}

function assert(condition, testName, details = '') {
  if (condition) {
    testResults.passed++;
    testResults.tests.push({ name: testName, status: 'PASSED', details });
    log(`✓ ${testName}`, 'success');
  } else {
    testResults.failed++;
    testResults.tests.push({ name: testName, status: 'FAILED', details });
    log(`✗ ${testName} - ${details}`, 'error');
    throw new Error(`Test failed: ${testName}`);
  }
}

// API Helper
async function apiCall(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const { headers, ...restOptions } = options;
  const response = await fetch(url, {
    headers: {
      ...(restOptions.body ? { 'Content-Type': 'application/json' } : {}),
      ...headers
    },
    ...restOptions
  });

  const data = await response.json().catch(() => null);
  return { response, data, status: response.status, ok: response.ok };
}

// Test Data
const testUsers = [
  { email: 'test_user1@fishlog.test', password: 'TestPass123!', name: 'Test User 1' },
  { email: 'test_user2@fishlog.test', password: 'TestPass123!', name: 'Test User 2' },
  { email: 'test_user3@fishlog.test', password: 'TestPass123!', name: 'Test User 3' }
];

const testCatch = {
  species: 'Gedde',
  lengthCm: 85,
  weightKg: 5.2,
  latitude: 55.6761,
  longitude: 12.5683,
  photoUrl: 'https://example.com/fish.jpg',
  notes: 'Stor gedde fanget ved Øresund',
  isDraft: false,
  visibility: 'public'
};

// Store test data
let users = [];
let catches = [];

// ============================================
// TEST SUITE
// ============================================

async function runTests() {
  log('\n🧪 Starting FishLog Integration Tests\n', 'info');
  log('━'.repeat(60), 'info');

  try {
    // Health Check
    await testHealthCheck();

    // Authentication Tests
    await testUserRegistration();
    await testUserLogin();

    // Catch Tests
    await testCreateCatch();
    await testGetCatches();
    await testDraftCatch();

    // Friend Tests
    await testSendFriendRequest();
    await testAcceptFriendRequest();
    await testGetFriendsList();

    // Feed Tests
    await testFeedVisibility();
    await testFeedPagination();

    // Social Interaction Tests
    await testLikeCatch();
    await testCommentOnCatch();
    await testGetComments();

    // Session Tests
    await testCreateSession();
    await testSessionWithCatches();

    // Statistics Tests
    await testGetStatistics();

    // Unfriend Tests
    await testUnfriend();

    // Cleanup
    await cleanup();

    // Print Results
    printResults();

  } catch (error) {
    log(`\n❌ Test suite failed: ${error.message}`, 'error');
    console.error(error);
    process.exit(1);
  }
}

// ============================================
// INDIVIDUAL TESTS
// ============================================

async function testHealthCheck() {
  log('\n📋 Testing: Health Check', 'info');
  const { ok, data } = await apiCall('/health');
  assert(ok, 'Health check returns 200');
  assert(data.status === 'healthy', 'Server is healthy');
  assert(data.database === 'connected', 'Database is connected');
}

async function testUserRegistration() {
  log('\n📋 Testing: User Registration', 'info');

  for (const user of testUsers) {
    const { ok, data, status } = await apiCall('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(user)
    });

    // 200 (ok) or 201 (created) or 409/400 (already exists) are acceptable
    if (ok && (status === 200 || status === 201)) {
      assert(ok, `Register new user: ${user.email}`);
      assert(data.accessToken, `User ${user.email} received access token`);
      users.push({ ...user, ...data });
    } else if ((status === 400 || status === 409) && (data.error?.includes('already') || data.error?.includes('registered'))) {
      // User already exists, try to login
      const loginResult = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: user.email, password: user.password })
      });
      assert(loginResult.ok, `Login existing user: ${user.email}`);
      users.push({ ...user, ...loginResult.data });
    } else {
      assert(false, `Register/login user: ${user.email}`, `Status: ${status}, Data: ${JSON.stringify(data)}`);
    }
  }

  assert(users.length === 3, 'All 3 test users ready');
}

async function testUserLogin() {
  log('\n📋 Testing: User Login', 'info');

  const { ok, data } = await apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: testUsers[0].email,
      password: testUsers[0].password
    })
  });

  assert(ok, 'Login with correct credentials');
  assert(data.accessToken, 'Received access token');
  assert(data.user, 'Received user data');
}

async function testCreateCatch() {
  log('\n📋 Testing: Create Catch', 'info');

  const user = users[0];
  const { ok, data, status } = await apiCall('/catches', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${user.accessToken}` },
    body: JSON.stringify(testCatch)
  });

  assert(ok, 'Create catch successfully', `Status: ${status}, Error: ${JSON.stringify(data)}`);
  const catchObj = data.catch || data;
  assert(catchObj.id, 'Catch has ID');
  assert(catchObj.species === testCatch.species, 'Catch has correct species');
  assert(!catchObj.isDraft, 'Catch is not a draft');

  catches.push({ ...catchObj, userId: user.user.id });
}

async function testGetCatches() {
  log('\n📋 Testing: Get Catches', 'info');

  const user = users[0];
  const { ok, data } = await apiCall('/catches', {
    headers: { 'Authorization': `Bearer ${user.accessToken}` }
  });

  assert(ok, 'Fetch user catches');
  assert(Array.isArray(data), 'Catches is an array');
  assert(data.length > 0, 'User has at least one catch');

  const userCatch = data.find(c => c.species === testCatch.species);
  assert(userCatch !== undefined, 'Found the test catch');
}

async function testDraftCatch() {
  log('\n📋 Testing: Draft Catch', 'info');

  const user = users[0];
  const draftCatch = {
    species: 'Aborre',
    lengthCm: 25,
    isDraft: true,
    visibility: 'private'
  };

  const { ok, data } = await apiCall('/catches', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${user.accessToken}` },
    body: JSON.stringify(draftCatch)
  });

  assert(ok, 'Create draft catch');
  const draftObj = data.catch || data;
  assert(draftObj.isDraft === true, 'Catch is marked as draft');

  // Complete the draft (endpoint is PATCH)
  const completeData = { ...draftCatch, weightKg: 0.4, isDraft: false };
  const complete = await apiCall(`/catches/${draftObj.id}/complete`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${user.accessToken}` },
    body: JSON.stringify(completeData)
  });

  assert(complete.ok, 'Complete draft catch');
  const completedObj = complete.data.catch || complete.data;
  assert(completedObj.isDraft === false, 'Catch is no longer a draft');
}

async function testSendFriendRequest() {
  log('\n📋 Testing: Send Friend Request', 'info');

  const user1 = users[0];
  const user2 = users[1];

  // Clean up any existing friendship first to ensure clean state
  await apiCall(`/friends/${user2.user.id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${user1.accessToken}` }
  });

  const { ok, data } = await apiCall('/friends/request', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${user1.accessToken}` },
    body: JSON.stringify({ accepterId: user2.user.id })
  });

  assert(ok, `User 1 sends friend request to User 2`);
  assert(data.status === 'pending', 'Friend request is pending');
}

async function testAcceptFriendRequest() {
  log('\n📋 Testing: Accept Friend Request', 'info');

  const user2 = users[1];

  // Get pending requests
  const requests = await apiCall('/friends/requests', {
    headers: { 'Authorization': `Bearer ${user2.accessToken}` }
  });

  assert(requests.ok, 'Fetch friend requests');
  assert(requests.data.length > 0, 'Has pending friend requests');

  const request = requests.data[0];

  // Accept request (POST /friends/accept with body { friendshipId })
  const accept = await apiCall('/friends/accept', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${user2.accessToken}` },
    body: JSON.stringify({ friendshipId: request.friendshipId })
  });

  assert(accept.ok, 'Accept friend request');
  assert(accept.data.status === 'accepted', 'Friendship is accepted');
}

async function testGetFriendsList() {
  log('\n📋 Testing: Get Friends List', 'info');

  const user1 = users[0];
  const { ok, data } = await apiCall('/friends', {
    headers: { 'Authorization': `Bearer ${user1.accessToken}` }
  });

  assert(ok, 'Fetch friends list');
  assert(Array.isArray(data.friends), 'Friends is an array');
  assert(data.friends.length > 0, 'User has at least one friend');
}

async function testFeedVisibility() {
  log('\n📋 Testing: Feed Visibility', 'info');

  // User 2 should see User 1's catch in feed (they are friends)
  const user2 = users[1];
  const { ok, data } = await apiCall('/feed', {
    headers: { 'Authorization': `Bearer ${user2.accessToken}` }
  });

  assert(ok, 'Fetch feed');

  // Handle both old and new API format
  const feedCatches = data.catches || data;
  assert(Array.isArray(feedCatches), 'Feed returns catches array');

  const friendCatch = feedCatches.find(c =>
    c.species === testCatch.species && c.user.name === testUsers[0].name
  );

  assert(friendCatch !== undefined, "User 2 can see User 1's catch in feed");
  assert(friendCatch.user.name === testUsers[0].name, 'Catch has user info');
}

async function testFeedPagination() {
  log('\n📋 Testing: Feed Pagination', 'info');

  const user = users[1];

  // Test page 1
  const page1 = await apiCall('/feed?page=1&limit=20', {
    headers: { 'Authorization': `Bearer ${user.accessToken}` }
  });

  assert(page1.ok, 'Fetch page 1 of feed');

  const catches1 = page1.data.catches || page1.data;
  assert(Array.isArray(catches1), 'Page 1 returns array');
  assert(catches1.length <= 20, 'Page 1 has max 20 items');

  // Check pagination metadata if available
  if (page1.data.page) {
    assert(page1.data.page === 1, 'Page number is correct');
    assert(page1.data.limit === 20, 'Limit is correct');
    assert(typeof page1.data.hasMore === 'boolean', 'Has hasMore flag');
  }
}

async function testLikeCatch() {
  log('\n📋 Testing: Like Catch', 'info');

  const user2 = users[1];
  const catchToLike = catches[0];

  const { ok, data } = await apiCall(`/catches/${catchToLike.id}/like`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${user2.accessToken}` }
  });

  assert(ok, 'Like catch successfully');

  // Verify like was added
  const catchData = await apiCall(`/catches/${catchToLike.id}`, {
    headers: { 'Authorization': `Bearer ${user2.accessToken}` }
  });

  assert(catchData.ok, 'Fetch catch details');
  assert(catchData.data.likesCount > 0, 'Catch has likes');
}

async function testCommentOnCatch() {
  log('\n📋 Testing: Comment on Catch', 'info');

  const user2 = users[1];
  const catchToComment = catches[0];

  const comment = { text: 'Fantastisk fangst! 🎣' };

  const { ok, data } = await apiCall(`/catches/${catchToComment.id}/comments`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${user2.accessToken}` },
    body: JSON.stringify(comment)
  });

  assert(ok, 'Add comment to catch');
  assert(data.text === comment.text, 'Comment text is correct');
  assert(data.user, 'Comment has user info');
}

async function testGetComments() {
  log('\n📋 Testing: Get Comments', 'info');

  const user = users[0];
  const catchWithComments = catches[0];

  const { ok, data } = await apiCall(`/catches/${catchWithComments.id}`, {
    headers: { 'Authorization': `Bearer ${user.accessToken}` }
  });

  assert(ok, 'Fetch catch with comments');
  assert(data.comments, 'Catch has comments array');
  assert(data.comments.length > 0, 'Catch has at least one comment');
  assert(data.commentsCount > 0, 'Comments count is correct');
}

async function testCreateSession() {
  log('\n📋 Testing: Create Fishing Session', 'info');

  const user = users[0];
  const session = {
    title: 'Test Fisketur',
    sessionType: 'shore',
    startTime: new Date().toISOString(),
    visibility: 'public'
  };

  // Clean up any existing active session for this user first
  const activeCheck = await apiCall('/sessions/active', {
    headers: { 'Authorization': `Bearer ${user.accessToken}` }
  });
  if (activeCheck.ok && activeCheck.data && activeCheck.data.id) {
    await apiCall(`/sessions/${activeCheck.data.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${user.accessToken}` }
    });
  }

  const { ok, data, status } = await apiCall('/sessions/start', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${user.accessToken}` },
    body: JSON.stringify(session)
  });

  assert(ok, 'Create fishing session', `Status: ${status}, Data: ${JSON.stringify(data)}`);
  const sessionObj = data.session || data;
  assert(sessionObj.id, 'Session has ID');
  assert(sessionObj.title === session.title, 'Session title is correct');

  users[0].sessionId = sessionObj.id;
}

async function testSessionWithCatches() {
  log('\n📋 Testing: Session with Catches', 'info');

  const user = users[0];
  const sessionId = user.sessionId;

  if (!sessionId) {
    log('Skipping: No session created', 'warning');
    return;
  }

  // Get session details
  const { ok, data } = await apiCall(`/sessions/${sessionId}`, {
    headers: { 'Authorization': `Bearer ${user.accessToken}` }
  });

  assert(ok, 'Fetch session details');
  assert(data.id === sessionId, 'Session ID matches');
  assert(Array.isArray(data.catches), 'Session has catches array');
}

async function testGetStatistics() {
  log('\n📋 Testing: User Statistics', 'info');

  const user = users[0];
  const { ok, data } = await apiCall('/statistics/overview', {
    headers: { 'Authorization': `Bearer ${user.accessToken}` }
  });

  assert(ok, 'Fetch statistics overview');
  assert(typeof data.totalCatches === 'number', 'Has total catches count');
  assert(Array.isArray(data.speciesBreakdown), 'Has species breakdown');
  assert(data.records, 'Has personal records');
  assert(data.averages, 'Has averages');
}

async function testUnfriend() {
  log('\n📋 Testing: Unfriend', 'info');

  const user1 = users[0];
  const user2 = users[1];

  const { ok } = await apiCall(`/friends/${user2.user.id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${user1.accessToken}` }
  });

  assert(ok, 'Unfriend user successfully');

  // Verify friendship is removed
  const friends = await apiCall('/friends', {
    headers: { 'Authorization': `Bearer ${user1.accessToken}` }
  });

  const friendsList = friends.data.friends || [];
  const stillFriends = friendsList.find(f => f.friend.id === user2.user.id);
  assert(stillFriends === undefined, 'User is no longer in friends list');
}

async function cleanup() {
  log('\n📋 Cleanup: Test Data', 'info');
  log('Test users and data will remain for manual inspection', 'warning');
  log('To clean up, delete users with email pattern: test_*@fishlog.test', 'warning');
}

// ============================================
// RESULTS
// ============================================

function printResults() {
  log('\n━'.repeat(60), 'info');
  log('\n📊 Test Results Summary\n', 'info');

  console.table({
    'Total Tests': testResults.passed + testResults.failed,
    'Passed': testResults.passed,
    'Failed': testResults.failed,
    'Success Rate': `${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`
  });

  if (testResults.failed > 0) {
    log('\n❌ Failed Tests:', 'error');
    testResults.tests
      .filter(t => t.status === 'FAILED')
      .forEach(t => log(`  - ${t.name}: ${t.details}`, 'error'));
  }

  if (testResults.passed === testResults.tests.length) {
    log('\n✨ All tests passed! 🎉', 'success');
    process.exit(0);
  } else {
    log('\n⚠️  Some tests failed', 'warning');
    process.exit(1);
  }
}

// ============================================
// RUN
// ============================================

runTests().catch(error => {
  log(`\n💥 Test suite crashed: ${error.message}`, 'error');
  console.error(error);
  process.exit(1);
});
