-- AlterTable
ALTER TABLE "Screen" ADD COLUMN "screenshotUrl" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Repo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "urlId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "summary" TEXT,
    "lastScannedAt" DATETIME,
    CONSTRAINT "Repo_urlId_fkey" FOREIGN KEY ("urlId") REFERENCES "Url" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Repo" ("id", "lastScannedAt", "name", "summary", "urlId") SELECT "id", "lastScannedAt", "name", "summary", "urlId" FROM "Repo";
DROP TABLE "Repo";
ALTER TABLE "new_Repo" RENAME TO "Repo";
CREATE UNIQUE INDEX "Repo_urlId_key" ON "Repo"("urlId");
CREATE TABLE "new_RepoAnalysisVersion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "repoId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "summary" TEXT,
    "screensJson" TEXT NOT NULL,
    "featuresJson" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RepoAnalysisVersion_repoId_fkey" FOREIGN KEY ("repoId") REFERENCES "Repo" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_RepoAnalysisVersion" ("createdAt", "featuresJson", "id", "notes", "repoId", "screensJson", "summary", "versionNumber") SELECT "createdAt", "featuresJson", "id", "notes", "repoId", "screensJson", "summary", "versionNumber" FROM "RepoAnalysisVersion";
DROP TABLE "RepoAnalysisVersion";
ALTER TABLE "new_RepoAnalysisVersion" RENAME TO "RepoAnalysisVersion";
CREATE UNIQUE INDEX "RepoAnalysisVersion_repoId_versionNumber_key" ON "RepoAnalysisVersion"("repoId", "versionNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
