const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Middleware
const isAuthenticated = (req, res, next) => {
    if (req.session.user) next();
    else res.status(401).json({ success: false, message: 'Access denied' });
};

const isStaff = (req, res, next) => {
    if (req.session.user && ['doctor', 'physical_therapist'].includes(req.session.user.role)) next();
    else res.status(403).json({ success: false, message: 'Access denied' });
};

// GET /api/get_staff_list
router.get('/get_staff_list', isAuthenticated, isStaff, async (req, res) => {
    try {
        const [doctors] = await db.query("SELECT user_id, first_name, last_name FROM users WHERE role = 'doctor' ORDER BY first_name, last_name");
        const [therapists] = await db.query("SELECT user_id, first_name, last_name FROM users WHERE role = 'physical_therapist' ORDER BY first_name, last_name");

        res.json({
            success: true,
            doctors,
            therapists
        });
    } catch (err) {
        console.error('Get Staff List Error:', err);
        res.status(500).json({ success: false, message: 'Database error' });
    }
});

module.exports = router;
