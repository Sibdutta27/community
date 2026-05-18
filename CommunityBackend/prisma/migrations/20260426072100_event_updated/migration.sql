/*
  Warnings:

  - Added the required column `label` to the `EventCategory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EventCategory" ADD COLUMN     "label" TEXT NOT NULL;
