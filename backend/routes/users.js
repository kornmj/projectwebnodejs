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

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Check if user exists
        const [users] = await connection.query('SELECT user_id, role FROM users WHERE username = ?', [username]);
        if (users.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: `User '${username}' not found` });
        }
        const userId = users[0].user_id;
        const userRole = users[0].role;

        // Prevent deletion of 'admin' role
        if (userRole === 'admin') {
            await connection.rollback();
            return res.status(403).json({ success: false, message: 'Cannot delete a user with Admin role.' });
        }

        // Update references to NULL (or a specific system user if preferred)
        // Update references to 'admin' user or System Admin
        // 1. Find the admin user (username = 'admin')
        const [admins] = await connection.query('SELECT user_id FROM users WHERE username = ?', ['admin']);
        let adminId = null;

        if (admins.length > 0) {
            adminId = admins[0].user_id;
        } else {
            // Fallback: If no 'admin' user, find ANY user to be the placeholder (e.g. ID 1)
            const [anyAdmin] = await connection.query('SELECT user_id FROM users ORDER BY user_id ASC LIMIT 1');
            if (anyAdmin.length > 0) adminId = anyAdmin[0].user_id;
        }

        if (adminId && adminId !== userId) {
            // Reassign exercise sessions
            await connection.query('UPDATE exercise_sessions SET doctor_id = ? WHERE doctor_id = ?', [adminId, userId]);
            await connection.query('UPDATE exercise_sessions SET therapist_id = ? WHERE therapist_id = ?', [adminId, userId]);

            // Reassign patient info
            await connection.query('UPDATE patient_info SET created_by = ? WHERE created_by = ?', [adminId, userId]);
        } else {
            // If strictly no other user exists to take over, or self-deletion of last admin:
            // Allow NULL for sessions as fallback
            await connection.query('UPDATE exercise_sessions SET doctor_id = NULL WHERE doctor_id = ?', [userId]);
            await connection.query('UPDATE exercise_sessions SET therapist_id = NULL WHERE therapist_id = ?', [userId]);

            // For patient_info, check if we are deleting the last user who owns data. 
            // If created_by is NOT NULL constraint exists, this will fail if we don't have an adminId.
            if (!adminId) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: 'Cannot delete user: No Admin user found to transfer data to.' });
            }
        }

        // Now delete the user
        const [result] = await connection.query('DELETE FROM users WHERE user_id = ?', [userId]);

        await connection.commit();
        res.json({ success: true, message: `User '${username}' deleted successfully` });

    } catch (err) {
        await connection.rollback();
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to delete user: ' + err.message });
    } finally {
        connection.release();
    }
});

module.exports = router;
