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
        phone, first_name, last_name, national_id,
        symptoms, procedure_history, weight, height, age,
        cpet_completed
    } = req.body;

    // Validate required fields
    if (!phone || !first_name || !last_name || !national_id) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Validate National ID
    if (!validateThaiNationalId(national_id)) {
        return res.status(400).json({ success: false, message: 'National ID must be exactly 13 digits' });
    }

    try {
        // Check availability
        const [existingPhone] = await db.query('SELECT patient_id FROM patients WHERE phone = ?', [phone]);
        if (existingPhone.length > 0) {
            return res.status(409).json({ success: false, message: 'Phone number already registered' });
        }

        const [existingId] = await db.query('SELECT patient_id FROM patients WHERE national_id = ?', [national_id]);
        if (existingId.length > 0) {
            return res.status(409).json({ success: false, message: 'National ID already registered' });
        }

        // Hash national_id as password
        const hashedPassword = await bcrypt.hash(national_id, 10);

        // Insert
        const [result] = await db.query(`
            INSERT INTO patients (
                phone, national_id, password, first_name, last_name, 
                symptoms, procedure_history, weight, height, age, 
                cpet_completed, created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            phone, national_id, hashedPassword, first_name, last_name,
            symptoms || null, procedure_history || null, weight || null, height || null, age || null,
            cpet_completed ? 1 : 0, req.session.user.user_id
        ]);

        res.json({
            success: true,
            message: 'Patient added successfully',
            patient_id: result.insertId,
            patient: { phone, first_name, last_name }
        });

    } catch (err) {
        console.error('Add Patient Error:', err);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

// POST /api/delete_patient
router.post('/delete_patient', isAuthenticated, isDoctor, async (req, res) => {
    const { patient_id } = req.body;

    if (!patient_id) {
        return res.status(400).json({ success: false, message: 'Invalid patient ID' });
    }

    try {
        const [patient] = await db.query('SELECT first_name, last_name FROM patients WHERE patient_id = ?', [patient_id]);
        if (patient.length === 0) {
            return res.status(404).json({ success: false, message: 'Patient not found' });
        }

        await db.query('DELETE FROM patients WHERE patient_id = ?', [patient_id]);

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
        const [rows] = await db.query('SELECT patient_id, phone, first_name, last_name, national_id FROM patients WHERE patient_id = ?', [patientId]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Patient not found' });
        }

        const patient = rows[0];
        const nid = patient.national_id;
        // Mask ID: 1-2345-XXXXX-XX-X
        patient.masked_id = `${nid[0]}-${nid.substring(1, 5)}-${nid.substring(5, 10).replace(/\d/g, 'X')}-XX-X`;
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
                p.patient_id, p.phone, p.first_name, p.last_name, p.national_id, p.created_at,
                CONCAT(u.first_name, ' ', u.last_name) as created_by_name
            FROM patients p
            LEFT JOIN users u ON p.created_by = u.user_id
            WHERE p.phone LIKE ?
            ORDER BY p.created_at DESC
            LIMIT 100
        `, [`%${query}%`]);

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
