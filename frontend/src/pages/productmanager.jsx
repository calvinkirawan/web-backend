import React, { useState, useEffect } from 'react';
import api from '../api/api';
import Sidebar from '../components/Sidebar';
import { formatCurrency } from '../utils/formatters';

function ProductManager() {
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null); // Tracks if we are editing
  const [formData, setFormData] = useState({ 
    name: '', 
    description: '', 
    price: '', 
    category: 'Goods', 
    type: 'sale' 
  });
  
  const activeBusiness = JSON.parse(localStorage.getItem('activeBusiness'));
  const currency = activeBusiness?.default_currency || 'IDR';

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

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await api.delete(`/products/${id}`);
      if (res.data.success) {
        alert("Product deleted.");
        fetchProducts();
      }
    } catch (err) {
      alert("Failed to delete product.");
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      category: product.category,
      type: product.type
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', description: '', price: '', category: 'Goods', type: 'sale' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // UPDATE EXISTING
        await api.put(`/products/${editingId}`, { ...formData, businessId: activeBusiness.id });
        alert("Product updated successfully!");
      } else {
        // CREATE NEW
        await api.post('/products', { ...formData, businessId: activeBusiness.id });
        alert("Product added successfully!");
      }
      
      handleCancelEdit(); // Reset form and ID
      fetchProducts();
    } catch (err) {
      alert("Action failed. Check console for details.");
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <Sidebar />
      <div style={{ flex: 1, padding: '30px' }}>
        <header style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2>Product & Services</h2>
            <p style={{ color: '#666' }}>Managing items for: <strong>{activeBusiness?.name}</strong></p>
          </div>
          {editingId && (
            <button onClick={handleCancelEdit} style={styles.cancelBtn}>Cancel Editing</button>
          )}
        </header>

        {/* FORM SECTION */}
        <div style={{ ...styles.card, borderLeft: editingId ? '5px solid #f39c12' : 'none' }}>
          <h4 style={{ marginBottom: '15px' }}>{editingId ? 'Edit Product' : 'Add New Product'}</h4>
          <form onSubmit={handleSubmit} style={styles.form}>
            <input 
              placeholder="Product Name" required
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
              style={styles.input}
            />
            <input 
              type="number" placeholder={`Price (${currency})`} required
              value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})}
              style={styles.input}
            />
            <select 
              value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
              style={styles.input}
            >
              <option value="Goods">Good (Barang)</option>
              <option value="Services">Service (Jasa)</option>
            </select>

            <select 
              value={formData.type} 
              onChange={e => setFormData({...formData, type: e.target.value})}
              style={styles.input}
            >
              <option value="sale">Sale (For Invoices)</option>
              <option value="purchase">Purchase (For Bills)</option>
              <option value="both">Both (Inventory/Resale)</option>
            </select>

            <textarea 
              placeholder="Description (Optional)" 
              value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
              style={{ ...styles.input, width: '100%', minHeight: '60px' }}
            />
            <button type="submit" style={{ ...styles.button, backgroundColor: editingId ? '#f39c12' : '#3498db' }}>
              {editingId ? 'Update Product' : 'Save Product'}
            </button>
          </form>
        </div>

        {/* TABLE SECTION */}
        <div style={styles.card}>
          <table style={styles.table}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Category</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Price</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={styles.td}><strong>{p.name}</strong></td>
                  <td style={styles.td}>{p.category}</td>
                  <td style={styles.td}>
                    <span style={{ 
                      fontSize: '11px', 
                      backgroundColor: p.type === 'purchase' ? '#fff7ed' : '#f0f9ff',
                      color: p.type === 'purchase' ? '#c2410c' : '#0369a1',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                      fontWeight: 'bold'
                    }}>
                      {p.type}
                    </span>
                  </td>
                  <td style={styles.td}>{formatCurrency(p.price, currency)}</td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleEdit(p)} style={styles.editBtn}>Edit</button>
                      <button onClick={() => handleDelete(p.id)} style={styles.deleteBtn}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No products found.</td></tr>
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
  button: { padding: '12px 24px', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: '0.3s' },
  cancelBtn: { padding: '8px 16px', backgroundColor: '#95a5a6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '12px', color: '#7f8c8d', fontSize: '12px', textTransform: 'uppercase' },
  td: { padding: '12px', fontSize: '14px', color: '#2c3e50' },
  editBtn: { padding: '6px 12px', backgroundColor: '#f39c12', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' },
  deleteBtn: { padding: '6px 12px', backgroundColor: '#e74c3c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }
};

export default ProductManager;