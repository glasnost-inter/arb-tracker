-- CreateTable
CREATE TABLE "FollowupTask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "description" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "dueDate" DATETIME NOT NULL,
    "projectId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FollowupTask_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ArchivedFollowupTask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "description" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "projectArchivedId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ArchivedFollowupTask_projectArchivedId_fkey" FOREIGN KEY ("projectArchivedId") REFERENCES "ArchivedProject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
