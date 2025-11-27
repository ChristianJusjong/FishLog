const API = 'https://fishlog-production.up.railway.app';

async function debug() {
  console.log('=== Debug Catches API ===\n');

  // 1. Create test user
  const timestamp = Date.now();
  const email = `debug_${timestamp}@test.com`;

  console.log('1. Creating test user...');
  const signup = await fetch(API + '/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'Test123!', name: 'Debug User' })
  });
  console.log('Signup:', signup.status, await signup.text());

  // 2. Login
  console.log('\n2. Logging in...');
  const login = await fetch(API + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'Test123!' })
  });
  const loginData = await login.json();
  console.log('Login status:', login.status);

  const headers = {
    'Authorization': `Bearer ${loginData.accessToken}`,
    'Content-Type': 'application/json'
  };

  // 3. Test GET /catches
  console.log('\n3. Testing GET /catches...');
  const getCatches = await fetch(API + '/catches', { headers });
  const getCatchesText = await getCatches.text();
  console.log('GET /catches status:', getCatches.status);
  console.log('Response:', getCatchesText);

  // 4. Test POST /catches with minimal data
  console.log('\n4. Testing POST /catches...');
  const createCatch = await fetch(API + '/catches', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      species: 'Gedde',
      latitude: 55.6761,
      longitude: 12.5683,
      visibility: 'public',
      isDraft: false
    })
  });
  const createCatchText = await createCatch.text();
  console.log('POST /catches status:', createCatch.status);
  console.log('Response:', createCatchText);

  // 5. Test hot-spots
  console.log('\n5. Testing GET /hot-spots/my-favorites...');
  const hotspots = await fetch(API + '/hot-spots/my-favorites', { headers });
  const hotspotsText = await hotspots.text();
  console.log('Status:', hotspots.status);
  console.log('Response:', hotspotsText);

  // 6. Test leaderboard
  console.log('\n6. Testing GET /leaderboard...');
  const leaderboard = await fetch(API + '/leaderboard', { headers });
  const leaderboardText = await leaderboard.text();
  console.log('Status:', leaderboard.status);
  console.log('Response:', leaderboardText);

  // 7. Test weather
  console.log('\n7. Testing GET /weather...');
  const weather = await fetch(API + '/weather?lat=55.6761&lon=12.5683', { headers });
  const weatherText = await weather.text();
  console.log('Status:', weather.status);
  console.log('Response:', weatherText);

  // 8. Test statistics
  console.log('\n8. Testing statistics routes...');
  const statsOverview = await fetch(API + '/statistics/overview', { headers });
  console.log('/statistics/overview:', statsOverview.status, await statsOverview.text());

  // 9. Check what routes are available
  console.log('\n9. Testing root endpoint for routes...');
  const root = await fetch(API + '/');
  console.log('Root:', await root.text());
}

debug().catch(console.error);
