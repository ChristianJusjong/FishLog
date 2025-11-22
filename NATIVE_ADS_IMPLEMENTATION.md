# Native Advertising System - Implementation Guide

## Overview
A complete native advertising monetization system has been implemented for FishLog, designed to generate revenue through non-intrusive, context-aware ads while maintaining excellent user experience.

## ✅ Completed Backend Implementation

### 1. Database Schema
**Location**: `apps/backend/prisma/schema.prisma`

The following models have been added:

#### **AdType Enum**
- `FEED_NATIVE` - Native ads in the feed (looks like catch posts)
- `SPONSORED_SPOT` - Sponsored fishing locations on map
- `AI_PRODUCT` - AI-recommended fishing gear/products
- `CHALLENGE_SPONSOR` - Sponsored fishing challenges
- `BANNER` - Traditional banner ads

#### **AdStatus Enum**
- `DRAFT` - Ad being created
- `ACTIVE` - Currently running
- `PAUSED` - Temporarily stopped
- `COMPLETED` - Campaign finished
- `REJECTED` - Not approved

#### **Core Models**

**NativeAd** - Main advertisement table
- Basic info: title, description, imageUrl, callToAction, targetUrl
- Sponsor: sponsorName, sponsorLogo
- Targeting: targetAudience[], targetSpecies[], targetRegions[], minAge, maxAge
- Budget: budget, spent, cpmPrice, cpcPrice, cpaPrice
- Campaign: startDate, endDate
- Metrics: impressions, clicks, conversions, engagement
- Settings: priority, frequency, maxImpressionsPerUser

**AdImpression** - Track ad views
- Links: ad, user
- Metadata: timestamp, platform, screenType
- Used for frequency capping

**AdClick** - Track ad clicks
- Links: ad, user
- Metadata: timestamp, platform, screenType

**AdConversion** - Track conversions (purchases, signups)
- Links: ad, user
- Data: conversionType, value, timestamp

**SponsoredSpot** - Sponsored locations
- Links: ad
- Location: latitude, longitude, radius
- Info: spotName, description, priority, active

### 2. API Endpoints
**Location**: `apps/backend/src/routes/native-ads.ts`

All routes are registered and ready to use:

#### **GET /api/ads/feed**
Fetch native ads for the feed with intelligent targeting

**Features**:
- Premium user filtering (no ads for premium/pro users)
- Frequency capping (respects maxImpressionsPerUser)
- Intelligent targeting based on:
  - User's catch history (species matching)
  - Geographic region
  - User demographics (age)
  - Audience type (beginner, sportsfisher, etc.)
- CTR-based ranking (better performing ads shown more)
- Returns top 3 most relevant ads

**Request Headers**:
```
x-user-id: <user_id>
```

**Response**:
```json
{
  "ads": [
    {
      "id": "...",
      "type": "FEED_NATIVE",
      "title": "Premium Pike Lures",
      "description": "Catch more pike with our proven lures",
      "imageUrl": "https://...",
      "callToAction": "Shop Now",
      "targetUrl": "https://...",
      "sponsorName": "FishingGear.dk",
      "sponsorLogo": "https://..."
    }
  ]
}
```

#### **POST /api/ads/:id/impression**
Track when an ad is shown to a user

**Body**:
```json
{
  "platform": "ios",
  "screenType": "feed"
}
```

**Response**:
```json
{
  "success": true
}
```

#### **POST /api/ads/:id/click**
Track when a user clicks an ad

**Body**:
```json
{
  "platform": "ios",
  "screenType": "feed"
}
```

#### **POST /api/ads/:id/conversion**
Track when a user completes a desired action

**Body**:
```json
{
  "conversionType": "purchase",
  "value": 299.00
}
```

#### **GET /api/ads/sponsored-spots**
Fetch sponsored fishing spots for the map

**Query Parameters**:
- `lat` - Latitude
- `lng` - Longitude
- `radius` - Search radius in meters (default: 50000)

**Response**:
```json
{
  "spots": [
    {
      "id": "...",
      "spotName": "Premium Pike Lake",
      "description": "Great pike fishing spot sponsored by XYZ",
      "latitude": 55.6761,
      "longitude": 12.5683,
      "priority": 10,
      "ad": { ... }
    }
  ]
}
```

#### **GET /api/ads/ai-products**
Get AI-recommended products based on user's recent catches

**Response**:
```json
{
  "products": [
    {
      "id": "...",
      "title": "Pike Lure Set",
      "description": "Perfect for pike fishing based on your recent catches",
      ...
    }
  ]
}
```

### 3. Frontend Components
**Location**: `apps/mobile/components/NativeAdCard.tsx`

