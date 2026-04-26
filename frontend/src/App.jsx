import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Register from './pages/register';
import Login from './pages/login';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<div><p>Dont have an account? <Link to="/register">Register here</Link></p>
        <p>Already have an account? <Link to="/login">Login here</Link></p></div>} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={
          <div style={{ display: 'flex' }}>
            <Sidebar />
            <div style={{ flex: 1, padding: '20px' }}>
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="*" element={<div>Page coming soon...</div>} />
              </Routes>
            </div>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;