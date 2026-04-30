import express from 'express';
import db from '../config/db.js';
const router = express.Router();

router.get('/test-url', (req, res) => {
    res.send("If you see this, the server is working!");
});

// POST: Add new product
router.post('/', async (req, res) => {
    const { businessId, name, description, price, category, type } = req.body;
    try {
        await db.query(
            "INSERT INTO products (business_id, name, description, price, category, type) VALUES (?, ?, ?, ?, ?, ?)",
            [businessId, name, description, price, category, type || 'sale']
        );
        res.json({ success: true, message: "Product added" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET: Fetch products for a specific branch
router.get('/', async (req, res) => {
    try {
        const { businessId, type } = req.query;
        let query = 'SELECT * FROM products WHERE business_id = ?';
        let params = [businessId];

        if (type) {
            query += ' AND (type = ? OR type = "both")';
            params.push(type);
        }

        const [products] = await db.execute(query, params);
        res.json({ success: true, data: products });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// --- NEW ROUTES BELOW ---

// PUT: Update an existing product
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description, price, category, type } = req.body;
    
    try {
        const query = `
            UPDATE products 
            SET name = ?, description = ?, price = ?, category = ?, type = ? 
            WHERE id = ?
        `;
        await db.execute(query, [name, description, price, category, type, id]);
        
        res.json({ success: true, message: "Product updated successfully" });
    } catch (err) {
        console.error("Update Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// DELETE: Remove a product
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        await db.execute("DELETE FROM products WHERE id = ?", [id]);
        res.json({ success: true, message: "Product deleted successfully" });
    } catch (err) {
        console.error("Delete Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

export default router;