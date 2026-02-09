-- ==========================================
-- Cardiac Rehab Database - Complete Setup
-- ==========================================
-- ไฟล์ SQL รวมสำหรับ import ทีเดียวจบ
-- เหมาะสำหรับ hosting (InfinityFree, 000webhost, etc.)
-- 
-- ⚠️ หมายเหตุ: ไฟล์นี้ไม่มี VIEW เพราะ hosting บางแห่งไม่รองรับ
-- ==========================================

-- ==========================================
-- 1. สร้าง Table: users
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

-- ==========================================
-- 2. สร้าง Table: patients
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
    symptoms TEXT COMMENT 'อาการของผู้ป่วยก่อนเข้ารับการออกกำลังกาย',
    procedure_history TEXT COMMENT 'หัตถการที่ได้รับมา',
    weight INT COMMENT 'น้ำหนัก (kg)',
    height INT COMMENT 'ส่วนสูง (cm)',
    age INT COMMENT 'อายุ (ปี)',
    cpet_completed BOOLEAN DEFAULT FALSE COMMENT 'ผ่านโปรแกรม CPET',
    created_by INT NOT NULL COMMENT 'Doctor user_id who created this patient',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_phone (phone),
    INDEX idx_national_id (national_id),
    INDEX idx_name (first_name, last_name),
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 3. สร้าง Table: exercise_sessions
-- ==========================================
-- เก็บข้อมูลการออกกำลังกายของผู้ป่วย
CREATE TABLE IF NOT EXISTS exercise_sessions (
    session_id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT NOT NULL,
    session_number INT NOT NULL COMMENT 'Auto-incremented per patient',
    session_date DATE NOT NULL,
    
    -- Vital Signs
    heart_rate INT NOT NULL COMMENT 'Beats per minute',
    bp_systolic INT NOT NULL COMMENT 'Systolic blood pressure',
    bp_diastolic INT NOT NULL COMMENT 'Diastolic blood pressure',
    mets DECIMAL(4,1) NOT NULL COMMENT 'Metabolic Equivalent of Task',
    
    -- Exercise Details
    exercise_method TEXT NOT NULL COMMENT 'Description of exercise method',
    recommendations TEXT NOT NULL COMMENT 'Recommendations for next session',
    ekg_image_path VARCHAR(255) COMMENT 'Path to EKG image file',
    
    -- Staff Responsible
    doctor_id INT NOT NULL COMMENT 'Doctor supervising session',
    therapist_id INT NOT NULL COMMENT 'Physical therapist conducting session',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES users(user_id),
    FOREIGN KEY (therapist_id) REFERENCES users(user_id),
    
    -- Unique constraint: one session number per patient
    UNIQUE KEY unique_patient_session (patient_id, session_number),
    
    -- Indexes for performance
    INDEX idx_patient_date (patient_id, session_date),
    INDEX idx_session_date (session_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Exercise session records for cardiac rehab';

-- ==========================================
-- 4. เพิ่มข้อมูล Test Users
-- ==========================================
-- Password ทั้งหมด: "password123"
-- Hash: $2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi

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

-- ==========================================
-- Setup Complete!
-- ==========================================
-- ✅ Tables Created:
--    - users (หมอและนักกายภาพ)
--    - patients (ผู้ป่วย)
--    - exercise_sessions (ข้อมูลการออกกำลังกาย)
--
-- ✅ Test Users Created:
--    - Username: doctor_somsak | Password: password123 | Role: Doctor
--    - Username: therapist_somchai | Password: password123 | Role: Physical Therapist
--
-- 📝 หมายเหตุ:
--    1. Patient login ใช้: phone เป็น username, national_id (13 หลัก) เป็น password
--    2. ข้อมูล patients จะเพิ่มผ่าน web interface (หมอเท่านั้น)
--    3. ใน production ควรเปลี่ยน password ของ test users
-- ==========================================
