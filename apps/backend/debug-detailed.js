const API = 'https://fishlog-production.up.railway.app';

async function debug() {
  console.log('=== Detailed API Debug ===\n');

  // Create test user
  const timestamp = Date.now();
  const email = `debug2_${timestamp}@test.com`;

  const signup = await fetch(API + '/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'Test123!', name: 'Debug User 2' })
  });
  const signupData = await signup.json();
  console.log('Signup:', signup.status);

  const token = signupData.accessToken;
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  // Test various catch operations
  console.log('\n--- Testing Catches ---');

  // Test 1: Simple GET without include
  console.log('\n1. GET /catches (basic)');
  const r1 = await fetch(API + '/catches', { headers });
  console.log('Status:', r1.status, await r1.text());

  // Test 2: GET statistics (works - uses catches internally)
  console.log('\n2. GET /statistics/overview');
  const r2 = await fetch(API + '/statistics/overview', { headers });
  console.log('Status:', r2.status, await r2.text());

  // Test 3: Create catch with minimal data
  console.log('\n3. POST /catches (minimal)');
  const r3 = await fetch(API + '/catches', {
    method: 'POST', headers,
    body: JSON.stringify({
      species: 'Test Fish',
      isDraft: true,
      visibility: 'private'
    })
  });
  console.log('Status:', r3.status, await r3.text());

  // Test 4: Weather endpoints
  console.log('\n--- Weather Routes ---');

  console.log('\n4a. GET /weather (wrong - should 404)');
  const w1 = await fetch(API + '/weather?lat=55.6761&lon=12.5683', { headers });
  console.log('Status:', w1.status, await w1.text());

  console.log('\n4b. GET /weather/current (correct)');
  const w2 = await fetch(API + '/weather/current?lat=55.6761&lon=12.5683', { headers });
  console.log('Status:', w2.status, await w2.text());

  console.log('\n4c. GET /weather/moon');
  const w3 = await fetch(API + '/weather/moon?date=' + new Date().toISOString(), { headers });
  console.log('Status:', w3.status, await w3.text());

  // Test 5: Test fiskedex (works according to earlier test)
  console.log('\n5. GET /catches/fiskedex');
  const r5 = await fetch(API + '/catches/fiskedex', { headers });
  console.log('Status:', r5.status);

  // Test 6: Test drafts
  console.log('\n6. GET /catches/drafts');
  const r6 = await fetch(API + '/catches/drafts', { headers });
  console.log('Status:', r6.status, await r6.text());

  // Test 7: Try different catch creation approaches
  console.log('\n--- Different catch creation tests ---');

  console.log('\n7a. POST /catches with full data');
  const r7a = await fetch(API + '/catches', {
    method: 'POST', headers,
    body: JSON.stringify({
      species: 'Gedde',
      lengthCm: 85,
      weightKg: 5.5,
      latitude: 55.6761,
      longitude: 12.5683,
      visibility: 'public',
      isDraft: false
    })
  });
  console.log('Status:', r7a.status, await r7a.text());

  console.log('\n7b. POST /catches/start (draft flow)');
  const r7b = await fetch(API + '/catches/start', {
    method: 'POST', headers,
    body: JSON.stringify({
      photoUrl: 'https://example.com/test.jpg',
      latitude: 55.6761,
      longitude: 12.5683
    })
  });
  console.log('Status:', r7b.status, await r7b.text());

  // Test 8: Check leaderboard
  console.log('\n8. GET /leaderboard');
  const r8 = await fetch(API + '/leaderboard', { headers });
  console.log('Status:', r8.status, await r8.text());

  // Test 9: Check hot-spots
  console.log('\n9. GET /hot-spots/my-favorites');
  const r9 = await fetch(API + '/hot-spots/my-favorites', { headers });
  console.log('Status:', r9.status, await r9.text());

  // Test 10: Species
  console.log('\n10. GET /species');
  const r10 = await fetch(API + '/species', { headers });
  console.log('Status:', r10.status, 'Length:', (await r10.text()).length);

  // Test 11: Badges
  console.log('\n11. GET /badges');
  const r11 = await fetch(API + '/badges', { headers });
  console.log('Status:', r11.status, await r11.text());

  console.log('\n=== Done ===');
}

debug().catch(console.error);
