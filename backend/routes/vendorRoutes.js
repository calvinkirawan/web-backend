import express from 'express';
import db from '../config/db.js'; // Adjust this path to your db config

const router = express.Router(); // Note the Capital 'R'

// GET all vendors
router.get('/', async (req, res) => {
    try {
        const { businessId } = req.query;
        const [vendors] = await db.execute(
            'SELECT * FROM vendors WHERE business_id = ?', 
            [businessId]
        );
        res.json({ data: vendors });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST new vendor
router.post('/', async (req, res) => {
    try {
        const { name, email, phone, address, businessId } = req.body;
        await db.execute(
            'INSERT INTO vendors (name, email, phone, address, business_id) VALUES (?, ?, ?, ?, ?)',
            [name, email, phone, address, businessId]
        );
        res.status(201).json({ message: 'Vendor created' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email, phone, address } = req.body;
    try {
        await db.execute(
            "UPDATE vendors SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?",
            [name, email, phone, address, id]
        );
        res.json({ success: true, message: "Vendor updated" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// DELETE: Remove vendor
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.execute("DELETE FROM vendors WHERE id = ?", [id]);
        res.json({ success: true, message: "Vendor deleted" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

export default router;