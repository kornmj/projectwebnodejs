const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function addAdminUser() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME
        });

        console.log('Connected to database.');

        // Check if admin already exists
        const [rows] = await connection.query('SELECT * FROM users WHERE username = ?', ['admin']);
        if (rows.length > 0) {
            console.log('Admin user already exists.');
            await connection.end();
            return;
        }

        // Hash password
        const password = 'adminpassword123'; // Default password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert admin user
        // Note: IF YOU GET AN ERROR HERE about 'role', it means we need to ALTER TABLE first.
        // Let's try inserting with 'doctor' role first if 'admin' is not in ENUM, 
        // OR we can just use text. 
        // Based on previous code, role is likely an ENUM or VARCHAR.
        // Let's try inserting as 'admin' directly. If it fails, user will tell us.

        try {
            await connection.query(`
                INSERT INTO users (username, password, email, first_name, last_name, role)
                VALUES (?, ?, ?, ?, ?, ?)
            `, ['admin', hashedPassword, 'admin@system.local', 'System', 'Administrator', 'admin']);
            console.log('Admin user created successfully.');
            console.log('Username: admin');
            console.log('Password: adminpassword123');
        } catch (insertErr) {
            if (insertErr.code === 'WARN_DATA_TRUNCATED' || insertErr.message.includes('Data truncated')) {
                console.log("Role 'admin' not supported in ENUM. Trying to alter table...");
                await connection.query("ALTER TABLE users MODIFY COLUMN role ENUM('doctor', 'physical_therapist', 'admin') NOT NULL DEFAULT 'doctor'");
                console.log("Table altered. Retrying insert...");
                await connection.query(`
                    INSERT INTO users (username, password, email, first_name, last_name, role)
                    VALUES (?, ?, ?, ?, ?, ?)
                `, ['admin', hashedPassword, 'admin@system.local', 'System', 'Administrator', 'admin']);
                console.log('Admin user created successfully after altering table.');
            } else {
                throw insertErr;
            }
        }

        await connection.end();
    } catch (err) {
        console.error('Error:', err.message);
    }
}

addAdminUser();
