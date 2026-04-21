import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;

// In-memory data (temporary "database")
let transactions = [];

// Test route
app.get("/", (req, res) => {
  res.json({ message: "API is running" });
});

// Get all transactions
app.get("/transactions", (req, res) => {
  res.json(transactions);
});

// Add transaction
app.post("/transactions", (req, res) => {
  const { amount, type, category } = req.body;

  const newTx = {
    id: Date.now(),
    amount,
    type,
    category
  };

  transactions.push(newTx);
  res.json(newTx);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});