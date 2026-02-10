const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function checkUsers() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME
        });

        console.log(`Connected to database: ${process.env.DB_NAME}`);

        console.log('\n--- Staff (users table) ---');
        const [users] = await connection.query('SELECT user_id, username, role FROM users');
        console.table(users);

        console.log('\n--- Patients (patient_auth table) ---');
        const [patients] = await connection.query('SELECT patient_id, phone FROM patient_auth');
        console.table(patients);

        await connection.end();
    } catch (err) {
        console.error('Error:', err.message);
    }
}

checkUsers();
