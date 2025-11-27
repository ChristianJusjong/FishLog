const API = 'http://localhost:3000';

async function debug() {
  console.log('Debugging failing endpoints...\n');

  // Login first
  const login = await fetch(API + '/auth/login', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({email: 'test_debug@fishlog.test', password: 'Test123!'})
  });

  let token;
  if (!login.ok) {
    // Create user first
    const signup = await fetch(API + '/auth/signup', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({email: 'test_debug@fishlog.test', password: 'Test123!', name: 'Debug User'})
    });
    const signupData = await signup.json();
    token = signupData.accessToken;
  } else {
    const loginData = await login.json();
    token = loginData.accessToken;
  }

  const headers = {'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json'};

  // Test Create Catch
  console.log('1. Testing Create Catch...');
  const createCatch = await fetch(API + '/catches', {
    method: 'POST', headers,
    body: JSON.stringify({
      species: 'Gedde', lengthCm: 85, weightKg: 5.2,
      latitude: 55.6761, longitude: 12.5683,
      notes: 'Debug catch', visibility: 'public', isDraft: false
    })
  });
  const catchResp = await createCatch.json();
  console.log('   Status:', createCatch.status);
  console.log('   Response:', JSON.stringify(catchResp, null, 2).substring(0, 500));

  // Test Get Catches
  console.log('\n2. Testing Get Catches...');
  const getCatches = await fetch(API + '/catches', {headers});
  const catchesResp = await getCatches.json();
  console.log('   Status:', getCatches.status);
  console.log('   Type:', Array.isArray(catchesResp) ? 'Array' : typeof catchesResp);
  console.log('   Response:', JSON.stringify(catchesResp, null, 2).substring(0, 300));

  // Test XP
  console.log('\n3. Testing XP...');
  const xp = await fetch(API + '/api/xp/me', {headers});
  const xpResp = await xp.json();
  console.log('   Status:', xp.status);
  console.log('   Response:', JSON.stringify(xpResp, null, 2));

  // Test Leaderboard
  console.log('\n4. Testing Leaderboard...');
  const lb = await fetch(API + '/leaderboard', {headers});
  const lbResp = await lb.json();
  console.log('   Status:', lb.status);
  console.log('   Response:', JSON.stringify(lbResp, null, 2).substring(0, 300));

  // Test Weather
  console.log('\n5. Testing Weather...');
  const weather = await fetch(API + '/weather?lat=55.6761&lon=12.5683', {headers});
  const weatherResp = await weather.json();
  console.log('   Status:', weather.status);
  console.log('   Response:', JSON.stringify(weatherResp, null, 2).substring(0, 300));

  // Test Hot Spots
  console.log('\n6. Testing Hot Spots...');
  const hs = await fetch(API + '/hot-spots/my-favorites', {headers});
  const hsResp = await hs.json();
  console.log('   Status:', hs.status);
  console.log('   Response:', JSON.stringify(hsResp, null, 2).substring(0, 300));

  // Test Friend Requests
  console.log('\n7. Testing Friend Requests...');
  const fr = await fetch(API + '/friends/requests', {headers});
  const frResp = await fr.json();
  console.log('   Status:', fr.status);
  console.log('   Response:', JSON.stringify(frResp, null, 2).substring(0, 300));

  // Test Challenge Templates
  console.log('\n8. Testing Challenge Templates...');
  const ct = await fetch(API + '/challenges/templates', {headers});
  const ctResp = await ct.json();
  console.log('   Status:', ct.status);
  console.log('   Response:', JSON.stringify(ctResp, null, 2).substring(0, 300));
}

debug().catch(console.error);
