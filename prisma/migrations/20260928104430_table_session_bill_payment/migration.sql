-- CreateEnum
CREATE TYPE "TableSessionPaymentMethod" AS ENUM ('ONLINE', 'COUNTER');

-- AlterTable
ALTER TABLE "TableSession" ADD COLUMN     "billRequestedAt" TIMESTAMP(3),
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "paymentMethod" "TableSessionPaymentMethod",
ADD COLUMN     "razorpayOrderId" TEXT;
