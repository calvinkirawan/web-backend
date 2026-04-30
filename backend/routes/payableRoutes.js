import express from 'express';
import db from '../config/db.js';

const router = express.Router();

// 1. FETCH ALL BILLS (Calculates remaining_balance for the frontend)
router.get('/', async (req, res) => {
    const { businessId } = req.query;
    try {
        const query = `
            SELECT 
                b.*, 
                (b.total_amount - IFNULL(SUM(p.amount_paid), 0)) as remaining_balance
            FROM bills b
            LEFT JOIN bill_payments p ON b.id = p.bill_id
            WHERE b.business_id = ?
            GROUP BY b.id
            ORDER BY b.due_date ASC
        `;
        const [rows] = await db.query(query, [businessId]);
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 2. RECORD PAYMENT (Mirroring your Invoice logic)
router.post('/', async (req, res) => {
    const { billId, amount, method, date } = req.body;

    try {
        // Validation: Get current totals before starting
        const [billRes] = await db.query("SELECT total_amount FROM bills WHERE id = ?", [billId]);
        const [payRes] = await db.query("SELECT SUM(amount_paid) as paid FROM bill_payments WHERE bill_id = ?", [billId]);

        if (billRes.length === 0) return res.status(404).json({ success: false, message: "Bill not found" });

        const grandTotal = parseFloat(billRes[0].total_amount);
        const alreadyPaid = parseFloat(payRes[0].paid) || 0;
        const remaining = grandTotal - alreadyPaid;

        // Overpayment Protection
        if (parseFloat(amount) > (remaining + 0.01)) { // 0.01 buffer for float math
            return res.status(400).json({ 
                success: false, 
                message: `Overpayment detected. Remaining balance is only ${remaining}` 
            });
        }

        await db.query("START TRANSACTION");

        // Step A: Record the new bill payment
        await db.query(
            "INSERT INTO bill_payments (bill_id, amount_paid, payment_method, payment_date) VALUES (?, ?, ?, ?)",
            [billId, amount, method, date]
        );

        // Step B: Re-calculate total paid to determine new status
        const [newPayRes] = await db.query(
            "SELECT SUM(amount_paid) as total_paid FROM bill_payments WHERE bill_id = ?",
            [billId]
        );
        const totalPaidSoFar = parseFloat(newPayRes[0].total_paid) || 0;

        // Step C: Determine Status
        let newStatus = 'Partial';
        if (totalPaidSoFar >= grandTotal) {
            newStatus = 'Paid';
        } else if (totalPaidSoFar <= 0) {
            newStatus = 'Unpaid';
        }

        // Step D: Update the bill record
        await db.query(
            "UPDATE bills SET status = ? WHERE id = ?",
            [newStatus, billId]
        );

        await db.query("COMMIT");
        res.json({ success: true, status: newStatus });

    } catch (err) {
        await db.query("ROLLBACK");
        res.status(500).json({ success: false, error: err.message });
    }
});

export default router;