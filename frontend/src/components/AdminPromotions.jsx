import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiTag, FiPlus, FiTrash2, FiPower, FiPercent, FiEdit2, FiDownload } from 'react-icons/fi';
const AdminPromotions = ({ onDownloadReport }) => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form State
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Rental',
    discountPercentage: '',
    promoCode: ''
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/promotions');
      setPromotions(res.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch promotions');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = (promo) => {
    setEditingId(promo._id);
    setFormData({
      title: promo.title,
      description: promo.description,
      type: promo.type,
      discountPercentage: promo.discountPercentage || '',
      promoCode: promo.promoCode || ''
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/promotions/${editingId}`, formData);
      } else {
        await axios.post('http://localhost:5000/api/promotions', formData);
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({
        title: '',
        description: '',
        type: 'Rental',
        discountPercentage: '',
        promoCode: ''
      });
      fetchPromotions();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save promotion');
    }
  };

  const toggleActive = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/promotions/${id}/toggle`);
      fetchPromotions();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this promotion?')) {
      try {
        await axios.delete(`http://localhost:5000/api/promotions/${id}`);
        fetchPromotions();
      } catch (err) {
        alert('Failed to delete promotion');
      }
    }
  };

  if (loading) return <div>Loading promotions...</div>;

  return (
    <div className="admin-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Promotions & Campaigns</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-outline" onClick={onDownloadReport} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.5rem', borderRadius: '12px', color: 'var(--primary)', borderColor: 'var(--primary)', background: 'transparent', cursor: 'pointer' }}>
            <FiDownload /> Weekly Report
          </button>
          <button 
            onClick={() => { 
              setShowForm(!showForm); 
              setEditingId(null);
              if (!showForm) setFormData({title:'', description:'', type:'Rental', discountPercentage:'', promoCode:''});
            }} 
            className="auth-button" 
            style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.5rem', borderRadius: '8px', margin: 0 }}
          >
            {showForm ? 'Cancel' : <><FiPlus /> Add Promotion</>}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <h3>{editingId ? 'Edit Promotion' : 'Create New Promotion'}</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Promotion Type</label>
              <select name="type" value={formData.type} onChange={handleInputChange} className="form-control" style={{ cursor: 'pointer' }}>
                <option value="Rental" style={{ background: 'var(--bg-dark)' }}>Rental Discount</option>
                <option value="Sale" style={{ background: 'var(--bg-dark)' }}>Vehicle Sale Offer</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Title</label>
              <input type="text" name="title" value={formData.title} onChange={handleInputChange} className="form-control" placeholder="e.g., New Year Sale" required />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Description</label>
              <input type="text" name="description" value={formData.description} onChange={handleInputChange} className="form-control" placeholder="e.g., Get free 3M tinting" required />
            </div>

            {formData.type === 'Rental' && (
              <>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Discount Percentage (%)</label>
                  <input type="number" name="discountPercentage" value={formData.discountPercentage} onChange={handleInputChange} className="form-control" placeholder="e.g., 10" min="1" max="100" required />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Promo Code</label>
                  <input type="text" name="promoCode" value={formData.promoCode} onChange={handleInputChange} className="form-control" placeholder="e.g., NEWYEAR10" style={{ textTransform: 'uppercase' }} required />
                </div>
              </>
            )}

            <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
              <button type="submit" className="auth-button" style={{ padding: '1rem 2rem', borderRadius: '8px' }}>
                {editingId ? 'Update Promotion' : 'Create Promotion'}
              </button>
            </div>
          </form>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: 'rgba(255,255,255,0.05)' }}>
            <tr>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Type</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Title</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Description</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Details</th>
              <th style={{ padding: '1rem', textAlign: 'center' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {promotions.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No promotions found. Create one above!</td>
              </tr>
            ) : (
              promotions.map((promo) => (
                <tr key={promo._id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem' }}>
                    <span className={`status-badge ${promo.type === 'Rental' ? 'success' : 'pending'}`}>
                      {promo.type}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 'bold' }}>{promo.title}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{promo.description}</td>
                  <td style={{ padding: '1rem' }}>
                    {promo.type === 'Rental' ? (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#34d399' }}><FiPercent /> {promo.discountPercentage}% OFF</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>Code: <strong>{promo.promoCode}</strong></div>
                      </div>
                    ) : (
                      <div style={{ color: 'var(--text-secondary)' }}>N/A</div>
                    )}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <button 
                      onClick={() => toggleActive(promo._id)}
                      style={{ 
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: promo.isActive ? '#34d399' : 'var(--text-secondary)' 
                      }}
                      title={promo.isActive ? "Deactivate" : "Activate"}
                    >
                      <FiPower size={20} />
                    </button>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                      <button onClick={() => handleEdit(promo)} className="icon-btn edit" title="Edit">
                        <FiEdit2 />
                      </button>
                      <button onClick={() => handleDelete(promo._id)} className="icon-btn delete" title="Delete">
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPromotions;
