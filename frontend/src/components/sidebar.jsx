import React from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import BusinessLobby from '../pages/businesslobby';

function Sidebar() {
    const handleLogout = () => {
        // Option A: Clear specific items (Safer)
        localStorage.removeItem('user');
        localStorage.removeItem('activeBusiness');
        window.location.href = '/login';
    };
    const features = [
        { name: 'Switch Businessses', path: '/business-lobby' },
        { name: 'Product Manager', path: '/product-manager'},
        { name: 'Customer Manager', path: '/customer-manager'},
        { name: 'Invoices', path: '/invoice-manager' },
        { name: 'Receiveable', path: '/payment-manager'},
        { name: 'Vendor',  path: '/vendor-manager' },
        { name: 'Bills', path: '/bill-manager' },
        { name: 'Payable', path: '/payable'},
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Income', path: '/income' },
        { name: 'Expenses', path: '/expenses' } ,
        { name: 'User Management', path: '/users' },
        
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
            <button style={{ marginTop: '20px' }} onClick={handleLogout}>Logout</button>
        </div>
    );
}

export default Sidebar;