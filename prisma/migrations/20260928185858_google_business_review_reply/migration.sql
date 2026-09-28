-- CreateEnum
CREATE TYPE "GoogleConnectionStatus" AS ENUM ('CONNECTED', 'PENDING_LOCATION', 'DISCONNECTED', 'AUTH_ERROR');

-- CreateEnum
CREATE TYPE "GoogleReplyStatus" AS ENUM ('NONE', 'DRAFTED', 'POSTED', 'FAILED');

-- CreateTable
CREATE TABLE "GoogleBusinessConnection" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "status" "GoogleConnectionStatus" NOT NULL DEFAULT 'PENDING_LOCATION',
    "googleAccountName" TEXT,
    "googleLocationName" TEXT,
    "locationTitle" TEXT,
    "autoReplyEnabled" BOOLEAN NOT NULL DEFAULT false,
    "lastSyncAt" TIMESTAMP(3),
    "lastError" TEXT,
    "connectedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoogleBusinessConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoogleBusinessCredential" (
    "id" TEXT NOT NULL,
    "googleBusinessConnectionId" TEXT NOT NULL,
    "encryptedPayload" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoogleBusinessCredential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoogleReview" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "googleBusinessConnectionId" TEXT NOT NULL,
    "googleReviewName" TEXT NOT NULL,
    "reviewerName" TEXT NOT NULL,
    "reviewerPhotoUrl" TEXT,
    "starRating" INTEGER NOT NULL,
    "comment" TEXT,
    "reviewCreatedAt" TIMESTAMP(3) NOT NULL,
    "reviewUpdatedAt" TIMESTAMP(3) NOT NULL,
    "replyStatus" "GoogleReplyStatus" NOT NULL DEFAULT 'NONE',
    "draftReply" TEXT,
    "postedReply" TEXT,
    "repliedAt" TIMESTAMP(3),
    "replyError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoogleReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GoogleBusinessConnection_businessId_key" ON "GoogleBusinessConnection"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "GoogleBusinessCredential_googleBusinessConnectionId_key" ON "GoogleBusinessCredential"("googleBusinessConnectionId");

-- CreateIndex
CREATE UNIQUE INDEX "GoogleReview_googleReviewName_key" ON "GoogleReview"("googleReviewName");

-- CreateIndex
CREATE INDEX "GoogleReview_businessId_idx" ON "GoogleReview"("businessId");

-- CreateIndex
CREATE INDEX "GoogleReview_businessId_replyStatus_idx" ON "GoogleReview"("businessId", "replyStatus");

-- AddForeignKey
ALTER TABLE "GoogleBusinessConnection" ADD CONSTRAINT "GoogleBusinessConnection_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoogleBusinessConnection" ADD CONSTRAINT "GoogleBusinessConnection_connectedById_fkey" FOREIGN KEY ("connectedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoogleBusinessCredential" ADD CONSTRAINT "GoogleBusinessCredential_googleBusinessConnectionId_fkey" FOREIGN KEY ("googleBusinessConnectionId") REFERENCES "GoogleBusinessConnection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoogleReview" ADD CONSTRAINT "GoogleReview_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoogleReview" ADD CONSTRAINT "GoogleReview_googleBusinessConnectionId_fkey" FOREIGN KEY ("googleBusinessConnectionId") REFERENCES "GoogleBusinessConnection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
