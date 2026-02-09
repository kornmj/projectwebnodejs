-- ==========================================
-- Cardiac Rehab Database Setup Script
-- ==========================================
-- ไฟล์นี้สร้าง database และ table สำหรับระบบ Cardiac Rehab
-- รวมถึงข้อมูล test users (หมอ 1 คน + นักกายภาพ 1 คน)

-- 1. สร้าง Database
-- ==========================================


-- 2. สร้าง Table: users
-- ==========================================
-- เก็บข้อมูล user ของหมอและนักกายภาพ
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL COMMENT 'bcrypt hashed password',
    email VARCHAR(100) NOT NULL UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    role ENUM('doctor', 'physical_therapist') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. สร้าง Table: patients
-- ==========================================
-- เก็บข้อมูลคนไข้ (เพิ่มโดยหมอเท่านั้น)
-- phone = username สำหรับ patient login
-- national_id (13 หลัก) = password สำหรับ patient login
CREATE TABLE IF NOT EXISTS patients (
    patient_id INT AUTO_INCREMENT PRIMARY KEY,
    phone VARCHAR(20) NOT NULL UNIQUE COMMENT 'Username for patient login',
    national_id VARCHAR(13) NOT NULL UNIQUE COMMENT 'Thai National ID (13 digits) - used as password',
    password VARCHAR(255) NOT NULL COMMENT 'Hashed national_id (bcrypt)',
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    created_by INT NOT NULL COMMENT 'Doctor user_id who created this patient',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_phone (phone),
    INDEX idx_national_id (national_id),
    INDEX idx_name (first_name, last_name),
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. เพิ่มข้อมูล Test Users
-- ==========================================
-- หมายเหตุ: password ที่ใช้คือ "password123" สำหรับทุก user (ใช้สำหรับ demo เท่านั้น)
-- Hash ด้วย bcrypt (cost 10): $2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi

-- Test User 1: หมอ
INSERT INTO users (username, password, email, first_name, last_name, phone, role) 
VALUES (
    'doctor_somsak',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'somsak.doctor@cardiac.com',
    'สมศักดิ์',
    'ใจดี',
    '081-234-5678',
    'doctor'
);

-- Test User 2: นักกายภาพบำบัด
INSERT INTO users (username, password, email, first_name, last_name, phone, role) 
VALUES (
    'therapist_somchai',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'somchai.therapist@cardiac.com',
    'สมชาย',
    'รักษ์คน',
    '089-876-5432',
    'physical_therapist'
);

-- 5. ตรวจสอบข้อมูล
-- ==========================================
SELECT * FROM users;

-- แสดงจำนวน users แยกตาม role
SELECT role, COUNT(*) as total 
FROM users 
GROUP BY role;

-- แสดงข้อมูล patients (ถ้ามี)
SELECT patient_id, phone, first_name, last_name, created_at 
FROM patients;

-- ==========================================
-- หมายเหตุสำคัญ:
-- ==========================================
-- 1. Password ทั้งหมดคือ: "password123" สำหรับ staff users (ใช้สำหรับทดสอบเท่านั้น)
-- 2. ใน production ควรเปลี่ยน password และไม่เก็บ password ใน SQL script
-- 3. bcrypt hash นี้สร้างจาก PHP function password_hash('password123', PASSWORD_BCRYPT)
-- 4. สามารถเพิ่ม users เพิ่มเติมได้ตามต้องการ
-- 5. Patients table จะถูกเติมข้อมูลผ่าน web interface (หมอเท่านั้น)
-- 6. Patient login ใช้: username = phone, password = national_id (13 หลัก)
