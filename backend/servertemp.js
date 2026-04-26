import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";
import bcrypt from "bcrypt";

const app = express();
app.use(express.json());
app.use(cors());

const PORT = 3000;

//
// 🔌 DATABASE
//
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "db"
});

//
// ⚡ ASYNC HANDLER (no try/catch everywhere)
//
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};





//

//
// 💰 INCOME
//

app.get("/users/:id/income", asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    "SELECT * FROM income WHERE user_id = ?",
    [req.params.id]
  );

  res.json({
    success: true,
    data: rows
  });
}));

app.post("/users/:id/income", asyncHandler(async (req, res) => {
  const { amount, source, date } = req.body;

  if (!amount) {
    return res.status(400).json({
      success: false,
      error: "amount is required"
    });
  }

  const [result] = await pool.query(
    "INSERT INTO income (user_id, amount, source, date) VALUES (?, ?, ?, ?)",
    [req.params.id, amount, source, date]
  );

  res.json({
    success: true,
    data: { id: result.insertId }
  });
}));

//
// 💸 EXPENSES
//

app.get("/users/:id/expenses", asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    "SELECT * FROM expenses WHERE user_id = ?",
    [req.params.id]
  );

  res.json({
    success: true,
    data: rows
  });
}));

app.post("/users/:id/expenses", asyncHandler(async (req, res) => {
  const { amount, category, date } = req.body;

  if (!amount) {
    return res.status(400).json({
      success: false,
      error: "amount is required"
    });
  }

  const [result] = await pool.query(
    "INSERT INTO expenses (user_id, amount, category, date) VALUES (?, ?, ?, ?)",
    [req.params.id, amount, category, date]
  );

  res.json({
    success: true,
    data: { id: result.insertId }
  });
}));

//
// 📊 REPORT
//

app.get("/users/:id/report", asyncHandler(async (req, res) => {
  const user_id = req.params.id;

  const [[income]] = await pool.query(
    "SELECT SUM(amount) AS total_income FROM income WHERE user_id = ?",
    [user_id]
  );

  const [[expense]] = await pool.query(
    "SELECT SUM(amount) AS total_expense FROM expenses WHERE user_id = ?",
    [user_id]
  );

  const total_income = income.total_income || 0;
  const total_expense = expense.total_expense || 0;

  res.json({
    success: true,
    data: {
      user_id,
      total_income,
      total_expense,
      balance: total_income - total_expense
    }
  });
}));

//
// ❌ GLOBAL ERROR HANDLER
//
app.use((err, req, res, next) => {
  console.error("ERROR:", err);

  res.status(500).json({
    success: false,
    error: err.message || "Internal Server Error"
  });
});

//
// ▶️ START SERVER
//
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});