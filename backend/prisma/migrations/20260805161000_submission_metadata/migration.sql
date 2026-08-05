-- AlterTable
ALTER TABLE "submissions" ADD COLUMN "userAgent" TEXT;
ALTER TABLE "submissions" ADD COLUMN "referrer" TEXT;
ALTER TABLE "submissions" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "submissions_widgetId_deletedAt_idx" ON "submissions"("widgetId", "deletedAt");
