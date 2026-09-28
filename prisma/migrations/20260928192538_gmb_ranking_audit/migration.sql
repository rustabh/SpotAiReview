-- AlterTable
ALTER TABLE "GoogleBusinessConnection" ADD COLUMN     "lastAuditAt" TIMESTAMP(3),
ADD COLUMN     "lastAuditChecklist" JSONB,
ADD COLUMN     "lastAuditScore" INTEGER,
ADD COLUMN     "lastAuditSummary" TEXT;