A complete React Native component for displaying native ads in the feed.

**Features**:
- Automatic impression tracking on mount
- Click tracking with URL opening
- Dark mode support via ThemeContext
- Sponsored badge and sponsor info
- Image support with fallback
- Call-to-action button
- Matches feed post styling for native feel

**Usage**:
```tsx
import NativeAdCard from '../components/NativeAdCard';

<NativeAdCard
  ad={adData}
  userId={currentUserId}
  onImpression={(adId) => console.log('Ad viewed:', adId)}
  onClick={(adId) => console.log('Ad clicked:', adId)}
/>
```

## 📋 Next Steps for Full Integration

### 1. Integrate Ads into Feed
**File**: `apps/mobile/app/feed.tsx`

Add ad fetching and insertion into the feed:

```tsx
import NativeAdCard from '../components/NativeAdCard';

// Fetch ads
const [feedAds, setFeedAds] = useState([]);

useEffect(() => {
  fetchFeedAds();
}, []);

const fetchFeedAds = async () => {
  const response = await fetch(`${API_URL}/api/ads/feed`, {
    headers: { 'x-user-id': user.id }
  });
  const data = await response.json();
  setFeedAds(data.ads);
};

// Insert ads every 5th post
const insertAdsIntoFeed = (posts, ads) => {
  const feedWithAds = [...posts];
  ads.forEach((ad, index) => {
    const position = (index + 1) * 5;
    if (position < feedWithAds.length) {
      feedWithAds.splice(position, 0, { type: 'ad', data: ad });
    }
  });
  return feedWithAds;
};

// Render
<FlatList
  data={insertAdsIntoFeed(posts, feedAds)}
  renderItem={({ item }) => {
    if (item.type === 'ad') {
      return <NativeAdCard ad={item.data} userId={user.id} />;
    }
    return <FeedPost post={item} />;
  }}
/>
```

### 2. Add Sponsored Spots to Map
**File**: `apps/mobile/app/map.tsx`

Display sponsored fishing spots:

```tsx
// Fetch sponsored spots based on map region
const fetchSponsoredSpots = async (lat, lng) => {
  const response = await fetch(
    `${API_URL}/api/ads/sponsored-spots?lat=${lat}&lng=${lng}&radius=50000`,
    { headers: { 'x-user-id': user.id } }
  );
  const data = await response.json();
  setSponsoredSpots(data.spots);
};

// Render markers
{sponsoredSpots.map(spot => (
  <Marker
    key={spot.id}
    coordinate={{ latitude: spot.latitude, longitude: spot.longitude }}
    title={spot.spotName}
    description={spot.description}
    pinColor="gold" // Different color for sponsored spots
  />
))}
```

### 3. Add AI Product Recommendations to AI Guide
**File**: `apps/mobile/app/ai-guide.tsx`

Show recommended products in the AI guide:

```tsx
const [recommendedProducts, setRecommendedProducts] = useState([]);

useEffect(() => {
  fetchAIProducts();
}, []);

const fetchAIProducts = async () => {
  const response = await fetch(`${API_URL}/api/ads/ai-products`, {
    headers: { 'x-user-id': user.id }
  });
  const data = await response.json();
  setRecommendedProducts(data.products);
};

// Display products section
{recommendedProducts.length > 0 && (
  <View style={styles.productsSection}>
    <Text style={styles.sectionTitle}>Recommended Gear</Text>
    {recommendedProducts.map(product => (
      <NativeAdCard key={product.id} ad={product} userId={user.id} />
    ))}
  </View>
)}
```

### 4. Create Admin Dashboard (Future)
A web-based admin panel for managing ads:

**Features needed**:
- Create/edit/delete ad campaigns
- Upload images
- Set targeting criteria
- Monitor performance metrics
- View analytics (impressions, clicks, CTR, conversions)
- Manage budgets and billing

### 5. Add Subscription Integration
Update the premium subscription system to disable ads:

**File**: `apps/backend/src/routes/native-ads.ts`

The `shouldShowAds()` function already checks for premium users:

```typescript
async function shouldShowAds(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { premium: true }
  });

  // Don't show ads to premium/pro users
  if (user?.premium?.tier === 'premium' || user?.premium?.tier === 'pro') {
    return false;
  }

  return true;
}
```

## 💰 Monetization Model

### Pricing Strategy
Based on Danish fishing niche market:

- **CPM (Cost Per Mille)**: 50-100 kr per 1000 impressions
- **CPC (Cost Per Click)**: 5-15 kr per click
- **CPA (Cost Per Action)**: 50-200 kr per conversion

### Revenue Projections

