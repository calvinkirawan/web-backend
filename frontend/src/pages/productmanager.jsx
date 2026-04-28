import React, { useState, useEffect } from 'react';
import api from '../api/api';
import Sidebar from '../components/Sidebar';

function ProductManager() {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({ name: '', description: '', price: '', category: 'Good' });
  const activeBusiness = JSON.parse(localStorage.getItem('activeBusiness'));

  useEffect(() => {
    if (activeBusiness) fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get(`/products?businessId=${activeBusiness.id}`);
      if (res.data.success) setProducts(res.data.data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/products', {
        businessId: activeBusiness.id,
        ...formData
      });
      if (res.data.success) {
        setFormData({ name: '', description: '', price: '', category: 'Good' });
        fetchProducts();
        alert("Product added successfully!");
      }
    } catch (err) {
      alert("Failed to add product.");
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <Sidebar />
      <div style={{ flex: 1, padding: '30px' }}>
        <header style={{ marginBottom: '20px' }}>
          <h2>Product Manager</h2>
          <p style={{ color: '#666' }}>Managing items for: <strong>{activeBusiness?.name}</strong></p>
        </header>

        {/* ADD FORM */}
        <div style={styles.card}>
          <form onSubmit={handleSubmit} style={styles.form}>
            <input 
              placeholder="Product Name" required
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
              style={styles.input}
            />
            <input 
              type="number" placeholder="Price (Rp)" required
              value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})}
              style={styles.input}
            />
            <select 
              value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
              style={styles.input}
            >
              <option value="Good">Good (Barang)</option>
              <option value="Service">Service (Jasa)</option>
            </select>
            <textarea 
              placeholder="Description (Optional)" 
              value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
              style={{ ...styles.input, width: '100%', minHeight: '60px' }}
            />
            <button type="submit" style={styles.button}>Save Product</button>
          </form>
        </div>

        {/* PRODUCT TABLE */}
        <div style={styles.card}>
          <table style={styles.table}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Category</th>
                <th style={styles.th}>Description</th>
                <th style={styles.th}>Price</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={styles.td}><strong>{p.name}</strong></td>
                  <td style={styles.td}>{p.category}</td>
                  <td style={styles.td}>{p.description || '-'}</td>
                  <td style={styles.td}>Rp {parseFloat(p.price).toLocaleString('id-ID')}</td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>No products found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: { backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '30px' },
  form: { display: 'flex', flexWrap: 'wrap', gap: '15px' },
  input: { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', flex: '1 1 200px', fontSize: '14px' },
  button: { padding: '12px 24px', backgroundColor: '#3498db', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '12px', color: '#7f8c8d', fontSize: '13px', textTransform: 'uppercase' },
  td: { padding: '12px', fontSize: '14px', color: '#2c3e50' }
};

export default ProductManager;