/*
  Warnings:

  - You are about to drop the column `otpExpiry` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `user` DROP COLUMN `otpExpiry`,
    ADD COLUMN `otpExpires` DATETIME(3) NULL;
