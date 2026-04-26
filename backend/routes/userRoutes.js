import express from 'express';
import db from '../config/db.js';

const router = express.Router();

// Helper to catch errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// 1. GET all users
router.get("/", asyncHandler(async (req, res) => {
  const [rows] = await db.query("SELECT * FROM users");
  res.json({ success: true, data: rows });
}));

// 2. GET one user
router.get("/:id", asyncHandler(async (req, res) => {
  const [rows] = await db.query(
    "SELECT * FROM users WHERE id = ?", // Make sure your column name is 'id' or 'user_id'
    [req.params.id]
  );

  if (rows.length === 0) {
    return res.status(404).json({ success: false, error: "User not found" });
  }
  res.json({ success: true, data: rows[0] });
}));

// 3. CREATE user (Manually)
router.post("/", asyncHandler(async (req, res) => {
  const { email, password_hash } = req.body;
  if (!email || !password_hash) {
    return res.status(400).json({ success: false, error: "Email and password are required" });
  }

  const [result] = await db.query(
    "INSERT INTO users (email, password_hash) VALUES (?, ?)",
    [email, password_hash]
  );
  res.json({ success: true, data: { id: result.insertId } });
}));

// 4. UPDATE user
router.put("/:id", asyncHandler(async (req, res) => {
  const { email, role } = req.body; // Changed name to email/role to match your table
  const [result] = await db.query(
    "UPDATE users SET email=?, role=? WHERE id=?",
    [email, role, req.params.id]
  );
  res.json({ success: true, data: { updated: result.affectedRows } });
}));

// 5. DELETE user
router.delete("/:id", asyncHandler(async (req, res) => {
  const [result] = await db.query(
    "DELETE FROM users WHERE id=?",
    [req.params.id]
  );
  res.json({ success: true, data: { deleted: result.affectedRows } });
}));

export default router;