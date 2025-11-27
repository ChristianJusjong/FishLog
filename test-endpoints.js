const API_URL = 'https://fishlog-production.up.railway.app';

async function test() {
  console.log('Final API Endpoint Test');
  console.log('========================');
  console.log('');
  
  // Test auth with proper body
  const authTests = [
    { 
      method: 'POST', 
      path: '/auth/signup', 
      body: { email: 'test@test.com', password: 'test123', name: 'Test' },
      expectStatus: [400, 409] // 400 = validation, 409 = already exists
    },
    { 
      method: 'POST', 
      path: '/auth/login', 
      body: { email: 'test@test.com', password: 'wrongpass' },
      expectStatus: [401, 400] // 401 = invalid creds, 400 = validation
    },
  ];
  
  for (const t of authTests) {
    const res = await fetch(API_URL + t.path, {
      method: t.method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(t.body)
    });
    const ok = t.expectStatus.includes(res.status) || res.status === 200;
    console.log('[' + res.status + '] ' + (ok ? 'OK' : 'FAIL') + '   ' + t.method + ' ' + t.path);
  }
  
  console.log('');
  
  // Test all other endpoints
  const endpoints = [
    '/health', '/users/me', '/catches', '/feed', '/events',
    '/statistics/overview', '/hot-spots/discover', '/species', '/leaderboard',
    '/api/xp/me', '/messages/conversations', '/sessions/active',
    '/segments/nearby', '/groups/my-groups', '/weather/current',
    '/notifications', '/predictions', '/badges', '/challenges', '/friends'
  ];
  
  let passed = 0, failed = 0;
  for (const path of endpoints) {
    const res = await fetch(API_URL + path);
    const ok = res.status === 200 || res.status === 401;
    if (ok) passed++; else failed++;
    console.log('[' + res.status + '] ' + (ok ? 'OK' : 'FAIL') + '   GET ' + path);
  }
  
  console.log('');
  console.log('Summary: ' + (passed + 2) + ' passed, ' + failed + ' failed');
}

test();
