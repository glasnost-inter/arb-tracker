/*
  Warnings:

  - You are about to drop the column `approvalDate` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `techStack` on the `Project` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "ownerSquad" TEXT NOT NULL,
    "pic" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "docLink" TEXT,
    "submissionDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewDate" DATETIME,
    "decisionDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'Submitted',
    "decision" TEXT,
    "mitigationNotes" TEXT,
    "adrNumber" TEXT,
    "notes" TEXT,
    "slaDuration" INTEGER NOT NULL DEFAULT 5,
    "slaTarget" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Project" ("adrNumber", "createdAt", "decision", "description", "docLink", "id", "mitigationNotes", "name", "notes", "ownerSquad", "pic", "reviewDate", "slaDuration", "slaTarget", "status", "submissionDate", "type", "updatedAt") SELECT "adrNumber", "createdAt", "decision", "description", "docLink", "id", "mitigationNotes", "name", "notes", "ownerSquad", "pic", "reviewDate", "slaDuration", "slaTarget", "status", "submissionDate", "type", "updatedAt" FROM "Project";
DROP TABLE "Project";
ALTER TABLE "new_Project" RENAME TO "Project";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
