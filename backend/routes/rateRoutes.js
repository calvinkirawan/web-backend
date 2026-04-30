import express from 'express';
const router = express.Router();
import db from '../config/db.js';

router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM exchange_rates");
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.get('/tax', async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM tax_rates WHERE is_active = 1 ORDER BY tax_name ASC"
        );
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST: Add a new tax rule (Admin/Internal use)
router.post('/tax', async (req, res) => {
    const { tax_name, rate } = req.body;
    try {
        await db.query(
            "INSERT INTO tax_rates (tax_name, rate, is_active) VALUES (?, ?, ?)",
            [tax_name, rate, 1]
        );
        res.json({ success: true, message: "New tax rate added" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

export default router;