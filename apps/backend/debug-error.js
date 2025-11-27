const API = 'https://fishlog-production.up.railway.app';

async function debug() {
  console.log('=== Debug API Errors ===\n');
  console.log('Time:', new Date().toISOString());

  // Create test user
  const timestamp = Date.now();
  const email = `debug_err_${timestamp}@test.com`;

  const signup = await fetch(API + '/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'Test123!', name: 'Debug User' })
  });
  const signupData = await signup.json();

  const token = signupData.accessToken;
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  console.log('\n--- Testing Failing Endpoints ---\n');

  // Test catches
  console.log('1. GET /catches');
  const r1 = await fetch(API + '/catches', { headers });
  console.log('   Status:', r1.status);
  console.log('   Response:', await r1.text());

  // Test create catch
  console.log('\n2. POST /catches');
  const r2 = await fetch(API + '/catches', {
    method: 'POST', headers,
    body: JSON.stringify({
      species: 'Gedde',
      visibility: 'public',
      isDraft: false
    })
  });
  console.log('   Status:', r2.status);
  console.log('   Response:', await r2.text());

  // Test catches/drafts
  console.log('\n3. GET /catches/drafts');
  const r3 = await fetch(API + '/catches/drafts', { headers });
  console.log('   Status:', r3.status);
  console.log('   Response:', await r3.text());

  // Test leaderboard
  console.log('\n4. GET /leaderboard');
  const r4 = await fetch(API + '/leaderboard', { headers });
  console.log('   Status:', r4.status);
  console.log('   Response:', await r4.text());

  // Test hot-spots
  console.log('\n5. GET /hot-spots/my-favorites');
  const r5 = await fetch(API + '/hot-spots/my-favorites', { headers });
  console.log('   Status:', r5.status);
  console.log('   Response:', await r5.text());

  // Test hot-spots discover
  console.log('\n6. GET /hot-spots/discover');
  const r6 = await fetch(API + '/hot-spots/discover', { headers });
  console.log('   Status:', r6.status);
  console.log('   Response:', await r6.text());

  console.log('\n=== Done ===');
}

debug().catch(console.error);
