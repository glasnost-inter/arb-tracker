/*
  Warnings:

  - You are about to drop the column `jiraKey` on the `SideQuest` table. All the data in the column will be lost.
  - Added the required column `ticketCode` to the `SideQuest` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SideQuest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ticketCode" TEXT NOT NULL,
    "instruction" TEXT NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "impactScore" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Open',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_SideQuest" ("createdAt", "dueDate", "id", "impactScore", "instruction", "status") SELECT "createdAt", "dueDate", "id", "impactScore", "instruction", "status" FROM "SideQuest";
DROP TABLE "SideQuest";
ALTER TABLE "new_SideQuest" RENAME TO "SideQuest";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
