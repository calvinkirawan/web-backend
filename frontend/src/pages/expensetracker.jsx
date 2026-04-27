import React, { useState, useEffect } from 'react';
import api from '../api/api';

function ExpenseTracker() {
  const [expenses, setExpenses] = useState([]);
  const [formData, setFormData] = useState({ category: '', description: '', amount: '', date: '' });
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await api.get(`/stats/expenses?userId=${user.id}`);
      if (res.data.success) {
        setExpenses(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching expense list:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/stats/expenses', {
        userId: user.id,
        ...formData
      });
      if (res.data.success) {
        setFormData({ category: '', description: '', amount: '', date: '' }); 
        fetchExpenses(); 
      }
    } catch (err) {
      alert("Failed to record expense");
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <div style={styles.mainContent}>
        <header style={styles.header}>
          <h1>Expense Tracker</h1>
          <p>Monitor your spending to maximize your business deductions.</p>
        </header>

        {/* 1. THE ADD FORM */}
        <section style={styles.formCard}>
          <h3 style={{ color: '#e74c3c', marginBottom: '15px' }}>Record New Expense</h3>
          <form onSubmit={handleSubmit} style={styles.formInline}>
            <select 
              value={formData.category} 
              required
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              style={styles.input}
            >
              <option value="">Select Category</option>
              <option value="Operational">Operational</option>
              <option value="Supplies">Supplies/Inventory</option>
              <option value="Rent">Rent & Utilities</option>
              <option value="Salary">Staff Salary</option>
              <option value="Marketing">Marketing</option>
              <option value="Other">Other</option>
            </select>
            
            <input 
              type="text" placeholder="Description (e.g. Laptop repair)" 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              style={styles.input}
            />
            
            <input 
              type="number" placeholder="Amount (Rp)" 
              value={formData.amount} required
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              style={styles.input}
            />
            
            <input 
              type="date" 
              value={formData.date} required
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              style={styles.input}
            />
            
            <button type="submit" style={styles.addButton}>Save Expense</button>
          </form>
        </section>

        {/* 2. THE HISTORY TABLE */}
        <section style={styles.tableCard}>
          <h3>Expense Logs</h3>
          {loading ? <p>Loading data...</p> : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Category</th>
                  <th style={styles.th}>Description</th>
                  <th style={styles.th}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {expenses.length > 0 ? expenses.map((item) => (
                  <tr key={item.id} style={styles.tr}>
                    <td style={styles.td}>{new Date(item.date).toLocaleDateString('id-ID')}</td>
                    <td style={styles.td}>
                      <span style={styles.categoryBadge}>{item.category}</span>
                    </td>
                    <td style={styles.td}>{item.description || '-'}</td>
                    <td style={{ ...styles.td, color: '#c0392b', fontWeight: 'bold' }}>
                      - Rp {parseFloat(item.amount).toLocaleString()}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#95a5a6' }}>
                      No expenses recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
}

const styles = {
  mainContent: { flex: 1, padding: '30px', backgroundColor: '#fdfdfd', minHeight: '100vh' },
  header: { marginBottom: '25px' },
  formCard: { 
    backgroundColor: '#fff', 
    padding: '25px', 
    borderRadius: '12px', 
    marginBottom: '30px', 
    boxShadow: '0 4px 12px rgba(231, 76, 60, 0.08)',
    borderTop: '4px solid #e74c3c'
  },
  formInline: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  input: { 
    padding: '12px', 
    borderRadius: '8px', 
    border: '1px solid #eee', 
    flex: 1, 
    minWidth: '180px',
    fontSize: '14px',
    outline: 'none',
    backgroundColor: '#fcfcfc'
  },
  addButton: { 
    padding: '12px 25px', 
    backgroundColor: '#e74c3c', 
    color: '#fff', 
    border: 'none', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    fontWeight: 'bold',
    transition: '0.3s'
  },
  tableCard: { 
    backgroundColor: '#fff', 
    padding: '25px', 
    borderRadius: '12px', 
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)' 
  },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '15px' },
  th: { textAlign: 'left', padding: '15px', borderBottom: '2px solid #f1f1f1', color: '#34495e', fontSize: '15px' },
  td: { padding: '15px', borderBottom: '1px solid #f9f9f9', fontSize: '14px', color: '#2c3e50' },
  tr: { transition: 'background 0.2s' },
  categoryBadge: {
    backgroundColor: '#fdecea',
    color: '#e74c3c',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
    textTransform: 'uppercase'
  }
};

export default ExpenseTracker;