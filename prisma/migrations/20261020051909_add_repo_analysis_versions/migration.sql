-- CreateTable
CREATE TABLE "RepoAnalysisVersion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "repoId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "summary" TEXT,
    "hasSsoAd" BOOLEAN NOT NULL DEFAULT false,
    "isMicroservice" BOOLEAN NOT NULL DEFAULT false,
    "screensJson" TEXT NOT NULL,
    "featuresJson" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RepoAnalysisVersion_repoId_fkey" FOREIGN KEY ("repoId") REFERENCES "Repo" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "RepoAnalysisVersion_repoId_versionNumber_key" ON "RepoAnalysisVersion"("repoId", "versionNumber");
