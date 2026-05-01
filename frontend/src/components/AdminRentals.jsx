import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiEdit2, FiTrash2, FiPlus, FiX, FiDownload } from 'react-icons/fi';
const AdminRentals = ({ onDownloadReport }) => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    vehicleType: 'Car', make: '', model: '', yearOfManufacture: '', 
    fuelType: 'Petrol', fuelConsumption: '', seats: '', pricePerDay: '', transmission: 'Automatic', 
    dailyMileageLimit: 100, extraKmCharge: 50, image: '', description: ''
  });

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/rentals');
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

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/rentals/${id}/status`, { status: newStatus });
      fetchVehicles();
    } catch (err) {
      console.error('Failed to update status', err);
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this rental vehicle?')) {
      try {
        await axios.delete(`http://localhost:5000/api/rentals/${id}`);
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
        await axios.put(`http://localhost:5000/api/rentals/${editingId}`, formData);
      } else {
        await axios.post('http://localhost:5000/api/rentals', formData);
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
      vehicleType: 'Car', make: '', model: '', yearOfManufacture: '', 
      fuelType: 'Petrol', fuelConsumption: '', seats: '', pricePerDay: '', transmission: 'Automatic', 
      dailyMileageLimit: 100, extraKmCharge: 50, image: '', description: ''
    });
  };

  return (
    <div className="admin-subcomponent">
      <div className="section-header" style={{ background: 'transparent', border: 'none', padding: '0 0 1.5rem 0' }}>
        <h2>Rental Vehicles</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-outline" onClick={onDownloadReport} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.5rem', borderRadius: '12px', color: 'var(--primary)', borderColor: 'var(--primary)' }}>
            <FiDownload /> Weekly Report
          </button>
          <button className="admin-add-btn" onClick={() => { resetForm(); setIsModalOpen(true); }}>
            <FiPlus /> Add New Rental
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
              <th>Price/Day (Rs)</th>
              <th>Seats / Fuel</th>
              <th>Status</th>
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
                  <td>{v.pricePerDay.toLocaleString()}</td>
                  <td>
                    <span className="status-badge pending" style={{ marginRight: '5px' }}>{v.seats} Seats</span>
                    <span className="status-badge success">{v.fuelConsumption} km/l</span>
                  </td>
                  <td>
                    <select 
                      value={v.status} 
                      onChange={(e) => handleStatusChange(v._id, e.target.value)}
                      style={{ 
                        padding: '0.4rem', 
                        borderRadius: '4px', 
                        background: 'rgba(255,255,255,0.05)', 
                        color: v.status === 'Booked' ? '#ef4444' : v.status === 'Maintenance' ? '#f59e0b' : '#34d399',
                        border: '1px solid rgba(255,255,255,0.1)',
                        fontWeight: 'bold'
                      }}
                    >
                      <option value="Available" style={{ color: 'black' }}>Available</option>
                      <option value="Booked" style={{ color: 'black' }}>Booked</option>
                      <option value="Maintenance" style={{ color: 'black' }}>Maintenance</option>
                    </select>
                  </td>
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
              <h2>{editingId ? 'Edit Rental Vehicle' : 'Add New Rental Vehicle'}</h2>
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
                  <label>Price Per Day (Rs.)</label>
                  <input type="number" name="pricePerDay" value={formData.pricePerDay} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Vehicle Type</label>
                  <select name="vehicleType" value={formData.vehicleType} onChange={handleInputChange}>
                    <option value="Car">Car</option><option value="Van">Van</option><option value="SUV">SUV</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Fuel Type</label>
                  <select name="fuelType" value={formData.fuelType} onChange={handleInputChange}>
                    <option value="Petrol">Petrol</option><option value="Diesel">Diesel</option><option value="Hybrid">Hybrid</option><option value="Electric">Electric</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Fuel Consumption (km/l)</label>
                  <input type="number" name="fuelConsumption" value={formData.fuelConsumption} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Number of Seats</label>
                  <input type="number" name="seats" value={formData.seats} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Transmission</label>
                  <select name="transmission" value={formData.transmission} onChange={handleInputChange}>
                    <option value="Automatic">Automatic</option><option value="Manual">Manual</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Daily Mileage Limit (km)</label>
                  <input type="number" name="dailyMileageLimit" value={formData.dailyMileageLimit || ''} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Extra Km Charge (Rs.)</label>
                  <input type="number" name="extraKmCharge" value={formData.extraKmCharge || ''} onChange={handleInputChange} required />
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

export default AdminRentals;
