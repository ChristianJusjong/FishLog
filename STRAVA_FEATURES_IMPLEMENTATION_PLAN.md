# Strava-Inspired Features Implementation Plan

## Overview
This document outlines the implementation plan for transforming FishLog into a Strava-like fishing app with unique fishing-specific features.

---

## PHASE 1: Database Schema & Models

### New Tables Required

#### 1.1 FishingSession
```prisma
model FishingSession {
  id              String    @id @default(uuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Session details
  title           String?
  description     String?
  sessionType     String    // 'shore', 'boat', 'kayak', 'ice', 'wade'

  // Time tracking
  startTime       DateTime
  endTime         DateTime?
  duration        Int?      // minutes

  // GPS tracking
  route           Json?     // Array of {lat, lng, timestamp, speed?, altitude?}
  totalDistance   Float?    // kilometers
  maxSpeed        Float?    // km/h
  avgSpeed        Float?    // km/h

  // Stats
  totalCatches    Int       @default(0)
  totalWeight     Float?    // kg
  speciesCount    Int       @default(0)

  // Weather snapshot
  weatherData     Json?     // Conditions at start/end

  // Privacy & sharing
  visibility      String    @default("friends") // 'private', 'friends', 'public'

  // Relations
  catches         Catch[]
  kudos           SessionKudos[]
  comments        SessionComment[]

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([userId])
  @@index([startTime])
  @@index([sessionType])
}
```

#### 1.2 Segment
```prisma
model Segment {
  id              String    @id @default(uuid())
  createdBy       String
  creator         User      @relation(fields: [createdBy], references: [id])

  // Segment details
  name            String
  description     String?
  segmentType     String    // 'spot', 'route', 'zone'

  // Geographic bounds
  centerLat       Float
  centerLng       Float
  radius          Float?    // meters (for spot segments)
  bounds          Json?     // GeoJSON polygon for route/zone segments

  // Stats
  activityCount   Int       @default(0)
  totalCatches    Int       @default(0)
  uniqueAnglers   Int       @default(0)

  // Metadata
  difficulty      String?   // 'beginner', 'intermediate', 'advanced', 'expert'
  tags            String[]  // ['shore-accessible', 'boat-required', 'deep-water']

  // Relations
  efforts         SegmentEffort[]
  legends         LocalLegend[]
  leaderboard     SegmentLeaderboard[]

  isActive        Boolean   @default(true)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([centerLat, centerLng])
  @@index([createdBy])
}
```

#### 1.3 SegmentEffort
```prisma
model SegmentEffort {
  id              String    @id @default(uuid())
  segmentId       String
  segment         Segment   @relation(fields: [segmentId], references: [id], onDelete: Cascade)
  userId          String
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  sessionId       String?
  session         FishingSession? @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  catchId         String?
  catch           Catch?    @relation(fields: [catchId], references: [id], onDelete: Cascade)

  // Effort stats
  effortScore     Float     // Calculated score based on catches, size, conditions
  catchCount      Int       @default(0)
  totalWeight     Float?
  biggestFish     Float?    // kg
  speciesDiversity Int      @default(0)

  // Conditions
  weatherDifficulty Float?  // 0-10 score

  // PR tracking
  isPR            Boolean   @default(false)

  completedAt     DateTime  @default(now())

  @@index([segmentId, effortScore])
  @@index([userId, segmentId])
  @@index([completedAt])
}
```

#### 1.4 LocalLegend
```prisma
model LocalLegend {
  id              String    @id @default(uuid())
  segmentId       String
  segment         Segment   @relation(fields: [segmentId], references: [id], onDelete: Cascade)
  userId          String
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Legend status
  status          String    @default("active") // 'active', 'dethroned', 'retired'
  effortCount     Int       // Number of efforts in past 90 days

  // Timeline
  achievedAt      DateTime  @default(now())
  dethronedAt     DateTime?

  // Stats during legend period
  totalCatches    Int       @default(0)
  totalDays       Int       @default(0)

  @@unique([segmentId, userId, achievedAt])
  @@index([segmentId, status])
  @@index([userId])
}
```

#### 1.5 SegmentLeaderboard
```prisma
model SegmentLeaderboard {
  id              String    @id @default(uuid())
  segmentId       String
  segment         Segment   @relation(fields: [segmentId], references: [id], onDelete: Cascade)
  userId          String
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Leaderboard type
  category        String    // 'most_catches', 'biggest_fish', 'total_weight', 'species_diversity'
  timeframe       String    // 'all_time', 'year', 'month', 'week'

  // Stats
  value           Float     // The score for this category
  rank            Int
  efforts         Int       // Number of efforts

  // Metadata
  lastEffortAt    DateTime
  updatedAt       DateTime  @updatedAt

  @@unique([segmentId, userId, category, timeframe])
  @@index([segmentId, category, timeframe, rank])
}
```

#### 1.6 SessionKudos
```prisma
model SessionKudos {
  id              String    @id @default(uuid())
  sessionId       String
  session         FishingSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  userId          String
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt       DateTime  @default(now())

  @@unique([sessionId, userId])
  @@index([sessionId])
  @@index([userId])
}
```

#### 1.7 CatchKudos
```prisma
model CatchKudos {
  id              String    @id @default(uuid())
  catchId         String
  catch           Catch     @relation(fields: [catchId], references: [id], onDelete: Cascade)
  userId          String
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt       DateTime  @default(now())

  @@unique([catchId, userId])
  @@index([catchId])
  @@index([userId])
}
```

#### 1.8 SessionComment
```prisma
model SessionComment {
  id              String    @id @default(uuid())
  sessionId       String
  session         FishingSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  userId          String
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  content         String

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([sessionId])
  @@index([userId])
}
```

#### 1.9 UserGoal
```prisma
model UserGoal {
  id              String    @id @default(uuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Goal details
  type            String    // 'catch_count', 'species_diversity', 'total_weight', 'technique_mastery', 'location_exploration'
  title           String
  description     String?

  // Target
  targetValue     Float
  currentValue    Float     @default(0)

  // Constraints
  speciesId       String?   // For species-specific goals
  technique       String?   // For technique goals
  timeframe       String    // 'weekly', 'monthly', 'yearly', 'all_time'

  // Timeline
  startDate       DateTime  @default(now())
  endDate         DateTime?
  completedAt     DateTime?

  // Status
  status          String    @default("active") // 'active', 'completed', 'failed', 'abandoned'

  @@index([userId, status])
  @@index([endDate])
}
```

#### 1.10 TideData
```prisma
model TideData {
  id              String    @id @default(uuid())

  // Location (grid-based for caching)
  lat             Float
  lng             Float
  stationId       String?   // External tide station ID

  // Tide information
  date            DateTime
  tideType        String    // 'high', 'low'
  height          Float     // meters
  time            DateTime

  // Metadata
  source          String    // 'noaa', 'dmi', 'manual'

  createdAt       DateTime  @default(now())

  @@unique([lat, lng, date, time])
  @@index([lat, lng, date])
  @@index([stationId, date])
}
```

#### 1.11 WaterTemperature
```prisma
model WaterTemperature {
  id              String    @id @default(uuid())

  // Location
  lat             Float
  lng             Float
  depth           Float?    // meters

  // Temperature data
  temperature     Float     // Celsius
  measuredAt      DateTime

  // Source
  source          String    // 'satellite', 'buoy', 'manual'
  sourceId        String?

  // Quality
  confidence      Float?    // 0-1

  createdAt       DateTime  @default(now())

  @@index([lat, lng, measuredAt])
  @@index([measuredAt])
}
```

#### 1.12 FishingRegulation
```prisma
model FishingRegulation {
  id              String    @id @default(uuid())

  // Geographic area (using PostGIS)
  region          String    // 'Denmark', 'Zealand', 'Specific Lake'
  bounds          Json?     // GeoJSON polygon

  // Species-specific rules
  speciesId       String?
  species         Species?  @relation(fields: [speciesId], references: [id])

  // Regulations
  minSize         Float?    // cm
  maxSize         Float?    // cm
  dailyLimit      Int?      // Number of fish per day
  closedSeasonStart DateTime?
  closedSeasonEnd DateTime?

  // Additional rules
  allowedGear     String[]  // ['rod', 'net', 'trap']
  catchAndRelease Boolean   @default(false)

  // Metadata
  regulationType  String    // 'size_limit', 'bag_limit', 'season', 'gear_restriction'
  description     String?
  authority       String?   // 'national', 'regional', 'local'

  effectiveFrom   DateTime
  effectiveUntil  DateTime?

  isActive        Boolean   @default(true)

  @@index([region])
  @@index([speciesId])
  @@index([effectiveFrom, effectiveUntil])
}
```

#### 1.13 BaitEffectiveness
```prisma
model BaitEffectiveness {
  id              String    @id @default(uuid())

  // Bait details
  baitType        String    // 'worm', 'minnow', 'lure', specific lure name
  baitCategory    String    // 'live', 'artificial', 'cut'

  // Location
  lat             Float
  lng             Float
  radius          Float     @default(1000) // meters

  // Species
  speciesId       String?
  species         Species?  @relation(fields: [speciesId], references: [id])

  // Effectiveness metrics
  successRate     Float     // 0-1 (catches / attempts)
  totalAttempts   Int       @default(0)
  totalCatches    Int       @default(0)
  avgCatchSize    Float?    // kg

  // Seasonal
  season          String?   // 'spring', 'summer', 'fall', 'winter'
  month           Int?      // 1-12

  // Conditions
  avgTemp         Float?
  avgDepth        Float?

  lastUpdated     DateTime  @updatedAt

  @@index([lat, lng])
  @@index([speciesId, baitType])
  @@index([season])
}
```

#### 1.14 ConservationScore
```prisma
model ConservationScore {
  id              String    @id @default(uuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Score components
  totalReleased   Int       @default(0)
  totalKept       Int       @default(0)
  releaseRate     Float     @default(0) // Percentage

  // Conservation actions
  reportedViolations Int    @default(0)
  educationalShares Int     @default(0)
  habitatCleanups  Int      @default(0)

  // Overall score (0-100)
  score           Float     @default(50)
  rank            String    @default("bronze") // 'bronze', 'silver', 'gold', 'platinum', 'champion'

  // Achievements
  achievements    String[]  // ['50-releases', 'habitat-hero', 'size-conscious']

  updatedAt       DateTime  @updatedAt

  @@unique([userId])
  @@index([score])
}
```

