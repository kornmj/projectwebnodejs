const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function resetPassword() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME
        });

        console.log(`Connected to database: ${process.env.DB_NAME}`);

        // Default password: password123
        const hashedPassword = await bcrypt.hash('password123', 10);
        const username = 'sitha11';

        console.log(`Resetting password for user: ${username}...`);

        const [result] = await connection.query(
            'UPDATE users SET password = ? WHERE username = ?',
            [hashedPassword, username]
        );

        if (result.affectedRows > 0) {
            console.log(`✅ Password for '${username}' has been reset to: password123`);
        } else {
            console.log(`❌ User '${username}' not found in 'users' table.`);

            // Try updating patient_auth if not found in users
            const [resultPatient] = await connection.query(
                'UPDATE patient_auth SET password = ? WHERE phone = ?',
                [hashedPassword, username]
            );

            if (resultPatient.affectedRows > 0) {
                console.log(`✅ Password for patient '${username}' has been reset to: password123`);
            } else {
                console.log(`❌ User/Patient '${username}' not found.`);
            }
        }

        await connection.end();
    } catch (err) {
        console.error('Error:', err.message);
    }
}

resetPassword();
