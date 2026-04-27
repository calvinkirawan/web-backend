import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/api';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    // Quick validation before hitting the server
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    
    try {
      const res = await api.post('/auth/register', { email, password });
      
      if (res.data.success) {
        setSuccess(true);
        // Wait 2 seconds so the user can read the success message
        setTimeout(() => {
          navigate('/login'); // Redirect to the login page
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed. Please try again.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create Account</h2>
        <p style={styles.subtitle}>Join TaxEase to manage your UMKM taxes smoothly.</p>

        {error && <div style={styles.errorBox}>{error}</div>}
        {success && <div style={styles.successBox}>Account created! Redirecting to login...</div>}

        <form onSubmit={handleRegister} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              style={styles.input} 
              placeholder="name@business.com"
              required 
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              style={styles.input} 
              placeholder="••••••••"
              required 
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirm Password</label>
            <input 
              type="password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              style={styles.input} 
              placeholder="••••••••"
              required 
            />
          </div>

          <button type="submit" style={styles.button}>Register</button>
        </form>

        <p style={styles.footerText}>
          Already have an account? <Link to="/login" style={styles.link}>Login here</Link>
        </p>
      </div>
    </div>
  );
}

// Inline styles to guarantee a perfect mirror of a clean UI
const styles = {
  container: { 
    height: '100vh', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#f4f7f6',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },
  card: { 
    width: '400px', 
    padding: '40px', 
    backgroundColor: '#fff', 
    borderRadius: '12px', 
    boxShadow: '0 8px 24px rgba(0,0,0,0.1)', 
    textAlign: 'center' 
  },
  title: {
    margin: '0 0 10px 0',
    color: '#2c3e50',
    fontSize: '28px'
  },
  subtitle: {
    margin: '0 0 30px 0',
    color: '#7f8c8d',
    fontSize: '14px'
  },
  form: { 
    textAlign: 'left' 
  },
  inputGroup: { 
    marginBottom: '20px' 
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    color: '#34495e',
    fontWeight: 'bold',
    fontSize: '14px'
  },
  input: { 
    width: '100%', 
    padding: '12px', 
    borderRadius: '6px', 
    border: '1px solid #ddd', 
    boxSizing: 'border-box',
    fontSize: '16px',
    transition: 'border 0.2s',
    outline: 'none'
  },
  button: { 
    width: '100%', 
    padding: '12px', 
    backgroundColor: '#27ae60', 
    color: '#fff', 
    border: 'none', 
    borderRadius: '6px', 
    cursor: 'pointer', 
    fontWeight: 'bold',
    fontSize: '16px',
    marginTop: '10px',
    transition: 'background-color 0.2s'
  },
  errorBox: { 
    backgroundColor: '#ffdada', 
    color: '#c0392b', 
    padding: '12px', 
    borderRadius: '6px', 
    marginBottom: '20px',
    fontSize: '14px'
  },
  successBox: { 
    backgroundColor: '#d4edda', 
    color: '#155724', 
    padding: '12px', 
    borderRadius: '6px', 
    marginBottom: '20px',
    fontSize: '14px'
  },
  footerText: { 
    marginTop: '25px',
    fontSize: '14px',
    color: '#7f8c8d'
  },
  link: {
    color: '#3498db',
    textDecoration: 'none',
    fontWeight: 'bold'
  }
};

export default Register;