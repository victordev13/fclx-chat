/*
  Warnings:

  - Added the required column `user_id` to the `Chat` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Chat` ADD COLUMN `user_id` VARCHAR(191) NOT NULL;
