/*
  Warnings:

  - A unique constraint covering the columns `[national_code]` on the table `students` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `national_code` to the `students` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `students` ADD COLUMN `national_code` CHAR(10) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `students_national_code_key` ON `students`(`national_code`);
