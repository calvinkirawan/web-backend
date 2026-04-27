import express from 'express';
import db from '../config/db.js'; // 1. Double check this path!

const router = express.Router();

router.get('/summary', async (req, res) => {
    const { user_id } = req.query;
    if (!user_id) {
        return res.status(400).json({ success: false, error: "User ID is required" });
    }
    try {
        // 2. Wrap queries in [brackets] because mysql2 returns an array
        const [incomeRows] = await db.query("SELECT SUM(amount) as total FROM income WHERE user_id = ?", [user_id]);
        const [expenseRows] = await db.query("SELECT SUM(amount) as total FROM expenses WHERE user_id = ?", [user_id]);

        // 3. Handle NULL values (if the table is empty, SUM returns null)
        const income = incomeRows[0].total || 0;
        const expenses = expenseRows[0].total || 0;
        
        const profit = income - expenses;
        const tax = income * 0.005; // 0.5% UMKM tax

        res.json({
            success: true,
            data: { income, expenses, profit, tax }
        });
    } catch (err) {
        console.error(err); // 4. Always log the error to your terminal!
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST: Add new income
router.post('/income', async (req, res) => {
    const { userId, source, amount, date } = req.body;

    try {
        await db.query(
            "INSERT INTO income (user_id, source, amount, date) VALUES (?, ?, ?, ?)",
            [userId, source, amount, date]
        );
        res.json({ success: true, message: "Income recorded!" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET: Get all income for a user
router.get('/income', async (req, res) => {
    const { userId } = req.query;
    try {
        const [rows] = await db.query(
            "SELECT * FROM income WHERE user_id = ? ORDER BY date DESC",
            [userId]
        );
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST: /api/stats/expenses
router.post('/expenses', async (req, res) => {
    const { userId, category, description, amount, date } = req.body;
    try {
        await db.query(
            "INSERT INTO expenses (user_id, category, description, amount, date) VALUES (?, ?, ?, ?, ?)",
            [userId, category, description, amount, date]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET: /api/stats/expenses
router.get('/expenses', async (req, res) => {
    const { userId } = req.query; // This captures the ?userId=...
    try {
        const [rows] = await db.query(
            "SELECT * FROM expenses WHERE user_id = ? ORDER BY date DESC",
            [userId]
        );
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

export default router;