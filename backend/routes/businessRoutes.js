import express from 'express';
const router = express.Router();
import db from '../config/db.js';

// GET all businesses for a specific user
router.get('/', async (req, res) => {
    const { userId } = req.query;
    try {
        const [rows] = await db.query("SELECT * FROM businesses WHERE user_id = ?", [userId]);
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST a new business branch
router.post('/', async (req, res) => {
    const { userId, name, address, npwp } = req.body;
    try {
        const [result] = await db.query(
            "INSERT INTO businesses (user_id, name, address, npwp) VALUES (?, ?, ?, ?)",
            [userId, name, address, npwp]
        );
        res.json({ success: true, businessId: result.insertId });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

export default router;