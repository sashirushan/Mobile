import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiEdit2, FiTrash2, FiPlus, FiX, FiDownload } from 'react-icons/fi';
const AdminUsers = ({ onDownloadReport }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    username: '', fullName: '', email: '', password: '', phone: '', address: '', role: 'user'
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEdit = (user) => {
    setFormData({
      username: user.username,
      fullName: user.fullName || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || '',
      password: '', // Blank out password on edit
      role: user.role
    });
    setEditingId(user._id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user? This cannot be undone.')) {
      try {
        await axios.delete(`http://localhost:5000/api/users/${id}`);
        fetchUsers();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/users/${editingId}`, formData);
      } else {
        await axios.post('http://localhost:5000/api/users', formData);
      }
      setIsModalOpen(false);
      fetchUsers();
      resetForm();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error saving user');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      username: '', fullName: '', email: '', password: '', phone: '', address: '', role: 'user'
    });
  };

  return (
    <div className="admin-subcomponent">
      <div className="section-header" style={{ background: 'transparent', border: 'none', padding: '0 0 1.5rem 0' }}>
        <h2>Manage Users</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-outline" onClick={onDownloadReport} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.5rem', borderRadius: '12px', color: 'var(--primary)', borderColor: 'var(--primary)' }}>
            <FiDownload /> Weekly Report
          </button>
          <button className="admin-add-btn" onClick={() => { resetForm(); setIsModalOpen(true); }}>
            <FiPlus /> Add New User
          </button>
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{ textAlign: 'center' }}>Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center' }}>No users found.</td></tr>
            ) : (
              users.map(u => (
                <tr key={u._id}>
                  <td style={{ fontWeight: 'bold' }}>{u.username}</td>
                  <td>{u.fullName || '-'}</td>
                  <td>{u.email || '-'}</td>
                  <td>
                    <span className={`status-badge ${u.role === 'admin' ? 'pending' : 'success'}`}>
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="icon-btn edit" onClick={() => handleEdit(u)}><FiEdit2 /></button>
                      <button className="icon-btn delete" onClick={() => handleDelete(u._id)}><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2>{editingId ? 'Edit User' : 'Add New User'}</h2>
              <button className="icon-btn" onClick={() => setIsModalOpen(false)}><FiX /></button>
            </div>
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
                <div className="form-group">
                  <label>Username</label>
                  <input type="text" name="username" value={formData.username} onChange={handleInputChange} required disabled={!!editingId} />
                </div>
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select name="role" value={formData.role} onChange={handleInputChange}>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input type="text" name="address" value={formData.address} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  {editingId ? (
                    <input 
                      type="password" 
                      value="******" 
                      disabled 
                      style={{ cursor: 'not-allowed', opacity: 0.7 }}
                    />
                  ) : (
                    <input 
                      type="password" 
                      name="password" 
                      value={formData.password} 
                      onChange={handleInputChange} 
                      required 
                      placeholder="Enter password"
                    />
                  )}
                </div>
              </div>
              
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">{editingId ? 'Update User' : 'Save User'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
