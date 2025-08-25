/*
  Warnings:

  - You are about to drop the `assets` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `assignments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `audit_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `departments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `locations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `staff` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('Software', 'Hardware', 'Connectivity', 'Other');

-- CreateEnum
CREATE TYPE "AssetStatus" AS ENUM ('Active', 'Maintenance', 'Decommissioned');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('Admin', 'Member');

-- DropForeignKey
ALTER TABLE "assignments" DROP CONSTRAINT "assignments_assetId_fkey";

-- DropForeignKey
ALTER TABLE "assignments" DROP CONSTRAINT "assignments_locationId_fkey";

-- DropForeignKey
ALTER TABLE "assignments" DROP CONSTRAINT "assignments_staffId_fkey";

-- DropForeignKey
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_assetId_fkey";

-- DropForeignKey
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_staffId_fkey";

-- DropForeignKey
ALTER TABLE "staff" DROP CONSTRAINT "staff_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "staff" DROP CONSTRAINT "staff_userId_fkey";

-- DropTable
DROP TABLE "assets";

-- DropTable
DROP TABLE "assignments";

-- DropTable
DROP TABLE "audit_logs";

-- DropTable
DROP TABLE "departments";

-- DropTable
DROP TABLE "locations";

-- DropTable
DROP TABLE "staff";

-- DropTable
DROP TABLE "users";

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "AssetType" NOT NULL,
    "acquired" TIMESTAMP(3) NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "status" "AssetStatus" NOT NULL,
    "summary" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "technicalDetails" TEXT NOT NULL,
    "subCategory" TEXT NOT NULL,
    "recurrentExpenditure" DOUBLE PRECISION,
    "aiSummary" TEXT,
    "imageUrl" TEXT,
    "ownerId" TEXT,
    "organizationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Staff" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "joined" TIMESTAMP(3) NOT NULL,
    "experience" TEXT NOT NULL,
    "salary" DOUBLE PRECISION NOT NULL,
    "qualificationsScore" INTEGER NOT NULL,
    "bio" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "organizationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppUser" (
    "uid" TEXT NOT NULL,
    "email" TEXT,
    "displayName" TEXT,
    "photoURL" TEXT,
    "organizationId" TEXT,
    "role" "UserRole" DEFAULT 'Member',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppUser_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "logoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Turnover" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Turnover_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Staff_email_key" ON "Staff"("email");

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppUser" ADD CONSTRAINT "AppUser_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Turnover" ADD CONSTRAINT "Turnover_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
