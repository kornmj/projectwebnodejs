-- Update Patients Table - Add Medical History Fields
-- Run this script to add new columns to the patients table


-- Add new columns for medical history and physical measurements
ALTER TABLE patients
ADD COLUMN symptoms TEXT COMMENT 'อาการของผู้ป่วยก่อนเข้ารับการออกกำลังกาย',
ADD COLUMN procedure_history TEXT COMMENT 'หัตถการที่ได้รับมา',
ADD COLUMN weight INT COMMENT 'น้ำหนัก (kg)',
ADD COLUMN height INT COMMENT 'ส่วนสูง (cm)',
ADD COLUMN age INT COMMENT 'อายุ (ปี)',
ADD COLUMN cpet_completed BOOLEAN DEFAULT FALSE COMMENT 'ผ่านโปรแกรม CPET';

-- Verify the changes
DESCRIBE patients;

-- Show sample data
SELECT 
    patient_id,
    phone,
    first_name,
    last_name,
    weight,
    height,
    age,
    cpet_completed
FROM patients
LIMIT 5;
