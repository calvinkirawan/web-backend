import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Register from './pages/register';
import Login from './pages/login';
import Dashboard from './pages/Dashboard';
import IncomeTracker from './pages/incometracker';
import ExpenseTracker from './pages/expensetracker';
import CustomerManager from './pages/customermanager';
import BusinessLobby from './pages/businesslobby';
import AddBusiness from './pages/add-business';
import ProductManager from './pages/productmanager';
import InvoiceManager from './pages/invoicemanager';
import VendorManager from './pages/vendormanager';
import BillManager from './pages/billmanager';
import PaymentManager from './pages/paymentmanager';
import Payable from './pages/payable';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<div><p>Dont have an account? <Link to="/register">Register here</Link></p>
        <p>Already have an account? <Link to="/login">Login here</Link></p></div>} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/business-lobby" element={<BusinessLobby />} />
        <Route path="/add-business" element={<AddBusiness />} />
        <Route path="/product-manager" element={<ProductManager />} />
        <Route path="/customer-manager" element={<CustomerManager />} />
        <Route path="/invoice-manager" element={<InvoiceManager />} />
        <Route path="/payment-manager" element={<PaymentManager />} />
        <Route path="/vendor-manager" element={<VendorManager />} />
        <Route path="/bill-manager" element={<BillManager />} />
        <Route path="/payable" element={<Payable />} />
        <Route path="/*" element={
          <div style={{ display: 'flex' }}>
            <Sidebar />
            <div style={{ flex: 1, padding: '20px' }}>
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/income" element={<IncomeTracker />} />
                <Route path="/expenses" element={<ExpenseTracker />} />
                <Route path="/customer" element={<CustomerManager />} />
              </Routes>
            </div>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;