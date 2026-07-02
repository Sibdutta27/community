-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('MALE', 'FEMALE', 'INTERSEX', 'PREFER_NOT_TO_SAY');

-- CreateEnum
CREATE TYPE "AncestryRelation" AS ENUM ('MOTHER', 'MATERNAL_GRANDMOTHER', 'MATERNAL_GRANDFATHER', 'FATHER', 'PATERNAL_GRANDMOTHER', 'PATERNAL_GRANDFATHER');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "DocumentType" ADD VALUE 'GENEALOGICAL_RECORDS';
ALTER TYPE "DocumentType" ADD VALUE 'KINSHIP_LETTERS';
ALTER TYPE "DocumentType" ADD VALUE 'ORAL_HISTORY';
ALTER TYPE "DocumentType" ADD VALUE 'DNA_TESTING';

-- DropForeignKey
ALTER TABLE "Address" DROP CONSTRAINT "Address_enrollmentId_fkey";

-- DropForeignKey
ALTER TABLE "EmergencyContact" DROP CONSTRAINT "EmergencyContact_enrollmentId_fkey";

-- DropForeignKey
ALTER TABLE "EnrollmentCulturalConnection" DROP CONSTRAINT "EnrollmentCulturalConnection_culturalConnectionId_fkey";

-- DropForeignKey
ALTER TABLE "EnrollmentCulturalConnection" DROP CONSTRAINT "EnrollmentCulturalConnection_enrollmentId_fkey";

-- DropForeignKey
ALTER TABLE "MaternalLineage" DROP CONSTRAINT "MaternalLineage_enrollmentId_fkey";

-- AlterTable
ALTER TABLE "Enrollment" DROP COLUMN "educationLevel",
DROP COLUMN "languagesSpoken",
DROP COLUMN "maternalLastName",
DROP COLUMN "middleName",
DROP COLUMN "preferredName",
DROP COLUMN "pronouns",
DROP COLUMN "specialSkills",
ADD COLUMN     "sex" "Sex";

-- DropTable
DROP TABLE "Address";

-- DropTable
DROP TABLE "EmergencyContact";

-- DropTable
DROP TABLE "EnrollmentCulturalConnection";

-- DropTable
DROP TABLE "MaternalLineage";

-- DropEnum
DROP TYPE "AddressType";

-- DropEnum
DROP TYPE "LivingStatus";

-- DropEnum
DROP TYPE "RelationType";

-- CreateTable
CREATE TABLE "Ancestry" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "relation" "AncestryRelation" NOT NULL,
    "name" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "nationality" TEXT,
    "municipality" TEXT,
    "yucayeke" TEXT,
    "isBorikuaTaino" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ancestry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Ancestry_enrollmentId_idx" ON "Ancestry"("enrollmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Ancestry_enrollmentId_relation_key" ON "Ancestry"("enrollmentId", "relation");

-- AddForeignKey
ALTER TABLE "Ancestry" ADD CONSTRAINT "Ancestry_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

