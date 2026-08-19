/*
  Warnings:

  - You are about to drop the column `category` on the `Product` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "categoryId" TEXT,
    "image" TEXT NOT NULL,
    "overview" TEXT NOT NULL,
    "features" JSONB NOT NULL,
    "applications" JSONB NOT NULL,
    "specs" JSONB NOT NULL,
    "coverImage" TEXT,
    "description" TEXT,
    "detailImages" JSONB,
    "gallery" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("applications", "categoryId", "coverImage", "createdAt", "description", "detailImages", "features", "gallery", "id", "image", "overview", "slug", "specs", "title") SELECT "applications", "categoryId", "coverImage", "createdAt", "description", "detailImages", "features", "gallery", "id", "image", "overview", "slug", "specs", "title" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
