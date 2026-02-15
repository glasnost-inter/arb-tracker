/*
  Warnings:

  - You are about to drop the `ArchivedFollowupTaskAttachment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ArchivedFollowupTaskAttachment";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "ArchivedSideQuest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ticketCode" TEXT NOT NULL,
    "questName" TEXT NOT NULL,
    "instruction" TEXT NOT NULL,
    "requestDate" DATETIME NOT NULL,
    "requestor" TEXT NOT NULL,
    "executor" TEXT,
    "dueDate" DATETIME NOT NULL,
    "finishDate" DATETIME,
    "impactScore" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL,
    "archivedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ArchivedSideQuestFollowUp" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sideQuestId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "action" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL,
    CONSTRAINT "ArchivedSideQuestFollowUp_sideQuestId_fkey" FOREIGN KEY ("sideQuestId") REFERENCES "ArchivedSideQuest" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ArchivedAttachment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filename" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "caption" TEXT,
    "mimeType" TEXT NOT NULL DEFAULT 'application/octet-stream',
    "createdAt" DATETIME NOT NULL,
    "projectId" TEXT,
    "sideQuestId" TEXT,
    "sideQuestFollowUpId" TEXT,
    "archivedFollowupTaskId" TEXT,
    CONSTRAINT "ArchivedAttachment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ArchivedProject" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ArchivedAttachment_sideQuestId_fkey" FOREIGN KEY ("sideQuestId") REFERENCES "ArchivedSideQuest" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ArchivedAttachment_sideQuestFollowUpId_fkey" FOREIGN KEY ("sideQuestFollowUpId") REFERENCES "ArchivedSideQuestFollowUp" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ArchivedAttachment_archivedFollowupTaskId_fkey" FOREIGN KEY ("archivedFollowupTaskId") REFERENCES "ArchivedFollowupTask" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ArchivedAttachment" ("createdAt", "filename", "id", "mimeType", "path", "projectId") SELECT "createdAt", "filename", "id", "mimeType", "path", "projectId" FROM "ArchivedAttachment";
DROP TABLE "ArchivedAttachment";
ALTER TABLE "new_ArchivedAttachment" RENAME TO "ArchivedAttachment";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
