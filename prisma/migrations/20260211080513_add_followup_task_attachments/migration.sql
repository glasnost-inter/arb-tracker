-- CreateTable
CREATE TABLE "FollowupTaskAttachment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filename" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "followupTaskId" TEXT NOT NULL,
    CONSTRAINT "FollowupTaskAttachment_followupTaskId_fkey" FOREIGN KEY ("followupTaskId") REFERENCES "FollowupTask" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ArchivedFollowupTaskAttachment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filename" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivedFollowupTaskId" TEXT NOT NULL,
    CONSTRAINT "ArchivedFollowupTaskAttachment_archivedFollowupTaskId_fkey" FOREIGN KEY ("archivedFollowupTaskId") REFERENCES "ArchivedFollowupTask" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
