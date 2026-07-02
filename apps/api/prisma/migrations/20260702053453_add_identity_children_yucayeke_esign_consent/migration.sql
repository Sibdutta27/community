-- CreateEnum
CREATE TYPE "Identity" AS ENUM ('ARAWAK', 'KALINAGO', 'GARIFUNA', 'TAINO');

-- AlterEnum
ALTER TYPE "MaritalStatus" ADD VALUE 'DOMESTIC_PARTNERSHIP';

-- AlterTable
ALTER TABLE "Enrollment" ADD COLUMN     "agreedToTerms" BOOLEAN,
ADD COLUMN     "hasChildren" BOOLEAN,
ADD COLUMN     "hasMinorChildren" BOOLEAN,
ADD COLUMN     "identity" "Identity",
ADD COLUMN     "signatureDate" TIMESTAMP(3),
ADD COLUMN     "signatureName" TEXT,
ADD COLUMN     "yucayeke" TEXT,
ADD COLUMN     "yucayekeUnknown" BOOLEAN;
