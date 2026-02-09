const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session Configuration
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true if using HTTPS
        maxAge: 3600000 // 1 hour
    }
}));

// Serve Static Files (Frontend)
// Assuming frontend is at ../frontend relative to backend/
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Basic Route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Import Routes
const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');
const staffRoutes = require('./routes/staff');
const sessionRoutes = require('./routes/sessions');
const userRoutes = require('./routes/users');

app.use('/api', authRoutes);
app.use('/api', patientRoutes);
app.use('/api', staffRoutes);
app.use('/api', sessionRoutes);
app.use('/api', userRoutes);

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
