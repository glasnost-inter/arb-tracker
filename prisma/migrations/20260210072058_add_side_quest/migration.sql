-- CreateTable
CREATE TABLE "SideQuest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jiraKey" TEXT NOT NULL,
    "instruction" TEXT NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "impactScore" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Open',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
