import express from 'express';
import db from '../config/db.js';

const router = express.Router();



router.post('/', async (req, res) => {
    const { invoiceId, amount, method, date } = req.body;
    const [invRes] = await db.query("SELECT total_amount FROM invoices WHERE id = ?", [invoiceId]);
    const [payRes] = await db.query("SELECT SUM(amount_paid) as paid FROM payments WHERE invoice_id = ?", [invoiceId]);

    const grandTotal = parseFloat(invRes[0].total_amount);
    const alreadyPaid = parseFloat(payRes[0].paid) || 0;
    const remaining = grandTotal - alreadyPaid;

if (parseFloat(amount) > remaining) {
    return res.status(400).json({ 
        success: false, 
        message: `Overpayment detected. Remaining balance is only ${remaining}` 
    });
}

    try {
        await db.query("START TRANSACTION");

        // 1. Record the new payment
        await db.query(
            "INSERT INTO payments (invoice_id, amount_paid, method, payment_date) VALUES (?, ?, ?, ?)",
            [invoiceId, amount, method, date]
        );

        // 2. Calculate the total paid so far for this invoice
        const [payRes] = await db.query(
            "SELECT SUM(amount_paid) as total_paid FROM payments WHERE invoice_id = ?",
            [invoiceId]
        );
        const totalPaidSoFar = payRes[0].total_paid || 0;

        // 3. Get the original invoice total
        const [invRes] = await db.query(
            "SELECT total_amount FROM invoices WHERE id = ?",
            [invoiceId]
        );
        const grandTotal = invRes[0].total_amount;

        // 4. Determine new status
        let newStatus = 'Partial';
        if (totalPaidSoFar >= grandTotal) {
            newStatus = 'Paid';
        } else if (totalPaidSoFar <= 0) {
            newStatus = 'Unpaid';
        }

        // 5. Update the invoice status
        await db.query(
            "UPDATE invoices SET status = ? WHERE id = ?",
            [newStatus, invoiceId]
        );

        await db.query("COMMIT");
        res.json({ success: true, status: newStatus });
    } catch (err) {
        await db.query("ROLLBACK");
        res.status(500).json({ success: false, error: err.message });
    }
});
export default router;