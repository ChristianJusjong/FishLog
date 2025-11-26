-- Add score column to catches table
ALTER TABLE "catches" ADD COLUMN IF NOT EXISTS "score" DOUBLE PRECISION DEFAULT 0;
