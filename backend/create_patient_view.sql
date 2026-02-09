-- Create View to Show Patient Records with Creator Names
-- This view joins patients table with users table to display creator names


-- Drop view if exists
DROP VIEW IF EXISTS patients_with_creator;

-- Create view with creator information
CREATE VIEW patients_with_creator AS
SELECT 
    p.patient_id,
    p.phone,
    p.national_id,
    p.first_name,
    p.last_name,
    p.symptoms,
    p.procedure_history,
    p.weight,
    p.height,
    p.age,
    p.cpet_completed,
    p.created_at,
    p.updated_at,
    p.created_by AS created_by_id,
    CONCAT(u.first_name, ' ', u.last_name) AS created_by_name,
    u.username AS created_by_username,
    u.role AS created_by_role
FROM patients p
LEFT JOIN users u ON p.created_by = u.user_id;

-- Test the view
SELECT 
    phone,
    first_name,
    last_name,
    created_by_name,
    created_by_username,
    created_at
FROM patients_with_creator
ORDER BY created_at DESC;
