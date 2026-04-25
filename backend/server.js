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


// --- AUTHENTICATION ROUTES ---

// 1. REGISTER (Use this once to create your admin account)
app.post("/auth/register", asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;

  // Hash the password (10 rounds of salt)
  const hashedPassword = await bcrypt.hash(password, 10);

  const [result] = await pool.query(
    "INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)",
    [email, hashedPassword, role || 'Admin']
  );

  res.json({ success: true, message: "User created!", userId: result.insertId });
}));

// 2. LOGIN
app.post("/auth/login", asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
  
  if (users.length === 0) {
    return res.status(401).json({ success: false, error: "Invalid email or password" });
  }

  const user = users[0];

  // Compare the entered password with the hashed password in DB
  const isMatch = await bcrypt.compare(password, user.password_hash);

  if (!isMatch) {
    return res.status(401).json({ success: false, error: "Invalid email or password" });
  }

  // Login successful
  res.json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      role: user.role
    }
  });
}));


//
// 👤 USERS
//

// GET all users
app.get("/users", asyncHandler(async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM users");

  res.json({
    success: true,
    data: rows
  });
}));

// GET one user
app.get("/users/:id", asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    "SELECT * FROM users WHERE user_id = ?",
    [req.params.id]
  );

  if (rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: "User not found"
    });
  }

  res.json({
    success: true,
    data: rows[0]
  });
}));

// CREATE user
app.post("/users", asyncHandler(async (req, res) => {
  const { email, password_hash } = req.body;

  if (!email || !password_hash) {
    return res.status(400).json({
      success: false,
      error: "email and password are required"
    });
  }

  const [result] = await pool.query(
    "INSERT INTO users (email, password_hash) VALUES (?, ?)",
    [email, password_hash]
  );

  res.json({
    success: true,
    data: { id: result.insertId }
  });
}));

// UPDATE user
app.put("/users/:id", asyncHandler(async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({
      success: false,
      error: "name and email are required"
    });
  }

  const [result] = await pool.query(
    "UPDATE users SET name=?, email=? WHERE user_id=?",
    [name, email, req.params.id]
  );

  res.json({
    success: true,
    data: { updated: result.affectedRows }
  });
}));

// DELETE user
app.delete("/users/:id", asyncHandler(async (req, res) => {
  const [result] = await pool.query(
    "DELETE FROM users WHERE user_id=?",
    [req.params.id]
  );

  res.json({
    success: true,
    data: { deleted: result.affectedRows }
  });
}));

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