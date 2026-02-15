/*
  Warnings:

  - You are about to drop the `FollowupTaskAttachment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SideQuestAttachment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SideQuestFollowUpAttachment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "FollowupTaskAttachment";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "SideQuestAttachment";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "SideQuestFollowUpAttachment";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Attachment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filename" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "caption" TEXT,
    "mimeType" TEXT NOT NULL DEFAULT 'application/octet-stream',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "projectId" TEXT,
    "followupTaskId" TEXT,
    "sideQuestId" TEXT,
    "sideQuestFollowUpId" TEXT,
    CONSTRAINT "Attachment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Attachment_followupTaskId_fkey" FOREIGN KEY ("followupTaskId") REFERENCES "FollowupTask" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Attachment_sideQuestId_fkey" FOREIGN KEY ("sideQuestId") REFERENCES "SideQuest" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Attachment_sideQuestFollowUpId_fkey" FOREIGN KEY ("sideQuestFollowUpId") REFERENCES "SideQuestFollowUp" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Attachment" ("createdAt", "filename", "id", "path", "projectId") SELECT "createdAt", "filename", "id", "path", "projectId" FROM "Attachment";
DROP TABLE "Attachment";
ALTER TABLE "new_Attachment" RENAME TO "Attachment";
CREATE TABLE "new_ArchivedAttachment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filename" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL DEFAULT 'application/octet-stream',
    "projectId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL,
    CONSTRAINT "ArchivedAttachment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ArchivedProject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ArchivedAttachment" ("createdAt", "filename", "id", "path", "projectId") SELECT "createdAt", "filename", "id", "path", "projectId" FROM "ArchivedAttachment";
DROP TABLE "ArchivedAttachment";
ALTER TABLE "new_ArchivedAttachment" RENAME TO "ArchivedAttachment";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
