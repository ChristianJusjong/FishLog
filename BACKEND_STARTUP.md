# 🔧 Backend Startup Guide

## Quick Start

### 1. **Ensure Database is Updated**
```bash
cd apps/backend
npx prisma generate
npx prisma db push
```

This will:
- Generate Prisma client with new models
- Push schema changes to database
- Create all 15 new tables

### 2. **Verify New Routes are Registered**

Check `apps/backend/src/index.ts` contains:
```typescript
import { sessionsRoutes } from './routes/sessions';
import { segmentsRoutes } from './routes/segments';
import { kudosRoutes } from './routes/kudos';
import { premiumAnalyticsRoutes } from './routes/premium-analytics';
import { fishingFeaturesRoutes } from './routes/fishing-features';

// ... later in the file:
fastify.register(sessionsRoutes);
fastify.register(segmentsRoutes);
fastify.register(kudosRoutes);
fastify.register(premiumAnalyticsRoutes);
fastify.register(fishingFeaturesRoutes);
```

✅ **All routes are already registered!**

### 3. **Start the Server**
```bash
cd apps/backend
npm run dev
```

Server should start on `http://localhost:3000` (or your configured port)

---

## 📋 API Endpoints Checklist

Test these endpoints after startup:

### **Health Check**
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-19T...",
  "database": "connected",
  "version": "1.0.0"
}
```

### **Sessions Endpoints** ✅
```bash
# Start a session (requires auth token)
curl -X POST http://localhost:3000/sessions/start \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"sessionType":"shore","title":"Test Session"}'

# Track GPS point
curl -X PATCH http://localhost:3000/sessions/SESSION_ID/track \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"lat":55.6761,"lng":12.5683,"timestamp":"2025-01-19T10:00:00Z"}'
```

### **Segments Endpoints** ✅
```bash
# Find nearby segments
curl "http://localhost:3000/segments/nearby?lat=55.6761&lng=12.5683&radius=50000" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get segment leaderboard
curl "http://localhost:3000/segments/SEGMENT_ID/leaderboard?category=most_catches&timeframe=all_time" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### **Kudos Endpoints** ✅
```bash
# Give kudos to catch
curl -X POST http://localhost:3000/kudos/catches/CATCH_ID \
  -H "Authorization: Bearer YOUR_TOKEN"

# Give kudos to session
curl -X POST http://localhost:3000/kudos/sessions/SESSION_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### **Analytics Endpoints** ✅
```bash
# Get overview
curl "http://localhost:3000/premium/analytics/overview" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get time series
curl "http://localhost:3000/premium/analytics/time-series?interval=month" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### **Fishing Features Endpoints** ✅
```bash
# Get tide predictions
curl "http://localhost:3000/fishing/tides?lat=55.6761&lng=12.5683" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get lunar calendar
curl "http://localhost:3000/fishing/lunar" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Check regulations
curl "http://localhost:3000/fishing/regulations?lat=55.6761&lng=12.5683" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🗄️ Database Tables Created

Run this to verify all tables exist:
```bash
cd apps/backend
npx prisma studio
```

Should see these new tables:
- [x] FishingSession
- [x] Segment
- [x] SegmentEffort
- [x] LocalLegend
- [x] SegmentLeaderboard
- [x] SessionKudos
- [x] CatchKudos
- [x] SessionComment
- [x] UserGoal
- [x] TideData
- [x] WaterTemperature
- [x] FishingRegulation
- [x] BaitEffectiveness
- [x] ConservationScore
- [x] PremiumSubscription

---

## 🔍 Troubleshooting

### **Error: "Module not found: './routes/sessions'"**
**Solution:** Make sure you created the route files:
```bash
ls apps/backend/src/routes/sessions.ts
ls apps/backend/src/routes/segments.ts
ls apps/backend/src/routes/kudos.ts
ls apps/backend/src/routes/premium-analytics.ts
ls apps/backend/src/routes/fishing-features.ts
```

### **Error: "Table 'FishingSession' does not exist"**
**Solution:** Run database migrations:
```bash
cd apps/backend
npx prisma db push
```

### **Error: "Cannot find module '@prisma/client'"**
**Solution:** Generate Prisma client:
```bash
cd apps/backend
npx prisma generate
```

### **Error: Rate limit exceeded**
The API has rate limiting (100 requests per 15 minutes).
**Solution:** Adjust in `index.ts`:
```typescript
fastify.register(rateLimit, {
  max: 1000, // Increase limit
  timeWindow: '15 minutes',
});
```

---

## 🧪 Test Data Creation

### **Create Test Session:**
```typescript
// Use Prisma Studio or run this in your backend console
const session = await prisma.fishingSession.create({
  data: {
    userId: 'USER_ID_HERE',
    sessionType: 'shore',
    title: 'Morning Session',
    startTime: new Date(),
    route: JSON.stringify([
      { lat: 55.6761, lng: 12.5683, timestamp: new Date() }
    ]),
    visibility: 'public'
  }
});
```

### **Create Test Segment:**
```typescript
const segment = await prisma.segment.create({
  data: {
    name: 'Copenhagen Harbor',
    segmentType: 'spot',
    centerLat: 55.6761,
    centerLng: 12.5683,
    radius: 500, // meters
    createdBy: 'USER_ID_HERE'
  }
});
```

### **Create Test Kudos:**
```typescript
const kudos = await prisma.catchKudos.create({
  data: {
    catchId: 'CATCH_ID_HERE',
    userId: 'USER_ID_HERE'
  }
});
```

---

## 📦 Dependencies Check

Verify all backend dependencies are installed:
```bash
cd apps/backend
npm list fastify @fastify/cors @fastify/multipart @fastify/static @fastify/rate-limit @fastify/helmet @fastify/websocket @prisma/client
```

Should show:
- fastify: ^4.x
- @fastify/cors: ^8.x
- @prisma/client: ^5.x
- All other @fastify/* packages

---

## 🚀 Production Deployment

Before deploying to production:

1. **Environment Variables**
```env
DATABASE_URL="postgresql://..."
PORT=3000
NODE_ENV=production
JWT_SECRET="your-secret-here"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

2. **Run Migrations**
```bash
npx prisma migrate deploy
```

3. **Build and Start**
```bash
npm run build
npm start
```

4. **Health Check**
```bash
curl https://your-domain.com/health
```

---

## ✅ Verification Complete

If all endpoints respond correctly, your backend is ready!

**Next Steps:**
1. Open the mobile app
2. Navigate to Profile → Fisketure
3. Start a fishing session
4. Watch the magic happen! 🎣
