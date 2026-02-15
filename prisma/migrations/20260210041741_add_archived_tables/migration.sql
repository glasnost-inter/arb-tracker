-- CreateTable
CREATE TABLE "ArchivedProject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "ownerSquad" TEXT NOT NULL,
    "pic" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "docLink" TEXT,
    "submissionDate" DATETIME NOT NULL,
    "reviewDate" DATETIME,
    "decisionDate" DATETIME,
    "status" TEXT NOT NULL,
    "decision" TEXT,
    "mitigationNotes" TEXT,
    "adrNumber" TEXT,
    "notes" TEXT,
    "slaDuration" INTEGER NOT NULL,
    "slaTarget" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    "archivedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ArchivedAttachment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filename" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL,
    CONSTRAINT "ArchivedAttachment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ArchivedProject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
