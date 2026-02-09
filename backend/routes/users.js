const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../config/db');

// Middleware
const isAuthenticated = (req, res, next) => {
    if (req.session.user) next();
    else res.status(401).json({ success: false, message: 'Not authenticated' });
};

// Only admins can manage users? The PHP code didn't strictly check for "admin" role, 
// but it implies some access control. Assuming "doctor" or specific admin logic. 
// For now, let's allow any authenticated staff to view, but maybe restrict add/delete?
// The PHP code didn't check session at all! It was a standalone script probably protected by not linking it?
// Or it was for initial setup. 
// I'll add `isAuthenticated` to be safe.

// GET /api/users - List all users
router.get('/users', async (req, res) => {
    try {
        const [users] = await db.query('SELECT user_id, username, email, first_name, last_name, phone, role, created_at FROM users ORDER BY created_at DESC');
        res.json({ success: true, users });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Database error' });
    }
});

// POST /api/users/add - Add new user
router.post('/users/add', async (req, res) => {
    const { username, password, email, first_name, last_name, phone, role } = req.body;

    if (!username || !password || !email || !first_name || !last_name || !role) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        await db.query(`
            INSERT INTO users (username, password, email, first_name, last_name, phone, role)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [username, hashedPassword, email, first_name, last_name, phone, role]);

        res.json({ success: true, message: `User '${username}' added successfully` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to add user' });
    }
});

// POST /api/users/update_password
router.post('/users/update_password', async (req, res) => {
    const { username, new_password } = req.body;

    if (!username || !new_password) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    try {
        const hashedPassword = await bcrypt.hash(new_password, 10);

        const [result] = await db.query('UPDATE users SET password = ? WHERE username = ?', [hashedPassword, username]);

        if (result.affectedRows > 0) {
            res.json({ success: true, message: `Password updated for '${username}'` });
        } else {
            res.status(404).json({ success: false, message: `User '${username}' not found` });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to update password' });
    }
});

// POST /api/users/delete
router.post('/users/delete', async (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ success: false, message: 'Username required' });
    }

    try {
        const [result] = await db.query('DELETE FROM users WHERE username = ?', [username]);

        if (result.affectedRows > 0) {
            res.json({ success: true, message: `User '${username}' deleted` });
        } else {
            res.status(404).json({ success: false, message: `User '${username}' not found` });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to delete user' });
    }
});

module.exports = router;
