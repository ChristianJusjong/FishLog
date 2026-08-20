import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  calculateMoonPhase,
  degreesToCardinal,
  mapWmoCode,
  getTimeOfDayAndSeason,
  weatherTelemetryService,
} from '../../src/services/weather-telemetry';
import { fastify } from '../../src/index';
import { prisma } from '../../src/lib/prisma';
import { FastifyInstance } from 'fastify';

describe('Weather Telemetry & Live Social Fishing Sessions', () => {
  let app: FastifyInstance;
  let user1Token: string;
  let user1Id: string;
  let user2Token: string;
  let user2Id: string;
  let testCatchId: string;

  beforeAll(async () => {
    app = fastify;
    await app.ready();

    // Create test user 1
    const u1Email = `angler1_${Date.now()}@example.com`;
    const signupRes1 = await app.inject({
      method: 'POST',
      url: '/auth/signup',
      payload: {
        email: u1Email,
        password: 'Password123!',
        name: 'Mads Lystfisker',
      },
    });
    const data1 = JSON.parse(signupRes1.payload);
    user1Token = data1.accessToken;
    user1Id = data1.user.id;

    // Create test user 2 (friend)
    const u2Email = `angler2_${Date.now()}@example.com`;
    const signupRes2 = await app.inject({
      method: 'POST',
      url: '/auth/signup',
      payload: {
        email: u2Email,
        password: 'Password123!',
        name: 'Jens Fisker',
      },
    });
    const data2 = JSON.parse(signupRes2.payload);
    user2Token = data2.accessToken;
    user2Id = data2.user.id;

    // Establish friendship
    await prisma.friendship.create({
      data: {
        requesterId: user1Id,
        accepterId: user2Id,
        status: 'accepted',
      },
    });
  });

  afterAll(async () => {
    if (testCatchId) {
      await prisma.catch.deleteMany({ where: { id: testCatchId } }).catch(() => {});
    }
    if (user1Id) {
      await prisma.user.deleteMany({ where: { id: { in: [user1Id, user2Id] } } }).catch(() => {});
    }
  });

  it('correctly calculates meteorological and lunar telemetry algorithms', () => {
    // Test Moon Phase
    const moon = calculateMoonPhase(new Date('2024-01-11T12:00:00Z'));
    expect(moon).toHaveProperty('phase');
    expect(moon).toHaveProperty('illumination');
    expect(typeof moon.illumination).toBe('number');

    // Test Cardinal Wind directions
    expect(degreesToCardinal(0)).toBe('N');
    expect(degreesToCardinal(90)).toBe('E');
    expect(degreesToCardinal(180)).toBe('S');
    expect(degreesToCardinal(270)).toBe('W');

    // Test WMO weather code mapping
    expect(mapWmoCode(0)).toBe('clear');
    expect(mapWmoCode(2)).toBe('partly_cloudy');
    expect(mapWmoCode(61)).toBe('rain');
    expect(mapWmoCode(95)).toBe('thunderstorm');

    // Test Season and Time of day
    const { timeOfDay, season } = getTimeOfDayAndSeason(new Date());
    expect(typeof timeOfDay).toBe('string');
    expect(typeof season).toBe('string');
  });

  it('enriches catch with telemetry into WeatherData and AiCatchTelemetry tables', async () => {
    // Create a catch
    const createCatchRes = await app.inject({
      method: 'POST',
      url: '/catches/start',
      headers: { Authorization: `Bearer ${user1Token}` },
      payload: {
        photoUrl: 'https://images.unsplash.com/photo-catch-test',
        latitude: 55.6761,
        longitude: 12.5683,
      },
    });

    expect(createCatchRes.statusCode).toBe(201);
    const catchData = JSON.parse(createCatchRes.payload);
    testCatchId = catchData.id;

    // Trigger telemetry enrichment
    await weatherTelemetryService.enrichCatchTelemetry({
      catchId: testCatchId,
      species: 'Gedde',
      weightKg: 4.2,
      lengthCm: 82,
      latitude: 55.6761,
      longitude: 12.5683,
      waterTemp: 11.5,
      technique: 'Spin',
      bait: 'Savage Gear Shad',
    });

    // Check WeatherData record
    const weatherRecord = await prisma.weatherData.findUnique({
      where: { catchId: testCatchId },
    });
    expect(weatherRecord).toBeDefined();
    expect(weatherRecord?.waterTemperature).toBe(11.5);
    expect(weatherRecord?.pressure).toBeGreaterThan(900);

    // Check AiCatchTelemetry foundation dataset
    const aiRecord = await prisma.aiCatchTelemetry.findUnique({
      where: { catchId: testCatchId },
    });
    expect(aiRecord).toBeDefined();
    expect(aiRecord?.species).toBe('Gedde');
    expect(aiRecord?.pressureHpa).toBeGreaterThan(900);
    expect(aiRecord?.waterTemp).toBe(11.5);

    // Test species telemetry statistical aggregation
    const stats = await weatherTelemetryService.getSpeciesTelemetryStats('Gedde');
    expect(stats).toBeDefined();
    expect(stats?.sampleSize).toBeGreaterThan(0);
  });

  it('supports Live Social Sessions and real-time friend beacon tracking (Strava for fishers)', async () => {
    // User 2 starts a live fishing session
    const startSessionRes = await app.inject({
      method: 'POST',
      url: '/sessions/start',
      headers: { Authorization: `Bearer ${user2Token}` },
      payload: {
        sessionType: 'boat',
        title: 'Forårsgedder på Furesøen',
        visibility: 'friends',
      },
    });

    expect(startSessionRes.statusCode).toBe(201);
    const sessionData = JSON.parse(startSessionRes.payload);
    const sessionId = sessionData.session.id;
    expect(sessionData.session.isLive).toBe(true);

    // User 2 broadcasts live GPS location
    const trackRes = await app.inject({
      method: 'PATCH',
      url: `/sessions/${sessionId}/track`,
      headers: { Authorization: `Bearer ${user2Token}` },
      payload: {
        lat: 55.795,
        lng: 12.428,
        timestamp: new Date().toISOString(),
        speed: 4.5,
      },
    });
    expect(trackRes.statusCode).toBe(200);

    // User 1 fetches live friends sessions
    const liveFriendsRes = await app.inject({
      method: 'GET',
      url: '/sessions/live-friends',
      headers: { Authorization: `Bearer ${user1Token}` },
    });

    expect(liveFriendsRes.statusCode).toBe(200);
    const liveData = JSON.parse(liveFriendsRes.payload);
    expect(liveData.liveSessions.length).toBeGreaterThan(0);
    const friendSession = liveData.liveSessions.find((s: any) => s.id === sessionId);
    expect(friendSession).toBeDefined();
    expect(friendSession.currentLat).toBe(55.795);
    expect(friendSession.currentLng).toBe(12.428);
    expect(friendSession.user.name).toBe('Jens Fisker');

    // End session
    await app.inject({
      method: 'POST',
      url: `/sessions/${sessionId}/end`,
      headers: { Authorization: `Bearer ${user2Token}` },
    });
  });
});
