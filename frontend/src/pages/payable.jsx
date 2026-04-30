import React, { useState, useEffect } from 'react';
import api from '../api/api';
import Sidebar from '../components/Sidebar';
import { formatCurrency } from '../utils/formatters';

function Payable() {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // --- NEW STATES FOR PAYMENT ---
    const [showModal, setShowModal] = useState(false);
    const [selectedBill, setSelectedBill] = useState(null);
    const [paymentData, setPaymentData] = useState({
        amount: '',
        method: 'Bank Transfer',
        date: new Date().toISOString().split('T')[0]
    });

    const activeBusiness = JSON.parse(localStorage.getItem('activeBusiness'));
    const currency = activeBusiness?.default_currency || 'IDR';

    useEffect(() => {
        if (activeBusiness) fetchBills();
    }, []);

    const fetchBills = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/bills?businessId=${activeBusiness.id}`);
            setBills(res.data.data || []);
        } catch (err) {
            console.error("Failed to load bills:", err);
        } finally {
            setLoading(false);
        }
    };

    // --- NEW PAYMENT HANDLERS ---
    const handleOpenPayModal = (bill) => {
        setSelectedBill(bill);
        setPaymentData({
            ...paymentData,
            amount: bill.remaining_balance || bill.total_amount,
            date: new Date().toISOString().split('T')[0]
        });
        setShowModal(true);
    };

    const handleSubmitPayment = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/payable', {
                billId: selectedBill.id,
                amount: paymentData.amount,
                method: paymentData.method,
                date: paymentData.date
            });

            if (res.data.success) {
                alert("Payment recorded!");
                setShowModal(false);
                fetchBills(); // <--- CRITICAL: Refresh the list
            }
        } catch (err) {
            // This will alert the actual error message coming from the backend
            alert("Error: " + err.response.data.error); 
            console.error(err.response.data);
        }
    };

    const filteredBills = bills.filter(bill => {
        const matchesSearch = 
            (bill.bill_number?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
            (bill.vendor_name?.toLowerCase() || "").includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' ? true : bill.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div style={styles.container}>
            <Sidebar />
            <div style={styles.main}>
                <div style={styles.header}>
                    <div>
                        <h2 style={{ margin: 0 }}>Recorded Bills</h2>
                        <p style={{ color: '#666', fontSize: '14px' }}>Overview of purchase invoices and vendor obligations.</p>
                    </div>
                    <div style={styles.actions}>
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            style={styles.searchBar}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div style={styles.card}>
                    {loading ? (
                        <div style={styles.emptyState}>Loading bills...</div>
                    ) : (
                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.thRow}>
                                    <th style={styles.th}>Vendor</th>
                                    <th style={styles.th}>Due Date</th>
                                    <th style={styles.th}>Balance</th>
                                    <th style={styles.th}>Status</th>
                                    <th style={styles.th}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBills.length > 0 ? filteredBills.map(bill => (
                                    <tr key={bill.id} style={styles.tr}>
                                        <td style={styles.td}>{bill.vendor_name}</td>
                                        <td style={styles.td}>
                                            {new Date(bill.due_date).toLocaleDateString()}
                                        </td>
                                        <td style={{ ...styles.td, fontWeight: 'bold' }}>
                                            {formatCurrency(bill.remaining_balance ?? bill.total_amount, bill.currency)}
                                        </td>
                                        <td style={styles.td}>
                                            <span style={{
                                                ...styles.badge,
                                                backgroundColor: getStatusColor(bill.status).bg,
                                                color: getStatusColor(bill.status).text
                                            }}>
                                                {bill.status}
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            {/* SHOW BUTTON ONLY IF NOT PAID */}
                                            {bill.status !== 'Paid' && (
                                                <button 
                                                    style={styles.payBtn}
                                                    onClick={() => handleOpenPayModal(bill)}
                                                >
                                                    Pay
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" style={styles.emptyState}>No bills found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* --- PAYMENT MODAL --- */}
            {showModal && selectedBill && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        <h3>Record Payment</h3>
                        <p>Paying <strong>{selectedBill.vendor_name}</strong></p>
                        
                        <form onSubmit={handleSubmitPayment}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={styles.label}>Amount ({currency})</label>
                                <input 
                                    type="number" 
                                    required
                                    style={styles.input}
                                    max={selectedBill.remaining_balance}
                                    value={paymentData.amount}
                                    onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})}
                                />
                            </div>
                            
                            <div style={{ marginBottom: '15px' }}>
                                <label style={styles.label}>Payment Method</label>
                                <select 
                                    style={styles.input}
                                    value={paymentData.method}
                                    onChange={(e) => setPaymentData({...paymentData, method: e.target.value})}
                                >
                                    <option value="Bank Transfer">Bank Transfer</option>
                                    <option value="Cash">Cash</option>
                                    <option value="Credit Card">Credit Card</option>
                                </select>
                            </div>

                            <div style={styles.modalActions}>
                                <button type="button" onClick={() => setShowModal(false)} style={styles.cancelBtn}>Cancel</button>
                                <button type="submit" style={styles.confirmBtn}>Confirm Payment</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

const getStatusColor = (status) => {
    switch (status) {
        case 'Paid': return { bg: '#e8f5e9', text: '#2e7d32' };
        case 'Partial': return { bg: '#fff3e0', text: '#ef6c00' };
        default: return { bg: '#ffebee', text: '#c62828' };
    }
};

const styles = {
    container: { display: 'flex', minHeight: '100vh', backgroundColor: '#f4f7f6' },
    main: { flex: 1, padding: '40px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
    searchBar: { padding: '10px 15px', borderRadius: '8px', border: '1px solid #ddd', width: '250px' },
    card: { backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' },
    table: { width: '100%', borderCollapse: 'collapse' },
    thRow: { backgroundColor: '#fcfcfc', borderBottom: '2px solid #eee' },
    th: { textAlign: 'left', padding: '15px', fontSize: '12px', color: '#888', textTransform: 'uppercase' },
    td: { padding: '15px', fontSize: '14px', color: '#333' },
    badge: { padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' },
    payBtn: { backgroundColor: '#2c3e50', color: 'white', border: 'none', padding: '6px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
    emptyState: { padding: '40px', textAlign: 'center', color: '#999' },
    
    // Modal Styles
    modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modal: { backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '400px', boxShadow: '0 5px 15px rgba(0,0,0,0.3)' },
    label: { display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold', color: '#666' },
    input: { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' },
    modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' },
    cancelBtn: { padding: '10px 20px', borderRadius: '6px', border: 'none', cursor: 'pointer', backgroundColor: '#eee' },
    confirmBtn: { padding: '10px 20px', borderRadius: '6px', border: 'none', cursor: 'pointer', backgroundColor: '#27ae60', color: 'white', fontWeight: 'bold' }
};

export default Payable;