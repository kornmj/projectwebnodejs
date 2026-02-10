const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function checkUsage() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME
        });

        const username = 'thanida';
        console.log(`Checking usage for user: ${username}`);

        const [users] = await connection.query('SELECT user_id FROM users WHERE username = ?', [username]);
        if (users.length === 0) {
            console.log('User not found.');
            await connection.end();
            return;
        }
        const userId = users[0].user_id;
        console.log(`User ID: ${userId}`);

        // Check patient_info (created_by)
        const [patients] = await connection.query('SELECT count(*) as count FROM patient_info WHERE created_by = ?', [userId]);
        console.log(`References in patient_info (created_by): ${patients[0].count}`);

        // Check exercise_sessions (doctor_id)
        const [sessionsDoc] = await connection.query('SELECT count(*) as count FROM exercise_sessions WHERE doctor_id = ?', [userId]);
        console.log(`References in exercise_sessions (doctor_id): ${sessionsDoc[0].count}`);

        // Check exercise_sessions (therapist_id)
        const [sessionsTherapist] = await connection.query('SELECT count(*) as count FROM exercise_sessions WHERE therapist_id = ?', [userId]);
        console.log(`References in exercise_sessions (therapist_id): ${sessionsTherapist[0].count}`);

        await connection.end();
    } catch (err) {
        console.error('Error:', err.message);
    }
}

checkUsage();
