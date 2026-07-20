-- Client changes from the 2026-07-08 BTF sync (kanban S2/S4/S5):
--   * Gender reshaped to WOMAN / MAN / TWO_SPIRIT / SELF_DESCRIBE (+ genderSelfDescribe text)
--   * Sex reshaped to MALE / FEMALE / INTERSEX (optional field covers "prefer not to say")
--   * Ancestry verification status (admin-attested)
--   * STATE_ID / SOCIAL_SECURITY_CARD document types (2-of-3 identity proof)
-- Existing rows are mapped inside the enum swaps: MALE->MAN, FEMALE->WOMAN; removed
-- values (NON_BINARY, PREFER_NOT_TO_SAY, OTHER) become NULL so members re-select.

-- CreateEnum
CREATE TYPE "AncestryVerificationStatus" AS ENUM ('UNVERIFIED', 'VERIFIED_DNA', 'VERIFIED_GENEALOGY');

-- AlterEnum (Gender): map old values to the new set
BEGIN;
CREATE TYPE "Gender_new" AS ENUM ('WOMAN', 'MAN', 'TWO_SPIRIT', 'SELF_DESCRIBE');
ALTER TABLE "Enrollment" ALTER COLUMN "gender" TYPE "Gender_new" USING (
  CASE "gender"::text
    WHEN 'MALE' THEN 'MAN'
    WHEN 'FEMALE' THEN 'WOMAN'
    WHEN 'TWO_SPIRIT' THEN 'TWO_SPIRIT'
    WHEN 'SELF_DESCRIBE' THEN 'SELF_DESCRIBE'
    ELSE NULL
  END::"Gender_new"
);
ALTER TYPE "Gender" RENAME TO "Gender_old";
ALTER TYPE "Gender_new" RENAME TO "Gender";
DROP TYPE "Gender_old";
COMMIT;

-- AlterEnum (Sex): PREFER_NOT_TO_SAY becomes NULL (field is optional)
BEGIN;
CREATE TYPE "Sex_new" AS ENUM ('MALE', 'FEMALE', 'INTERSEX');
ALTER TABLE "Enrollment" ALTER COLUMN "sex" TYPE "Sex_new" USING (
  CASE "sex"::text
    WHEN 'MALE' THEN 'MALE'
    WHEN 'FEMALE' THEN 'FEMALE'
    WHEN 'INTERSEX' THEN 'INTERSEX'
    ELSE NULL
  END::"Sex_new"
);
ALTER TYPE "Sex" RENAME TO "Sex_old";
ALTER TYPE "Sex_new" RENAME TO "Sex";
DROP TYPE "Sex_old";
COMMIT;

-- AlterEnum
ALTER TYPE "DocumentType" ADD VALUE 'STATE_ID';
ALTER TYPE "DocumentType" ADD VALUE 'SOCIAL_SECURITY_CARD';

-- AlterTable
ALTER TABLE "Enrollment" ADD COLUMN     "genderSelfDescribe" TEXT;

-- AlterTable
ALTER TABLE "Ancestry" ADD COLUMN     "verificationStatus" "AncestryVerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
ADD COLUMN     "verifiedAt" TIMESTAMP(3),
ADD COLUMN     "verifiedByUserId" TEXT;
