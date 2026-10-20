-- CreateTable
CREATE TABLE "Url" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Repo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "urlId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "summary" TEXT,
    "hasSsoAd" BOOLEAN NOT NULL DEFAULT false,
    "isMicroservice" BOOLEAN NOT NULL DEFAULT false,
    "lastScannedAt" DATETIME,
    CONSTRAINT "Repo_urlId_fkey" FOREIGN KEY ("urlId") REFERENCES "Url" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Screen" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "repoId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "route" TEXT,
    "frontend" TEXT,
    "backend" TEXT,
    "notes" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Screen_repoId_fkey" FOREIGN KEY ("repoId") REFERENCES "Repo" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ScreenDataSource" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "screenId" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'UNKNOWN',
    "label" TEXT NOT NULL,
    CONSTRAINT "ScreenDataSource_screenId_fkey" FOREIGN KEY ("screenId") REFERENCES "Screen" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ScreenTransition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "repoId" TEXT NOT NULL,
    "fromScreenId" TEXT NOT NULL,
    "toScreenId" TEXT NOT NULL,
    "trigger" TEXT,
    CONSTRAINT "ScreenTransition_fromScreenId_fkey" FOREIGN KEY ("fromScreenId") REFERENCES "Screen" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ScreenTransition_toScreenId_fkey" FOREIGN KEY ("toScreenId") REFERENCES "Screen" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Feature" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "repoId" TEXT,
    "jiraUrlId" TEXT,
    "status" TEXT,
    "completionPct" INTEGER,
    "lastCheckedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Feature_repoId_fkey" FOREIGN KEY ("repoId") REFERENCES "Repo" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Feature_jiraUrlId_fkey" FOREIGN KEY ("jiraUrlId") REFERENCES "Url" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kind" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "requestedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "notes" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "Url_url_key" ON "Url"("url");

-- CreateIndex
CREATE UNIQUE INDEX "Repo_urlId_key" ON "Repo"("urlId");