#### 1.15 PremiumSubscription
```prisma
model PremiumSubscription {
  id              String    @id @default(uuid())
  userId          String    @unique
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Subscription details
  tier            String    // 'free', 'premium', 'pro'
  status          String    // 'active', 'canceled', 'expired', 'trial'

  // Billing
  stripeCustomerId String?
  stripeSubscriptionId String?

  // Timeline
  startDate       DateTime  @default(now())
  currentPeriodEnd DateTime?
  cancelAt        DateTime?

  // Trial
  trialEnd        DateTime?

  // Features enabled
  features        String[]  // ['advanced_analytics', 'live_tracking', 'export', 'ad_free']

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([userId])
  @@index([status])
}
```

### 1.16 Updates to Existing Models

```prisma
// Add to Catch model
model Catch {
  // ... existing fields ...

  sessionId       String?
  session         FishingSession? @relation(fields: [sessionId], references: [id])

  isReleased      Boolean   @default(false)
  releaseCondition String?  // 'excellent', 'good', 'fair', 'poor'

  kudos           CatchKudos[]
  segmentEfforts  SegmentEffort[]

  // ... rest of existing fields ...
}

// Add to User model
model User {
  // ... existing fields ...

  sessions        FishingSession[]
  segmentEfforts  SegmentEffort[]
  legends         LocalLegend[]
  goals           UserGoal[]
  conservationScore ConservationScore?
  premium         PremiumSubscription?
  sessionKudos    SessionKudos[]
  catchKudos      CatchKudos[]
  segmentLeaderboards SegmentLeaderboard[]

  // ... rest of existing fields ...
}

// Add to Species model
model Species {
  // ... existing fields ...

  regulations     FishingRegulation[]
  baitEffectiveness BaitEffectiveness[]

  // Behavior patterns
  behaviorPatterns Json? // Seasonal behavior, feeding times, habitat preferences

  // ... rest of existing fields ...
}
```

---

## PHASE 2: Backend API - Fishing Sessions

### 2.1 New Routes File: `sessions.ts`

#### Endpoints to Create:

1. **POST /api/sessions/start**
   - Start a new fishing session
   - Input: `{ sessionType, title?, location? }`
   - Output: Session object with ID
   - Begin GPS tracking

2. **PATCH /api/sessions/:id/track**
   - Add GPS point to route
   - Input: `{ lat, lng, timestamp, speed?, altitude? }`
   - Called periodically during session (every 30s-1min)

3. **POST /api/sessions/:id/end**
   - End fishing session
   - Calculate duration, distance, avg speed
   - Link all catches made during timeframe
   - Detect segments crossed
   - Calculate effort scores
   - Output: Complete session summary

4. **GET /api/sessions/:id**
   - Get session details with route, catches, kudos
   - Include weather data, stats

5. **GET /api/sessions/user/:userId**
   - Get user's session history
   - Filter by date range, type
   - Pagination support

6. **GET /api/sessions/feed**
   - Get sessions from friends
   - Similar to catch feed
   - Include kudos count, comment count

7. **DELETE /api/sessions/:id**
   - Delete session (keeps catches)

8. **PATCH /api/sessions/:id**
   - Update session details (title, description, visibility)

### 2.2 Session Processing Logic

```typescript
// Backend service: sessions.service.ts

async function endSession(sessionId: string) {
  const session = await getSession(sessionId);

  // Calculate duration
  const duration = differenceInMinutes(new Date(), session.startTime);

  // Calculate distance from route
  const totalDistance = calculateRouteDistance(session.route);

  // Calculate speeds
  const { maxSpeed, avgSpeed } = calculateSpeeds(session.route);

  // Link catches by timestamp overlap
  const catches = await findCatchesDuringSession(
    session.userId,
    session.startTime,
    new Date()
  );

  // Calculate stats
  const stats = {
    totalCatches: catches.length,
    totalWeight: catches.reduce((sum, c) => sum + (c.weight || 0), 0),
    speciesCount: new Set(catches.map(c => c.speciesId)).size,
  };

  // Detect segments
  await detectAndRecordSegmentEfforts(session, catches);

  // Update session
  await updateSession(sessionId, {
    endTime: new Date(),
    duration,
    totalDistance,
    maxSpeed,
    avgSpeed,
    ...stats,
  });

  // Check for new PRs
  await checkForPersonalRecords(session.userId, session);

  return getSessionWithDetails(sessionId);
}

async function detectAndRecordSegmentEfforts(session, catches) {
  // Find segments intersecting with route
  const segments = await findSegmentsInRoute(session.route);

  for (const segment of segments) {
    // Calculate catches within segment
    const segmentCatches = catches.filter(c =>
      isWithinSegment(c.latitude, c.longitude, segment)
    );

    if (segmentCatches.length > 0) {
      // Create segment effort
      const effortScore = calculateEffortScore(
        segmentCatches,
        session.weatherData
      );

      await createSegmentEffort({
        segmentId: segment.id,
        userId: session.userId,
        sessionId: session.id,
        catchCount: segmentCatches.length,
        totalWeight: segmentCatches.reduce((s, c) => s + c.weight, 0),
        biggestFish: Math.max(...segmentCatches.map(c => c.weight)),
        effortScore,
      });

      // Update segment stats
      await updateSegmentStats(segment.id);

      // Check for local legend
      await checkLocalLegendStatus(segment.id, session.userId);
    }
  }
}
```

---

## PHASE 3: Backend API - Segments & Local Legends

### 3.1 New Routes File: `segments.ts`

#### Endpoints:

1. **POST /api/segments**
   - Create new segment
   - Input: `{ name, description, centerLat, centerLng, radius?, bounds?, type }`
   - Auto-detect or manual creation

2. **GET /api/segments/nearby**
   - Get segments near location
   - Query params: `lat`, `lng`, `radius`

3. **GET /api/segments/:id**
   - Get segment details
   - Include leaderboards, current legend

4. **GET /api/segments/:id/leaderboard**
   - Get leaderboard for segment
   - Query params: `category`, `timeframe`

5. **GET /api/segments/:id/efforts**
   - Get all efforts for segment
   - Filter by user, timeframe

6. **GET /api/segments/:id/legend-history**
   - Get history of local legends

7. **GET /api/segments/explore**
   - Discover popular segments
   - Filter by activity, region

8. **POST /api/segments/:id/efforts**
   - Manually log effort (for non-session catches)

### 3.2 Local Legend Calculation

```typescript
// Backend service: segments.service.ts

async function checkLocalLegendStatus(segmentId: string, userId: string) {
  const ninetyDaysAgo = subDays(new Date(), 90);

  // Count user's efforts in past 90 days
  const userEfforts = await prisma.segmentEffort.count({
    where: {
      segmentId,
      userId,
      completedAt: { gte: ninetyDaysAgo },
    },
  });

  // Get current legend
  const currentLegend = await prisma.localLegend.findFirst({
    where: {
      segmentId,
      status: 'active',
    },
    include: { user: true },
  });

  if (!currentLegend) {
    // No legend yet, user with most efforts wins
    const topUser = await getTopUserForSegment(segmentId, ninetyDaysAgo);
    if (topUser.id === userId && topUser.efforts >= 3) {
      await createLocalLegend(segmentId, userId, topUser.efforts);
    }
  } else {
    // Check if challenger has more efforts
    const legendEfforts = await prisma.segmentEffort.count({
      where: {
        segmentId,
        userId: currentLegend.userId,
        completedAt: { gte: ninetyDaysAgo },
      },
    });

    if (userId !== currentLegend.userId && userEfforts > legendEfforts) {
      // Dethrone!
      await dethroneLocalLegend(currentLegend.id);
      await createLocalLegend(segmentId, userId, userEfforts);

      // Send notification to dethroned legend
      await sendLegendDethronedNotification(currentLegend.userId, segmentId);
    }
  }
}

async function updateSegmentLeaderboards(segmentId: string) {
  const categories = ['most_catches', 'biggest_fish', 'total_weight', 'species_diversity'];
  const timeframes = ['all_time', 'year', 'month', 'week'];

  for (const category of categories) {
    for (const timeframe of timeframes) {
      const startDate = getStartDateForTimeframe(timeframe);

      const rankings = await calculateRankings(segmentId, category, startDate);

      // Upsert leaderboard entries
      for (const [index, ranking] of rankings.entries()) {
        await prisma.segmentLeaderboard.upsert({
          where: {
            segmentId_userId_category_timeframe: {
              segmentId,
              userId: ranking.userId,
              category,
              timeframe,
            },
          },
          update: {
            value: ranking.value,
            rank: index + 1,
            efforts: ranking.efforts,
            lastEffortAt: ranking.lastEffortAt,
          },
          create: {
            segmentId,
            userId: ranking.userId,
            category,
            timeframe,
            value: ranking.value,
            rank: index + 1,
            efforts: ranking.efforts,
            lastEffortAt: ranking.lastEffortAt,
          },
        });
      }
    }
  }
}
```

### 3.3 Segment Auto-Detection

```typescript
// Run as background job or on-demand

async function detectPopularSegments() {
  // Find clusters of catches
  const clusters = await prisma.$queryRaw`
    SELECT
      ST_X(ST_Centroid(ST_Collect(location))) as center_lng,
      ST_Y(ST_Centroid(ST_Collect(location))) as center_lat,
      COUNT(*) as catch_count,
      COUNT(DISTINCT user_id) as unique_anglers
    FROM catches
    WHERE location IS NOT NULL
      AND created_at > NOW() - INTERVAL '90 days'
    GROUP BY ST_SnapToGrid(location, 0.001) -- ~100m grid
    HAVING COUNT(*) > 10 -- At least 10 catches
      AND COUNT(DISTINCT user_id) > 3 -- At least 3 anglers
  `;

  for (const cluster of clusters) {
    // Check if segment already exists
    const existing = await prisma.segment.findFirst({
      where: {
        centerLat: { gte: cluster.center_lat - 0.001, lte: cluster.center_lat + 0.001 },
        centerLng: { gte: cluster.center_lng - 0.001, lte: cluster.center_lng + 0.001 },
      },
    });

    if (!existing) {
      // Create auto-detected segment
      await prisma.segment.create({
        data: {
          name: `Popular Spot ${cluster.center_lat.toFixed(4)}N ${cluster.center_lng.toFixed(4)}E`,
          centerLat: cluster.center_lat,
          centerLng: cluster.center_lng,
          radius: 100, // meters
          segmentType: 'spot',
          activityCount: cluster.catch_count,
          uniqueAnglers: cluster.unique_anglers,
          createdBy: 'system', // System-generated
        },
      });
    }
  }
}
```

