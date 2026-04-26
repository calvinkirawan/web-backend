const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes - This connects your modular files
app.use('/auth', authRoutes);

// Health Check (For your demo)
app.get('/', (req, res) => {
    res.send('Accounting Backend is Running 🚀');
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});