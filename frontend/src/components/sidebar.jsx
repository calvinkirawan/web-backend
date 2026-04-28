import React from 'react';
import { Link } from 'react-router-dom';
import BusinessLobby from '../pages/businesslobby';

function Sidebar() {
    const features = [
        { name: 'Switch Businessses', path: '/business-lobby' },
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Income', path: '/income' },
        { name: 'Expenses', path: '/expenses' } ,
        { name: 'User Management', path: '/users' },
        { name: 'Invoices', path: '/invoices' },
        // Add more of your 16 features here later
    ];

    return (
        <div style={{ width: '250px', height: '100vh', background: '#2c3e50', color: 'white', padding: '20px' }}>
            <h3>TaxEase Admin</h3>
            <hr />
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {features.map((item) => (
                    <li key={item.path} style={{ margin: '15px 0' }}>
                        <Link to={item.path} style={{ color: 'white', textDecoration: 'none' }}>
                            {item.name}
                        </Link>
                    </li>
                ))}
            </ul>
            <button style={{ marginTop: '20px' }} onClick={() => window.location.href = '/'}>Logout</button>
        </div>
    );
}

export default Sidebar;