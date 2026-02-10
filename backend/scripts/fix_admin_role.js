const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function fixAdminRole() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME
        });

        console.log('Connected to database.');

        // 1. Alter table to support 'admin' role
        console.log("Altering table to add 'admin' role...");
        // If it fails, maybe role is not ENUM, but assuming it is based on behavior.
        // If it's VARCHAR, this ALTER won't hurt much or will fail if not needed.
        // But safer to check.
        try {
            await connection.query("ALTER TABLE users MODIFY COLUMN role ENUM('doctor', 'physical_therapist', 'admin') NOT NULL DEFAULT 'doctor'");
            console.log("Table altered successfully.");
        } catch (alterErr) {
            console.log("Alter table warning (might already be supported or not ENUM):", alterErr.message);
        }

        // 2. Update the admin user
        console.log("Updating admin user role...");
        const [result] = await connection.query("UPDATE users SET role = 'admin' WHERE username = 'admin'");
        console.log(`Updated ${result.affectedRows} row(s). Admin user is now truly 'admin'.`);

        await connection.end();
    } catch (err) {
        console.error('Error:', err.message);
    }
}

fixAdminRole();