---

## PHASE 4: Backend API - Kudos System

### 4.1 New Routes in `catches.ts` and `sessions.ts`

#### Catch Kudos Endpoints:

1. **POST /api/catches/:id/kudos**
   - Give kudos to catch
   - Check uniqueness (one kudos per user per catch)

2. **DELETE /api/catches/:id/kudos**
   - Remove kudos

3. **GET /api/catches/:id/kudos**
   - Get all kudos for catch with user details

#### Session Kudos Endpoints:

4. **POST /api/sessions/:id/kudos**
   - Give kudos to session

5. **DELETE /api/sessions/:id/kudos**
   - Remove kudos

6. **GET /api/sessions/:id/kudos**
   - Get all kudos for session

### 4.2 Kudos Integration

```typescript
// Update existing feed queries to include kudos

async function getFeed(userId: string, options: FeedOptions) {
  const catches = await prisma.catch.findMany({
    where: {
      OR: [
        { visibility: 'public' },
        {
          visibility: 'friends',
          user: {
            friendsAsUser1: { some: { user2Id: userId, status: 'accepted' } },
            friendsAsUser2: { some: { user1Id: userId, status: 'accepted' } },
          }
        },
      ],
    },
    include: {
      user: true,
      species: true,
      kudos: {
        include: { user: { select: { id: true, username: true, avatar: true } } },
      },
      _count: {
        select: { kudos: true, comments: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return catches.map(c => ({
    ...c,
    kudosCount: c._count.kudos,
    hasUserKudoed: c.kudos.some(k => k.userId === userId),
    topKudoers: c.kudos.slice(0, 3).map(k => k.user), // Show first 3
  }));
}
```

---

## PHASE 5: Backend API - Premium Analytics

### 5.1 New Routes File: `analytics.ts`

#### Premium Analytics Endpoints:

1. **GET /api/analytics/performance-trends**
   - Time series data: catches over time, success rate trends
   - Requires: Premium tier

2. **GET /api/analytics/best-times**
   - Heatmap of best fishing times by hour/day of week
   - Success rate by time slot
   - Requires: Premium tier

3. **GET /api/analytics/weather-correlation**
   - Correlate catch success with weather conditions
   - Temperature, wind, pressure, moon phase
   - Requires: Premium tier

4. **GET /api/analytics/technique-effectiveness**
   - Compare success rates by technique, bait, gear
   - ROI on lures (cost per catch)
   - Requires: Premium tier

5. **GET /api/analytics/location-insights**
   - Advanced location analysis
   - Spot effectiveness over time
   - Species distribution by location
   - Requires: Premium tier

6. **GET /api/analytics/predictions**
   - Enhanced predictions (better than free tier)
   - Next 7 days forecast with success probability
   - Requires: Premium tier

7. **GET /api/analytics/goal-suggestions**
   - AI-suggested goals based on patterns
   - Requires: Premium tier

8. **GET /api/analytics/export**
   - Export all data (CSV, JSON)
   - Requires: Premium tier

### 5.2 Analytics Calculation Examples

```typescript
// analytics.service.ts

async function getBestTimesHeatmap(userId: string) {
  const catches = await prisma.catch.findMany({
    where: { userId },
    select: {
      createdAt: true,
      weight: true,
    },
  });

  // Create 24x7 heatmap (hour x day of week)
  const heatmap = Array(7).fill(null).map(() => Array(24).fill(0));
  const counts = Array(7).fill(null).map(() => Array(24).fill(0));

  catches.forEach(c => {
    const hour = c.createdAt.getHours();
    const day = c.createdAt.getDay();
    heatmap[day][hour] += 1;
    counts[day][hour] += 1;
  });

  // Calculate success rate (normalize by sessions)
  const sessions = await prisma.fishingSession.findMany({
    where: { userId },
    select: { startTime: true, endTime: true },
  });

  // ... normalize by session hours ...

  return {
    heatmap,
    bestHour: findMaxIndex(heatmap),
    bestDay: findBestDay(heatmap),
    insights: generateInsights(heatmap),
  };
}

async function getWeatherCorrelation(userId: string) {
  const catches = await prisma.catch.findMany({
    where: { userId, weatherData: { not: null } },
    select: {
      weatherData: true,
      weight: true,
    },
  });

  // Analyze correlations
  const tempBuckets = groupByTemperature(catches);
  const windBuckets = groupByWind(catches);
  const pressureBuckets = groupByPressure(catches);
  const moonBuckets = groupByMoonPhase(catches);

  return {
    temperature: {
      optimal: findOptimalRange(tempBuckets),
      correlation: calculateCorrelation(tempBuckets),
    },
    wind: {
      optimal: findOptimalRange(windBuckets),
      correlation: calculateCorrelation(windBuckets),
    },
    pressure: {
      optimal: findOptimalRange(pressureBuckets),
      correlation: calculateCorrelation(pressureBuckets),
    },
    moonPhase: {
      best: findBestPhase(moonBuckets),
      data: moonBuckets,
    },
  };
}
```

### 5.3 Subscription Management Routes

```typescript
// subscription.ts

// POST /api/subscription/create-checkout
async createCheckoutSession(userId: string, tier: string) {
  // Stripe integration
  const session = await stripe.checkout.sessions.create({
    customer_email: user.email,
    line_items: [{ price: PRICE_IDS[tier], quantity: 1 }],
    mode: 'subscription',
    success_url: `${APP_URL}/premium/success`,
    cancel_url: `${APP_URL}/premium`,
  });

  return { url: session.url };
}

// POST /api/subscription/webhook (Stripe webhook)
async handleStripeWebhook(event: Stripe.Event) {
  switch (event.type) {
    case 'checkout.session.completed':
      await activateSubscription(event.data.object);
      break;
    case 'customer.subscription.deleted':
      await cancelSubscription(event.data.object);
      break;
    // ... other events
  }
}

// Middleware to check premium status
async function requirePremium(req, res, next) {
  const subscription = await prisma.premiumSubscription.findUnique({
    where: { userId: req.user.id },
  });

  if (!subscription || subscription.status !== 'active') {
    return res.status(403).send({ error: 'Premium subscription required' });
  }

  next();
}
```

---

## PHASE 6: Backend API - Unique Fishing Features

### 6.1 Tide Integration

#### New Routes File: `tides.ts`

```typescript
// GET /api/tides
async function getTides(lat: number, lng: number, date: string) {
  // Check cache first
  const cached = await prisma.tideData.findMany({
    where: {
      lat: { gte: lat - 0.01, lte: lat + 0.01 },
      lng: { gte: lng - 0.01, lte: lng + 0.01 },
      date: new Date(date),
    },
  });

  if (cached.length > 0) return cached;

  // Fetch from external API (NOAA, DMI, etc.)
  const tides = await fetchTideData(lat, lng, date);

  // Cache results
  await prisma.tideData.createMany({ data: tides });

  return tides;
}

// GET /api/tides/predictions
async function getTidePredictions(lat: number, lng: number, days: number = 7) {
  // Get next 7 days of tide data
  const predictions = [];
  for (let i = 0; i < days; i++) {
    const date = addDays(new Date(), i);
    const tides = await getTides(lat, lng, date.toISOString());
    predictions.push({ date, tides });
  }

  return predictions;
}

// Integration with external APIs
async function fetchTideData(lat: number, lng: number, date: string) {
  // For Denmark: Use DMI (Danish Meteorological Institute) API
  const station = await findNearestTideStation(lat, lng);

  const response = await fetch(
    `https://api.dmi.dk/v1/tides/${station.id}?date=${date}`,
    { headers: { 'X-API-Key': process.env.DMI_API_KEY } }
  );

  const data = await response.json();

  return data.tides.map(t => ({
    lat,
    lng,
    stationId: station.id,
    date: new Date(date),
    tideType: t.type,
    height: t.height,
    time: new Date(t.time),
    source: 'dmi',
  }));
}
```

### 6.2 Lunar Calendar Integration

```typescript
// lunar.ts

import SunCalc from 'suncalc';

// GET /api/lunar/phase
async function getMoonPhase(date: Date) {
  const moonIllumination = SunCalc.getMoonIllumination(date);

  return {
    phase: moonIllumination.phase, // 0-1
    phaseName: getMoonPhaseName(moonIllumination.phase),
    illumination: moonIllumination.fraction,
    age: moonIllumination.phase * 29.53, // Days since new moon
  };
}

function getMoonPhaseName(phase: number): string {
  if (phase < 0.0625 || phase >= 0.9375) return 'New Moon';
  if (phase < 0.1875) return 'Waxing Crescent';
  if (phase < 0.3125) return 'First Quarter';
  if (phase < 0.4375) return 'Waxing Gibbous';
  if (phase < 0.5625) return 'Full Moon';
  if (phase < 0.6875) return 'Waning Gibbous';
  if (phase < 0.8125) return 'Last Quarter';
  return 'Waning Crescent';
}