**10,000 Active Users**:
- Daily ad impressions: ~50,000
- Monthly impressions: ~1,500,000
- Revenue @ 75 kr CPM: **112,500 kr/month** (€15,000)

**50,000 Active Users**:
- Daily ad impressions: ~250,000
- Monthly impressions: ~7,500,000
- Revenue @ 75 kr CPM: **562,500 kr/month** (€75,000)

### Advertiser Types
1. **Fishing Gear Brands** - Lures, rods, reels
2. **Tackle Shops** - Local fishing stores
3. **Guided Fishing Tours** - Professional guides
4. **Fishing Lodges** - Accommodation
5. **Boat Rentals** - Equipment rental
6. **Outdoor Brands** - Clothing, gear
7. **Fishing Apps/Services** - Complementary services

## 🎯 Key Features

### Smart Targeting
- **Species-based**: Show pike lures to pike anglers
- **Location-based**: Show local tackle shops and guided tours
- **Behavior-based**: Target active users vs. beginners differently
- **Seasonal**: Promote ice fishing gear in winter

### Frequency Capping
- Limit impressions per user per day
- Prevents ad fatigue
- Improves user experience
- Increases ad effectiveness

### Performance Tracking
- Real-time impression tracking
- Click-through rate monitoring
- Conversion tracking with revenue attribution
- A/B testing capability (compare different ad creatives)

### User Experience
- Native design matches feed posts
- Clear "Sponsored" labeling
- One-tap to open advertiser website
- No intrusive pop-ups or interstitials
- Premium users see no ads

## 🔒 Privacy & Compliance

### GDPR Compliance
- Store only necessary data (user ID, timestamps)
- No personal data shared with advertisers
- Users can opt out (via premium subscription)
- Transparent about sponsored content

### Best Practices
- Clear "Sponsored" labels
- Relevant targeting only
- Respect user preferences
- Quality control for advertisers

## 📊 Analytics Dashboard (To Be Built)

Future admin features:

1. **Campaign Overview**
   - Active campaigns
   - Total spend vs. budget
   - Overall performance metrics

2. **Performance Metrics**
   - Impressions, clicks, conversions
   - CTR, CPC, CPM, CPA
   - ROI for advertisers

3. **Audience Insights**
   - Demographics reached
   - Species preferences
   - Geographic distribution
   - Engagement patterns

4. **Revenue Tracking**
   - Daily/weekly/monthly revenue
   - Revenue by advertiser
   - Projected earnings

## 🚀 Launch Checklist

- [x] Database schema created
- [x] API endpoints implemented
- [x] Frontend component created
- [ ] Integrate ads into feed
- [ ] Add sponsored spots to map
- [ ] Add product recommendations to AI guide
- [ ] Create admin dashboard
- [ ] Set up payment processing (Stripe)
- [ ] Create advertiser onboarding flow
- [ ] Test with real advertisers
- [ ] Monitor performance and optimize

## 📝 Sample Ad Creation

Once the admin dashboard is built, creating an ad will look like:

```json
{
  "type": "FEED_NATIVE",
  "status": "ACTIVE",
  "title": "Spro Pike Fighter - 40% Off!",
  "description": "Premium pike lures proven to catch more fish. Limited time offer.",
  "imageUrl": "https://cdn.fishlog.dk/ads/spro-pike-fighter.jpg",
  "callToAction": "Shop Now",
  "targetUrl": "https://tacklestore.dk/spro-pike-fighter",
  "sponsorName": "Tackle Store DK",
  "sponsorLogo": "https://cdn.fishlog.dk/logos/tacklestore.png",
  "targetAudience": ["sportsfisher", "experienced"],
  "targetSpecies": ["Gedde", "Sandart"],
  "targetRegions": ["Denmark", "Copenhagen"],
  "minAge": 18,
  "maxAge": 65,
  "budget": 5000,
  "cpmPrice": 75,
  "startDate": "2025-01-01T00:00:00Z",
  "endDate": "2025-01-31T23:59:59Z",
  "priority": 10,
  "frequency": 5,
  "maxImpressionsPerUser": 3
}
```

## 🎉 Summary

The native advertising system is **fully implemented on the backend** with:
- ✅ Complete database schema
- ✅ 5 API endpoints for ad serving and tracking
- ✅ Intelligent targeting algorithm
- ✅ Frequency capping
- ✅ Performance tracking
- ✅ React Native component for display

**Next step**: Integrate the NativeAdCard component into the feed, map, and AI guide screens to start displaying ads to free users.

This system will provide sustainable revenue while maintaining excellent UX, as requested by the user who "hader paywalls" (hates paywalls).
