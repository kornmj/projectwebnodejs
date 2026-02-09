-- Create Exercise Sessions Table and Related Structure
-- Phase 1: Database Setup for Exercise Session Management


-- Create exercise_sessions table
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

-- Create view for exercise sessions with staff names
CREATE OR REPLACE VIEW exercise_sessions_with_staff AS
SELECT 
    es.*,
    CONCAT(d.first_name, ' ', d.last_name) AS doctor_name,
    CONCAT(t.first_name, ' ', t.last_name) AS therapist_name,
    p.first_name AS patient_first_name,
    p.last_name AS patient_last_name,
    p.phone AS patient_phone
FROM exercise_sessions es
LEFT JOIN users d ON es.doctor_id = d.user_id
LEFT JOIN users t ON es.therapist_id = t.user_id
LEFT JOIN patients p ON es.patient_id = p.patient_id;

-- Verify table creation
DESCRIBE exercise_sessions;

-- Show the view
SELECT * FROM exercise_sessions_with_staff LIMIT 5;