// GET /api/lunar/optimal-times
async function getOptimalFishingTimes(lat: number, lng: number, date: Date) {
  const moonPhase = await getMoonPhase(date);
  const sunTimes = SunCalc.getTimes(date, lat, lng);
  const moonTimes = SunCalc.getMoonTimes(date, lat, lng);

  // Major periods (moon overhead and underfoot)
  const moonPosition = SunCalc.getMoonPosition(date, lat, lng);

  // Minor periods (moonrise and moonset)
  const optimalTimes = [
    { time: moonTimes.rise, type: 'minor', name: 'Moonrise' },
    { time: moonTimes.set, type: 'minor', name: 'Moonset' },
    { time: sunTimes.sunrise, type: 'minor', name: 'Sunrise' },
    { time: sunTimes.sunset, type: 'minor', name: 'Sunset' },
  ];

  return {
    moonPhase,
    optimalTimes: optimalTimes.filter(t => t.time),
    solunarRating: calculateSolunarRating(moonPhase, optimalTimes),
  };
}
```

### 6.3 Water Temperature Layers

```typescript
// water-temperature.ts

// GET /api/water-temperature
async function getWaterTemperature(lat: number, lng: number, date?: Date) {
  // Check database first
  const recent = await prisma.waterTemperature.findFirst({
    where: {
      lat: { gte: lat - 0.05, lte: lat + 0.05 },
      lng: { gte: lng - 0.05, lte: lng + 0.05 },
      measuredAt: { gte: subDays(new Date(), 1) },
    },
    orderBy: { measuredAt: 'desc' },
  });

  if (recent) return recent;

  // Fetch from satellite data (NASA MODIS, Copernicus, etc.)
  const temp = await fetchSatelliteWaterTemp(lat, lng);

  // Store in database
  const data = await prisma.waterTemperature.create({
    data: {
      lat,
      lng,
      temperature: temp.value,
      measuredAt: new Date(),
      source: 'satellite',
      sourceId: temp.sourceId,
      confidence: temp.confidence,
    },
  });

  return data;
}

// GET /api/water-temperature/grid
async function getWaterTempGrid(bounds: Bounds, resolution: number = 0.1) {
  // Return grid of water temperatures for map overlay
  const grid = [];

  for (let lat = bounds.south; lat <= bounds.north; lat += resolution) {
    for (let lng = bounds.west; lng <= bounds.east; lng += resolution) {
      const temp = await getWaterTemperature(lat, lng);
      grid.push({ lat, lng, temperature: temp.temperature });
    }
  }

  return grid;
}
```

### 6.4 Fishing Regulations

```typescript
// regulations.ts

// GET /api/regulations/check
async function checkRegulations(lat: number, lng: number, speciesId?: string) {
  const point = { lat, lng };

  // Find applicable regulations (using PostGIS)
  const regulations = await prisma.$queryRaw`
    SELECT * FROM fishing_regulations
    WHERE is_active = true
      AND ST_Contains(bounds::geometry, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326))
      ${speciesId ? Prisma.sql`AND species_id = ${speciesId}` : Prisma.empty}
      AND (effective_until IS NULL OR effective_until > NOW())
    ORDER BY effective_from DESC
  `;

  return regulations;
}

// GET /api/regulations/validate-catch
async function validateCatch(catchData: {
  speciesId: string;
  length?: number;
  weight?: number;
  lat: number;
  lng: number;
  date: Date;
}) {
  const regulations = await checkRegulations(
    catchData.lat,
    catchData.lng,
    catchData.speciesId
  );

  const violations = [];
  const warnings = [];

  for (const reg of regulations) {
    // Check size limits
    if (reg.minSize && catchData.length && catchData.length < reg.minSize) {
      violations.push({
        type: 'size_too_small',
        regulation: reg,
        message: `Fish is below minimum size (${reg.minSize}cm)`,
      });
    }

    if (reg.maxSize && catchData.length && catchData.length > reg.maxSize) {
      violations.push({
        type: 'size_too_large',
        regulation: reg,
        message: `Fish exceeds maximum size (${reg.maxSize}cm)`,
      });
    }

    // Check closed season
    if (reg.closedSeasonStart && reg.closedSeasonEnd) {
      const catchDate = catchData.date;
      const seasonStart = new Date(catchDate.getFullYear(), reg.closedSeasonStart.getMonth(), reg.closedSeasonStart.getDate());
      const seasonEnd = new Date(catchDate.getFullYear(), reg.closedSeasonEnd.getMonth(), reg.closedSeasonEnd.getDate());

      if (catchDate >= seasonStart && catchDate <= seasonEnd) {
        violations.push({
          type: 'closed_season',
          regulation: reg,
          message: `Closed season: ${seasonStart.toLocaleDateString()} - ${seasonEnd.toLocaleDateString()}`,
        });
      }
    }

    // Check catch and release requirement
    if (reg.catchAndRelease && !catchData.isReleased) {
      warnings.push({
        type: 'should_release',
        regulation: reg,
        message: 'This area requires catch and release',
      });
    }
  }

  return {
    isLegal: violations.length === 0,
    violations,
    warnings,
    regulations,
  };
}
```

### 6.5 Bait Effectiveness

```typescript
// bait-effectiveness.ts

// GET /api/bait/effectiveness
async function getBaitEffectiveness(params: {
  lat: number;
  lng: number;
  speciesId?: string;
  season?: string;
}) {
  const effectiveness = await prisma.baitEffectiveness.findMany({
    where: {
      lat: { gte: params.lat - 0.05, lte: params.lat + 0.05 },
      lng: { gte: params.lng - 0.05, lte: params.lng + 0.05 },
      speciesId: params.speciesId,
      season: params.season,
    },
    include: { species: true },
    orderBy: { successRate: 'desc' },
  });

  return effectiveness;
}

// POST /api/bait/update-effectiveness (called after catch)
async function updateBaitEffectiveness(catchData: {
  bait: string;
  speciesId: string;
  lat: number;
  lng: number;
  weight: number;
  season: string;
}) {
  // Find or create bait effectiveness record
  const record = await prisma.baitEffectiveness.upsert({
    where: {
      // Unique composite key
      baitType_speciesId_lat_lng_season: {
        baitType: catchData.bait,
        speciesId: catchData.speciesId,
        lat: Math.round(catchData.lat * 100) / 100, // Round to 2 decimals
        lng: Math.round(catchData.lng * 100) / 100,
        season: catchData.season,
      },
    },
    update: {
      totalCatches: { increment: 1 },
      totalAttempts: { increment: 1 },
      avgCatchSize: {
        // Recalculate average
        // (old_avg * old_count + new_value) / new_count
      },
    },
    create: {
      baitType: catchData.bait,
      baitCategory: categorizeBait(catchData.bait),
      speciesId: catchData.speciesId,
      lat: Math.round(catchData.lat * 100) / 100,
      lng: Math.round(catchData.lng * 100) / 100,
      season: catchData.season,
      totalCatches: 1,
      totalAttempts: 1,
      avgCatchSize: catchData.weight,
      successRate: 1.0,
    },
  });

  // Recalculate success rate
  const newSuccessRate = record.totalCatches / record.totalAttempts;

  await prisma.baitEffectiveness.update({
    where: { id: record.id },
    data: { successRate: newSuccessRate },
  });
}
```

### 6.6 Conservation Score

```typescript
// conservation.ts

// GET /api/conservation/score/:userId
async function getConservationScore(userId: string) {
  const score = await prisma.conservationScore.findUnique({
    where: { userId },
  });

  if (!score) {
    return createDefaultScore(userId);
  }

  return score;
}

// POST /api/conservation/update (called after catch)
async function updateConservationScore(userId: string, catchData: {
  isReleased: boolean;
  isLegal: boolean;
  educationalShare?: boolean;
}) {
  const score = await getConservationScore(userId);

  const updates = {
    totalReleased: catchData.isReleased ? { increment: 1 } : undefined,
    totalKept: !catchData.isReleased ? { increment: 1 } : undefined,
    educationalShares: catchData.educationalShare ? { increment: 1 } : undefined,
  };

  const newTotalReleased = score.totalReleased + (catchData.isReleased ? 1 : 0);
  const newTotalKept = score.totalKept + (catchData.isReleased ? 0 : 1);
  const releaseRate = (newTotalReleased / (newTotalReleased + newTotalKept)) * 100;

  // Calculate overall score (0-100)
  const newScore = calculateConservationScore({
    releaseRate,
    totalReleased: newTotalReleased,
    educationalShares: score.educationalShares + (catchData.educationalShare ? 1 : 0),
    reportedViolations: score.reportedViolations,
    habitatCleanups: score.habitatCleanups,
  });

  const rank = getConservationRank(newScore);
  const achievements = checkConservationAchievements(score);

  await prisma.conservationScore.update({
    where: { userId },
    data: {
      ...updates,
      releaseRate,
      score: newScore,
      rank,
      achievements,
    },
  });

  return { score: newScore, rank, newAchievements: achievements };
}

function calculateConservationScore(data: any): number {
  let score = 50; // Base score

  // Release rate (0-30 points)
  score += (data.releaseRate / 100) * 30;

  // Total releases (0-20 points)
  score += Math.min(data.totalReleased / 10, 20);

  // Educational shares (0-15 points)
  score += Math.min(data.educationalShares * 3, 15);

  // Reported violations (0-10 points)
  score += Math.min(data.reportedViolations * 2, 10);

  // Habitat cleanups (0-25 points)
  score += Math.min(data.habitatCleanups * 5, 25);

  return Math.min(score, 100);
}
```

---

## PHASE 7: Mobile UI - Session Tracking

### 7.1 New Screens

#### 7.1.1 `app/session-tracking.tsx`

```typescript
// Full-screen session tracking interface

import { useState, useEffect } from 'react';
import MapView, { Polyline } from 'react-native-maps';
import * as Location from 'expo-location';

