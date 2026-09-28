-- CreateEnum
CREATE TYPE "RatingSentiment" AS ENUM ('MOST_RECOMMENDED', 'WOULD_RECOMMEND', 'OKAY', 'COULD_BE_BETTER');

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "rating" "RatingSentiment";

-- AlterTable
ALTER TABLE "TableSession" ADD COLUMN     "overallRating" "RatingSentiment",
ADD COLUMN     "ratingSubmittedAt" TIMESTAMP(3);
