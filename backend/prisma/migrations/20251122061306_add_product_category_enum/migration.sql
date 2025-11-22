/*
  Warnings:

  - The `category` column on the `Product` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ProductCategory" AS ENUM ('ELECTRONICS', 'FURNITURE', 'FOOD_BEVERAGE', 'CLOTHING', 'RAW_MATERIALS');

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "category",
ADD COLUMN     "category" "ProductCategory";

-- CreateIndex
CREATE INDEX "Product_category_idx" ON "Product"("category");
