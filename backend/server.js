import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import businessRoutes from './routes/businessRoutes.js';
import productRoutes from './routes/productRoutes.js';
import rateRoutes from './routes/rateRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import vendorRoutes from './routes/vendorRoutes.js';
import billRoutes from './routes/billRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import payableRoutes from './routes/payableRoutes.js';

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

app.use('/rates', rateRoutes)

app.use('/invoices', invoiceRoutes)

app.use('/vendors', vendorRoutes)

app.use('/bills', billRoutes)

app.use('/payments', paymentRoutes)

app.use('/payable', payableRoutes)

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});