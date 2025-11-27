const API = 'http://localhost:3000';

async function runAllTests() {
  const results = { passed: 0, failed: 0, tests: [] };

  function log(test, status, details = '') {
    const icon = status === 'PASS' ? '✓' : '✗';
    console.log(`${icon} ${test}${details ? ' - ' + details : ''}`);
    results.tests.push({ test, status, details });
    if (status === 'PASS') results.passed++; else results.failed++;
  }

  console.log('\n🧪 FishLog API Test Suite\n' + '='.repeat(50));

  try {
    // 1. HEALTH CHECK
    console.log('\n📋 Health & Infrastructure');
    const health = await fetch(API + '/health');
    const healthData = await health.json();
    log('Health endpoint', health.ok ? 'PASS' : 'FAIL', healthData.status);
    log('Database connected', healthData.database === 'connected' ? 'PASS' : 'FAIL', healthData.database);

    // 2. AUTHENTICATION
    console.log('\n📋 Authentication');
    const timestamp = Date.now();
    const testEmail = `test_${timestamp}@fishlog.test`;

    const signup = await fetch(API + '/auth/signup', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({email: testEmail, password: 'Test123!', name: 'Test User'})
    });
    const signupData = await signup.json();
    log('User signup', signup.ok ? 'PASS' : 'FAIL', signup.ok ? 'Created' : signupData.error);

    const login = await fetch(API + '/auth/login', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({email: testEmail, password: 'Test123!'})
    });
    const loginData = await login.json();
    log('User login', login.ok && loginData.accessToken ? 'PASS' : 'FAIL');

    const token = loginData.accessToken;
    const headers = {'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json'};

    // 3. USER PROFILE
    console.log('\n📋 User Profile');
    const profile = await fetch(API + '/users/me', {headers});
    const profileData = await profile.json();
    log('Get profile', profile.ok ? 'PASS' : 'FAIL', profileData.email || profileData.error);

    const updateProfile = await fetch(API + '/users/me', {
      method: 'PATCH', headers,
      body: JSON.stringify({name: 'Updated Name', bio: 'Test bio'})
    });
    log('Update profile', updateProfile.ok ? 'PASS' : 'FAIL');

    // 4. CATCHES
    console.log('\n📋 Catches');
    const createCatch = await fetch(API + '/catches', {
      method: 'POST', headers,
      body: JSON.stringify({
        species: 'Gedde', lengthCm: 85, weightKg: 5.2,
        latitude: 55.6761, longitude: 12.5683,
        notes: 'Test catch', visibility: 'public', isDraft: false
      })
    });
    const catchData = await createCatch.json();
    // Response is { catch: {...}, badges: [...] }
    const catchObj = catchData.catch || catchData;
    log('Create catch', createCatch.ok ? 'PASS' : 'FAIL', catchObj.id ? 'ID: ' + catchObj.id : catchData.error);
    const catchId = catchObj.id;

    const getCatches = await fetch(API + '/catches', {headers});
    const catchesList = await getCatches.json();
    log('Get catches list', getCatches.ok && Array.isArray(catchesList) ? 'PASS' : 'FAIL', catchesList.length + ' catches');

    if (catchId) {
      const getCatch = await fetch(API + '/catches/' + catchId, {headers});
      log('Get single catch', getCatch.ok ? 'PASS' : 'FAIL');

      const updateCatch = await fetch(API + '/catches/' + catchId, {
        method: 'PUT', headers,
        body: JSON.stringify({notes: 'Updated notes'})
      });
      log('Update catch', updateCatch.ok ? 'PASS' : 'FAIL');
    }

    // 5. FEED
    console.log('\n📋 Feed');
    const feed = await fetch(API + '/feed', {headers});
    const feedData = await feed.json();
    log('Get feed', feed.ok ? 'PASS' : 'FAIL', (feedData.catches || feedData).length + ' items');

    const feedPage2 = await fetch(API + '/feed?page=1&limit=10', {headers});
    log('Feed pagination', feedPage2.ok ? 'PASS' : 'FAIL');

    // 6. SOCIAL - LIKES & COMMENTS
    console.log('\n📋 Social Features');
    if (catchId) {
      const like = await fetch(API + '/catches/' + catchId + '/like', {method: 'POST', headers});
      log('Like catch', like.ok ? 'PASS' : 'FAIL');

      const comment = await fetch(API + '/catches/' + catchId + '/comments', {
        method: 'POST', headers,
        body: JSON.stringify({text: 'Great catch!'})
      });
      log('Add comment', comment.ok ? 'PASS' : 'FAIL');

      const getComments = await fetch(API + '/catches/' + catchId + '/comments', {headers});
      log('Get comments', getComments.ok ? 'PASS' : 'FAIL');
    }

    // 7. FRIENDS
    console.log('\n📋 Friends');
    const friends = await fetch(API + '/friends', {headers});
    const friendsData = await friends.json();
    log('Get friends list', friends.ok ? 'PASS' : 'FAIL', Array.isArray(friendsData) ? friendsData.length + ' friends' : 'Error');

    const requests = await fetch(API + '/friends/requests', {headers});
    log('Get friend requests', requests.ok ? 'PASS' : 'FAIL');

    // 8. STATISTICS
    console.log('\n📋 Statistics');
    const stats = await fetch(API + '/statistics/overview', {headers});
    const statsData = await stats.json();
    log('Get statistics', stats.ok ? 'PASS' : 'FAIL', statsData.totalCatches !== undefined ? 'Total: ' + statsData.totalCatches : statsData.error);

    // 9. SESSIONS
    console.log('\n📋 Fishing Sessions');
    const createSession = await fetch(API + '/sessions/start', {
      method: 'POST', headers,
      body: JSON.stringify({
        title: 'Test Session', sessionType: 'shore',
        visibility: 'public'
      })
    });
    const sessionData = await createSession.json();
    log('Start session', createSession.ok ? 'PASS' : 'FAIL', sessionData.id ? 'ID: ' + sessionData.id : sessionData.error);

    const getSessions = await fetch(API + '/sessions/active', {headers});
    log('Get active session', getSessions.ok ? 'PASS' : 'FAIL');

    // End session if created
    if (sessionData.id) {
      const endSession = await fetch(API + '/sessions/' + sessionData.id + '/end', {
        method: 'PUT', headers
      });
      log('End session', endSession.ok ? 'PASS' : 'FAIL');
    }

    // 10. CHALLENGES
    console.log('\n📋 Challenges');
    const challenges = await fetch(API + '/challenges', {headers});
    log('Get challenges', challenges.ok ? 'PASS' : 'FAIL');

    const templates = await fetch(API + '/challenges/templates', {headers});
    log('Get challenge templates', templates.ok ? 'PASS' : 'FAIL');

    // 11. BADGES
    console.log('\n📋 Badges & XP');
    const badges = await fetch(API + '/badges', {headers});
    log('Get badges', badges.ok ? 'PASS' : 'FAIL');

    const xp = await fetch(API + '/api/xp/me', {headers});
    log('Get XP info', xp.ok ? 'PASS' : 'FAIL');

    // 12. NOTIFICATIONS
    console.log('\n📋 Notifications');
    const notifications = await fetch(API + '/notifications', {headers});
    log('Get notifications', notifications.ok ? 'PASS' : 'FAIL');

    // 13. WEATHER
    console.log('\n📋 Weather');
    const weather = await fetch(API + '/weather?lat=55.6761&lon=12.5683', {headers});
    log('Get weather', weather.ok ? 'PASS' : 'FAIL');

    // 14. HOT SPOTS
    console.log('\n📋 Hot Spots');
    const hotspots = await fetch(API + '/hot-spots/my-favorites', {headers});
    log('Get favorite spots', hotspots.ok ? 'PASS' : 'FAIL');

    // 15. SPECIES
    console.log('\n📋 Species');
    const species = await fetch(API + '/species', {headers});
    log('Get species list', species.ok ? 'PASS' : 'FAIL');

    // 16. LEADERBOARD
    console.log('\n📋 Leaderboard');
    const leaderboard = await fetch(API + '/leaderboard', {headers});
    log('Get leaderboard', leaderboard.ok ? 'PASS' : 'FAIL');

    // 17. PERSONAL BESTS
    console.log('\n📋 Personal Bests');
    const pbs = await fetch(API + '/personal-bests', {headers});
    log('Get personal bests', pbs.ok ? 'PASS' : 'FAIL');

    // 18. CONVERSATIONS/MESSAGES
    console.log('\n📋 Messages');
    const conversations = await fetch(API + '/conversations', {headers});
    log('Get conversations', conversations.ok ? 'PASS' : 'FAIL');

    // 19. FAVORITE SPOTS
    console.log('\n📋 Favorite Spots');
    const favoriteSpots = await fetch(API + '/favorite-spots', {headers});
    log('Get favorite spots', favoriteSpots.ok ? 'PASS' : 'FAIL');

    // 20. EVENTS
    console.log('\n📋 Events');
    const events = await fetch(API + '/events', {headers});
    log('Get events', events.ok ? 'PASS' : 'FAIL');

    // CLEANUP
    if (catchId) {
      await fetch(API + '/catches/' + catchId, {method: 'DELETE', headers});
    }

    // SUMMARY
    console.log('\n' + '='.repeat(50));
    console.log(`📊 RESULTS: ${results.passed}/${results.passed + results.failed} tests passed`);
    console.log(`Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);

    const failed = results.tests.filter(t => t.status === 'FAIL');
    if (failed.length > 0) {
      console.log('\n❌ Failed tests:');
      failed.forEach(t => console.log(`  - ${t.test}: ${t.details}`));
    } else {
      console.log('\n✅ All tests passed!');
    }

  } catch (e) {
    console.error('Test error:', e.message);
  }
}

runAllTests();
