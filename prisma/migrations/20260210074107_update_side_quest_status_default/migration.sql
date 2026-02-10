-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SideQuest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ticketCode" TEXT NOT NULL,
    "questName" TEXT NOT NULL DEFAULT 'Untitled Quest',
    "instruction" TEXT NOT NULL,
    "requestDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requestor" TEXT NOT NULL DEFAULT 'Unknown',
    "executor" TEXT,
    "dueDate" DATETIME NOT NULL,
    "impactScore" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Submited',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_SideQuest" ("createdAt", "dueDate", "executor", "id", "impactScore", "instruction", "questName", "requestDate", "requestor", "status", "ticketCode") SELECT "createdAt", "dueDate", "executor", "id", "impactScore", "instruction", "questName", "requestDate", "requestor", "status", "ticketCode" FROM "SideQuest";
DROP TABLE "SideQuest";
ALTER TABLE "new_SideQuest" RENAME TO "SideQuest";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
