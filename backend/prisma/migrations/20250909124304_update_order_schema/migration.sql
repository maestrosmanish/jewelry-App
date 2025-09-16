-- AlterTable
ALTER TABLE `order` ADD COLUMN `paymentType` ENUM('CASH', 'CARD', 'UPI', 'PAYPAL', 'OTHER') NULL;
