import React, { useState, useEffect } from 'react';
import api from '../api/api';
import Sidebar from '../components/Sidebar';
import { formatCurrency } from '../utils/formatters';

function BillManager() {
    const [bills, setBills] = useState([]);
    const [products, setProducts] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [taxRates, setTaxRates] = useState([]);
    
    // UI States
    const [showTaxModal, setShowTaxModal] = useState(false);
    const [newTax, setNewTax] = useState({ tax_name: '', rate: '' });
    const [formData, setFormData] = useState({ 
        vendorId: '', productId: '', taxId: '', quantity: 1, billRef: '' 
    });

    const activeBusiness = JSON.parse(localStorage.getItem('activeBusiness'));
    const currency = activeBusiness?.default_currency || 'IDR';

    useEffect(() => { if (activeBusiness) loadInitialData(); }, []);

    const loadInitialData = async () => {
        try {
            const [billRes, prodRes, vendRes, taxRes] = await Promise.all([
                api.get(`/bills?businessId=${activeBusiness.id}`),
                api.get(`/products?businessId=${activeBusiness.id}&type=purchase`),
                api.get(`/vendors?businessId=${activeBusiness.id}`),
                api.get(`/rates/tax`) 
            ]);
            setBills(billRes.data.data || []);
            setProducts(prodRes.data.data || []);
            setVendors(vendRes.data.data || []);
            setTaxRates(taxRes.data.data || []);
        } catch (err) { console.error("Data load failed", err); }
    };

    // --- LIVE CALCULATION ---
    const selectedProduct = products.find(p => p.id === parseInt(formData.productId));
    const selectedVendor = vendors.find(v => v.id === parseInt(formData.vendorId));
    const selectedTax = taxRates.find(t => t.id === parseInt(formData.taxId));

    const subtotal = selectedProduct ? selectedProduct.price * formData.quantity : 0;
    const taxAmount = selectedTax ? subtotal * selectedTax.rate : 0;
    const grandTotal = subtotal + taxAmount;

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/bills', {
                businessId: activeBusiness.id,
                vendorId: formData.vendorId,
                totalAmount: grandTotal, // Saving the total including tax
                currency: currency,
                taxId: formData.taxId,
            });
            alert("Bill recorded!");
            setFormData({ vendorId: '', productId: '', taxId: '', quantity: 1, billRef: '' });
            loadInitialData();
        } catch (err) { alert("Error recording bill."); }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
            <Sidebar />
            <div style={{ flex: 1, padding: '30px' }}>
                <h2 style={{ marginBottom: '20px' }}>Bill Manager (Purchases)</h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '30px' }}>
                    
                    {/* LEFT: FORM SECTION */}
                    <div>
                        <div style={styles.card}>
                            <h4 style={{ marginBottom: '15px' }}>Record Incoming Bill</h4>
                            <form onSubmit={handleSubmit} style={styles.formGrid}>

                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Select Vendor</label>
                                    <select required style={styles.input} value={formData.vendorId} onChange={e => setFormData({...formData, vendorId: e.target.value})}>
                                        <option value="">Choose Vendor</option>
                                        {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                    </select>
                                </div>

                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Product/Service</label>
                                    <select required style={styles.input} value={formData.productId} onChange={e => setFormData({...formData, productId: e.target.value})}>
                                        <option value="">Select Item</option>
                                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>

                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={styles.label}>Qty</label>
                                        <input type="number" min="1" required style={styles.input} value={formData.quantity} onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 1})} />
                                    </div>
                                    <div style={{ flex: 2 }}>
                                        <label style={styles.label}>Tax Rule</label>
                                        <select required style={styles.input} value={formData.taxId} onChange={(e) => e.target.value === "ADD_NEW" ? setShowTaxModal(true) : setFormData({ ...formData, taxId: e.target.value })}>
                                            <option value="">No Tax</option>
                                            {taxRates.map(t => (
                                                <option key={t.id} value={t.id}>{t.tax_name} ({(t.rate * 100).toFixed(1)}%)</option>
                                            ))}
                                            <option value="ADD_NEW" style={{ fontWeight: 'bold', color: '#e67e22' }}>+ Add New Tax</option>
                                        </select>
                                    </div>
                                </div>

                                <button type="submit" style={styles.button}>Confirm & Record Bill</button>
                            </form>
                        </div>
                    </div>

                    {/* RIGHT: LIVE BILL DOCUMENT PREVIEW */}
                    <div style={styles.stickyContainer}>
                        <h4 style={{ marginBottom: '10px', color: '#7f8c8d' }}>Live Document Preview</h4>
                        <div style={styles.billPreviewDoc}>
                            <div style={styles.docHeader}>
                                <div>
                                    <h3 style={{ margin: 0, color: '#d35400' }}>VENDOR BILL</h3>
                                    <small>{activeBusiness?.name}</small>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{formData.billRef || '---'}</div>
                                    <small>{new Date().toLocaleDateString()}</small>
                                </div>
                            </div>

                            <div style={styles.docSection}>
                                <small style={styles.docLabel}>VENDOR:</small>
                                <div><strong>{selectedVendor?.name || 'No Vendor Selected'}</strong></div>
                                <div style={{ fontSize: '11px', color: '#7f8c8d' }}>{selectedVendor?.address || ''}</div>
                            </div>

                            <table style={styles.docTable}>
                                <thead>
                                    <tr>
                                        <th style={{ textAlign: 'left' }}>Item</th>
                                        <th style={{ textAlign: 'right' }}>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr style={{ height: '60px', verticalAlign: 'middle' }}>
                                        <td>
                                            {selectedProduct?.name || '---'}<br/>
                                            <small>{formData.quantity} x {formatCurrency(selectedProduct?.price || 0, currency)}</small>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>{formatCurrency(subtotal, currency)}</td>
                                    </tr>
                                </tbody>
                            </table>

                            <div style={styles.docSummary}>
                                <div style={styles.summaryLine}>
                                    <span>Subtotal</span>
                                    <span>{formatCurrency(subtotal, currency)}</span>
                                </div>
                                {selectedTax && (
                                    <div style={styles.summaryLine}>
                                        <span>Tax ({selectedTax.tax_name})</span>
                                        <span>{formatCurrency(taxAmount, currency)}</span>
                                    </div>
                                )}
                                <div style={{ ...styles.summaryLine, borderTop: '2px solid #eee', marginTop: '10px', paddingTop: '10px', fontWeight: 'bold', color: '#2c3e50' }}>
                                    <span>Total to Pay</span>
                                    <span>{formatCurrency(grandTotal, currency)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* MODAL FOR NEW TAX (Keep your existing modal logic) */}
                {showTaxModal && (
                    <div style={styles.modalOverlay}>
                        <div style={styles.modal}>
                            <h3>Create New Tax Rule</h3>
                            <form onSubmit={handleSaveTax}>
                                <input placeholder="Rule Name" required style={styles.modalInput} value={newTax.tax_name} onChange={e => setNewTax({...newTax, tax_name: e.target.value})} />
                                <input type="number" step="0.01" placeholder="Rate %" required style={styles.modalInput} value={newTax.rate} onChange={e => setNewTax({...newTax, rate: e.target.value})} />
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button type="submit" style={styles.saveBtn}>Save</button>
                                    <button type="button" onClick={() => setShowTaxModal(false)} style={styles.cancelBtn}>Cancel</button>
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
    card: { backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '25px' },
    formGrid: { display: 'flex', flexDirection: 'column', gap: '18px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
    label: { fontSize: '13px', fontWeight: 'bold', color: '#34495e' },
    input: { padding: '12px', borderRadius: '8px', border: '1px solid #ddd' },
    button: { padding: '15px', backgroundColor: '#e67e22', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' },
    
    // STICKY DOCUMENT PREVIEW
    stickyContainer: { position: 'sticky', top: '30px' },
    billPreviewDoc: { 
        backgroundColor: '#fff', 
        padding: '30px', 
        borderRadius: '2px', 
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)', 
        minHeight: '400px', 
        borderTop: '6px solid #d35400',
        display: 'flex',
        flexDirection: 'column'
    },
    docHeader: { display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f4f4f4', paddingBottom: '15px', marginBottom: '20px' },
    docSection: { marginBottom: '20px' },
    docLabel: { fontSize: '10px', color: '#95a5a6', fontWeight: 'bold', letterSpacing: '0.5px' },
    docTable: { width: '100%', borderCollapse: 'collapse', marginBottom: '20px' },
    docSummary: { marginTop: 'auto', borderTop: '1px solid #f4f4f4', paddingTop: '15px' },
    summaryLine: { display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '14px' },

    // Modal Styles
    modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modal: { backgroundColor: '#fff', padding: '30px', borderRadius: '12px', width: '400px' },
    modalInput: { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' },
    saveBtn: { flex: 1, padding: '12px', backgroundColor: '#2ecc71', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' },
    cancelBtn: { flex: 1, padding: '12px', backgroundColor: '#e74c3c', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }
};

export default BillManager;