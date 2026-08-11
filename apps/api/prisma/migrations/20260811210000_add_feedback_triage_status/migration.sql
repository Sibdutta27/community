-- Triage state for member feedback (T7).
--
-- The Feedback table shipped write-only: the widget files rows, nobody can
-- work them. Staff running the weekly closed-beta focus groups need a lane
-- per submission, so the admin surface has something to filter down to.
--
-- RESOLVED and DECLINED are both terminal on purpose — a beta queue is full
-- of duplicates and out-of-scope wishes, and closing those as RESOLVED would
-- overstate how much actually got fixed.
--
-- Existing rows adopt NEW via the column default, so nothing is stranded.

-- CreateEnum
CREATE TYPE "FeedbackStatus" AS ENUM ('NEW', 'IN_REVIEW', 'RESOLVED', 'DECLINED');

-- AlterTable
ALTER TABLE "Feedback" ADD COLUMN     "status" "FeedbackStatus" NOT NULL DEFAULT 'NEW';

-- CreateIndex
CREATE INDEX "Feedback_status_createdAt_idx" ON "Feedback"("status", "createdAt");

-- ROLLBACK
-- DROP INDEX "Feedback_status_createdAt_idx";
-- ALTER TABLE "Feedback" DROP COLUMN "status";
-- DROP TYPE "FeedbackStatus";