export default function SessionTracking() {
  const [session, setSession] = useState(null);
  const [route, setRoute] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [stats, setStats] = useState({
    duration: 0,
    distance: 0,
    catches: 0,
  });

  useEffect(() => {
    if (session) {
      // Track location every 30 seconds
      const interval = setInterval(trackLocation, 30000);
      return () => clearInterval(interval);
    }
  }, [session]);

  async function startSession(type: string) {
    const response = await api.post('/sessions/start', { sessionType: type });
    setSession(response.data);
    trackLocation(); // Initial point
  }

  async function trackLocation() {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    const point = {
      lat: location.coords.latitude,
      lng: location.coords.longitude,
      timestamp: new Date().toISOString(),
      speed: location.coords.speed,
      altitude: location.coords.altitude,
    };

    await api.patch(`/sessions/${session.id}/track`, point);
    setRoute([...route, point]);
    setCurrentLocation(point);
  }

  async function endSession() {
    const summary = await api.post(`/sessions/${session.id}/end`);
    // Show summary modal
    showSessionSummary(summary.data);
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={currentLocation ? {
          latitude: currentLocation.lat,
          longitude: currentLocation.lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        } : undefined}
      >
        {route.length > 0 && (
          <Polyline
            coordinates={route.map(p => ({ latitude: p.lat, longitude: p.lng }))}
            strokeColor="#00A9FF"
            strokeWidth={4}
          />
        )}
        {currentLocation && (
          <Marker coordinate={{ latitude: currentLocation.lat, longitude: currentLocation.lng }} />
        )}
      </MapView>

      <View style={styles.statsCard}>
        <StatItem label="Duration" value={formatDuration(stats.duration)} />
        <StatItem label="Distance" value={`${stats.distance.toFixed(2)} km`} />
        <StatItem label="Catches" value={stats.catches} />
      </View>

      {!session ? (
        <Button title="Start Session" onPress={() => showSessionTypeModal()} />
      ) : (
        <Button title="End Session" onPress={endSession} />
      )}
    </View>
  );
}
```

#### 7.1.2 `app/session-detail.tsx`

```typescript
// View completed session with route, catches, kudos

export default function SessionDetail({ route }) {
  const { sessionId } = route.params;
  const [session, setSession] = useState(null);

  useEffect(() => {
    loadSession();
  }, []);

  async function loadSession() {
    const response = await api.get(`/sessions/${sessionId}`);
    setSession(response.data);
  }

  async function giveKudos() {
    await api.post(`/sessions/${sessionId}/kudos`);
    await loadSession(); // Refresh
  }

  return (
    <ScrollView>
      <MapView style={styles.map}>
        <Polyline
          coordinates={session.route}
          strokeColor="#00A9FF"
          strokeWidth={4}
        />
      </MapView>

      <View style={styles.header}>
        <Text style={styles.title}>{session.title || 'Fishing Session'}</Text>
        <Text>{formatDate(session.startTime)}</Text>
      </View>

      <View style={styles.stats}>
        <StatCard icon="timer" label="Duration" value={formatDuration(session.duration)} />
        <StatCard icon="map" label="Distance" value={`${session.totalDistance} km`} />
        <StatCard icon="fish" label="Catches" value={session.totalCatches} />
        <StatCard icon="weight" label="Total Weight" value={`${session.totalWeight} kg`} />
      </View>

      <View style={styles.kudosSection}>
        <Button
          icon={session.hasUserKudoed ? "heart" : "heart-outline"}
          onPress={giveKudos}
        >
          {session.kudosCount} Kudos
        </Button>
        <AvatarGroup users={session.topKudoers} />
      </View>

      <View style={styles.catchesSection}>
        <Text style={styles.sectionTitle}>Catches</Text>
        {session.catches.map(catch => (
          <CatchCard key={catch.id} catch={catch} />
        ))}
      </View>

      <View style={styles.commentsSection}>
        <Text style={styles.sectionTitle}>Comments</Text>
        {session.comments.map(comment => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </View>
    </ScrollView>
  );
}
```

### 7.2 Component Updates

#### 7.2.1 Update `app/catch-form.tsx`

```typescript
// Add option to link catch to active session

function CatchForm() {
  const [activeSession, setActiveSession] = useState(null);

  useEffect(() => {
    checkActiveSession();
  }, []);

  async function checkActiveSession() {
    const session = await api.get('/sessions/active');
    setActiveSession(session.data);
  }

  return (
    <View>
      {/* Existing form fields */}

      {activeSession && (
        <View style={styles.sessionLink}>
          <Text>Link to active session: {activeSession.title}</Text>
          <Switch value={linkToSession} onValueChange={setLinkToSession} />
        </View>
      )}
    </View>
  );
}
```

---

## PHASE 8: Mobile UI - Segments & Legends

### 8.1 New Screens

#### 8.1.1 `app/segments.tsx`

```typescript
// Explore segments screen

export default function SegmentsScreen() {
  const [segments, setSegments] = useState([]);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    loadNearbySegments();
  }, []);

  async function loadNearbySegments() {
    const location = await Location.getCurrentPositionAsync();
    const response = await api.get('/segments/nearby', {
      params: {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
        radius: 50000, // 50km
      },
    });
    setSegments(response.data);
  }

  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.title}>Fishing Segments</Text>
        <Text style={styles.subtitle}>Compete on popular spots</Text>
      </View>

      <FlatList
        data={segments}
        renderItem={({ item }) => (
          <SegmentCard segment={item} />
        )}
      />
    </View>
  );
}

function SegmentCard({ segment }) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/segment/${segment.id}`)}
    >
      <View style={styles.header}>
        <Text style={styles.name}>{segment.name}</Text>
        {segment.currentLegend && (
          <View style={styles.legendBadge}>
            <Icon name="crown" color="#FFD700" />
            <Text>{segment.currentLegend.user.username}</Text>
          </View>
        )}
      </View>

      <View style={styles.stats}>
        <Text>{segment.totalCatches} catches</Text>
        <Text>{segment.uniqueAnglers} anglers</Text>
      </View>

      <Text style={styles.distance}>
        {calculateDistance(userLocation, segment)} km away
      </Text>
    </TouchableOpacity>
  );
}
```

#### 8.1.2 `app/segment/[id].tsx`

```typescript
// Segment detail with leaderboards

export default function SegmentDetail() {
  const { id } = useLocalSearchParams();
  const [segment, setSegment] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [category, setCategory] = useState('most_catches');
  const [timeframe, setTimeframe] = useState('all_time');

  useEffect(() => {
    loadSegment();
    loadLeaderboard();
  }, [category, timeframe]);

  async function loadLeaderboard() {
    const response = await api.get(`/segments/${id}/leaderboard`, {
      params: { category, timeframe },
    });
    setLeaderboard(response.data);
  }

  return (
    <ScrollView>
      <MapView
        style={styles.map}
        region={{
          latitude: segment.centerLat,
          longitude: segment.centerLng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Circle
          center={{ latitude: segment.centerLat, longitude: segment.centerLng }}
          radius={segment.radius}
          fillColor="rgba(0, 169, 255, 0.2)"
          strokeColor="#00A9FF"
        />
      </MapView>

      {segment.currentLegend && (
        <View style={styles.legendCard}>
          <Icon name="crown" size={32} color="#FFD700" />
          <Text style={styles.legendTitle}>Local Legend</Text>
          <Text style={styles.legendName}>{segment.currentLegend.user.username}</Text>
          <Text>{segment.currentLegend.effortCount} efforts in 90 days</Text>
        </View>
      )}

      <View style={styles.filters}>
        <SegmentedControl
          values={['Most Catches', 'Biggest Fish', 'Total Weight', 'Species']}
          selectedIndex={getCategoryIndex(category)}
          onChange={(e) => setCategory(getCategory(e.nativeEvent.selectedSegmentIndex))}
        />

        <SegmentedControl
          values={['All Time', 'Year', 'Month', 'Week']}
          selectedIndex={getTimeframeIndex(timeframe)}
          onChange={(e) => setTimeframe(getTimeframe(e.nativeEvent.selectedSegmentIndex))}
        />
      </View>

      <View style={styles.leaderboard}>
        {leaderboard.map((entry, index) => (
          <LeaderboardRow
            key={entry.userId}
            rank={index + 1}
            user={entry.user}
            value={entry.value}
            category={category}
          />
        ))}
      </View>

      <Button title="View Your Efforts" onPress={() => showUserEfforts()} />
    </ScrollView>
  );
}

function LeaderboardRow({ rank, user, value, category }) {
  const medalColor = rank === 1 ? '#FFD700' : rank === 2 ? '#C0C0C0' : rank === 3 ? '#CD7F32' : null;

  return (
    <View style={styles.row}>
      <View style={styles.rankContainer}>
        {medalColor ? (
          <Icon name="medal" size={24} color={medalColor} />
        ) : (
          <Text style={styles.rank}>{rank}</Text>
        )}
      </View>

      <Image source={{ uri: user.avatar }} style={styles.avatar} />
      <Text style={styles.username}>{user.username}</Text>

      <Text style={styles.value}>
        {formatValue(value, category)}
      </Text>
    </View>
  );
}
```

### 8.2 Map Integration

#### 8.2.1 Update `app/map.tsx`

```typescript
// Add segments layer to map

function MapScreen() {
  const [showSegments, setShowSegments] = useState(true);
  const [segments, setSegments] = useState([]);

  async function loadSegmentsInView(region) {
    const response = await api.get('/segments/in-bounds', {
      params: {
        north: region.latitude + region.latitudeDelta / 2,
        south: region.latitude - region.latitudeDelta / 2,
        east: region.longitude + region.longitudeDelta / 2,
        west: region.longitude - region.longitudeDelta / 2,
      },
    });
    setSegments(response.data);
  }

  return (
    <View>
      <MapView onRegionChangeComplete={loadSegmentsInView}>
        {/* Existing markers */}

        {showSegments && segments.map(segment => (
          <Circle
            key={segment.id}
            center={{ latitude: segment.centerLat, longitude: segment.centerLng }}
            radius={segment.radius}
            fillColor="rgba(255, 165, 0, 0.2)"
            strokeColor="#FFA500"
            onPress={() => router.push(`/segment/${segment.id}`)}
          />
        ))}
      </MapView>

      <FloatingMenu>
        <MenuItem
          icon="trophy"
          label="Segments"
          active={showSegments}
          onPress={() => setShowSegments(!showSegments)}
        />
      </FloatingMenu>
    </View>
  );
}
```

---

## PHASE 9: Mobile UI - Enhanced Feed & Kudos

### 9.1 Update `app/feed.tsx`

