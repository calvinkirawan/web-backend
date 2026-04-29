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

export default router;