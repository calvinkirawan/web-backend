import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      
      if (res.data.success) {
        // Store user info in local storage so the app remembers who is logged in
        localStorage.setItem('user', JSON.stringify(res.data.data));
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || "Connection to server failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>TaxEase Admin</h1>
        <p style={styles.subtitle}>Please enter your credentials to continue</p>
        
        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label>Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              placeholder="admin@taxease.com"
              required 
            />
          </div>

          <div style={styles.inputGroup}>
            <label>Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              placeholder="••••••••"
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{...styles.button, backgroundColor: loading ? '#bdc3c7' : '#2980b9'}}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f4f7f6',
    fontFamily: 'Arial, sans-serif'
  },
  card: {
    width: '400px',
    padding: '40px',
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
    textAlign: 'center'
  },
  title: { color: '#2c3e50', marginBottom: '10px' },
  subtitle: { color: '#7f8c8d', marginBottom: '30px', fontSize: '14px' },
  form: { textAlign: 'left' },
  inputGroup: { marginBottom: '20px' },
  input: {
    width: '100%',
    padding: '12px',
    marginTop: '5px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    boxSizing: 'border-box'
  },
  button: {
    width: '100%',
    padding: '12px',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    transition: '0.3s'
  },
  error: {
    backgroundColor: '#ffdada',
    color: '#c0392b',
    padding: '10px',
    borderRadius: '6px',
    marginBottom: '20px',
    fontSize: '14px'
  }
};

export default Login;