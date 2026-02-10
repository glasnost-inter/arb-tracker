-- CreateTable
CREATE TABLE "SideQuestAttachment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filename" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "sideQuestId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SideQuestAttachment_sideQuestId_fkey" FOREIGN KEY ("sideQuestId") REFERENCES "SideQuest" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SideQuestFollowUpAttachment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filename" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "sideQuestFollowUpId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SideQuestFollowUpAttachment_sideQuestFollowUpId_fkey" FOREIGN KEY ("sideQuestFollowUpId") REFERENCES "SideQuestFollowUp" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
