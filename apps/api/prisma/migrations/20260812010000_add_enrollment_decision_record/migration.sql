-- Enrollment decision record: why an application was decided, and who is to be
-- told. Additive only — every column is nullable and the new table starts
-- empty, so existing enrollments are untouched.

-- CreateEnum
CREATE TYPE "NoticeChannel" AS ENUM ('ACCOUNT_EMAIL', 'CONTACT_EMAIL', 'SMS');

-- CreateEnum
CREATE TYPE "NoticeStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'SUPPRESSED');

-- AlterTable
ALTER TABLE "Enrollment"
    ADD COLUMN "decisionReason" TEXT,
    ADD COLUMN "decidedAt" TIMESTAMP(3),
    ADD COLUMN "decidedById" TEXT;

-- CreateTable
CREATE TABLE "EnrollmentNotice" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "channel" "NoticeChannel" NOT NULL,
    "destination" TEXT NOT NULL,
    "status" "NoticeStatus" NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP(3),
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnrollmentNotice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EnrollmentNotice_status_createdAt_idx" ON "EnrollmentNotice"("status", "createdAt");

-- CreateIndex
CREATE INDEX "EnrollmentNotice_enrollmentId_idx" ON "EnrollmentNotice"("enrollmentId");

-- AddForeignKey
ALTER TABLE "EnrollmentNotice"
    ADD CONSTRAINT "EnrollmentNotice_enrollmentId_fkey"
    FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- Rollback:
--   DROP TABLE "EnrollmentNotice";
--   DROP TYPE "NoticeStatus";
--   DROP TYPE "NoticeChannel";
--   ALTER TABLE "Enrollment"
--       DROP COLUMN "decisionReason",
--       DROP COLUMN "decidedAt",
--       DROP COLUMN "decidedById";
