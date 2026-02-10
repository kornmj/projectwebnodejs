const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function fixSchema() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME
        });

        console.log(`Connected to database: ${process.env.DB_NAME}`);

        // Add session_number
        try {
            // Check if column exists first to be safe, or just let ALTER handle error
            await connection.query('ALTER TABLE exercise_sessions ADD COLUMN session_number INT AFTER patient_id');
            console.log('✅ Added column: session_number');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('ℹ️ Column session_number already exists.');
            } else {
                console.error('❌ Error adding session_number:', err.message);
            }
        }

        // Add recommendations
        try {
            await connection.query('ALTER TABLE exercise_sessions ADD COLUMN recommendations TEXT AFTER exercise_method');
            console.log('✅ Added column: recommendations');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('ℹ️ Column recommendations already exists.');
            } else {
                console.error('❌ Error adding recommendations:', err.message);
            }
        }

        // Also update existing records to have session_number = 1 if null (optional)
        // await connection.query('UPDATE exercise_sessions SET session_number = 1 WHERE session_number IS NULL');

        await connection.end();
    } catch (err) {
        console.error('Connection Error:', err.message);
    }
}

fixSchema();
