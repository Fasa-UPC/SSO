-- CreateTable
CREATE TABLE `users` (
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

    INDEX `users_student_no_username_idx`(`student_no`, `username`),
    INDEX `users_first_name_last_name_idx`(`first_name`, `last_name`),
    UNIQUE INDEX `users_email_username_student_no_key`(`email`, `username`, `student_no`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `student_cards` (
    `id` VARCHAR(191) NOT NULL,
    `img` TEXT NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `student_cards_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `clients` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(50) NOT NULL,
    `secret` TEXT NULL,
    `valid_to` DATETIME(3) NOT NULL,
    `approved` BOOLEAN NOT NULL DEFAULT false,
    `client_uri` TEXT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `student_cards` ADD CONSTRAINT `student_cards_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
