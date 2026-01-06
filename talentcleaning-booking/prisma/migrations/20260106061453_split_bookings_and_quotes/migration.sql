/*
  Warnings:

  - You are about to drop the column `canceledAt` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `lat` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `lng` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `quoteId` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `reference` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `BookingExtra` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Extra` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Quote` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Booking" DROP CONSTRAINT "Booking_quoteId_fkey";

-- DropForeignKey
ALTER TABLE "public"."BookingExtra" DROP CONSTRAINT "BookingExtra_bookingId_fkey";

-- DropForeignKey
ALTER TABLE "public"."BookingExtra" DROP CONSTRAINT "BookingExtra_extraId_fkey";

-- DropIndex
DROP INDEX "public"."Booking_assignedToId_idx";

-- DropIndex
DROP INDEX "public"."Booking_quoteId_key";

-- DropIndex
DROP INDEX "public"."Booking_reference_key";

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "canceledAt",
DROP COLUMN "lat",
DROP COLUMN "lng",
DROP COLUMN "metadata",
DROP COLUMN "quoteId",
DROP COLUMN "reference",
ALTER COLUMN "endAt" DROP NOT NULL,
ALTER COLUMN "total" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "password";

-- DropTable
DROP TABLE "public"."BookingExtra";

-- DropTable
DROP TABLE "public"."Extra";

-- DropTable
DROP TABLE "public"."Quote";

-- CreateTable
CREATE TABLE "QuoteRequest" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "company" TEXT,
    "serviceType" TEXT,
    "propertySize" TEXT,
    "frequency" TEXT,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuoteRequest_pkey" PRIMARY KEY ("id")
);
