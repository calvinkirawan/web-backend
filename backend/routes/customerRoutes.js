import express from 'express';
const router = express.Router();
import db from '../config/db.js'; // Adjust path to your db config

// POST: Add new customer
router.post('/', async (req, res) => {
    const { userId, name, email, address } = req.body;
    try {
        await db.query(
            "INSERT INTO customers (user_id, name, email, address) VALUES (?, ?, ?, ?)",
            [userId, name, email, address]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET: Get all customers for a user
router.get('/', async (req, res) => {
    const { userId } = req.query;
    try {
        const [rows] = await db.query("SELECT * FROM customers WHERE user_id = ?", [userId]);
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

export default router;