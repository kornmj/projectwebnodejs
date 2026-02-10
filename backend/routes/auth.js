const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../config/db');

// Helper to verify password
async function verifyPassword(inputPassword, storedHash) {
    return await bcrypt.compare(inputPassword, storedHash);
}

// POST /api/login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    try {
        // 1. Try finding in 'users' table (Staff)
        let [rows] = await db.query('SELECT user_id, username, password, first_name, last_name, role FROM users WHERE username = ?', [username]);
        let user = rows[0];
        let userType = 'staff';

        // 2. If not found, try 'patients' table
        if (!user) {
            [rows] = await db.query(`
                SELECT 
                    pa.patient_id as user_id, 
                    pa.phone as username, 
                    pa.password, 
                    pi.first_name, 
                    pi.last_name 
                FROM patient_auth pa
                LEFT JOIN patient_info pi ON pa.patient_id = pi.patient_id
                WHERE pa.phone = ?
            `, [username]);
            user = rows[0];
            userType = 'patient';
            if (user) user.role = 'patient';
        }

        // 3. User not found
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // 4. Verify Password
        const match = await verifyPassword(password, user.password);
        if (!match) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // 5. Create Session
        req.session.user = {
            user_id: user.user_id,
            username: user.username,
            role: user.role,
            user_type: userType,
            name: `${user.first_name} ${user.last_name}`
        };

        // 6. Determine Redirect URL
        let redirect = '';
        if (user.role === 'doctor') {
            redirect = '/html/Doctor_dashboard.html';
        } else if (user.role === 'physical_therapist') {
            redirect = '/html/patient_search.html';
        } else if (user.role === 'patient') {
            redirect = `/html/exercise_history.html?patient_id=${user.user_id}`;
        } else {
            redirect = '/index.html';
        }

        // Success Response
        res.json({
            success: true,
            role: user.role,
            user_id: user.user_id,
            name: req.session.user.name,
            redirect: redirect
        });

    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET /api/check_session
router.get('/check_session', (req, res) => {
    if (req.session.user) {
        res.json({
            logged_in: true,
            user_id: req.session.user.user_id,
            username: req.session.user.username,
            role: req.session.user.role,
            user_type: req.session.user.user_type,
            name: req.session.user.name
        });
    } else {
        res.json({ logged_in: false, message: 'Not authenticated' });
    }
});

// POST /api/logout
router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Logout failed' });
        }
        res.clearCookie('connect.sid'); // Default cookie name
        res.json({ success: true, message: 'Logged out successfully' });
    });
});

module.exports = router;
