/*
  Warnings:

  - You are about to drop the column `label` on the `EventCategory` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "EventCategory" DROP COLUMN "label",
ADD COLUMN     "description" TEXT;
