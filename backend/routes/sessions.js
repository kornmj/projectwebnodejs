const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Middleware
const isAuthenticated = (req, res, next) => {
    if (req.session.user) next();
    else res.status(401).json({ success: false, message: 'Not authenticated' });
};

const isStaff = (req, res, next) => {
    if (req.session.user && ['doctor', 'physical_therapist'].includes(req.session.user.role)) next();
    else res.status(403).json({ success: false, message: 'Access denied' });
};

// Configure Multer for EKG uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Path: backend/../uploads/ekg/ -> d:/web-project-/uploads/ekg/
        const uploadDir = path.join(__dirname, '../../uploads/ekg/');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const patientId = req.body.patient_id;
        // We need session number but it's generated in DB... PHP logic generated it before save.
        // We can query it or just use timestamp for now to be safe, but PHP used session number.
        // Let's rely on frontend or just unique timestamp + original name.
        // PHP: $patientId . '_' . $sessionNumber . '_' . time() . '.' . $extension;
        // We'll mimic this but might need to query session number inside route. 
        // Multer runs before route handler. Solution: Use simple name first or just timestamp.
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, patientId + '_ekg_' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            cb(null, true);
        } else {
            cb(new Error('Only PNG and JPEG images are allowed'));
        }
    }
});

// GET /api/get_exercise_sessions
router.get('/get_exercise_sessions', isAuthenticated, async (req, res) => {
    const patientId = req.query.patient_id;

    if (!patientId) return res.status(400).json({ success: false, message: 'Patient ID required' });

    // Access Control
    if (req.session.user.role === 'patient' && req.session.user.user_id != patientId) {
        return res.status(403).json({ success: false, message: 'Access denied' });
    }

    try {
        const [sessions] = await db.query(`
            SELECT 
                s.session_id, s.session_number, s.session_date, s.heart_rate,
                s.bp_systolic, s.bp_diastolic, s.mets, s.exercise_method,
                s.recommendations, s.ekg_image_path,
                CONCAT(d.first_name, ' ', d.last_name) as doctor_name,
                CONCAT(t.first_name, ' ', t.last_name) as therapist_name,
                s.created_at
            FROM exercise_sessions s
            LEFT JOIN users d ON s.doctor_id = d.user_id
            LEFT JOIN users t ON s.therapist_id = t.user_id
            WHERE s.patient_id = ?
            ORDER BY s.session_number ASC
        `, [patientId]);

        res.json({ success: true, sessions, total: sessions.length });
    } catch (err) {
        console.error('Get Sessions Error:', err);
        res.status(500).json({ success: false, message: 'Database error' });
    }
});

// GET /api/get_next_session_number
router.get('/get_next_session_number', isAuthenticated, isStaff, async (req, res) => {
    const patientId = req.query.patient_id;
    if (!patientId) return res.status(400).json({ success: false, message: 'Patient ID required' });

    try {
        const [rows] = await db.query('SELECT COALESCE(MAX(session_number), 0) + 1 AS next_session_number FROM exercise_sessions WHERE patient_id = ?', [patientId]);
        res.json({ success: true, next_session_number: rows[0].next_session_number });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Database error' });
    }
});

// POST /api/save_exercise_session
router.post('/save_exercise_session', isAuthenticated, isStaff, upload.single('ekg_image'), async (req, res) => {
    const {
        patient_id, session_date, heart_rate, bp_systolic, bp_diastolic,
        mets, exercise_method, recommendations, doctor_id, therapist_id
    } = req.body;

    if (!req.file) return res.status(400).json({ success: false, message: 'EKG image is required' });

    try {
        // Get next session number (Concurrency issue possible but low risk here)
        const [rows] = await db.query('SELECT COALESCE(MAX(session_number), 0) + 1 AS next_session_number FROM exercise_sessions WHERE patient_id = ?', [patient_id]);
        const sessionNumber = rows[0].next_session_number;

        // DB path (relative for frontend usage)
        // file.path is absolute. We need relative path stored in DB.
        // PHP stored: 'uploads/ekg/filename'.
        // Multer stores full path.
        const dbPath = 'uploads/ekg/' + req.file.filename;

        const [result] = await db.query(`
            INSERT INTO exercise_sessions (
                patient_id, session_number, session_date,
                heart_rate, bp_systolic, bp_diastolic, mets,
                exercise_method, recommendations, ekg_image_path,
                doctor_id, therapist_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            patient_id, sessionNumber, session_date,
            heart_rate, bp_systolic, bp_diastolic, mets,
            exercise_method, recommendations, dbPath,
            doctor_id, therapist_id
        ]);

        res.json({
            success: true,
            session_id: result.insertId,
            session_number: sessionNumber,
            message: 'Exercise session recorded successfully'
        });

    } catch (err) {
        console.error('Save Session Error:', err);
        // Delete file on error
        if (req.file) fs.unlink(req.file.path, () => { });
        res.status(500).json({ success: false, message: 'Failed to save session' });
    }
});

module.exports = router;
