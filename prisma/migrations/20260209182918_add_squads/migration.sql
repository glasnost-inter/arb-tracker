-- CreateTable
CREATE TABLE "Squad" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Squad_name_key" ON "Squad"("name");
