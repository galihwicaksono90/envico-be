-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Business" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "imagePath" TEXT,
    "filePath" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "asSlide" BOOLEAN NOT NULL DEFAULT true
);
INSERT INTO "new_Business" ("asSlide", "content", "createdAt", "description", "filePath", "id", "imagePath", "title", "updatedAt") SELECT "asSlide", "content", "createdAt", "description", "filePath", "id", "imagePath", "title", "updatedAt" FROM "Business";
DROP TABLE "Business";
ALTER TABLE "new_Business" RENAME TO "Business";
CREATE UNIQUE INDEX "Business_title_key" ON "Business"("title");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