```typescript
// Enhanced feed with sessions, kudos, better filtering

export default function FeedScreen() {
  const [feedItems, setFeedItems] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'catches', 'sessions'

  async function loadFeed() {
    const response = await api.get('/feed', {
      params: { type: filter },
    });
    setFeedItems(response.data);
  }

  return (
    <View>
      <View style={styles.filterBar}>
        <FilterChip
          label="All"
          active={filter === 'all'}
          onPress={() => setFilter('all')}
        />
        <FilterChip
          label="Catches"
          active={filter === 'catches'}
          onPress={() => setFilter('catches')}
        />
        <FilterChip
          label="Sessions"
          active={filter === 'sessions'}
          onPress={() => setFilter('sessions')}
        />
      </View>

      <FlatList
        data={feedItems}
        renderItem={({ item }) => (
          item.type === 'catch' ? (
            <EnhancedCatchCard catch={item} />
          ) : (
            <SessionCard session={item} />
          )
        )}
      />
    </View>
  );
}

function EnhancedCatchCard({ catch }) {
  const [hasKudoed, setHasKudoed] = useState(catch.hasUserKudoed);
  const [kudosCount, setKudosCount] = useState(catch.kudosCount);

  async function toggleKudos() {
    if (hasKudoed) {
      await api.delete(`/catches/${catch.id}/kudos`);
      setKudosCount(kudosCount - 1);
    } else {
      await api.post(`/catches/${catch.id}/kudos`);
      setKudosCount(kudosCount + 1);
      // Celebrate animation
      showKudosAnimation();
    }
    setHasKudoed(!hasKudoed);
  }

  return (
    <View style={styles.card}>
      {/* User header */}
      <View style={styles.header}>
        <UserAvatar user={catch.user} />
        <Text>{catch.user.username}</Text>
        <Text style={styles.time}>{formatTimeAgo(catch.createdAt)}</Text>
      </View>

      {/* Catch photo */}
      <Image source={{ uri: catch.photoUrl }} style={styles.photo} />

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity onPress={toggleKudos} style={styles.kudosButton}>
          <Icon
            name={hasKudoed ? "heart" : "heart-outline"}
            size={24}
            color={hasKudoed ? "#FF0000" : "#666"}
          />
          <Text style={hasKudoed ? styles.kudoedText : styles.kudosText}>
            {kudosCount}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.commentButton}>
          <Icon name="comment-outline" size={24} />
          <Text>{catch.commentsCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity>
          <Icon name="share-outline" size={24} />
        </TouchableOpacity>
      </View>

      {/* Kudos list */}
      {kudosCount > 0 && (
        <View style={styles.kudosList}>
          <AvatarGroup users={catch.topKudoers} max={3} />
          <Text style={styles.kudosText}>
            {formatKudosText(catch.topKudoers, kudosCount)}
          </Text>
        </View>
      )}

      {/* Catch details */}
      <View style={styles.details}>
        <Text style={styles.species}>{catch.species.name}</Text>
        <Text>{catch.weight}kg • {catch.length}cm</Text>
        {catch.isPR && (
          <View style={styles.prBadge}>
            <Icon name="trophy" color="#FFD700" />
            <Text>Personal Record!</Text>
          </View>
        )}
      </View>
    </View>
  );
}

function SessionCard({ session }) {
  // Similar structure to EnhancedCatchCard but for sessions
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <UserAvatar user={session.user} />
        <Text>{session.user.username}</Text>
        <Text>{formatTimeAgo(session.startTime)}</Text>
      </View>

      {/* Route map preview */}
      <MapView
        style={styles.routePreview}
        region={getRegionForRoute(session.route)}
        scrollEnabled={false}
        zoomEnabled={false}
      >
        <Polyline
          coordinates={session.route}
          strokeColor="#00A9FF"
          strokeWidth={3}
        />
      </MapView>

      {/* Session stats */}
      <View style={styles.sessionStats}>
        <StatItem icon="timer" value={formatDuration(session.duration)} />
        <StatItem icon="map" value={`${session.totalDistance} km`} />
        <StatItem icon="fish" value={`${session.totalCatches} catches`} />
      </View>

      {/* Actions (kudos, comments) */}
      <View style={styles.actions}>
        {/* Similar to catch card */}
      </View>
    </View>
  );
}
```

---

## PHASE 10: Mobile UI - Premium Analytics Dashboard

### 10.1 New Screen: `app/premium-analytics.tsx`

```typescript
export default function PremiumAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    checkPremiumStatus();
  }, []);

  async function checkPremiumStatus() {
    const subscription = await api.get('/subscription/status');
    setIsPremium(subscription.data.isPremium);

    if (subscription.data.isPremium) {
      loadAnalytics();
    }
  }

  async function loadAnalytics() {
    const [trends, bestTimes, weather, technique, predictions] = await Promise.all([
      api.get('/analytics/performance-trends'),
      api.get('/analytics/best-times'),
      api.get('/analytics/weather-correlation'),
      api.get('/analytics/technique-effectiveness'),
      api.get('/analytics/predictions'),
    ]);

    setAnalytics({ trends, bestTimes, weather, technique, predictions });
  }

  if (!isPremium) {
    return <PremiumUpsell />;
  }

  return (
    <ScrollView>
      <Text style={styles.title}>Premium Analytics</Text>

      {/* Performance Trends */}
      <AnalyticsCard title="Performance Trends">
        <LineChart
          data={{
            labels: analytics.trends.labels,
            datasets: [
              {
                data: analytics.trends.catchCounts,
                color: () => '#00A9FF',
              },
            ],
          }}
          width={Dimensions.get('window').width - 40}
          height={220}
          chartConfig={chartConfig}
        />
      </AnalyticsCard>

      {/* Best Times Heatmap */}
      <AnalyticsCard title="Best Fishing Times">
        <HeatmapChart data={analytics.bestTimes.heatmap} />
        <Text>
          Peak hour: {analytics.bestTimes.bestHour}:00
        </Text>
        <Text>
          Best day: {analytics.bestTimes.bestDay}
        </Text>
      </AnalyticsCard>

      {/* Weather Correlation */}
      <AnalyticsCard title="Weather Insights">
        <View style={styles.weatherInsights}>
          <InsightRow
            label="Optimal Temperature"
            value={`${analytics.weather.temperature.optimal.min}-${analytics.weather.temperature.optimal.max}°C`}
            correlation={analytics.weather.temperature.correlation}
          />
          <InsightRow
            label="Best Wind Speed"
            value={`${analytics.weather.wind.optimal.min}-${analytics.weather.wind.optimal.max} m/s`}
            correlation={analytics.weather.wind.correlation}
          />
          <InsightRow
            label="Best Moon Phase"
            value={analytics.weather.moonPhase.best}
            correlation={analytics.weather.moonPhase.correlation}
          />
        </View>
      </AnalyticsCard>

      {/* Technique Effectiveness */}
      <AnalyticsCard title="Technique Effectiveness">
        <BarChart
          data={{
            labels: analytics.technique.techniques.map(t => t.name),
            datasets: [{
              data: analytics.technique.techniques.map(t => t.successRate * 100),
            }],
          }}
          width={Dimensions.get('window').width - 40}
          height={220}
          chartConfig={chartConfig}
        />
      </AnalyticsCard>

      {/* Predictions */}
      <AnalyticsCard title="7-Day Forecast">
        {analytics.predictions.forecast.map(day => (
          <PredictionRow
            key={day.date}
            date={day.date}
            probability={day.successProbability}
            optimalTimes={day.optimalTimes}
          />
        ))}
      </AnalyticsCard>
    </ScrollView>
  );
}

function PremiumUpsell() {
  return (
    <View style={styles.upsell}>
      <Icon name="lock-closed" size={64} color="#00A9FF" />
      <Text style={styles.upsellTitle}>Unlock Premium Analytics</Text>

      <View style={styles.features}>
        <FeatureItem icon="trending-up" text="Performance trends" />
        <FeatureItem icon="time" text="Best fishing times heatmap" />
        <FeatureItem icon="cloud" text="Weather correlations" />
        <FeatureItem icon="analytics" text="Technique effectiveness" />
        <FeatureItem icon="bulb" text="AI predictions" />
        <FeatureItem icon="download" text="Export all data" />
      </View>

      <Button
        title="Upgrade to Premium"
        onPress={() => router.push('/premium')}
      />
    </View>
  );
}
```

### 10.2 Premium Subscription Screen

```typescript
// app/premium.tsx

export default function PremiumScreen() {
  const [selectedTier, setSelectedTier] = useState('premium');

  async function subscribe() {
    const response = await api.post('/subscription/create-checkout', {
      tier: selectedTier,
    });

    // Open Stripe checkout
    await WebBrowser.openBrowserAsync(response.data.url);
  }

  return (
    <ScrollView>
      <Text style={styles.title}>Go Premium</Text>

      <View style={styles.tiers}>
        <TierCard
          name="Free"
          price="0"
          features={[
            'Basic catch logging',
            'Social feed',
            'Basic statistics',
            'Map with catches',
          ]}
          active={selectedTier === 'free'}
        />

        <TierCard
          name="Premium"
          price="49"
          period="month"
          features={[
            'Everything in Free',
            'Advanced analytics',
            'Segment leaderboards',
            'Session tracking',
            'Weather correlations',
            'AI predictions (enhanced)',
            'Export data',
            'Ad-free',
          ]}
          active={selectedTier === 'premium'}
          onPress={() => setSelectedTier('premium')}
          recommended
        />
      </View>

      <Button title="Subscribe" onPress={subscribe} disabled={selectedTier === 'free'} />
    </ScrollView>
  );
}
```

---

## PHASE 11: Mobile UI - Unique Features Integration

### 11.1 Tide Integration

#### Update `app/map.tsx`

```typescript
function MapScreen() {
  const [showTides, setShowTides] = useState(false);
  const [tideStations, setTideStations] = useState([]);

  async function loadTideStations(region) {
    // Load tide stations in view
    const response = await api.get('/tides/stations', {
      params: {
        lat: region.latitude,
        lng: region.longitude,
        radius: 50000,
      },
    });
    setTideStations(response.data);
  }

  return (
    <MapView>
      {showTides && tideStations.map(station => (
        <Marker
          key={station.id}
          coordinate={{ latitude: station.lat, longitude: station.lng }}
          onPress={() => showTideInfo(station)}
        >
          <TideMarker station={station} />
        </Marker>
      ))}
    </MapView>
  );
}

function TideMarker({ station }) {
  const nextTide = station.nextTide;

  return (
    <View style={styles.tideMarker}>
      <Icon
        name={nextTide.type === 'high' ? 'arrow-up' : 'arrow-down'}
        color={nextTide.type === 'high' ? '#0077BE' : '#8B4513'}
      />
      <Text style={styles.tideTime}>
        {format(nextTide.time, 'HH:mm')}
      </Text>
    </View>
  );
}
```

