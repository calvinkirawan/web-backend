import React, { useState, useEffect } from 'react';
import api from '../api/api';
import Sidebar from '../components/Sidebar';
import { formatCurrency } from '../utils/formatters';

function PaymentManager() {
    // --- STATE ---
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('Unpaid');
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [paymentData, setPaymentData] = useState({ 
        amount: '', 
        method: 'Bank Transfer', 
        date: new Date().toISOString().split('T')[0] 
    });

    const activeBusiness = JSON.parse(localStorage.getItem('activeBusiness'));
    const currency = activeBusiness?.default_currency || 'IDR';

    // --- EFFECTS ---
    useEffect(() => { 
        if (activeBusiness) loadInvoices(); 
    }, []);

    const loadInvoices = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/invoices?businessId=${activeBusiness.id}`);
            setInvoices(res.data.data || []);
        } catch (err) {
            console.error("Error loading invoices:", err);
        } finally {
            setLoading(false);
        }
    };

    // --- LOGIC ---
    const filteredInvoices = invoices.filter(inv => {
        const matchesFilter = filter === 'All' 
            ? true 
            : filter === 'Unpaid' 
                ? (inv.status === 'Unpaid' || inv.status === 'Partial')
                : inv.status === filter;

        const matchesSearch = inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              inv.customer_name.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesFilter && matchesSearch;
    });

    const handleOpenModal = (invoice) => {
        setSelectedInvoice(invoice);
        setPaymentData({
            ...paymentData,
            amount: invoice.remaining_balance, // Defaults to remaining balance
            date: new Date().toISOString().split('T')[0]
        });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedInvoice(null);
    };

    const handleSubmitPayment = async (e) => {
        e.preventDefault();
        
        const payAmt = parseFloat(paymentData.amount);
        const remaining = parseFloat(selectedInvoice.remaining_balance);

        if (payAmt <= 0) return alert("Please enter a valid amount.");
        if (payAmt > remaining) {
            alert(`Error: Amount exceeds the remaining balance of ${formatCurrency(remaining, currency)}`);
            return;
        }

        try {
            await api.post('/payments', {
                invoiceId: selectedInvoice.id,
                amount: payAmt,
                method: paymentData.method,
                date: paymentData.date
            });
            
            alert(`Payment of ${formatCurrency(payAmt, currency)} recorded!`);
            handleCloseModal();
            loadInvoices(); 
        } catch (err) {
            alert("Error: Could not record payment.");
            console.error(err);
        }
    };

    // --- RENDER ---
    return (
        <div style={styles.container}>
            <Sidebar />
            <div style={styles.mainContent}>
                
                <div style={styles.headerSection}>
                    <div>
                        <h2 style={{ margin: 0 }}>Payment Tracking</h2>
                        <p style={{ color: '#7f8c8d', marginTop: '5px' }}>Manage collections and partial payments.</p>
                    </div>

                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <input 
                            type="text" 
                            placeholder="Search invoice or customer..." 
                            style={styles.searchInput}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div style={styles.tabBar}>
                            {['Unpaid', 'Paid', 'All'].map(tab => (
                                <button 
                                    key={tab}
                                    onClick={() => setFilter(tab)}
                                    style={{
                                        ...styles.tabBtn,
                                        backgroundColor: filter === tab ? '#3498db' : 'transparent',
                                        color: filter === tab ? '#fff' : '#7f8c8d'
                                    }}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div style={styles.card}>
                    {loading ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#7f8c8d' }}>Loading records...</div>
                    ) : (
                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.thRow}>
                                    <th style={styles.th}>Invoice #</th>
                                    <th style={styles.th}>Customer</th>
                                    <th style={styles.th}>Balance Due</th>
                                    <th style={styles.th}>Status</th>
                                    <th style={styles.th}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredInvoices.length > 0 ? filteredInvoices.map(inv => (
                                    <tr key={inv.id} style={styles.tr}>
                                        <td style={{ fontWeight: 'bold', padding: '15px' }}>{inv.invoice_number}</td>
                                        <td>{inv.customer_name}</td>
                                        <td>
                                            <div style={{ fontWeight: 'bold', color: inv.remaining_balance > 0 ? '#e74c3c' : '#2ecc71' }}>
                                                {formatCurrency(inv.remaining_balance, inv.currency)}
                                            </div>
                                            <div style={{ fontSize: '10px', color: '#7f8c8d' }}>Total: {formatCurrency(inv.total_amount, inv.currency)}</div>
                                        </td>
                                        <td>
                                            <span style={{
                                                ...styles.statusBadge,
                                                backgroundColor: inv.status === 'Paid' ? '#e1f5fe' : inv.status === 'Partial' ? '#e8f5e9' : '#fff9c4',
                                                color: inv.status === 'Paid' ? '#0288d1' : inv.status === 'Partial' ? '#2e7d32' : '#fbc02d',
                                                border: '1px solid currentColor'
                                            }}>
                                                {inv.status}
                                            </span>
                                        </td>
                                        <td>
                                            {inv.remaining_balance > 0 ? (
                                                <button style={styles.payBtn} onClick={() => handleOpenModal(inv)}>Record Payment</button>
                                            ) : (
                                                <span style={{ color: '#2ecc71', fontWeight: 'bold', fontSize: '13px' }}>✓ Settled</span>
                                            )}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#95a5a6' }}>No records found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {showModal && (
                    <div style={styles.modalOverlay}>
                        <div style={styles.modal}>
                            <h3 style={{ marginTop: 0 }}>Record Payment</h3>
                            
                            <div style={styles.balanceSummary}>
                                <div style={styles.summaryLine}>
                                    <span>Invoice Total:</span>
                                    <span>{formatCurrency(selectedInvoice.total_amount, currency)}</span>
                                </div>
                                <div style={styles.summaryLine}>
                                    <span>Total Paid:</span>
                                    <span style={{ color: '#2ecc71' }}>{formatCurrency(selectedInvoice.total_paid || 0, currency)}</span>
                                </div>
                                <div style={{ ...styles.summaryLine, fontWeight: 'bold', borderTop: '1px solid #ddd', paddingTop: '10px', marginTop: '5px' }}>
                                    <span>Remaining Balance:</span>
                                    <span style={{ color: '#e74c3c' }}>{formatCurrency(selectedInvoice.remaining_balance, currency)}</span>
                                </div>
                            </div>

                            <form onSubmit={handleSubmitPayment} style={styles.form}>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Amount to Pay Now</label>
                                    <div style={{ position: 'relative' }}>
                                        <input 
                                            type="number" 
                                            step="0.01"
                                            max={selectedInvoice.remaining_balance}
                                            required 
                                            style={styles.input}
                                            value={paymentData.amount}
                                            onChange={e => setPaymentData({...paymentData, amount: e.target.value})}
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => setPaymentData({...paymentData, amount: selectedInvoice.remaining_balance})}
                                            style={styles.quickFill}
                                        >
                                            Full
                                        </button>
                                    </div>
                                </div>

                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Method</label>
                                    <select style={styles.input} value={paymentData.method} onChange={e => setPaymentData({...paymentData, method: e.target.value})}>
                                        <option value="Bank Transfer">Bank Transfer</option>
                                        <option value="Cash">Cash</option>
                                        <option value="Credit Card">Credit Card</option>
                                        <option value="Check">Check</option>
                                    </select>
                                </div>

                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Date</label>
                                    <input 
                                        type="date" 
                                        style={styles.input} 
                                        value={paymentData.date} 
                                        onChange={e => setPaymentData({...paymentData, date: e.target.value})}
                                    />
                                </div>

                                <div style={styles.modalActions}>
                                    <button type="submit" style={styles.confirmBtn}>Confirm Payment</button>
                                    <button type="button" onClick={handleCloseModal} style={styles.cancelBtn}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

const styles = {
    container: { display: 'flex', minHeight: '100vh', backgroundColor: '#f8f9fa' },
    mainContent: { flex: 1, padding: '40px' },
    headerSection: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
    searchInput: { padding: '10px 15px', borderRadius: '8px', border: '1px solid #ddd', width: '250px', fontSize: '14px' },
    tabBar: { display: 'flex', backgroundColor: '#eee', padding: '4px', borderRadius: '8px' },
    tabBtn: { padding: '8px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' },
    card: { backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden' },
    table: { width: '100%', borderCollapse: 'collapse' },
    thRow: { backgroundColor: '#fafafa', textAlign: 'left', borderBottom: '2px solid #eee' },
    th: { padding: '15px', color: '#7f8c8d', fontSize: '12px', textTransform: 'uppercase' },
    tr: { borderBottom: '1px solid #f1f2f6' },
    statusBadge: { padding: '5px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' },
    payBtn: { padding: '8px 16px', backgroundColor: '#2ecc71', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 },
    modal: { backgroundColor: '#fff', padding: '30px', borderRadius: '15px', width: '400px' },
    balanceSummary: { backgroundColor: '#fdfdfe', padding: '15px', borderRadius: '10px', border: '1px solid #edf2f7', marginBottom: '20px' },
    summaryLine: { display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '5px' },
    form: { display: 'flex', flexDirection: 'column', gap: '15px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
    label: { fontSize: '12px', fontWeight: 'bold', color: '#34495e' },
    input: { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', width: '100%', boxSizing: 'border-box' },
    quickFill: { position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '10px', cursor: 'pointer' },
    modalActions: { display: 'flex', gap: '10px', marginTop: '10px' },
    confirmBtn: { flex: 2, padding: '12px', backgroundColor: '#3498db', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
    cancelBtn: { flex: 1, padding: '12px', backgroundColor: '#ecf0f1', color: '#7f8c8d', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }
};

export default PaymentManager;