import React, { useState, useEffect } from 'react';
import api from '../api/api';

function CustomerManager() {
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({ name: '', email: '', address: '' });
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await api.get(`/customers?userId=${user.id}`);
      if (res.data.success) setCustomers(res.data.data);
    } catch (err) {
      console.error("Failed to fetch customers");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/customers', { userId: user.id, ...formData });
      if (res.data.success) {
        setFormData({ name: '', email: '', address: '' }); // Clear form
        fetchCustomers(); // Refresh list
        alert("Customer added!");
      }
    } catch (err) {
      alert("Error adding customer");
    }
  };

  return (
    <div style={{ padding: '30px' }}>
      <h2>Customer Database</h2>
      
      {/* ADD CUSTOMER FORM */}
      <form onSubmit={handleSubmit} style={styles.form}>
        <input 
          type="text" placeholder="Customer Name" required
          value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
          style={styles.input}
        />
        <input 
          type="email" placeholder="Email (Optional)" 
          value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
          style={styles.input}
        />
        <textarea 
          placeholder="Address" 
          value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})}
          style={styles.input}
        />
        <button type="submit" style={styles.button}>Save Customer</button>
      </form>

      {/* CUSTOMER LIST */}
      <table style={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Address</th>
          </tr>
        </thead>
        <tbody>
          {customers.map(c => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.email || '-'}</td>
              <td>{c.address || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  form: { display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px', marginBottom: '30px' },
  input: { padding: '10px', borderRadius: '5px', border: '1px solid #ccc' },
  button: { padding: '10px', backgroundColor: '#3498db', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  table: { width: '100%', borderCollapse: 'collapse' }
};

export default CustomerManager;