#### New Component: `components/TideInfo.tsx`

```typescript
export function TideInfoCard({ location }) {
  const [tides, setTides] = useState([]);

  useEffect(() => {
    loadTides();
  }, [location]);

  async function loadTides() {
    const response = await api.get('/tides', {
      params: {
        lat: location.lat,
        lng: location.lng,
        date: new Date().toISOString(),
      },
    });
    setTides(response.data);
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Tide Information</Text>

      {tides.map(tide => (
        <View key={tide.time} style={styles.tideRow}>
          <Icon
            name={tide.tideType === 'high' ? 'arrow-up-circle' : 'arrow-down-circle'}
            size={24}
            color={tide.tideType === 'high' ? '#0077BE' : '#8B4513'}
          />
          <Text>{tide.tideType === 'high' ? 'High Tide' : 'Low Tide'}</Text>
          <Text>{format(new Date(tide.time), 'HH:mm')}</Text>
          <Text>{tide.height.toFixed(1)}m</Text>
        </View>
      ))}
    </View>
  );
}
```

### 11.2 Lunar Calendar Integration

#### New Screen: `app/lunar-calendar.tsx`

```typescript
export default function LunarCalendar() {
  const [moonPhase, setMoonPhase] = useState(null);
  const [optimalTimes, setOptimalTimes] = useState([]);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    loadLunarData();
  }, []);

  async function loadLunarData() {
    const loc = await Location.getCurrentPositionAsync();
    setLocation(loc.coords);

    const [phase, times] = await Promise.all([
      api.get('/lunar/phase', { params: { date: new Date().toISOString() } }),
      api.get('/lunar/optimal-times', {
        params: {
          lat: loc.coords.latitude,
          lng: loc.coords.longitude,
          date: new Date().toISOString(),
        },
      }),
    ]);

    setMoonPhase(phase.data);
    setOptimalTimes(times.data);
  }

  return (
    <ScrollView>
      <View style={styles.moonPhaseCard}>
        <MoonIcon phase={moonPhase.phase} size={120} />
        <Text style={styles.phaseName}>{moonPhase.phaseName}</Text>
        <Text>{(moonPhase.illumination * 100).toFixed(0)}% illuminated</Text>
        <Text>Day {moonPhase.age.toFixed(1)} of lunar cycle</Text>
      </View>

      <View style={styles.solunarCard}>
        <Text style={styles.cardTitle}>Solunar Rating</Text>
        <SolunarRating rating={optimalTimes.solunarRating} />
        <Text>{getSolunarDescription(optimalTimes.solunarRating)}</Text>
      </View>

      <View style={styles.optimalTimesCard}>
        <Text style={styles.cardTitle}>Best Fishing Times Today</Text>
        {optimalTimes.optimalTimes.map(time => (
          <View key={time.time} style={styles.timeRow}>
            <Icon
              name={time.type === 'major' ? 'star' : 'star-outline'}
              color={time.type === 'major' ? '#FFD700' : '#666'}
            />
            <Text style={styles.timeName}>{time.name}</Text>
            <Text>{format(new Date(time.time), 'HH:mm')}</Text>
          </View>
        ))}
      </View>

      <View style={styles.calendarCard}>
        <Text style={styles.cardTitle}>7-Day Lunar Forecast</Text>
        {/* Calendar view with moon phases */}
      </View>
    </ScrollView>
  );
}
```

### 11.3 Water Temperature Overlay

#### Update `app/map.tsx`

```typescript
function MapScreen() {
  const [showWaterTemp, setShowWaterTemp] = useState(false);
  const [tempGrid, setTempGrid] = useState([]);

  async function loadWaterTempLayer(region) {
    const response = await api.get('/water-temperature/grid', {
      params: {
        north: region.latitude + region.latitudeDelta / 2,
        south: region.latitude - region.latitudeDelta / 2,
        east: region.longitude + region.longitudeDelta / 2,
        west: region.longitude - region.longitudeDelta / 2,
        resolution: 0.05,
      },
    });
    setTempGrid(response.data);
  }

  return (
    <MapView>
      {showWaterTemp && (
        <HeatmapOverlay
          points={tempGrid.map(point => ({
            latitude: point.lat,
            longitude: point.lng,
            weight: normalizeTemperature(point.temperature),
          }))}
          gradient={{
            colors: ['#0000FF', '#00FFFF', '#00FF00', '#FFFF00', '#FF0000'],
            startPoints: [0, 0.25, 0.5, 0.75, 1],
            colorMapSize: 256,
          }}
        />
      )}

      <FloatingMenu>
        <MenuItem
          icon="thermometer"
          label="Water Temp"
          active={showWaterTemp}
          onPress={() => setShowWaterTemp(!showWaterTemp)}
        />
      </FloatingMenu>
    </MapView>
  );
}
```

### 11.4 Regulations Checker

#### New Component: `components/RegulationCheck.tsx`

```typescript
export function RegulationCheck({ catch }) {
  const [validation, setValidation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    validateCatch();
  }, [catch]);

  async function validateCatch() {
    const response = await api.get('/regulations/validate-catch', {
      params: {
        speciesId: catch.speciesId,
        length: catch.length,
        weight: catch.weight,
        lat: catch.latitude,
        lng: catch.longitude,
        date: catch.createdAt,
        isReleased: catch.isReleased,
      },
    });
    setValidation(response.data);
    setLoading(false);
  }

  if (loading) return <ActivityIndicator />;

  return (
    <View style={styles.container}>
      {validation.isLegal ? (
        <View style={styles.legalCard}>
          <Icon name="checkmark-circle" size={32} color="#00AA00" />
          <Text style={styles.legalText}>Legal Catch</Text>
        </View>
      ) : (
        <View style={styles.illegalCard}>
          <Icon name="alert-circle" size={32} color="#FF0000" />
          <Text style={styles.illegalText}>Regulation Violations</Text>
          {validation.violations.map((v, i) => (
            <View key={i} style={styles.violation}>
              <Text>{v.message}</Text>
            </View>
          ))}
        </View>
      )}

      {validation.warnings.length > 0 && (
        <View style={styles.warningsCard}>
          <Icon name="warning" size={24} color="#FFA500" />
          <Text>Warnings:</Text>
          {validation.warnings.map((w, i) => (
            <Text key={i}>{w.message}</Text>
          ))}
        </View>
      )}

      {validation.regulations.length > 0 && (
        <View style={styles.regulationsCard}>
          <Text style={styles.title}>Applicable Regulations:</Text>
          {validation.regulations.map(reg => (
            <RegulationItem key={reg.id} regulation={reg} />
          ))}
        </View>
      )}
    </View>
  );
}
```

#### Integration in Catch Form

```typescript
// Update app/catch-form.tsx

function CatchForm() {
  const [catchData, setCatchData] = useState({});
  const [regulationCheck, setRegulationCheck] = useState(null);

  useEffect(() => {
    // Check regulations when species, size, or location changes
    if (catchData.speciesId && catchData.length && catchData.location) {
      checkRegulations();
    }
  }, [catchData.speciesId, catchData.length, catchData.location]);

  async function checkRegulations() {
    const response = await api.get('/regulations/check', {
      params: {
        lat: catchData.location.lat,
        lng: catchData.location.lng,
        speciesId: catchData.speciesId,
      },
    });
    setRegulationCheck(response.data);
  }

  return (
    <ScrollView>
      {/* Existing form fields */}

      {regulationCheck && regulationCheck.length > 0 && (
        <View style={styles.regulationInfo}>
          <Text style={styles.infoTitle}>Local Regulations:</Text>
          {regulationCheck[0].minSize && (
            <Text>Minimum size: {regulationCheck[0].minSize}cm</Text>
          )}
          {regulationCheck[0].dailyLimit && (
            <Text>Daily limit: {regulationCheck[0].dailyLimit} fish</Text>
          )}
          {regulationCheck[0].closedSeasonStart && (
            <Text>
              Closed season: {format(regulationCheck[0].closedSeasonStart, 'MMM d')} - {format(regulationCheck[0].closedSeasonEnd, 'MMM d')}
            </Text>
          )}
        </View>
      )}

      {/* Release toggle */}
      <View style={styles.releaseSection}>
        <Text>Was this fish released?</Text>
        <Switch
          value={catchData.isReleased}
          onValueChange={(value) => setCatchData({ ...catchData, isReleased: value })}
        />
      </View>
    </ScrollView>
  );
}
```

### 11.5 Conservation Score Display

#### New Screen: `app/conservation.tsx`

```typescript
export default function ConservationScreen() {
  const [score, setScore] = useState(null);

  useEffect(() => {
    loadScore();
  }, []);

  async function loadScore() {
    const response = await api.get('/conservation/score/me');
    setScore(response.data);
  }

  return (
    <ScrollView>
      <View style={styles.header}>
        <Text style={styles.title}>Conservation Score</Text>
        <Text style={styles.subtitle}>Your environmental impact</Text>
      </View>

      <View style={styles.scoreCard}>
        <CircularProgress
          value={score.score}
          maxValue={100}
          radius={80}
          activeStrokeColor={getScoreColor(score.score)}
        />
        <Text style={styles.scoreText}>{score.score.toFixed(0)}</Text>
        <Text style={styles.rankText}>{score.rank.toUpperCase()}</Text>
      </View>

      <View style={styles.stats}>
        <StatCard
          icon="refresh"
          label="Release Rate"
          value={`${score.releaseRate.toFixed(0)}%`}
        />
        <StatCard
          icon="fish"
          label="Total Released"
          value={score.totalReleased}
        />
        <StatCard
          icon="leaf"
          label="Habitat Cleanups"
          value={score.habitatCleanups}
        />
      </View>

      <View style={styles.achievements}>
        <Text style={styles.sectionTitle}>Conservation Achievements</Text>
        {score.achievements.map(achievement => (
          <AchievementBadge key={achievement} achievement={achievement} />
        ))}
      </View>

      <View style={styles.tips}>
        <Text style={styles.sectionTitle}>Improve Your Score</Text>
        <TipCard tip="Release more fish, especially those below legal size" />
        <TipCard tip="Participate in habitat cleanup events" />
        <TipCard tip="Report fishing regulation violations" />
        <TipCard tip="Share educational content about conservation" />
      </View>
    </ScrollView>
  );
}
```

