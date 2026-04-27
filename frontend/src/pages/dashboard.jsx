import React, { useState, useEffect } from 'react';
import api from '../api/api'; // Your Axios instance

function Dashboard() {
  const [summary, setSummary] = useState({ income: 0, expenses: 0, profit: 0, tax: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    try {
      const res = await api.get(`/stats/summary?user_id=${user.id}`);
      if (res.data.success) {
        setSummary(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading your financial overview...</div>;

  return (
    <div style={{ display: 'flex' }}>
      <div style={styles.mainContent}>
        <header style={styles.header}>
          <h1>Business Overview</h1>
          <p>Here's what's happening with your taxes this month.</p>
        </header>

        <div style={styles.cardGrid}>
          <div style={styles.card}>
            <h3>Total Income</h3>
            <p style={styles.incomeText}>Rp {summary.income.toLocaleString()}</p>
          </div>
          <div style={styles.card}>
            <h3>Total Expenses</h3>
            <p style={styles.expenseText}>Rp {summary.expenses.toLocaleString()}</p>
          </div>
          <div style={styles.card}>
            <h3>Net Profit</h3>
            <p style={styles.profitText}>Rp {summary.profit.toLocaleString()}</p>
          </div>
          <div style={{ ...styles.card, borderLeft: '5px solid #f1c40f' }}>
            <h3>Est. Tax (0.5%)</h3>
            <p style={styles.taxText}>Rp {summary.tax.toLocaleString()}</p>
          </div>
        </div>

        {/* Placeholder for future Charts (Feature #19) */}
        <div style={styles.chartPlaceholder}>
          <p>Charts & Recent Transactions coming soon...</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  mainContent: { flex: 1, padding: '30px', backgroundColor: '#f8f9fa', minHeight: '100vh' },
  header: { marginBottom: '30px' },
  cardGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' },
  card: { 
    backgroundColor: '#fff', 
    padding: '20px', 
    borderRadius: '10px', 
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
    borderLeft: '5px solid #3498db' 
  },
  incomeText: { fontSize: '24px', fontWeight: 'bold', color: '#27ae60' },
  expenseText: { fontSize: '24px', fontWeight: 'bold', color: '#e74c3c' },
  profitText: { fontSize: '24px', fontWeight: 'bold', color: '#2c3e50' },
  taxText: { fontSize: '24px', fontWeight: 'bold', color: '#f39c12' },
  chartPlaceholder: { marginTop: '40px', height: '300px', backgroundColor: '#fff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #ccc' }
};

export default Dashboard;

