const API = 'https://fishlog-production.up.railway.app';

async function verifyRailway() {
  console.log('🔍 Verifying Railway Deployment\n');

  // Login first
  const timestamp = Date.now();
  const testEmail = `verify_${timestamp}@fishlog.test`;

  const signup = await fetch(API + '/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: 'Test123!', name: 'Verify User' })
  });
  const signupData = await signup.json();

  const login = await fetch(API + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: 'Test123!' })
  });
  const loginData = await login.json();
  const token = loginData.accessToken;
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  console.log('✓ Logged in successfully\n');

  // Test correct weather endpoints
  console.log('=== WEATHER ENDPOINTS ===');
  const weatherEndpoints = [
    '/weather/current?lat=55.6761&lon=12.5683',
    '/weather/moon?date=2025-11-25',
  ];
  for (const path of weatherEndpoints) {
    const res = await fetch(API + path, { headers });
    const data = await res.text();
    console.log(`${path}: ${res.status}`);
    if (res.status !== 200) console.log(`   Response: ${data.substring(0, 200)}`);
  }

  // Test database query endpoints (the ones that returned 500)
  console.log('\n=== DATABASE QUERY TESTS ===');

  // Try simplified catch creation
  console.log('\nTesting simplified catch creation...');
  const simpleCatch = await fetch(API + '/catches', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      species: 'Aborre',
      visibility: 'public',
      isDraft: true
    })
  });
  const simpleCatchData = await simpleCatch.text();
  console.log(`POST /catches (simple): ${simpleCatch.status}`);
  console.log(`   Response: ${simpleCatchData.substring(0, 300)}`);

  // Try with bare minimum fields
  console.log('\nTesting catch with bare minimum...');
  const minCatch = await fetch(API + '/catches', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      isDraft: true
    })
  });
  const minCatchData = await minCatch.text();
  console.log(`POST /catches (minimum): ${minCatch.status}`);
  console.log(`   Response: ${minCatchData.substring(0, 300)}`);

  // Test with species only
  console.log('\nTesting catch with species only...');
  const speciesCatch = await fetch(API + '/catches', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      species: 'Gedde',
      isDraft: false
    })
  });
  const speciesCatchData = await speciesCatch.text();
  console.log(`POST /catches (species only): ${speciesCatch.status}`);
  console.log(`   Response: ${speciesCatchData.substring(0, 300)}`);

  // Test health endpoint to verify database
  console.log('\n=== DATABASE VERIFICATION ===');
  const health = await fetch(API + '/health');
  const healthData = await health.json();
  console.log('Health check:', healthData);

  // Test friends endpoint to verify route registration
  console.log('\n=== ROUTE REGISTRATION VERIFICATION ===');
  const friendsEndpoints = [
    '/friends',
    '/friends/requests',
    '/friends/search?query=test',
  ];
  for (const path of friendsEndpoints) {
    const res = await fetch(API + path, { headers });
    console.log(`GET ${path}: ${res.status}`);
  }

  // Test XP endpoints
  console.log('\n=== XP ENDPOINTS ===');
  const xpEndpoints = [
    '/api/xp/me',
    '/api/xp/leaderboard',
    '/api/xp/my-rank',
    '/api/xp/rank/5',
  ];
  for (const path of xpEndpoints) {
    const res = await fetch(API + path, { headers });
    console.log(`GET ${path}: ${res.status}`);
    if (res.status !== 200) {
      const data = await res.text();
      console.log(`   Response: ${data.substring(0, 150)}`);
    }
  }

  // Test leaderboard with detail
  console.log('\n=== LEADERBOARD DEBUG ===');
  const leaderboardRes = await fetch(API + '/leaderboard?category=total_score&limit=5', { headers });
  const leaderboardText = await leaderboardRes.text();
  console.log(`GET /leaderboard: ${leaderboardRes.status}`);
  console.log(`   Response: ${leaderboardText.substring(0, 500)}`);

  // Test challenge templates endpoint
  console.log('\n=== CHALLENGE TEMPLATES ===');
  const templateEndpoints = [
    '/challenges/templates',
    '/challenge-templates',
  ];
  for (const path of templateEndpoints) {
    const res = await fetch(API + path, { headers });
    const data = await res.text();
    console.log(`GET ${path}: ${res.status}`);
    console.log(`   Response: ${data.substring(0, 200)}`);
  }

  console.log('\n=== VERIFICATION COMPLETE ===');
}

verifyRailway().catch(console.error);
