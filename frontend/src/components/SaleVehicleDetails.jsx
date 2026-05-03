import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiCheckCircle, FiStar, FiTag, FiCalendar, FiActivity, FiSettings, FiTruck, FiDroplet, FiZap, FiCpu, FiShield, FiLayers } from 'react-icons/fi';

const SaleVehicleDetails = () => {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    message: ''
  });
  const [submitStatus, setSubmitStatus] = useState({ loading: false, success: false, error: null });
  const [promotions, setPromotions] = useState([]);

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const response = await fetch(`https://ravishing-illumination-production.up.railway.app/api/sales/${id}`);
        if (!response.ok) throw new Error('Vehicle not found');
        const data = await response.json();
        setVehicle(data);
      } catch (error) {
        console.error('Error fetching vehicle details:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchPromotions = async () => {
      try {
        const response = await fetch(`https://ravishing-illumination-production.up.railway.app/api/promotions`);
        const data = await response.json();
        setPromotions(data.filter(p => p.type === 'Sale' && p.isActive));
      } catch (error) {
        console.error('Error fetching promotions:', error);
      }
    };

    fetchVehicle();
    fetchPromotions();
  }, [id]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus({ loading: true, success: false, error: null });
    
    try {
      const username = localStorage.getItem('username');
      if (!username) throw new Error('Please log in to send an inquiry');
      
      const response = await fetch('https://ravishing-illumination-production.up.railway.app/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId: id,
          username,
          message: formData.message
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit inquiry');
      }
      
      setSubmitStatus({ loading: false, success: true, error: null });
      setFormData({ message: '' });
      
      // Reset success message after 5 seconds
      setTimeout(() => setSubmitStatus(prev => ({ ...prev, success: false })), 5000);
    } catch (error) {
      setSubmitStatus({ loading: false, success: false, error: error.message || 'Failed to send inquiry. Please try again later.' });
    }
  };

  if (loading) {
    return <div className="loading-spinner" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading vehicle details...</div>;
  }

  if (!vehicle) {
    return (
      <div className="no-results" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h2>Vehicle Not Found</h2>
        <Link to="/sales" className="back-btn" style={{ marginTop: '1rem' }}><FiArrowLeft /> Back to Sales</Link>
      </div>
    );
  }

  return (
    <div className="vehicle-details-page">
      {/* Top Navigation */}
      <div className="sales-nav">
        <div className="sales-nav-left" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link to="/home"><img src="/logo.png" alt="Samarasinghe Motors Logo" style={{ height: '65px', objectFit: 'contain' }} /></Link>
          <Link to="/sales" className="back-btn" style={{ margin: 0 }}><FiArrowLeft /> Back to Listings</Link>
        </div>
      </div>

      <div className="details-container">
        {/* Left Side: Image and Specs */}
        <div className="details-info">
          <div className="details-image-container">
            <img src={vehicle.image} alt={`${vehicle.make} ${vehicle.model}`} className="details-image" />
            <div className="details-condition-badge">{vehicle.condition}</div>
          </div>
          
          <div className="details-header">
            <h1 className="details-title">{vehicle.yearOfManufacture} {vehicle.make} {vehicle.model}</h1>
            <div className="details-price">Rs. {vehicle.price.toLocaleString()}</div>
          </div>
          
          <div className="details-specs-grid">
            <div className="spec-item">
              <span className="spec-label"><FiShield style={{ color: '#00b4d8' }} /> Brand</span>
              <span className="spec-value">{vehicle.make}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label"><FiLayers style={{ color: '#00b4d8' }} /> Model</span>
              <span className="spec-value">{vehicle.model}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label"><FiZap style={{ color: '#00b4d8' }} /> Trim / Edition</span>
              <span className="spec-value">{vehicle.trimEdition || '-'}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label"><FiCalendar style={{ color: '#00b4d8' }} /> Year</span>
              <span className="spec-value">{vehicle.yearOfManufacture}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label"><FiActivity style={{ color: '#00b4d8' }} /> Condition</span>
              <span className="spec-value">{vehicle.condition}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label"><FiSettings style={{ color: '#00b4d8' }} /> Transmission</span>
              <span className="spec-value">{vehicle.transmission}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label"><FiTruck style={{ color: '#00b4d8' }} /> Body Type</span>
              <span className="spec-value">{vehicle.vehicleType}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label"><FiDroplet style={{ color: '#00b4d8' }} /> Fuel Type</span>
              <span className="spec-value">{vehicle.fuelType}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label"><FiCpu style={{ color: '#00b4d8' }} /> Engine</span>
              <span className="spec-value">{vehicle.engineCapacity || '-'}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label"><FiActivity style={{ color: '#00b4d8' }} /> Mileage</span>
              <span className="spec-value">{vehicle.mileage.toLocaleString()} km</span>
            </div>
          </div>
          
          <div className="details-description">
            <h3>Description</h3>
            <p>{vehicle.description || 'No description provided.'}</p>
            
            <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', borderLeft: '4px solid var(--primary)' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)', fontSize: '1.1rem' }}>Contact for inquiries</h4>
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                Call us directly at <strong style={{ color: 'var(--primary)', fontSize: '1.2rem' }}>+94 77 123 4567</strong> for immediate assistance.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Inquiry Form */}
        <div className="inquiry-section">
          <div className="inquiry-card">
            <h2>Interested in this vehicle?</h2>
            <p>Send us an inquiry and our sales team will get back to you shortly.</p>
            
            {submitStatus.success ? (
              <div className="success-message">
                <FiCheckCircle size={24} />
                <span>Your inquiry has been sent successfully! We will contact you soon.</span>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="inquiry-form">
                <div className="form-group">
                  <label>Message</label>
                  <textarea 
                    name="message" 
                    value={formData.message} 
                    onChange={handleInputChange} 
                    required 
                    placeholder="I am interested in buying this vehicle. Please let me know the availability..."
                    rows="5"
                  ></textarea>
                </div>
                
                {submitStatus.error && <div className="error-message">{submitStatus.error}</div>}
                
                <button type="submit" className="submit-inquiry-btn" disabled={submitStatus.loading}>
                  {submitStatus.loading ? 'Sending...' : 'Send Inquiry'}
                </button>
              </form>
            )}
          </div>

          {/* Active Promotions */}
          {promotions.length > 0 && (
            <div className="inquiry-card" style={{ marginTop: '2rem', background: 'rgba(0, 180, 216, 0.05)', border: '1px solid rgba(0, 180, 216, 0.3)' }}>
              <h3 style={{ color: 'var(--primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FiTag /> Special Offers
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {promotions.map(promo => (
                  <div key={promo._id} style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid var(--primary)' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: 'white', fontSize: '1.1rem' }}>{promo.title}</h4>
                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{promo.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SaleVehicleDetails;
