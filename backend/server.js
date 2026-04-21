import express from "express";
import mysql from "mysql2/promise";

const app = express();
app.use(express.json());

const PORT = 3000;

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "1234",
  database: "web"
});

//
// 👤 USERS
//

// GET all users
app.get("/users", async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM users");
  res.json(rows);
});

// GET single user
app.get("/users/:id", async (req, res) => {
  const [rows] = await pool.query(
    "SELECT * FROM users WHERE user_id = ?",
    [req.params.id]
  );
  res.json(rows[0]);
});

// CREATE user
app.post("/users", async (req, res) => {
  const { name, email } = req.body;

  const [result] = await pool.query(
    "INSERT INTO users (name, email) VALUES (?, ?)",
    [name, email]
  );

  res.json({ id: result.insertId });
});

// DELETE user
app.delete("/users/:id", async (req, res) => {
  const [result] = await pool.query(
    "DELETE FROM users WHERE user_id = ?",
    [req.params.id]
  );

  res.json({ deleted: result.affectedRows });
});

//
// 💰 INCOME
//

// GET user's income
app.get("/users/:id/income", async (req, res) => {
  const [rows] = await pool.query(
    "SELECT * FROM income WHERE user_id = ?",
    [req.params.id]
  );
  res.json(rows);
});

// ADD income
app.post("/users/:id/income", async (req, res) => {
  const { amount, source, date } = req.body;

  const [result] = await pool.query(
    "INSERT INTO income (user_id, amount, source, date) VALUES (?, ?, ?, ?)",
    [req.params.id, amount, source, date]
  );

  res.json({ id: result.insertId });
});

//
// 💸 EXPENSES
//

// GET user's expenses
app.get("/users/:id/expenses", async (req, res) => {
  const [rows] = await pool.query(
    "SELECT * FROM expenses WHERE user_id = ?",
    [req.params.id]
  );
  res.json(rows);
});

// ADD expense
app.post("/users/:id/expenses", async (req, res) => {
  const { amount, category, date } = req.body;

  const [result] = await pool.query(
    "INSERT INTO expenses (user_id, amount, category, date) VALUES (?, ?, ?, ?)",
    [req.params.id, amount, category, date]
  );

  res.json({ id: result.insertId });
});

//
// 📊 REPORT
//

app.get("/users/:id/report", async (req, res) => {
  const user_id = req.params.id;

  const [incomeRows] = await pool.query(
    "SELECT SUM(amount) AS total_income FROM income WHERE user_id = ?",
    [user_id]
  );

  const [expenseRows] = await pool.query(
    "SELECT SUM(amount) AS total_expense FROM expenses WHERE user_id = ?",
    [user_id]
  );

  const total_income = incomeRows[0].total_income || 0;
  const total_expense = expenseRows[0].total_expense || 0;

  res.json({
    user_id,
    total_income,
    total_expense,
    balance: total_income - total_expense
  });
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});