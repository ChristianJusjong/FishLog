const API = 'https://fishlog-production.up.railway.app';

async function debugEndpoints() {
  console.log('🔍 Debugging Railway API Issues\n');

  // First, login
  const timestamp = Date.now();
  const testEmail = `debug_${timestamp}@fishlog.test`;

  console.log('1. Creating test user...');
  const signup = await fetch(API + '/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: 'Test123!', name: 'Debug User' })
  });
  const signupData = await signup.json();
  console.log('   Signup:', signup.ok ? 'OK' : 'FAIL');

  console.log('2. Logging in...');
  const login = await fetch(API + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: 'Test123!' })
  });
  const loginData = await login.json();
  const token = loginData.accessToken;
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
  console.log('   Login:', login.ok ? 'OK' : 'FAIL');

  console.log('\n=== TESTING CRITICAL ENDPOINTS ===\n');

  // Test catches create
  console.log('3. Testing POST /catches...');
  const createCatchRes = await fetch(API + '/catches', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      species: 'Gedde',
      lengthCm: 85,
      weightKg: 5.5,
      latitude: 55.6761,
      longitude: 12.5683,
      notes: 'Debug test catch',
      visibility: 'public',
      isDraft: false
    })
  });
  const createCatchText = await createCatchRes.text();
  console.log('   Status:', createCatchRes.status);
  console.log('   Response:', createCatchText.substring(0, 500));

  // Test catches get
  console.log('\n4. Testing GET /catches...');
  const getCatchesRes = await fetch(API + '/catches', { headers });
  const getCatchesText = await getCatchesRes.text();
  console.log('   Status:', getCatchesRes.status);
  console.log('   Response:', getCatchesText.substring(0, 500));

  // Test leaderboard
  console.log('\n5. Testing GET /leaderboard...');
  const leaderboardRes = await fetch(API + '/leaderboard', { headers });
  const leaderboardText = await leaderboardRes.text();
  console.log('   Status:', leaderboardRes.status);
  console.log('   Response:', leaderboardText.substring(0, 500));

  // Test hot-spots/my-favorites
  console.log('\n6. Testing GET /hot-spots/my-favorites...');
  const hotSpotsRes = await fetch(API + '/hot-spots/my-favorites', { headers });
  const hotSpotsText = await hotSpotsRes.text();
  console.log('   Status:', hotSpotsRes.status);
  console.log('   Response:', hotSpotsText.substring(0, 500));

  // Test XP endpoint
  console.log('\n7. Testing GET /api/xp/me...');
  const xpRes = await fetch(API + '/api/xp/me', { headers });
  const xpText = await xpRes.text();
  console.log('   Status:', xpRes.status);
  console.log('   Response:', xpText.substring(0, 500));

  // Test weather
  console.log('\n8. Testing GET /weather...');
  const weatherRes = await fetch(API + '/weather?lat=55.6761&lon=12.5683', { headers });
  const weatherText = await weatherRes.text();
  console.log('   Status:', weatherRes.status);
  console.log('   Response:', weatherText.substring(0, 500));

  // Check what routes exist
  console.log('\n9. Testing root endpoint to see available routes...');
  const rootRes = await fetch(API + '/');
  const rootText = await rootRes.text();
  console.log('   Status:', rootRes.status);
  console.log('   Response:', rootText.substring(0, 1000));

  // Test friend requests with different paths
  console.log('\n10. Testing friend-related endpoints...');
  const paths = [
    '/friends/requests',
    '/friends/pending',
    '/friends/incoming',
    '/friends/outgoing',
  ];
  for (const path of paths) {
    const res = await fetch(API + path, { headers });
    console.log(`   ${path}: ${res.status}`);
  }

  // Test challenges endpoints
  console.log('\n11. Testing challenge endpoints...');
  const challengePaths = [
    '/challenges',
    '/challenges/mine',
    '/challenges/templates',
    '/challenges/active',
    '/challenge-templates',
  ];
  for (const path of challengePaths) {
    const res = await fetch(API + path, { headers });
    console.log(`   ${path}: ${res.status}`);
  }

  console.log('\n=== DEBUG COMPLETE ===');
}

debugEndpoints().catch(console.error);
