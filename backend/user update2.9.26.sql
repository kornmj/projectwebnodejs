-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               10.4.32-MariaDB - mariadb.org binary distribution
-- Server OS:                    Win64
-- HeidiSQL Version:             12.15.0.7171
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Dumping data for table cardiac_rehab.users: ~5 rows (approximately)
INSERT INTO `users` (`user_id`, `username`, `password`, `email`, `first_name`, `last_name`, `phone`, `role`, `created_at`, `updated_at`) VALUES
	(1, 'doctor_somsak', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'somsak.doctor@cardiac.com', 'สมศักดิ์', 'ใจดี', '081-234-5678', 'doctor', '2026-02-08 13:46:59', '2026-02-08 13:46:59'),
	(2, 'therapist_somchai', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'somchai.therapist@cardiac.com', 'สมชาย', 'รักษ์คน', '089-876-5432', 'physical_therapist', '2026-02-08 13:46:59', '2026-02-08 13:46:59'),
	(3, 'sitha', '$2y$10$r6Xu6vln.MZzbDHNmfhFLu.HUwHI6KmmMxNcEVrqAXLnMs4Au8EhC', 'sitha@gmail.com', 'Sitha', 'Phongphibool', '0818205417', 'doctor', '2026-02-08 13:48:56', '2026-02-08 13:48:56'),
	(6, 'sitha11', '$2y$10$E2RUwo0bh0tIvrcN8z7nd.jE327/hmVEX4610cAhQ6jTO7VuGCl06', 'sitha11@gmail.com', 'Sitha', 'Phongphibool', '0818205417', 'doctor', '2026-02-08 17:03:13', '2026-02-08 17:03:13'),
	(8, 'thanida', '$2y$10$BBa1ruum82Ah2CPBOB1EKOSlDGW8FRUJkkslinqn6rJhm6Ba7z95W', 'pleng.plang42@gmail.com', 'Thanida', 'Gosom', '0955059727', 'physical_therapist', '2026-02-08 17:53:30', '2026-02-08 17:53:30');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
