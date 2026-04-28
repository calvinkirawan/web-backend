import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

function Dashboard() {
  const [summary, setSummary] = useState({ income: 0, expenses: 0, profit: 0, tax: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 1. Get data from storage
  const user = JSON.parse(localStorage.getItem('user'));
  const activeBusiness = JSON.parse(localStorage.getItem('activeBusiness'));

  useEffect(() => {
    // 2. Safety Guard: Redirect if no business is selected
    if (!user) {
      navigate('/login');
    } else if (!activeBusiness) {
      navigate('/select-business');
    } else {
      fetchData();
    }
  }, []);

  const fetchData = async () => {
    try {
      const activeBusiness = JSON.parse(localStorage.getItem('activeBusiness'));
      const res = await api.get(`/dashboard/summary?businessId=${activeBusiness.id}`);
      
      // Check if the data is wrapped in .data or if it's the root object
      const finalData = res.data.data ? res.data.data : res.data;
      
      setSummary({
        income: finalData.income || 0,
        expenses: finalData.expenses || 0,
        profit: finalData.profit || 0,
        tax: finalData.tax || 0
      });
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={styles.loading}>Loading {activeBusiness?.name || 'Business'}...</div>;

  return (
    <div style={styles.container}>
      <main style={styles.content}>
        <header style={styles.header}>
          <h1>{activeBusiness.name} Dashboard</h1>
          <p>Tax ID (NPWP): {activeBusiness.npwp || 'Not Registered'}</p>
        </header>

        <div style={styles.grid}>
          <div style={{ ...styles.card, borderLeft: '5px solid #2ecc71' }}>
            <h3>Total Income</h3>
            <p style={styles.amount}>Rp {summary.income.toLocaleString('id-ID')}</p>
          </div>

          <div style={{ ...styles.card, borderLeft: '5px solid #e74c3c' }}>
            <h3>Total Expenses</h3>
            <p style={styles.amount}>Rp {summary.expenses.toLocaleString('id-ID')}</p>
          </div>

          <div style={{ ...styles.card, borderLeft: '5px solid #3498db' }}>
            <h3>Net Profit</h3>
            <p style={styles.amount}>Rp {summary.profit.toLocaleString('id-ID')}</p>
          </div>

          <div style={{ ...styles.card, borderLeft: '5px solid #f1c40f' }}>
            <h3>Est. PPh Final (0.5%)</h3>
            <p style={styles.amount}>Rp {summary.tax.toLocaleString('id-ID')}</p>
          </div>
        </div>
      </main>
    </div>
  );
}

const styles = {
  container: { display: 'flex', minHeight: '100vh', backgroundColor: '#f4f7f6' },
  content: { flex: 1, padding: '40px' },
  header: { marginBottom: '30px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' },
  card: { backgroundColor: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' },
  amount: { fontSize: '24px', fontWeight: 'bold', margin: '10px 0 0 0' },
  loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.2rem' }
};

export default Dashboard;