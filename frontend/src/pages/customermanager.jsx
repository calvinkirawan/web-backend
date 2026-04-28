import React, { useState, useEffect } from 'react';
import api from '../api/api';
import Sidebar from '../components/Sidebar';

function CustomerManager() {
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '' });
  
  const user = JSON.parse(localStorage.getItem('user'));
  const activeBusiness = JSON.parse(localStorage.getItem('activeBusiness'));

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await api.get(`/customers?businessId=${activeBusiness.id}`);
      if (res.data.success) setCustomers(res.data.data);
    } catch (err) {
      console.error("Failed to fetch customers");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/customers', { 
        userId: user.id, 
        businessId: activeBusiness.id, 
        ...formData 
      });
      
      if (res.data.success) {
        setFormData({ name: '', email: '', phone: '', address: '' });
        fetchCustomers();
        alert("Customer added successfully!");
      }
    } catch (err) {
      alert("Error adding customer");
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1, padding: '30px', backgroundColor: '#f9f9f9' }}>
        <h2>Customer Management - {activeBusiness.name}</h2>
        
        {/* ADD FORM */}
        <div style={styles.card}>
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
            <button type="submit" style={styles.button}>Save Customer</button>
          </form>
        </div>

        {/* LIST TABLE */}
        <table style={styles.table}>
          <thead style={{ backgroundColor: '#eee' }}>
            <tr>
              <th>Name</th>
              <th>Contact</th>
              <th>Address</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '12px' }}>{c.name}</td>
                <td style={{ padding: '12px' }}>
                  {c.email && <div>📧 {c.email}</div>}
                  {c.phone && <div>📞 {c.phone}</div>}
                </td>
                <td style={{ padding: '12px' }}>{c.address || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  card: { backgroundColor: '#fff', padding: '20px', borderRadius: '8px', marginBottom: '30px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
  form: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
  input: { padding: '10px', borderRadius: '5px', border: '1px solid #ccc' },
  button: { padding: '10px', backgroundColor: '#2ecc71', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', gridColumn: 'span 2' },
  table: { width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff' }
};

export default CustomerManager;