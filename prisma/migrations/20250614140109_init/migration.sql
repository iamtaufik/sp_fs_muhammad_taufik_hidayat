/*
  Warnings:

  - Made the column `projectId` on table `memberships` required. This step will fail if there are existing NULL values in that column.
  - Made the column `assigneeId` on table `tasks` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "memberships" DROP CONSTRAINT "memberships_projectId_fkey";

-- DropForeignKey
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_assigneeId_fkey";

-- AlterTable
ALTER TABLE "memberships" ALTER COLUMN "projectId" SET NOT NULL;

-- AlterTable
ALTER TABLE "tasks" ALTER COLUMN "assigneeId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
