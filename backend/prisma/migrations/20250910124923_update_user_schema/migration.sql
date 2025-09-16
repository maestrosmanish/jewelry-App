/*
  Warnings:

  - You are about to drop the column `nstatus` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `user` DROP COLUMN `nstatus`,
    ADD COLUMN `status` BOOLEAN NOT NULL DEFAULT true;