#### Add to Profile Screen

```typescript
// Update app/profile.tsx

function ProfileScreen() {
  return (
    <ScrollView>
      {/* Existing profile content */}

      <TouchableOpacity
        style={styles.conservationCard}
        onPress={() => router.push('/conservation')}
      >
        <Icon name="leaf" size={32} color="#00AA00" />
        <View>
          <Text style={styles.conservationTitle}>Conservation Score</Text>
          <Text style={styles.conservationRank}>{user.conservationScore.rank}</Text>
        </View>
        <Text style={styles.conservationValue}>
          {user.conservationScore.score.toFixed(0)}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
```

### 11.6 Bait Effectiveness Display

#### New Component: `components/BaitRecommendations.tsx`

```typescript
export function BaitRecommendations({ location, speciesId }) {
  const [effectiveness, setEffectiveness] = useState([]);
  const season = getCurrentSeason();

  useEffect(() => {
    loadEffectiveness();
  }, [location, speciesId]);

  async function loadEffectiveness() {
    const response = await api.get('/bait/effectiveness', {
      params: {
        lat: location.lat,
        lng: location.lng,
        speciesId,
        season,
      },
    });
    setEffectiveness(response.data);
  }

  if (effectiveness.length === 0) {
    return <Text>No bait data available for this location</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recommended Baits</Text>
      {effectiveness.map(bait => (
        <View key={bait.id} style={styles.baitRow}>
          <View style={styles.baitInfo}>
            <Text style={styles.baitName}>{bait.baitType}</Text>
            <Text style={styles.baitCategory}>{bait.baitCategory}</Text>
          </View>

          <View style={styles.stats}>
            <View style={styles.successRate}>
              <ProgressBar
                progress={bait.successRate}
                color="#00AA00"
              />
              <Text>{(bait.successRate * 100).toFixed(0)}% success</Text>
            </View>
            <Text style={styles.catches}>
              {bait.totalCatches} / {bait.totalAttempts} catches
            </Text>
            {bait.avgCatchSize && (
              <Text>Avg: {bait.avgCatchSize.toFixed(1)}kg</Text>
            )}
          </View>
        </View>
      ))}
    </View>
  );
}
```

#### Integration in AI Guide

```typescript
// Update app/ai-guide.tsx

function AIGuideScreen() {
  return (
    <ScrollView>
      {/* Existing AI recommendations */}

      {location && targetSpecies && (
        <BaitRecommendations
          location={location}
          speciesId={targetSpecies}
        />
      )}
    </ScrollView>
  );
}
```

---

## PHASE 12: Testing & Polish

### 12.1 Testing Checklist

#### Backend Tests
- [ ] Session CRUD operations
- [ ] GPS route recording and distance calculation
- [ ] Segment detection algorithm
- [ ] Local legend calculation
- [ ] Leaderboard ranking accuracy
- [ ] Kudos uniqueness constraints
- [ ] Premium subscription flow
- [ ] Analytics calculations
- [ ] Tide data caching
- [ ] Regulation validation logic
- [ ] Conservation score calculation
- [ ] Bait effectiveness updates

#### Mobile Tests
- [ ] Session tracking with GPS
- [ ] Route visualization on map
- [ ] Segment exploration and filtering
- [ ] Kudos animations
- [ ] Feed filtering (catches vs sessions)
- [ ] Analytics charts rendering
- [ ] Premium subscription flow
- [ ] Tide information display
- [ ] Lunar calendar accuracy
- [ ] Water temperature overlay performance
- [ ] Regulation check integration
- [ ] Conservation score display

#### Integration Tests
- [ ] Session end triggers segment detection
- [ ] Catch logging during session auto-links
- [ ] Kudos trigger notifications
- [ ] Premium features locked for free users
- [ ] Analytics data updates in real-time
- [ ] Offline session tracking
- [ ] WebSocket updates for kudos/comments

### 12.2 Performance Optimization

```typescript
// Backend optimizations

// 1. Add database indexes
await prisma.$executeRaw`
  CREATE INDEX idx_fishing_sessions_user_date ON fishing_sessions(user_id, start_time DESC);
  CREATE INDEX idx_segment_efforts_score ON segment_efforts(segment_id, effort_score DESC);
  CREATE INDEX idx_catches_session ON catches(session_id) WHERE session_id IS NOT NULL;
  CREATE INDEX idx_water_temp_location_date ON water_temperatures USING GIST (
    ll_to_earth(lat, lng)
  );
`;

// 2. Cache frequently accessed data
const cacheMiddleware = async (req, res, next) => {
  const key = `cache:${req.url}`;
  const cached = await redis.get(key);

  if (cached) {
    return res.send(JSON.parse(cached));
  }

  // Store original send
  const originalSend = res.send;
  res.send = function(data) {
    redis.setex(key, 300, JSON.stringify(data)); // 5 min cache
    originalSend.call(this, data);
  };

  next();
};

// 3. Paginate large datasets
async function getSegments(page = 1, limit = 20) {
  const segments = await prisma.segment.findMany({
    skip: (page - 1) * limit,
    take: limit,
    include: {
      currentLegend: { include: { user: true } },
      _count: { select: { efforts: true } },
    },
  });

  return segments;
}

// 4. Background jobs for heavy computations
import Queue from 'bull';

const analyticsQueue = new Queue('analytics', process.env.REDIS_URL);

analyticsQueue.process(async (job) => {
  const { userId } = job.data;
  await calculateUserAnalytics(userId);
});

// Trigger from API
app.post('/analytics/refresh', async (req, res) => {
  await analyticsQueue.add({ userId: req.user.id });
  res.send({ message: 'Analytics refresh queued' });
});
```

### 12.3 Animations & Polish

```typescript
// Mobile animations

// Kudos animation
function KudosAnimation() {
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, {
      damping: 10,
      stiffness: 100,
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Icon name="heart" size={100} color="#FF0000" />
    </Animated.View>
  );
}

// PR celebration
function PRCelebration() {
  const fireworks = useSharedValue(0);

  useEffect(() => {
    fireworks.value = withSequence(
      withTiming(1, { duration: 500 }),
      withRepeat(withTiming(0, { duration: 500 }), 3)
    );
  }, []);

  return (
    <View style={styles.celebration}>
      <LottieView
        source={require('./animations/fireworks.json')}
        autoPlay
        loop={false}
      />
      <Text style={styles.prText}>NEW PERSONAL RECORD!</Text>
    </View>
  );
}

// Session summary reveal
function SessionSummary({ session }) {
  const slideAnim = useSharedValue(-300);

  useEffect(() => {
    slideAnim.value = withSpring(0);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: slideAnim.value }],
  }));

  return (
    <Animated.View style={[styles.modal, animatedStyle]}>
      {/* Session stats */}
    </Animated.View>
  );
}
```

### 12.4 Error Handling

```typescript
// Global error handler
app.setErrorHandler((error, request, reply) => {
  if (error instanceof PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return reply.status(409).send({
        error: 'Duplicate entry',
        field: error.meta.target,
      });
    }
  }

  if (error.statusCode === 401) {
    return reply.status(401).send({
      error: 'Unauthorized',
      message: 'Please log in to continue',
    });
  }

  // Log to monitoring service
  logger.error(error, {
    url: request.url,
    method: request.method,
    userId: request.user?.id,
  });

  reply.status(500).send({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : undefined,
  });
});

// Mobile error boundaries
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log to Sentry or similar
    logError(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.error}>
          <Icon name="alert-circle" size={64} color="#FF0000" />
          <Text>Something went wrong</Text>
          <Button title="Retry" onPress={() => this.setState({ hasError: false })} />
        </View>
      );
    }

    return this.props.children;
  }
}
```

---

## Implementation Timeline Estimate

### Phase Dependencies
- **Phase 1** must complete before all others (database foundation)
- **Phases 2-6** can partially overlap (backend development)
- **Phases 7-11** depend on respective backend phases
- **Phase 12** runs throughout and after all phases

### Recommended Order
1. **Weeks 1-2**: Phase 1 (Database schema)
2. **Weeks 3-4**: Phase 2 (Sessions backend) + Phase 7 (Sessions UI)
3. **Weeks 5-6**: Phase 3 (Segments backend) + Phase 8 (Segments UI)
4. **Week 7**: Phase 4 (Kudos backend) + Phase 9 (Enhanced feed)
5. **Weeks 8-9**: Phase 5 (Premium analytics backend) + Phase 10 (Analytics UI)
6. **Weeks 10-12**: Phase 6 (Unique features backend) + Phase 11 (Unique features UI)
7. **Weeks 13-14**: Phase 12 (Testing, polish, bug fixes)

---

## Success Metrics

### Engagement Metrics
- Daily active sessions started
- Kudos given per user per day
- Segment efforts logged
- Premium conversion rate
- Conservation score improvements

### Technical Metrics
- API response times < 200ms
- GPS tracking accuracy
- Offline session sync success rate
- Analytics calculation performance

---

## Future Enhancements (Post-Launch)

1. **Social Challenges**: Team-based competitions
2. **Live Tracking**: Real-time angler locations (privacy-controlled)
3. **AR Features**: AR fish identification, size estimation
4. **Coaching**: Personalized fishing tips based on performance
5. **Marketplace**: Buy/sell gear within app
6. **Tournaments**: Official tournament registration and scoring
7. **Weather Alerts**: Push notifications for optimal conditions
8. **Trip Routing**: Navigate to multiple spots with offline maps

---

This completes the comprehensive implementation plan. Each phase is designed to be independently testable and deployable, allowing for incremental rollout of features.
