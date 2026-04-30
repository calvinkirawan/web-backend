import express from 'express';
import db from '../config/db.js';

const router = express.Router();

// GET all bills for a business
router.get('/', async (req, res) => {
    try {
        const { businessId } = req.query;
        const [rows] = await db.execute(`
            SELECT b.*, v.name as vendor_name 
            FROM bills b 
            JOIN vendors v ON b.vendor_id = v.id 
            WHERE b.business_id = ?
            ORDER BY b.created_at DESC
        `, [businessId]);
        res.json({ data: rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST a new bill
router.post('/', async (req, res) => {
    try {
        const { businessId, vendorId, totalAmount, currency, taxId } = req.body;
        

        await db.execute(
            `INSERT INTO bills (business_id, vendor_id, total_amount, currency, tax_id) 
             VALUES (?, ?, ?, ?, ?)`,
            [businessId, vendorId, totalAmount, currency, taxId || null]
        );
        
        res.status(201).json({ message: 'Bill recorded successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



export default router;