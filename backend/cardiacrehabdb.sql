-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 10, 2026 at 12:45 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `cardiacrehabdb`
--

-- --------------------------------------------------------

--
-- Table structure for table `exercise_sessions`
--

CREATE TABLE `exercise_sessions` (
  `session_id` int(11) NOT NULL,
  `patient_id` int(11) NOT NULL,
  `session_number` int(11) DEFAULT NULL,
  `session_date` datetime NOT NULL,
  `heart_rate` int(11) DEFAULT NULL,
  `bp_systolic` int(11) DEFAULT NULL,
  `bp_diastolic` int(11) DEFAULT NULL,
  `mets` decimal(4,1) DEFAULT NULL,
  `exercise_method` text DEFAULT NULL,
  `recommendations` text DEFAULT NULL,
  `duration_minutes` int(11) DEFAULT NULL,
  `intensity_level` varchar(20) DEFAULT NULL,
  `doctor_id` int(11) DEFAULT NULL,
  `therapist_id` int(11) DEFAULT NULL,
  `ekg_image_path` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `exercise_sessions`
--

INSERT INTO `exercise_sessions` (`session_id`, `patient_id`, `session_number`, `session_date`, `heart_rate`, `bp_systolic`, `bp_diastolic`, `mets`, `exercise_method`, `recommendations`, `duration_minutes`, `intensity_level`, `doctor_id`, `therapist_id`, `ekg_image_path`, `notes`, `created_at`) VALUES
(1, 1, NULL, '2026-02-10 13:16:43', 85, NULL, NULL, NULL, NULL, NULL, 30, NULL, 6, NULL, NULL, NULL, '2026-02-10 06:16:43'),
(2, 2, 1, '2026-02-10 00:00:00', 110, 110, 110, 11.0, 'h][', 'h[o', NULL, NULL, 6, NULL, 'uploads/ekg/2_ekg_1770710640274-972148418.jpg', NULL, '2026-02-10 08:04:00'),
(3, 3, 1, '2026-02-10 00:00:00', 150, 150, 150, 11.0, 'QQSs', 'sQZQs', NULL, NULL, 7, 8, 'uploads/ekg/3_ekg_1770714487638-954387645.jpg', NULL, '2026-02-10 09:08:07');

-- --------------------------------------------------------

--
-- Table structure for table `patient_auth`
--

CREATE TABLE `patient_auth` (
  `patient_id` int(11) NOT NULL,
  `phone` varchar(20) NOT NULL COMMENT 'Username for login',
  `password` varchar(255) NOT NULL COMMENT 'Hashed password',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `patient_auth`
--

INSERT INTO `patient_auth` (`patient_id`, `phone`, `password`, `created_at`, `updated_at`) VALUES
(1, '0812345678', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '2026-02-10 06:16:43', '2026-02-10 06:16:43'),
(2, '0800466825', '$2b$10$HmQdVUEKG95EJZssyT7doOPVs/jKgJZAP4wstH6YGF9CvEJpkub9S', '2026-02-10 07:58:44', '2026-02-10 07:58:44'),
(3, '0844999841', '$2b$10$Wq2Ogsll1tUU4hBYnoNLjODA8ygBjD9KfOebwWotPRA3H0tmvGHFu', '2026-02-10 09:07:16', '2026-02-10 09:07:16');

-- --------------------------------------------------------

--
-- Table structure for table `patient_info`
--

CREATE TABLE `patient_info` (
  `info_id` int(11) NOT NULL,
  `patient_id` int(11) NOT NULL,
  `national_id` varchar(13) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('male','female','other') DEFAULT NULL,
  `created_by` int(11) NOT NULL COMMENT 'Doctor who created this patient',
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `patient_info`
--

INSERT INTO `patient_info` (`info_id`, `patient_id`, `national_id`, `first_name`, `last_name`, `date_of_birth`, `gender`, `created_by`, `updated_at`) VALUES
(1, 1, '1100012345678', 'Manee', 'Mejai', NULL, 'female', 6, '2026-02-10 09:04:29'),
(2, 2, '1129701321534', 'Nochmanit', 'Gosom', NULL, 'male', 6, '2026-02-10 09:04:29'),
(3, 3, '1111111111110', 'Puri', 'Yeddluckjee', NULL, 'female', 7, '2026-02-10 09:07:16');

-- --------------------------------------------------------

--
-- Table structure for table `patient_medical_history`
--

CREATE TABLE `patient_medical_history` (
  `history_id` int(11) NOT NULL,
  `patient_id` int(11) NOT NULL,
  `symptoms` text DEFAULT NULL COMMENT 'อาการ',
  `procedure_history` text DEFAULT NULL COMMENT 'ประวัติหัตถการ',
  `weight` decimal(5,2) DEFAULT NULL COMMENT 'น้ำหนัก (kg)',
  `height` decimal(5,2) DEFAULT NULL COMMENT 'ส่วนสูง (cm)',
  `age` int(11) DEFAULT NULL,
  `cpet_completed` tinyint(1) DEFAULT 0,
  `heart_rate_resting` int(11) DEFAULT NULL COMMENT 'HR ขณะพัก',
  `bp_resting_systolic` int(11) DEFAULT NULL,
  `bp_resting_diastolic` int(11) DEFAULT NULL,
  `recorded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `patient_medical_history`
--

INSERT INTO `patient_medical_history` (`history_id`, `patient_id`, `symptoms`, `procedure_history`, `weight`, `height`, `age`, `cpet_completed`, `heart_rate_resting`, `bp_resting_systolic`, `bp_resting_diastolic`, `recorded_at`) VALUES
(1, 1, 'Tired easily', NULL, 65.50, 160.00, 55, 0, NULL, NULL, NULL, '2026-02-10 06:16:43'),
(2, 2, 'asf', 'asfa', 110.00, 178.00, 21, 1, NULL, NULL, NULL, '2026-02-10 07:58:44'),
(3, 3, 'WAWD', 'DWAd', 110.00, 178.00, 21, 1, NULL, NULL, NULL, '2026-02-10 09:07:16');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL COMMENT 'bcrypt hashed',
  `email` varchar(100) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `role` enum('doctor','physical_therapist','admin') NOT NULL DEFAULT 'doctor',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `username`, `password`, `email`, `first_name`, `last_name`, `phone`, `role`, `created_at`, `updated_at`) VALUES
(6, 'admin', '$2b$10$KZt5dwIwgq47hZenNt8Jc.mU0lVKqsESni8i0a.PBu2bXnm75n2Vu', 'marnoch352@outlook.com', 'Nochmanit', 'Gosom', '0800466825', 'admin', '2026-02-10 09:04:20', '2026-02-10 09:04:20'),
(7, 'sitha', '$2b$10$MKhEcMIcnWltVAMjKowj6eHdzwOeRBc8wKVud92gYSiT7ndh0RWkm', 'sitha@gmail.com', 'Sitha', 'Phongphibool', '0818205417', 'doctor', '2026-02-10 09:05:12', '2026-02-10 09:05:12'),
(8, 'thanida', '$2b$10$SfWg1FzxAMQ73IRFQcgdeuZe/ISQf1GUqUmTYX7xlBFeNJk2wXMWy', 'pleng.plang42@gmail.com', 'Thanida', 'Gosom', '0955059727', 'physical_therapist', '2026-02-10 09:05:18', '2026-02-10 09:05:18');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `exercise_sessions`
--
ALTER TABLE `exercise_sessions`
  ADD PRIMARY KEY (`session_id`),
  ADD KEY `patient_id` (`patient_id`),
  ADD KEY `doctor_id` (`doctor_id`),
  ADD KEY `therapist_id` (`therapist_id`),
  ADD KEY `idx_session_date` (`session_date`);

--
-- Indexes for table `patient_auth`
--
ALTER TABLE `patient_auth`
  ADD PRIMARY KEY (`patient_id`),
  ADD UNIQUE KEY `phone` (`phone`),
  ADD KEY `idx_patient_phone` (`phone`);

--
-- Indexes for table `patient_info`
--
ALTER TABLE `patient_info`
  ADD PRIMARY KEY (`info_id`),
  ADD UNIQUE KEY `patient_id` (`patient_id`),
  ADD UNIQUE KEY `national_id` (`national_id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_patient_name` (`first_name`,`last_name`);

--
-- Indexes for table `patient_medical_history`
--
ALTER TABLE `patient_medical_history`
  ADD PRIMARY KEY (`history_id`),
  ADD KEY `idx_history_patient` (`patient_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_user_role` (`role`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `exercise_sessions`
--
ALTER TABLE `exercise_sessions`
  MODIFY `session_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `patient_auth`
--
ALTER TABLE `patient_auth`
  MODIFY `patient_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `patient_info`
--
ALTER TABLE `patient_info`
  MODIFY `info_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `patient_medical_history`
--
ALTER TABLE `patient_medical_history`
  MODIFY `history_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `exercise_sessions`
--
ALTER TABLE `exercise_sessions`
  ADD CONSTRAINT `exercise_sessions_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patient_auth` (`patient_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `exercise_sessions_ibfk_2` FOREIGN KEY (`doctor_id`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `exercise_sessions_ibfk_3` FOREIGN KEY (`therapist_id`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `patient_info`
--
ALTER TABLE `patient_info`
  ADD CONSTRAINT `patient_info_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patient_auth` (`patient_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `patient_info_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `patient_medical_history`
--
ALTER TABLE `patient_medical_history`
  ADD CONSTRAINT `patient_medical_history_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patient_auth` (`patient_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
