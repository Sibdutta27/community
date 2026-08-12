-- Website Studio: territory presentation overrides + the media library.
-- Additive: three new tables, nothing existing touched. Landed together so the
-- two build lanes never both edit schema.prisma.

-- CreateTable
CREATE TABLE "TerritoryOverride" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "displayName" TEXT,
    "cacique" TEXT,
    "altNames" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "municipalities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" TEXT,
    "publishedAt" TIMESTAMP(3),
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TerritoryOverride_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TerritoryOverride_slug_key" ON "TerritoryOverride"("slug");

-- CreateTable
CREATE TABLE "ContentMedia" (
    "id" TEXT NOT NULL,
    "fileKey" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "altEn" TEXT,
    "altEs" TEXT,
    "uploadedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentMedia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ContentMedia_fileKey_key" ON "ContentMedia"("fileKey");
CREATE INDEX "ContentMedia_createdAt_idx" ON "ContentMedia"("createdAt");

-- CreateTable
CREATE TABLE "ContentImageSlot" (
    "id" TEXT NOT NULL,
    "slotKey" TEXT NOT NULL,
    "mediaId" TEXT,
    "publishedAt" TIMESTAMP(3),
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentImageSlot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ContentImageSlot_slotKey_key" ON "ContentImageSlot"("slotKey");
CREATE INDEX "ContentImageSlot_mediaId_idx" ON "ContentImageSlot"("mediaId");

-- AddForeignKey
ALTER TABLE "ContentImageSlot"
    ADD CONSTRAINT "ContentImageSlot_mediaId_fkey"
    FOREIGN KEY ("mediaId") REFERENCES "ContentMedia"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

-- Rollback:
--   DROP TABLE "ContentImageSlot";
--   DROP TABLE "ContentMedia";
--   DROP TABLE "TerritoryOverride";
