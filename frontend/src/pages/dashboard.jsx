import React from 'react';

function Dashboard() {
    return (
        <div style={{ padding: '20px' }}>
            <h2>Accounting Dashboard</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '20px' }}>
                <div style={{ padding: '20px', background: '#ecf0f1', borderRadius: '8px' }}>
                    <h4>Total Income</h4>
                    <p style={{ fontSize: '24px', fontWeight: 'bold' }}>Rp 0</p>
                </div>
                <div style={{ padding: '20px', background: '#ecf0f1', borderRadius: '8px' }}>
                    <h4>Total Expenses</h4>
                    <p style={{ fontSize: '24px', fontWeight: 'bold' }}>Rp 0</p>
                </div>
                <div style={{ padding: '20px', background: '#ecf0f1', borderRadius: '8px' }}>
                    <h4>Tax Estimate</h4>
                    <p style={{ fontSize: '24px', fontWeight: 'bold' }}>Rp 0</p>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;