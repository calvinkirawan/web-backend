import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

function AddBusiness() {
  const [formData, setFormData] = useState({ name: '', address: '', npwp: '', default_currency: 'IDR' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const user = JSON.parse(localStorage.getItem('user'));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post('/businesses', {
        userId: user.id,
        ...formData
      });

      if (res.data.success) {
        alert("Success! Business branch registered.");
        navigate('/business-lobby'); // Send them back to the lobby
      }
    } catch (err) {
      console.error("Error adding business:", err);
      alert("Failed to register business. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <header style={styles.header}>
          <h2 style={styles.title}>Register New Branch</h2>
          <p style={styles.subtitle}>Add another business entity or location to your TaxEase account.</p>
        </header>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Business Name</label>
            <input 
              type="text" 
              placeholder="e.g. TaxEase Coffee Medan" 
              value={formData.name}
              required
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>NPWP (Tax ID)</label>
            <input 
              type="text" 
              placeholder="00.000.000.0-000.000" 
              value={formData.npwp}
              onChange={(e) => setFormData({...formData, npwp: e.target.value})}
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Business Address</label>
            <textarea 
              placeholder="Street name, City, Postal Code" 
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              style={{...styles.input, minHeight: '80px', resize: 'vertical'}}
            />
          </div>

          <div style={styles.inputGroup}>
            <label>Default Currency</label>
            <select 
              value={formData.default_currency} 
              onChange={e => setFormData({...formData, default_currency: e.target.value})}
              style={styles.input}
            >
              <option value="IDR">Indonesian Rupiah (IDR)</option>
              <option value="USD">US Dollar (USD)</option>
              <option value="SGD">Singapore Dollar (SGD)</option>
            </select>
            <small style={{ color: '#666' }}>This will be the base currency for all products and taxes in this branch.</small>
          </div>

          <div style={styles.buttonGroup}>
            <button 
              type="button" 
              onClick={() => navigate('/business-lobby')} 
              style={styles.cancelButton}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              style={styles.submitButton}
            >
              {loading ? 'Registering...' : 'Confirm & Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: { 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '100vh', 
    backgroundColor: '#f8f9fa',
    padding: '20px'
  },
  card: { 
    backgroundColor: '#fff', 
    padding: '40px', 
    borderRadius: '15px', 
    boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
    width: '100%',
    maxWidth: '500px'
  },
  header: { textAlign: 'center', marginBottom: '30px' },
  title: { color: '#2c3e50', margin: '0 0 10px 0' },
  subtitle: { color: '#7f8c8d', fontSize: '14px', margin: 0 },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '14px', fontWeight: 'bold', color: '#34495e' },
  input: { 
    padding: '12px', 
    borderRadius: '8px', 
    border: '1px solid #dfe6e9', 
    fontSize: '15px',
    outline: 'none',
    transition: 'border 0.2s'
  },
  buttonGroup: { display: 'flex', gap: '15px', marginTop: '10px' },
  submitButton: { 
    flex: 2,
    padding: '12px', 
    backgroundColor: '#3498db', 
    color: '#fff', 
    border: 'none', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    fontWeight: 'bold',
    fontSize: '16px'
  },
  cancelButton: { 
    flex: 1,
    padding: '12px', 
    backgroundColor: '#ecf0f1', 
    color: '#7f8c8d', 
    border: 'none', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    fontWeight: 'bold'
  }
};

export default AddBusiness;