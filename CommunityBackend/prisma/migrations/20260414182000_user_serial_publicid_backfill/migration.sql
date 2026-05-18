-- Backfill migration for databases that were baselined with init marked as applied
-- but did not actually receive all User columns/constraints.

-- 1) Ensure columns exist
ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "serial" BIGINT;

ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "publicId" TEXT;

-- 2) Ensure sequence/default for serial
CREATE SEQUENCE IF NOT EXISTS "User_serial_seq";

ALTER TABLE "User"
ALTER COLUMN "serial" SET DEFAULT nextval('"User_serial_seq"');

-- 3) Backfill serial for old rows where missing
UPDATE "User"
SET "serial" = nextval('"User_serial_seq"')
WHERE "serial" IS NULL;

-- 4) Move sequence ahead of current max(serial)
SELECT setval(
  '"User_serial_seq"',
  COALESCE((SELECT MAX("serial") FROM "User"), 0) + 1,
  false
);

-- 5) Enforce constraints expected by Prisma schema
ALTER TABLE "User"
ALTER COLUMN "serial" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "User_serial_key" ON "User"("serial");
CREATE UNIQUE INDEX IF NOT EXISTS "User_publicId_key" ON "User"("publicId");
