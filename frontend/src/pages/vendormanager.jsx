import React, { useState, useEffect } from 'react';
import api from '../api/api';
import Sidebar from '../components/Sidebar';

function VendorManager() {
    const [vendors, setVendors] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '' });
    
    const activeBusiness = JSON.parse(localStorage.getItem('activeBusiness'));

    useEffect(() => {
        if (activeBusiness) loadVendors();
    }, []);

    const loadVendors = async () => {
        try {
            const res = await api.get(`/vendors?businessId=${activeBusiness.id}`);
            setVendors(res.data.data || []);
        } catch (err) {
            console.error("Error loading vendors", err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this vendor?")) return;
        try {
            const res = await api.delete(`/vendors/${id}`);
            if (res.data.success) {
                alert("Vendor deleted successfully!");
                loadVendors();
            }
        } catch (err) {
            alert("Failed to delete vendor.");
        }
    };

    const handleEdit = (vendor) => {
        setEditingId(vendor.id);
        setFormData({
            name: vendor.name,
            email: vendor.email || '',
            phone: vendor.phone || '',
            address: vendor.address || ''
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setFormData({ name: '', email: '', phone: '', address: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...formData, businessId: activeBusiness.id };

            if (editingId) {
                // UPDATE
                await api.put(`/vendors/${editingId}`, payload);
                alert("Vendor updated successfully!");
            } else {
                // CREATE
                await api.post('/vendors', payload);
                alert("Vendor added successfully!");
            }

            handleCancelEdit();
            loadVendors();
        } catch (err) {
            alert("Error saving vendor.");
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
            <Sidebar />
            <div style={{ flex: 1, padding: '30px' }}>
                <header style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2>Vendor Management</h2>
                    {editingId && (
                        <button onClick={handleCancelEdit} style={styles.cancelBtn}>Cancel Editing</button>
                    )}
                </header>

                {/* Add/Edit Vendor Form */}
                <div style={{ ...styles.card, borderLeft: editingId ? '5px solid #e67e22' : 'none' }}>
                    <h4 style={{ marginBottom: '15px' }}>{editingId ? 'Edit Vendor Info' : 'Add New Vendor'}</h4>
                    <form onSubmit={handleSubmit} style={styles.formGrid}>
                        <input 
                            placeholder="Company/Vendor Name" required style={styles.input}
                            value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                        <input 
                            placeholder="Email" type="email" style={styles.input}
                            value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                        />
                        <input 
                            placeholder="Phone Number" style={styles.input}
                            value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                        />
                        <input 
                            placeholder="Address" style={styles.input}
                            value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
                        />
                        <button type="submit" style={{ ...styles.button, backgroundColor: editingId ? '#d35400' : '#e67e22' }}>
                            {editingId ? 'Update Vendor' : 'Add Vendor'}
                        </button>
                    </form>
                </div>

                {/* Vendor List */}
                <div style={styles.card}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                                <th style={styles.th}>Name</th>
                                <th style={styles.th}>Contact</th>
                                <th style={styles.th}>Address</th>
                                <th style={styles.th}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vendors.map(v => (
                                <tr key={v.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ ...styles.td, fontWeight: 'bold' }}>{v.name}</td>
                                    <td style={styles.td}>
                                        <div style={{ fontSize: '14px' }}>{v.email}</div>
                                        <div style={{ fontSize: '12px', color: '#7f8c8d' }}>{v.phone}</div>
                                    </td>
                                    <td style={styles.td}>{v.address || '-'}</td>
                                    <td style={styles.td}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={() => handleEdit(v)} style={styles.editBtn}>Edit</button>
                                            <button onClick={() => handleDelete(v.id)} style={styles.deleteBtn}>Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {vendors.length === 0 && (
                                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>No vendors found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

const styles = {
    card: { backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '25px' },
    formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' },
    input: { padding: '12px', borderRadius: '8px', border: '1px solid #ddd' },
    button: { padding: '12px', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
    cancelBtn: { padding: '8px 16px', backgroundColor: '#95a5a6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' },
    th: { padding: '12px', color: '#7f8c8d' },
    td: { padding: '12px' },
    editBtn: { padding: '6px 12px', backgroundColor: '#f39c12', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' },
    deleteBtn: { padding: '6px 12px', backgroundColor: '#e74c3c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }
};

export default VendorManager;