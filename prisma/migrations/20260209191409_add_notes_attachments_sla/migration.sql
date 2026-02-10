-- CreateTable
CREATE TABLE "Attachment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filename" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Attachment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "ownerSquad" TEXT NOT NULL,
    "pic" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "techStack" TEXT NOT NULL,
    "docLink" TEXT,
    "apiStatus" TEXT NOT NULL,
    "submissionDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewDate" DATETIME,
    "approvalDate" DATETIME,
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
INSERT INTO "new_Project" ("adrNumber", "apiStatus", "approvalDate", "createdAt", "decision", "description", "docLink", "domain", "id", "name", "notes", "ownerSquad", "pic", "reviewDate", "slaTarget", "status", "submissionDate", "techStack", "type", "updatedAt") SELECT "adrNumber", "apiStatus", "approvalDate", "createdAt", "decision", "description", "docLink", "domain", "id", "name", "notes", "ownerSquad", "pic", "reviewDate", "slaTarget", "status", "submissionDate", "techStack", "type", "updatedAt" FROM "Project";
DROP TABLE "Project";
ALTER TABLE "new_Project" RENAME TO "Project";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
