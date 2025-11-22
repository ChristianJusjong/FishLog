-- CreateEnum for ad types
CREATE TYPE "AdType" AS ENUM ('FEED_NATIVE', 'SPONSORED_SPOT', 'AI_PRODUCT', 'CHALLENGE_SPONSOR', 'BANNER');

-- CreateEnum for ad status
CREATE TYPE "AdStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'REJECTED');

-- Native Ad table
CREATE TABLE "NativeAd" (
    "id" TEXT NOT NULL,
    "type" "AdType" NOT NULL,
    "status" "AdStatus" NOT NULL DEFAULT 'DRAFT',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "callToAction" TEXT NOT NULL,
    "targetUrl" TEXT NOT NULL,
    "sponsorName" TEXT NOT NULL,
    "sponsorLogo" TEXT,

    -- Targeting
    "targetAudience" TEXT[], -- ['sportsfisher', 'beginner', 'premium_user']
    "targetSpecies" TEXT[], -- ['Gedde', 'Aborre'] etc
    "targetRegions" TEXT[], -- ['Denmark', 'Copenhagen'] etc
    "minAge" INTEGER,
    "maxAge" INTEGER,

    -- Budget & Pricing
    "budget" DECIMAL(10,2),
    "spent" DECIMAL(10,2) DEFAULT 0,
    "cpmPrice" DECIMAL(10,2), -- Cost per 1000 impressions
    "cpcPrice" DECIMAL(10,2), -- Cost per click
    "cpaPrice" DECIMAL(10,2), -- Cost per action

    -- Campaign dates
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),

    -- Performance metrics
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "engagement" INTEGER NOT NULL DEFAULT 0, -- likes, comments, shares

    -- Metadata
    "priority" INTEGER NOT NULL DEFAULT 0, -- Higher = shown more
    "frequency" INTEGER NOT NULL DEFAULT 5, -- Show every N posts
    "maxImpressionsPerUser" INTEGER DEFAULT 3, -- Daily limit per user

    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "NativeAd_pkey" PRIMARY KEY ("id")
);

-- Ad Impression tracking (for frequency capping)
CREATE TABLE "AdImpression" (
    "id" TEXT NOT NULL,
    "adId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "platform" TEXT, -- 'ios', 'android', 'web'
    "screenType" TEXT, -- 'feed', 'map', 'statistics'

    CONSTRAINT "AdImpression_pkey" PRIMARY KEY ("id")
);

-- Ad Click tracking
CREATE TABLE "AdClick" (
    "id" TEXT NOT NULL,
    "adId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "platform" TEXT,
    "screenType" TEXT,

    CONSTRAINT "AdClick_pkey" PRIMARY KEY ("id")
);

-- Ad Conversion tracking (purchases, signups, etc)
CREATE TABLE "AdConversion" (
    "id" TEXT NOT NULL,
    "adId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "conversionType" TEXT NOT NULL, -- 'purchase', 'signup', 'download'
    "value" DECIMAL(10,2), -- Revenue from conversion
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdConversion_pkey" PRIMARY KEY ("id")
);

-- Sponsored Fishing Spots
CREATE TABLE "SponsoredSpot" (
    "id" TEXT NOT NULL,
    "adId" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "radius" DOUBLE PRECISION NOT NULL DEFAULT 1000, -- meters
    "spotName" TEXT NOT NULL,
    "description" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,

    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SponsoredSpot_pkey" PRIMARY KEY ("id")
);

-- Add subscription tier to User model if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='User' AND column_name='subscriptionTier') THEN
        ALTER TABLE "User" ADD COLUMN "subscriptionTier" TEXT DEFAULT 'FREE';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='User' AND column_name='subscriptionStatus') THEN
        ALTER TABLE "User" ADD COLUMN "subscriptionStatus" TEXT DEFAULT 'NONE';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='User' AND column_name='showAds') THEN
        ALTER TABLE "User" ADD COLUMN "showAds" BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Create indexes for performance
CREATE INDEX "NativeAd_status_startDate_endDate_idx" ON "NativeAd"("status", "startDate", "endDate");
CREATE INDEX "NativeAd_type_status_idx" ON "NativeAd"("type", "status");
CREATE INDEX "AdImpression_adId_userId_timestamp_idx" ON "AdImpression"("adId", "userId", "timestamp");
CREATE INDEX "AdImpression_userId_timestamp_idx" ON "AdImpression"("userId", "timestamp");
CREATE INDEX "AdClick_adId_idx" ON "AdClick"("adId");
CREATE INDEX "AdClick_userId_idx" ON "AdClick"("userId");
CREATE INDEX "AdConversion_adId_idx" ON "AdConversion"("adId");
CREATE INDEX "SponsoredSpot_latitude_longitude_idx" ON "SponsoredSpot"("latitude", "longitude");

-- Foreign keys
ALTER TABLE "AdImpression" ADD CONSTRAINT "AdImpression_adId_fkey" FOREIGN KEY ("adId") REFERENCES "NativeAd"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AdImpression" ADD CONSTRAINT "AdImpression_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AdClick" ADD CONSTRAINT "AdClick_adId_fkey" FOREIGN KEY ("adId") REFERENCES "NativeAd"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AdClick" ADD CONSTRAINT "AdClick_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AdConversion" ADD CONSTRAINT "AdConversion_adId_fkey" FOREIGN KEY ("adId") REFERENCES "NativeAd"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AdConversion" ADD CONSTRAINT "AdConversion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SponsoredSpot" ADD CONSTRAINT "SponsoredSpot_adId_fkey" FOREIGN KEY ("adId") REFERENCES "NativeAd"("id") ON DELETE CASCADE ON UPDATE CASCADE;
