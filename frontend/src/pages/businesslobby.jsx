import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

function BusinessLobby() {
  const [businesses, setBusinesses] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBusinesses = async () => {
      const res = await api.get(`/businesses?userId=${user.id}`);
      if (res.data.success) setBusinesses(res.data.data);
    };
    fetchBusinesses();
  }, [user.id]);

  const handleSelect = (business) => {
    // Save the active business so all other components can use its ID
    localStorage.setItem('activeBusiness', JSON.stringify(business));
    navigate('/dashboard');
  };

  return (
    <div style={styles.container}>
      <h2>Welcome back, {user.email}</h2>
      <p>Select a business to manage:</p>
      <div style={styles.grid}>
        {businesses.map((b) => (
          <div key={b.id} onClick={() => handleSelect(b)} style={styles.card}>
            <h3>{b.name}</h3>
            <p>{b.address || 'No address set'}</p>
          </div>
        ))}
        {/* Option to create a new one */}
        <div style={{...styles.card, borderStyle: 'dashed'}} onClick={() => navigate('/add-business')}>
          <h3>+ Add New Branch</h3>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '50px', textAlign: 'center', backgroundColor: '#f4f7f6', minHeight: '100vh' },
  grid: { display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '30px' },
  card: { 
    width: '250px', padding: '20px', backgroundColor: '#fff', borderRadius: '12px', 
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)', cursor: 'pointer', transition: '0.3s'
  }
};

export default BusinessLobby;