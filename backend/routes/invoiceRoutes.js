import express from 'express';
import db from '../config/db.js';
const router = express.Router();

// GET: Fetch all invoices with Balance calculations (Sync'd for Option A)
router.get('/', async (req, res) => {
    const { businessId } = req.query;
    try {
        const query = `
            SELECT 
                i.*, 
                tr.tax_name,
                COALESCE(SUM(p.amount_paid), 0) AS total_paid,
                (i.total_amount - COALESCE(SUM(p.amount_paid), 0)) AS remaining_balance
            FROM invoices i
            LEFT JOIN tax_rates tr ON i.tax_rate_id = tr.id
            LEFT JOIN payments p ON i.id = p.invoice_id
            WHERE i.business_id = ?
            GROUP BY i.id
            ORDER BY i.created_at DESC
        `;
        
        const [rows] = await db.query(query, [businessId]);
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST: Generate a new invoice (Remains the same)
router.post('/', async (req, res) => {
    const { businessId, customerName, totalAmount, currency, taxId, invoiceNumber } = req.body;

    if (!businessId || !totalAmount || !invoiceNumber) {
        return res.status(400).json({ 
            success: false, 
            message: "Missing required fields" 
        });
    }

    try {
        const [taxResult] = await db.query("SELECT rate FROM tax_rates WHERE id = ?", [taxId]);
        const rate = taxResult.length > 0 ? taxResult[0].rate : 0;
        const taxAmount = totalAmount * rate;

        const query = `
            INSERT INTO invoices 
            (business_id, customer_name, total_amount, currency, tax_rate, tax_amount, tax_rate_id, invoice_number) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await db.query(query, [
            businessId,
            customerName || 'Walk-in Customer',
            totalAmount,
            currency || 'IDR',
            rate,
            taxAmount,
            taxId || null,
            invoiceNumber
        ]);

        res.json({ success: true, message: `Invoice ${invoiceNumber} created successfully!` });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

export default router;