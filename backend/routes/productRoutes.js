import express from 'express';
import db from '../config/db.js';
const router = express.Router();

router.get('/test-url', (req, res) => {
    res.send("If you see this, the server is working!");
});

// POST: Add new product
router.post('/', async (req, res) => {
    const { businessId, name, description, price, category } = req.body;
    try {
        await db.query(
            "INSERT INTO products (business_id, name, description, price, category) VALUES (?, ?, ?, ?, ?)",
            [businessId, name, description, price, category]
        );
        res.json({ success: true, message: "Product added" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET: Fetch products for a specific branch
router.get('/', async (req, res) => {
    const { businessId } = req.query;
    try {
        const [rows] = await db.query(
            "SELECT * FROM products WHERE business_id = ? ORDER BY name ASC", 
            [businessId]
        );
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

export default router;