-- AlterTable
ALTER TABLE "catches"
  ADD COLUMN IF NOT EXISTS "photoHash" TEXT,
  ADD COLUMN IF NOT EXISTS "exifData" TEXT;
