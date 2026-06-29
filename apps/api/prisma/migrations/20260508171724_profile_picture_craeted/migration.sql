-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_enrollmentId_fkey";

-- AlterTable
ALTER TABLE "Document" ALTER COLUMN "enrollmentId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
