const db = require('./config/db');

async function listUsers() {
    try {
        console.log('--- USERS TABLE ---');
        const [users] = await db.query('SELECT user_id, username, role, password FROM users');
        users.forEach(u => {
            console.log(`ID: ${u.user_id} | User: ${u.username} | Role: ${u.role} | PwdHash: ${u.password.substring(0, 10)}...`);
        });
        console.log('-------------------');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

listUsers();
