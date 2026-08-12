-- Website Studio overrides. Additive: three new tables + one enum. The git
-- catalogs stay authoritative; these rows only layer on top, so an empty set
-- of tables renders the site exactly as it ships.

-- CreateEnum
CREATE TYPE "ContentRevisionAction" AS ENUM ('PUBLISHED', 'REVERTED');

-- CreateTable
CREATE TABLE "ContentString" (
    "id" TEXT NOT NULL,
    "contentKeyId" TEXT NOT NULL,
    "keyPath" TEXT NOT NULL,
    "draftEn" TEXT,
    "draftEs" TEXT,
    "publishedEn" TEXT,
    "publishedEs" TEXT,
    "publishedAt" TIMESTAMP(3),
    "publishedBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentString_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ContentString_contentKeyId_key" ON "ContentString"("contentKeyId");
CREATE UNIQUE INDEX "ContentString_keyPath_key" ON "ContentString"("keyPath");
CREATE INDEX "ContentString_publishedAt_idx" ON "ContentString"("publishedAt");
CREATE INDEX "ContentString_updatedAt_idx" ON "ContentString"("updatedAt");

-- AddForeignKey
ALTER TABLE "ContentString"
    ADD CONSTRAINT "ContentString_contentKeyId_fkey"
    FOREIGN KEY ("contentKeyId") REFERENCES "ContentKey"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "ContentRevision" (
    "id" TEXT NOT NULL,
    "contentKeyId" TEXT NOT NULL,
    "keyPath" TEXT NOT NULL,
    "action" "ContentRevisionAction" NOT NULL,
    "fromEn" TEXT,
    "fromEs" TEXT,
    "toEn" TEXT,
    "toEs" TEXT,
    "actorId" TEXT,
    "actorEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentRevision_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContentRevision_contentKeyId_createdAt_idx" ON "ContentRevision"("contentKeyId", "createdAt");
CREATE INDEX "ContentRevision_createdAt_idx" ON "ContentRevision"("createdAt");

-- AddForeignKey
ALTER TABLE "ContentRevision"
    ADD CONSTRAINT "ContentRevision_contentKeyId_fkey"
    FOREIGN KEY ("contentKeyId") REFERENCES "ContentKey"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "ContentVersion" (
    "id" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentVersion_pkey" PRIMARY KEY ("id")
);

-- Rollback:
--   DROP TABLE "ContentRevision";
--   DROP TABLE "ContentString";
--   DROP TABLE "ContentVersion";
--   DROP TYPE "ContentRevisionAction";
