import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiEdit2, FiTrash2, FiPlus, FiX, FiDownload } from 'react-icons/fi';
const AdminSales = ({ onDownloadReport }) => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    vehicleType: 'Car', make: '', model: '', yearOfManufacture: '', condition: 'Brand New', 
    mileage: '', price: '', registeredYear: '', fuelType: 'Petrol', transmission: 'Automatic', 
    trimEdition: '', engineCapacity: '', image: '', description: ''
  });

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/sales');
      setVehicles(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEdit = (vehicle) => {
    setFormData(vehicle);
    setEditingId(vehicle._id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await axios.delete(`http://localhost:5000/api/sales/${id}`);
        fetchVehicles();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/sales/${editingId}`, formData);
      } else {
        await axios.post('http://localhost:5000/api/sales', formData);
      }
      setIsModalOpen(false);
      fetchVehicles();
      resetForm();
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      vehicleType: 'Car', make: '', model: '', yearOfManufacture: '', condition: 'Brand New', 
      mileage: '', price: '', registeredYear: '', fuelType: 'Petrol', transmission: 'Automatic', 
      trimEdition: '', engineCapacity: '', image: '', description: ''
    });
  };

  return (
    <div className="admin-subcomponent">
      <div className="section-header" style={{ background: 'transparent', border: 'none', padding: '0 0 1.5rem 0' }}>
        <h2>Sales Vehicles</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-outline" onClick={onDownloadReport} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.5rem', borderRadius: '12px', color: 'var(--primary)', borderColor: 'var(--primary)' }}>
            <FiDownload /> Weekly Report
          </button>
          <button className="admin-add-btn" onClick={() => { resetForm(); setIsModalOpen(true); }}>
            <FiPlus /> Add New Vehicle
          </button>
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Vehicle</th>
              <th>Year</th>
              <th>Price (Rs)</th>
              <th>Condition</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ textAlign: 'center' }}>Loading...</td></tr>
            ) : vehicles.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center' }}>No vehicles found.</td></tr>
            ) : (
              vehicles.map(v => (
                <tr key={v._id}>
                  <td><img src={v.image} alt={v.model} style={{ width: '60px', borderRadius: '8px' }} /></td>
                  <td>{v.make} {v.model}</td>
                  <td>{v.yearOfManufacture}</td>
                  <td>{v.price.toLocaleString()}</td>
                  <td><span className="status-badge success">{v.condition}</span></td>
                  <td>
                    <div className="action-buttons">
                      <button className="icon-btn edit" onClick={() => handleEdit(v)}><FiEdit2 /></button>
                      <button className="icon-btn delete" onClick={() => handleDelete(v._id)}><FiTrash2 /></button>
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
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingId ? 'Edit Sales Vehicle' : 'Add New Sales Vehicle'}</h2>
              <button className="icon-btn" onClick={() => setIsModalOpen(false)}><FiX /></button>
            </div>
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Make</label>
                  <input type="text" name="make" value={formData.make} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Model</label>
                  <input type="text" name="model" value={formData.model} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Year of Manufacture</label>
                  <input type="number" name="yearOfManufacture" value={formData.yearOfManufacture} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Price (Rs.)</label>
                  <input type="number" name="price" value={formData.price} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Vehicle Type</label>
                  <select name="vehicleType" value={formData.vehicleType} onChange={handleInputChange}>
                    <option value="Car">Car</option><option value="Van">Van</option><option value="SUV">SUV</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Condition</label>
                  <select name="condition" value={formData.condition} onChange={handleInputChange}>
                    <option value="Brand New">Brand New</option><option value="Reconditioned">Reconditioned</option><option value="Used">Used</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Mileage (km)</label>
                  <input type="number" name="mileage" value={formData.mileage} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Fuel Type</label>
                  <select name="fuelType" value={formData.fuelType} onChange={handleInputChange}>
                    <option value="Petrol">Petrol</option><option value="Diesel">Diesel</option><option value="Hybrid">Hybrid</option><option value="Electric">Electric</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Transmission</label>
                  <select name="transmission" value={formData.transmission} onChange={handleInputChange}>
                    <option value="Automatic">Automatic</option><option value="Manual">Manual</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Registered Year (if Used)</label>
                  <input type="number" name="registeredYear" value={formData.registeredYear || ''} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Trim / Edition</label>
                  <input type="text" name="trimEdition" value={formData.trimEdition || ''} onChange={handleInputChange} placeholder="e.g. VXL, AMG Line" />
                </div>
                <div className="form-group">
                  <label>Engine Capacity</label>
                  <input type="text" name="engineCapacity" value={formData.engineCapacity || ''} onChange={handleInputChange} placeholder="e.g. 1500cc, 2.0L" />
                </div>
              </div>
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label>Image URL</label>
                <input type="text" name="image" value={formData.image} onChange={handleInputChange} required style={{ width: '100%' }} />
              </div>
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label>Description</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} style={{ width: '100%', minHeight: '80px' }}></textarea>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">{editingId ? 'Update Vehicle' : 'Save Vehicle'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSales;
