-- DropIndex
DROP INDEX `Category_name_key` ON `category`;

-- AlterTable
ALTER TABLE `category` ADD COLUMN `parentId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Category` ADD CONSTRAINT `Category_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `Category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
