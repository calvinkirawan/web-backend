import React, { useState, useEffect } from 'react';
import api from '../api/api';
import Sidebar from '../components/Sidebar';

function CustomerManager() {
  const [customers, setCustomers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '' });
  
  const user = JSON.parse(localStorage.getItem('user'));
  const activeBusiness = JSON.parse(localStorage.getItem('activeBusiness'));

  useEffect(() => {
    if (activeBusiness) fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await api.get(`/customers?businessId=${activeBusiness.id}`);
      if (res.data.success) setCustomers(res.data.data);
    } catch (err) {
      console.error("Failed to fetch customers");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) return;
    try {
      const res = await api.delete(`/customers/${id}`);
      if (res.data.success) {
        alert("Customer deleted.");
        fetchCustomers();
      }
    } catch (err) {
      alert("Failed to delete customer.");
    }
  };

  const handleEdit = (customer) => {
    setEditingId(customer.id);
    setFormData({
      name: customer.name,
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || ''
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
      const payload = { 
        userId: user.id, 
        businessId: activeBusiness.id, 
        ...formData 
      };

      if (editingId) {
        await api.put(`/customers/${editingId}`, payload);
        alert("Customer updated successfully!");
      } else {
        await api.post('/customers', payload);
        alert("Customer added successfully!");
      }
      
      handleCancelEdit();
      fetchCustomers();
    } catch (err) {
      alert("Error saving customer");
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1, padding: '30px', backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
        <header style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Customer Management - {activeBusiness?.name}</h2>
          {editingId && (
            <button onClick={handleCancelEdit} style={styles.cancelBtn}>Cancel Editing</button>
          )}
        </header>
        
        {/* FORM SECTION */}
        <div style={{ ...styles.card, borderLeft: editingId ? '5px solid #f39c12' : 'none' }}>
          <h4 style={{ marginBottom: '15px' }}>{editingId ? 'Edit Customer Info' : 'Add New Customer'}</h4>
          <form onSubmit={handleSubmit} style={styles.form}>
            <input 
              placeholder="Customer/Client Name" required
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
              style={styles.input}
            />
            <input 
              placeholder="Email" 
              value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
              style={styles.input}
            />
            <input 
              placeholder="Phone Number" 
              value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
              style={styles.input}
            />
            <textarea 
              placeholder="Address" 
              value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
              style={{...styles.input, gridColumn: 'span 2'}}
            />
            <button type="submit" style={{ ...styles.button, backgroundColor: editingId ? '#f39c12' : '#2ecc71' }}>
               {editingId ? 'Update Customer' : 'Save Customer'}
            </button>
          </form>
        </div>

        {/* LIST TABLE */}
        <div style={styles.card}>
          <table style={styles.table}>
            <thead style={{ backgroundColor: '#f4f4f4' }}>
              <tr>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Contact</th>
                <th style={styles.th}>Address</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={styles.td}><strong>{c.name}</strong></td>
                  <td style={styles.td}>
                    {c.email && <div style={{ fontSize: '12px' }}>📧 {c.email}</div>}
                    {c.phone && <div style={{ fontSize: '12px' }}>📞 {c.phone}</div>}
                  </td>
                  <td style={styles.td}>{c.address || '-'}</td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleEdit(c)} style={styles.editBtn}>Edit</button>
                      <button onClick={() => handleDelete(c.id)} style={styles.deleteBtn}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>No customers found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: { backgroundColor: '#fff', padding: '20px', borderRadius: '8px', marginBottom: '30px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
  form: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
  input: { padding: '10px', borderRadius: '5px', border: '1px solid #ccc' },
  button: { padding: '10px', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', gridColumn: 'span 2', fontWeight: 'bold' },
  cancelBtn: { padding: '8px 16px', backgroundColor: '#95a5a6', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  table: { width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff' },
  th: { padding: '12px', textAlign: 'left', fontSize: '13px', color: '#7f8c8d' },
  td: { padding: '12px', fontSize: '14px' },
  editBtn: { padding: '5px 10px', backgroundColor: '#f39c12', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' },
  deleteBtn: { padding: '5px 10px', backgroundColor: '#e74c3c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }
};

export default CustomerManager;