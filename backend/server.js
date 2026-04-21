import express from "express";
import mysql from "mysql2/promise";

const app = express();
app.use(express.json());

const PORT = 3000;

// 🔌 Database connection
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "1234", // change if different
  database: "web"
});

// 🧪 Test DB
app.get("/", (req, res) => {
  try {
    res.json({ message: "DB connected" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB failed" });
  }
});

// 📥 GET user by ID
app.get("/user/:id", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE user_id = ?",
      [req.params.id]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to fetch user" });
  }
});

// ➕ POST create user
app.post("/user", async (req, res) => {
  const { name, email } = req.body;

  try {
    const [result] = await pool.query(
      "INSERT INTO users (name, email) VALUES (?, ?)",
      [name, email]
    );

    res.json({
      message: "user created",
      id: result.insertId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to create user" });
  }
});

// 💰 POST income
app.post("/income", async (req, res) => {
  const { user_id, amount, source, date } = req.body;

  try {
    const [result] = await pool.query(
      "INSERT INTO income (user_id, amount, source, date) VALUES (?, ?, ?, ?)",
      [user_id, amount, source, date]
    );

    res.json({
      message: "income added",
      id: result.insertId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to add income" });
  }
});

// 🗑 DELETE user
app.delete("/user/:id", async (req, res) => {
  try {
    const [result] = await pool.query(
      "DELETE FROM users WHERE user_id = ?",
      [req.params.id]
    );

    res.json({
      message: "user deleted",
      affectedRows: result.affectedRows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to delete user" });
  }
});

// ▶️ Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});