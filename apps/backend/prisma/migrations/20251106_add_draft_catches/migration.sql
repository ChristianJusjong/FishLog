-- AlterTable
ALTER TABLE "catches"
  ALTER COLUMN "species" DROP NOT NULL,
  ADD COLUMN "isDraft" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "catches_isDraft_idx" ON "catches"("isDraft");
