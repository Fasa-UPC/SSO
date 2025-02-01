-- DropIndex
DROP INDEX `students_student_no_username_idx` ON `students`;

-- CreateIndex
CREATE INDEX `students_username_idx` ON `students`(`username`);

-- CreateIndex
CREATE INDEX `students_student_no_idx` ON `students`(`student_no`);
