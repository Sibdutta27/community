-- Member feedback / work-order submissions raised from the in-app widget.
-- Client request (2026-07-20 BTF sync): the weekly closed-beta focus groups
-- need a "suggestions box" where testers can report what they see, with a
-- picture, without describing which page they were on.
--
-- `userId` is nullable by design — signed-out visitors can report issues too.

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "message" TEXT NOT NULL,
    "pageUrl" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "userAgent" TEXT,
    "attachmentKey" TEXT,
    "attachmentName" TEXT,
    "attachmentMimeType" TEXT,
    "attachmentSize" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Feedback_userId_idx" ON "Feedback"("userId");

-- CreateIndex
CREATE INDEX "Feedback_createdAt_idx" ON "Feedback"("createdAt");

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ROLLBACK
-- DROP TABLE "Feedback";
