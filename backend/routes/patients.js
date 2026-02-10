const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../config/db');

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.status(401).json({ success: false, message: 'Not authenticated' });
    }
};

// Middleware to check if user is a doctor
const isDoctor = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'doctor') {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Access denied. Doctors only.' });
    }
};

// Middleware to check if user is doctor or therapist
const isStaff = (req, res, next) => {
    if (req.session.user && ['doctor', 'physical_therapist'].includes(req.session.user.role)) {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Access denied. Doctors and therapists only.' });
    }
};

// Helper: Validate Thai National ID
function validateThaiNationalId(id) {
    if (!id || id.length !== 13 || !/^\d+$/.test(id)) {
        return false;
    }
    // Simple length check for now, can implement checksum if needed
    return true;
}

// POST /api/add_patient
router.post('/add_patient', isAuthenticated, isDoctor, async (req, res) => {
    const {
        phone, first_name, last_name, gender, national_id,
        symptoms, procedure_history, weight, height, age,
        cpet_completed
    } = req.body;

    // Validate required fields
    if (!phone || !first_name || !last_name || !national_id || !gender) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Validate National ID
    if (!validateThaiNationalId(national_id)) {
        return res.status(400).json({ success: false, message: 'National ID must be exactly 13 digits' });
    }

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Check availability
        const [existingPhone] = await connection.query('SELECT patient_id FROM patient_auth WHERE phone = ?', [phone]);
        if (existingPhone.length > 0) {
            await connection.rollback();
            return res.status(409).json({ success: false, message: 'Phone number already registered' });
        }

        const [existingId] = await connection.query('SELECT patient_id FROM patient_info WHERE national_id = ?', [national_id]);
        if (existingId.length > 0) {
            await connection.rollback();
            return res.status(409).json({ success: false, message: 'National ID already registered' });
        }

        // 2. Hash national_id as password
        const hashedPassword = await bcrypt.hash(national_id, 10);

        // 3. Insert into patient_auth
        const [authResult] = await connection.query(
            'INSERT INTO patient_auth (phone, password) VALUES (?, ?)',
            [phone, hashedPassword]
        );
        const patientId = authResult.insertId;

        // 4. Insert into patient_info
        await connection.query(
            'INSERT INTO patient_info (patient_id, national_id, first_name, last_name, gender, created_by) VALUES (?, ?, ?, ?, ?, ?)',
            [patientId, national_id, first_name, last_name, gender, req.session.user.user_id]
        );

        // 5. Insert into patient_medical_history
        await connection.query(
            `INSERT INTO patient_medical_history (
                patient_id, symptoms, procedure_history, weight, height, age, cpet_completed
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                patientId,
                symptoms || null,
                procedure_history || null,
                weight || null,
                height || null,
                age || null,
                cpet_completed ? 1 : 0
            ]
        );

        await connection.commit();

        res.json({
            success: true,
            message: 'Patient added successfully',
            patient_id: patientId,
            patient: { phone, first_name, last_name }
        });

    } catch (err) {
        await connection.rollback();
        console.error('Add Patient Error:', err);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    } finally {
        connection.release();
    }
});

// POST /api/delete_patient
router.post('/delete_patient', isAuthenticated, isDoctor, async (req, res) => {
    const { patient_id } = req.body;

    if (!patient_id) {
        return res.status(400).json({ success: false, message: 'Invalid patient ID' });
    }

    try {
        const [patient] = await db.query('SELECT first_name, last_name FROM patient_info WHERE patient_id = ?', [patient_id]);
        if (patient.length === 0) {
            return res.status(404).json({ success: false, message: 'Patient not found' });
        }

        // Deleting from patient_auth will cascade to patient_info and patient_medical_history
        await db.query('DELETE FROM patient_auth WHERE patient_id = ?', [patient_id]);

        res.json({
            success: true,
            message: 'Patient and all related records deleted successfully',
            patient_name: `${patient[0].first_name} ${patient[0].last_name}`
        });

    } catch (err) {
        console.error('Delete Patient Error:', err);
        res.status(500).json({ success: false, message: 'Failed to delete patient' });
    }
});

// GET /api/get_patient
router.get('/get_patient', isAuthenticated, async (req, res) => {
    const patientId = req.query.patient_id;

    if (!patientId) {
        return res.status(400).json({ success: false, message: 'Patient ID required' });
    }

    try {
        const [rows] = await db.query(`
            SELECT pa.patient_id, pa.phone, pi.first_name, pi.last_name, pi.national_id, pi.gender 
            FROM patient_auth pa
            JOIN patient_info pi ON pa.patient_id = pi.patient_id
            WHERE pa.patient_id = ?
        `, [patientId]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Patient not found' });
        }

        const patient = rows[0];
        const nid = patient.national_id;
        // Mask ID: 1-2345-XXXXX-XX-X
        patient.masked_id = nid ? `${nid[0]}-${nid.substring(1, 5)}-${nid.substring(5, 10).replace(/\d/g, 'X')}-XX-X` : 'N/A';
        delete patient.national_id;

        res.json({ success: true, patient });

    } catch (err) {
        console.error('Get Patient Error:', err);
        res.status(500).json({ success: false, message: 'Database error' });
    }
});

// GET /api/search_patients
router.get('/search_patients', isAuthenticated, isStaff, async (req, res) => {
    const query = req.query.query;

    if (!query) {
        return res.json({ success: true, count: 0, patients: [] });
    }

    try {
        const [patients] = await db.query(`
            SELECT 
                pa.patient_id, pa.phone, pi.first_name, pi.last_name, pi.national_id, pi.gender, pa.created_at,
                CONCAT(u.first_name, ' ', u.last_name) as created_by_name
            FROM patient_auth pa
            JOIN patient_info pi ON pa.patient_id = pi.patient_id
            LEFT JOIN users u ON pi.created_by = u.user_id
            WHERE pa.phone LIKE ? OR pi.first_name LIKE ? OR pi.last_name LIKE ?
            ORDER BY pa.created_at DESC
            LIMIT 100
        `, [`%${query}%`, `%${query}%`, `%${query}%`]);

        // Mask IDs
        patients.forEach(p => {
            if (p.national_id && p.national_id.length >= 13) {
                const nid = p.national_id;
                p.masked_id = `${nid[0]}-${nid.substring(1, 5)}-${nid.substring(5, 8)}XX-XX-X`;
            } else {
                p.masked_id = 'Invalid ID';
            }
            delete p.national_id;
        });

        res.json({ success: true, count: patients.length, patients });

    } catch (err) {
        console.error('Search Error:', err);
        res.status(500).json({ success: false, message: 'An error occurred during search' });
    }
});

module.exports = router;
