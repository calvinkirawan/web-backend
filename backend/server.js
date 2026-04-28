import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import businessRoutes from './routes/businessRoutes.js';
import productRoutes from './routes/productRoutes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health Check (For your demo)
app.get('/', (req, res) => {
    res.send('Accounting Backend is Running 🚀');
});

// Routes - This connects your modular files
app.use('/auth', authRoutes);

app.use('/users', userRoutes)

app.use('/stats', statsRoutes)

app.use('/customers', customerRoutes)

app.use('/businesses', businessRoutes)

app.use('/products', productRoutes)

app.get('/test-url', (req, res) => {
    res.send("If you see this, the server is working!");
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});