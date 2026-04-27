import React, { useState, useEffect } from 'react';
import api from '../api/api';

function IncomeTracker() {
  const [incomes, setIncomes] = useState([]);
  const [formData, setFormData] = useState({ source: '', amount: '', date: '' });
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchIncomes();
  }, []);

  const fetchIncomes = async () => {
    try {
      const res = await api.get(`/stats/income?userId=${user.id}`);
      if (res.data.success) {
        setIncomes(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching income list:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/stats/income', {
        userId: user.id,
        ...formData
      });
      if (res.data.success) {
        setFormData({ source: '', amount: '', date: '' }); // Reset form
        fetchIncomes(); // Refresh the list
      }
    } catch (err) {
      alert("Failed to add income");
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <div style={styles.mainContent}>
        <header>
          <h1>Income Tracker</h1>
          <p>Record your sales and track your revenue here.</p>
        </header>

        {/* 1. THE ADD FORM */}
        <section style={styles.formCard}>
          <h3>Add New Sale</h3>
          <form onSubmit={handleSubmit} style={styles.formInline}>
            <input 
              type="text" placeholder="Source (e.g. Project A)" 
              value={formData.source} required
              onChange={(e) => setFormData({...formData, source: e.target.value})}
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
            <button type="submit" style={styles.addButton}>Add Income</button>
          </form>
        </section>

        {/* 2. THE HISTORY TABLE */}
        <section style={styles.tableCard}>
          <h3>Revenue History</h3>
          {loading ? <p>Loading data...</p> : (
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Source</th>
                  <th style={styles.th}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {incomes.map((item) => (
                  <tr key={item.id} style={styles.tr}>
                    <td style={styles.td}>{new Date(item.date).toLocaleDateString('id-ID')}</td>
                    <td style={styles.td}>{item.source}</td>
                    <td style={styles.td}>Rp {parseFloat(item.amount).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
}

const styles = {
  mainContent: { flex: 1, padding: '30px', backgroundColor: '#f8f9fa' },
  formCard: { backgroundColor: '#fff', padding: '20px', borderRadius: '10px', marginBottom: '30px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' },
  formInline: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  input: { padding: '10px', borderRadius: '5px', border: '1px solid #ddd', flex: 1, minWidth: '150px' },
  addButton: { padding: '10px 20px', backgroundColor: '#27ae60', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
  tableCard: { backgroundColor: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
  th: { textAlign: 'left', padding: '12px', borderBottom: '2px solid #eee', color: '#7f8c8d' },
  td: { padding: '12px', borderBottom: '1px solid #eee' },
  tr: { ':hover': { backgroundColor: '#f9f9f9' } }
};

export default IncomeTracker;