import React, { useState, useEffect } from 'react';
import api from '../api/api';
import Sidebar from '../components/Sidebar';
import { formatCurrency } from '../utils/formatters';

function InvoiceManager() {
    const [invoices, setInvoices] = useState([]);
    const [products, setProducts] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [taxRates, setTaxRates] = useState([]);
    
    const [showTaxModal, setShowTaxModal] = useState(false);
    const [newTax, setNewTax] = useState({ tax_name: '', rate: '' });

    // Added invoiceNumber to formData
    const [formData, setFormData] = useState({ 
        customerId: '', productId: '', taxId: '', quantity: 1, invoiceNumber: '' 
    });

    const activeBusiness = JSON.parse(localStorage.getItem('activeBusiness'));
    const currency = activeBusiness?.default_currency || 'IDR';

    useEffect(() => { if (activeBusiness) loadInitialData(); }, []);

    // Suggest a next invoice number whenever the list of invoices changes
    useEffect(() => {
        if (invoices.length > 0) {
            const nextNum = invoices.length + 1001;
            setFormData(prev => ({ ...prev, invoiceNumber: `INV-${nextNum}` }));
        } else {
            setFormData(prev => ({ ...prev, invoiceNumber: 'INV-1001' }));
        }
    }, [invoices]);

    const loadInitialData = async () => {
        try {
            const [invRes, prodRes, custRes, taxRes] = await Promise.all([
                api.get(`/invoices?businessId=${activeBusiness.id}`),
                api.get(`/products?businessId=${activeBusiness.id}&type=sale`),
                api.get(`/customers?businessId=${activeBusiness.id}`),
                api.get(`/rates/tax`) 
            ]);
            setInvoices(invRes.data.data || []);
            setProducts(prodRes.data.data || []);
            setCustomers(custRes.data.data || []);
            setTaxRates(taxRes.data.data || []);
        } catch (err) { console.error(err); }
    };

    const selectedProduct = products.find(p => p.id === parseInt(formData.productId));
    const selectedCustomer = customers.find(c => c.id === parseInt(formData.customerId));
    const selectedTaxRule = taxRates.find(t => t.id === parseInt(formData.taxId));

    const subtotal = selectedProduct ? selectedProduct.price * formData.quantity : 0;
    const taxAmount = selectedTaxRule ? subtotal * selectedTaxRule.rate : 0;
    const grandTotal = subtotal + taxAmount;

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/invoices', {
                businessId: activeBusiness.id,
                invoiceNumber: formData.invoiceNumber, // Sending the number to backend
                customerName: selectedCustomer ? selectedCustomer.name : 'Unknown',
                totalAmount: grandTotal,
                currency: currency,
                taxId: formData.taxId
            });
            alert("Success! Invoice recorded.");
            setFormData({ customerId: '', productId: '', taxId: '', quantity: 1, invoiceNumber: '' });
            loadInitialData();
        } catch (err) { alert("Error creating invoice."); }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
            <Sidebar />
            <div style={{ flex: 1, padding: '30px' }}>
                <h2 style={{ marginBottom: '20px' }}>Invoice Manager</h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '30px' }}>
                    
                    {/* LEFT SIDE: INPUT FORM */}
                    <div>
                        <div style={styles.card}>
                            <h4 style={{ marginBottom: '15px' }}>Invoice Details</h4>
                            <form onSubmit={handleSubmit} style={styles.formStack}>
                                
                                {/* NEW INVOICE NUMBER FIELD */}
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Invoice Number</label>
                                    <input 
                                        required 
                                        style={styles.input} 
                                        value={formData.invoiceNumber} 
                                        onChange={e => setFormData({...formData, invoiceNumber: e.target.value})} 
                                    />
                                </div>

                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Customer</label>
                                    <select required style={styles.input} value={formData.customerId} onChange={e => setFormData({...formData, customerId: e.target.value})}>
                                        <option value="">Select Customer</option>
                                        {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>

                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Product/Service</label>
                                    <select required style={styles.input} value={formData.productId} onChange={e => setFormData({...formData, productId: e.target.value})}>
                                        <option value="">Select Product</option>
                                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>

                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <div style={{ ...styles.inputGroup, flex: 1 }}>
                                        <label style={styles.label}>Quantity</label>
                                        <input type="number" min="1" required style={styles.input} value={formData.quantity} onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 1})} />
                                    </div>
                                    <div style={{ ...styles.inputGroup, flex: 2 }}>
                                        <label style={styles.label}>Tax Rule</label>
                                        <select required style={styles.input} value={formData.taxId} onChange={(e) => e.target.value === "ADD_NEW" ? setShowTaxModal(true) : setFormData({ ...formData, taxId: e.target.value })}>
                                            <option value="">No Tax</option>
                                            {taxRates.map(t => (
                                                <option key={t.id} value={t.id}>{t.tax_name} ({(t.rate * 100).toFixed(1)}%)</option>
                                            ))}
                                            <option value="ADD_NEW" style={{ fontWeight: 'bold', color: '#3498db' }}>+ Add New Tax Rule</option>
                                        </select>
                                    </div>
                                </div>

                                <button type="submit" style={styles.button}>Create & Record Invoice</button>
                            </form>
                        </div>
                    </div>

                    {/* RIGHT SIDE: DOCUMENT PREVIEW */}
                    <div style={styles.previewScroll}>
                        <h4 style={{ marginBottom: '10px', color: '#7f8c8d' }}>Live Preview</h4>
                        <div style={styles.invoiceDoc}>
                            <div style={styles.docHeader}>
                                <div>
                                    <h3 style={{ margin: 0, color: '#2ecc71' }}>INVOICE</h3>
                                    <small>{activeBusiness?.name}</small>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    {/* INVOICE NUMBER IN PREVIEW */}
                                    <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{formData.invoiceNumber || 'INV-XXXX'}</div>
                                    <small>{new Date().toLocaleDateString()}</small>
                                </div>
                            </div>

                            <div style={styles.docSection}>
                                <small style={styles.label}>BILL TO:</small>
                                <div><strong>{selectedCustomer?.name || '---'}</strong></div>
                                <small>{selectedCustomer?.address || ''}</small>
                            </div>

                            <table style={styles.docTable}>
                                <thead>
                                    <tr>
                                        <th style={{ textAlign: 'left' }}>Description</th>
                                        <th style={{ textAlign: 'right' }}>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr style={{ height: '50px' }}>
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
                                {selectedTaxRule && (
                                    <div style={styles.summaryLine}>
                                        <span>Tax ({selectedTaxRule.tax_name})</span>
                                        <span>{formatCurrency(taxAmount, currency)}</span>
                                    </div>
                                )}
                                <div style={{ ...styles.summaryLine, borderTop: '2px solid #eee', marginTop: '10px', paddingTop: '10px', fontWeight: 'bold', fontSize: '1.1rem' }}>
                                    <span>Total Amount</span>
                                    <span>{formatCurrency(grandTotal, currency)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

const styles = {
    card: { backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' },
    formStack: { display: 'flex', flexDirection: 'column', gap: '20px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
    label: { fontSize: '12px', fontWeight: 'bold', color: '#7f8c8d', textTransform: 'uppercase' },
    input: { padding: '12px', borderRadius: '8px', border: '1px solid #ddd' },
    button: { padding: '15px', backgroundColor: '#2ecc71', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' },
    
    previewScroll: { position: 'sticky', top: '30px' },
    invoiceDoc: { 
        backgroundColor: '#fff', 
        padding: '30px', 
        borderRadius: '2px', 
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)', 
        minHeight: '450px',
        borderTop: '6px solid #2ecc71', // Added green accent for sales
        display: 'flex',
        flexDirection: 'column'
    },
    docHeader: { display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f4f4f4', paddingBottom: '15px', marginBottom: '20px' },
    docSection: { marginBottom: '25px' },
    docTable: { width: '100%', borderCollapse: 'collapse', marginBottom: '20px' },
    docSummary: { marginTop: 'auto', borderTop: '2px solid #f4f4f4', paddingTop: '15px' },
    summaryLine: { display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '14px' }
};

export default InvoiceManager;