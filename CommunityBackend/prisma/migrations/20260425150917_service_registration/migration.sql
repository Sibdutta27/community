/*
  Warnings:

  - You are about to drop the `ServiceAppointment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ServiceAppointment" DROP CONSTRAINT "ServiceAppointment_serviceId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceAppointment" DROP CONSTRAINT "ServiceAppointment_userId_fkey";

-- DropTable
DROP TABLE "ServiceAppointment";

-- CreateTable
CREATE TABLE "ServiceRegistration" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "ServiceRegistration_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ServiceRegistration" ADD CONSTRAINT "ServiceRegistration_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRegistration" ADD CONSTRAINT "ServiceRegistration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
