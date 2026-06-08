-- AlterTable
ALTER TABLE "products" ADD COLUMN     "burnTime" INTEGER,
ADD COLUMN     "giftEligible" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hsnCode" TEXT,
ADD COLUMN     "ingredients" TEXT,
ADD COLUMN     "scentNotes" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "tagline" TEXT,
ADD COLUMN     "waxType" TEXT,
ADD COLUMN     "weight" DOUBLE PRECISION;
