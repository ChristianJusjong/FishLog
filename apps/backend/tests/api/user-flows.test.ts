import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { fastify } from '../../src/index';

describe('Automated End-to-End User Flow Test Suite', () => {
  let authToken: string;
  let refreshToken: string;
  let userId: string;
  let catchId: string;
  let spotId: string;
  const testEmail = `autotest_${Date.now()}@example.com`;
  const testPassword = 'SecurePassword123!';
  const testName = 'Auto Test Angler';

  beforeAll(async () => {
    await fastify.ready();
  });

  afterAll(async () => {
    await fastify.close();
  });

  it('Step 1: User Signup', async () => {
    const response = await fastify.inject({
      method: 'POST',
      url: '/auth/signup',
      payload: {
        email: testEmail,
        password: testPassword,
        name: testName,
      },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body).toHaveProperty('accessToken');
    expect(body).toHaveProperty('refreshToken');
    expect(body.user.email).toBe(testEmail);

    authToken = body.accessToken;
    refreshToken = body.refreshToken;
    userId = body.user.id;
  });

  it('Step 2: User Login', async () => {
    const response = await fastify.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        email: testEmail,
        password: testPassword,
      },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body).toHaveProperty('accessToken');
    expect(body).toHaveProperty('refreshToken');
    authToken = body.accessToken;
    refreshToken = body.refreshToken;
  });

  it('Step 3: Fetch User Profile', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/users/me',
      headers: {
        authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body.id).toBe(userId);
    expect(body.email).toBe(testEmail);
  });

  it('Step 4: Camera-First Catch Start (Draft Creation)', async () => {
    const response = await fastify.inject({
      method: 'POST',
      url: '/catches/start',
      headers: {
        authorization: `Bearer ${authToken}`,
      },
      payload: {
        photoUrl: 'https://example.com/test_fish.jpg',
        latitude: 56.1572,
        longitude: 10.2107,
        exifData: {
          timestamp: new Date().toISOString(),
          device: 'Test Device',
        },
      },
    });

    expect(response.statusCode).toBe(201);
    const body = JSON.parse(response.payload);
    expect(body).toHaveProperty('id');
    expect(body.isDraft).toBe(true);
    catchId = body.id;
  });

  it('Step 5: Fill Catch Details (Update Draft)', async () => {
    const response = await fastify.inject({
      method: 'PUT',
      url: `/catches/${catchId}`,
      headers: {
        authorization: `Bearer ${authToken}`,
      },
      payload: {
        species: 'Havørred',
        lengthCm: 65.5,
        weightKg: 3.2,
        bait: 'Børsteorm',
        lure: 'Pattegrisen',
        technique: 'Fluefiskeri',
        notes: 'Fanget ved solopgang under faldende vandstand.',
        visibility: 'public',
      },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body.species).toBe('Havørred');
    expect(body.lengthCm).toBe(65.5);
  });

  it('Step 6: Complete Catch', { timeout: 15000 }, async () => {
    const response = await fastify.inject({
      method: 'PATCH',
      url: `/catches/${catchId}/complete`,
      headers: {
        authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body.catch.isDraft).toBe(false);
  });

  it('Step 7: Retrieve Single Catch Details', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: `/catches/${catchId}`,
      headers: {
        authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body.id).toBe(catchId);
    expect(body.species).toBe('Havørred');
  });

  it('Step 8: Create Favorite Spot', async () => {
    const response = await fastify.inject({
      method: 'POST',
      url: '/favorite-spots',
      headers: {
        authorization: `Bearer ${authToken}`,
      },
      payload: {
        name: 'Hemmeligt Kystspot',
        latitude: 56.1572,
        longitude: 10.2107,
        fishSpecies: 'Havørred',
        bottomType: 'Tang og sten',
        depth: 2.5,
        privacy: 'private',
      },
    });

    expect(response.statusCode).toBe(201);
    const body = JSON.parse(response.payload);
    expect(body).toHaveProperty('id');
    expect(body.name).toBe('Hemmeligt Kystspot');
    spotId = body.id;
  });

  it('Step 9: List Favorite Spots with Catch Counts', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/favorite-spots',
      headers: {
        authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
    expect(body[0]).toHaveProperty('catchCount');
  });

  it('Step 10: AI Fishing Recommendations', async () => {
    const response = await fastify.inject({
      method: 'POST',
      url: '/ai/recommendations',
      headers: {
        authorization: `Bearer ${authToken}`,
      },
      payload: {
        species: 'Gedde',
        latitude: 56.1572,
        longitude: 10.2107,
        air_temp: 18,
        wind_speed: 4,
      },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body).toHaveProperty('species', 'Gedde');
    expect(body).toHaveProperty('baits');
    expect(body).toHaveProperty('lures');
  });

  it('Step 11: Refresh Token', async () => {
    const response = await fastify.inject({
      method: 'POST',
      url: '/auth/refresh',
      payload: {
        refreshToken,
      },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body).toHaveProperty('accessToken');
  });
});
