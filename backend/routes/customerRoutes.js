import express from 'express';
const router = express.Router();
import db from '../config/db.js'; // Adjust path to your db config

// POST: Add customer for specific business
router.post('/', async (req, res) => {
    const { userId, businessId, name, email, phone, address } = req.body;
    try {
        await db.query(
            "INSERT INTO customers (user_id, business_id, name, email, phone, address) VALUES (?, ?, ?, ?, ?, ?)",
            [userId, businessId, name, email, phone, address]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET: List customers for current business
router.get('/', async (req, res) => {
    const { businessId } = req.query;
    try {
        const [rows] = await db.query(
            "SELECT * FROM customers WHERE business_id = ? ORDER BY name ASC", 
            [businessId]
        );
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email, phone, address } = req.body;
    try {
        await db.execute(
            "UPDATE customers SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?",
            [name, email, phone, address, id]
        );
        res.json({ success: true, message: "Customer updated" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// DELETE: Remove customer
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.execute("DELETE FROM customers WHERE id = ?", [id]);
        res.json({ success: true, message: "Customer deleted" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

export default router;