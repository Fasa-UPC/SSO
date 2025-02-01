/*
  Warnings:

  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `student_cards` DROP FOREIGN KEY `student_cards_userId_fkey`;

-- DropTable
DROP TABLE `users`;

-- CreateTable
CREATE TABLE `students` (
    `id` VARCHAR(191) NOT NULL,
    `first_name` VARCHAR(50) NULL,
    `last_name` VARCHAR(50) NULL,
    `student_no` CHAR(7) NOT NULL,
    `username` VARCHAR(50) NOT NULL,
    `password` CHAR(60) NOT NULL,
    `email` VARCHAR(254) NULL,
    `approved` BOOLEAN NOT NULL DEFAULT false,
    `birthDate` DATE NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `students_student_no_key`(`student_no`),
    UNIQUE INDEX `students_username_key`(`username`),
    UNIQUE INDEX `students_email_key`(`email`),
    INDEX `students_student_no_username_idx`(`student_no`, `username`),
    INDEX `students_first_name_last_name_idx`(`first_name`, `last_name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `student_cards` ADD CONSTRAINT `student_cards_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `students`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
