import express from 'express';
import db from '../config/db.js'; // Ensure this path is correct
import bcrypt from 'bcrypt';

const router = express.Router();

// Helper to catch errors (if you don't have the express-async-handler package)
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// --- AUTHENTICATION ROUTES ---

// 1. REGISTER
// Note: Path is just "/" because the "/auth" prefix is added in server.js
router.post("/register", asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const [result] = await db.query(
    "INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)",
    [email, hashedPassword, role || 'Admin']
  );

  res.json({ success: true, message: "User created!", userId: result.insertId });
}));

// 2. LOGIN
router.post("/login", asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
  
  if (users.length === 0) {
    return res.status(401).json({ success: false, error: "Invalid email or password" });
  }

  const user = users[0];
  const isMatch = await bcrypt.compare(password, user.password_hash);

  if (!isMatch) {
    return res.status(401).json({ success: false, error: "Invalid email or password" });
  }

  res.json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      role: user.role
    }
  });
}));

export default router;