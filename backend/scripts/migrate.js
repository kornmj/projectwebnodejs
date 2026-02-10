const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function migrate() {
    const sqlPath = path.join(__dirname, '../cardiacrehabdb.sql');
    console.log(`Reading SQL file from: ${sqlPath}`);

    try {
        const sqlContent = fs.readFileSync(sqlPath, 'utf8');
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            multipleStatements: true
        });

        console.log('Connected to MySQL server.');

        // Re-create database to ensure clean state
        await connection.query(`DROP DATABASE IF EXISTS \`${process.env.DB_NAME}\`;`);
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
        await connection.query(`USE \`${process.env.DB_NAME}\`;`);

        console.log(`Executing SQL commands on database: ${process.env.DB_NAME}...`);

        // Execute the SQL file content
        await connection.query(sqlContent);

        console.log('✅ Migration completed successfully!');

        // Check tables
        const [rows] = await connection.query('SHOW TABLES;');
        console.log('Current Tables:', rows.map(r => Object.values(r)[0]));

        await connection.end();
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrate();
