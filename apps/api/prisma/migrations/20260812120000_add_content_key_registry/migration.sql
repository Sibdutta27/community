-- Content key registry: a projection of apps/web/messages/{en,es}.json so the
-- Website Studio knows what exists, what it defaults to, and what may be
-- edited. Additive — one new table, nothing existing is touched.
--
-- Populated by `pnpm --filter yucayekeconnect-server content:sync`, which must
-- be run after this migration and after any change to the catalogs.

-- CreateTable
CREATE TABLE "ContentKey" (
    "id" TEXT NOT NULL,
    "keyPath" TEXT NOT NULL,
    "namespace" TEXT NOT NULL,
    "group" TEXT,
    "defaultEn" TEXT NOT NULL,
    "defaultEs" TEXT NOT NULL,
    "isArrayLeaf" BOOLEAN NOT NULL DEFAULT false,
    "placeholders" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "editable" BOOLEAN NOT NULL DEFAULT false,
    "retiredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ContentKey_keyPath_key" ON "ContentKey"("keyPath");

-- CreateIndex
CREATE INDEX "ContentKey_namespace_group_idx" ON "ContentKey"("namespace", "group");

-- CreateIndex
CREATE INDEX "ContentKey_editable_namespace_idx" ON "ContentKey"("editable", "namespace");

-- CreateIndex
CREATE INDEX "ContentKey_retiredAt_idx" ON "ContentKey"("retiredAt");

-- Rollback:
--   DROP TABLE "ContentKey";
