import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCheckCircle, FiCalendar, FiTag, FiPercent, FiShield, FiLayers, FiSettings, FiDroplet, FiZap, FiUsers, FiNavigation, FiDollarSign } from 'react-icons/fi';

const RentVehicleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Booking form state
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: ''
  });
  const [submitStatus, setSubmitStatus] = useState({ loading: false, success: false, error: null });
  const [promotions, setPromotions] = useState([]);

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const response = await fetch(`https://ravishing-illumination-production.up.railway.app/api/rentals/${id}`);
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
        setPromotions(data.filter(p => p.type === 'Rental' && p.isActive));
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

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!formData.startDate || !formData.endDate) {
      alert("Please select start and end dates.");
      return;
    }
    
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    if (end <= start) {
      alert("End date must be after start date.");
      return;
    }
    
    navigate('/payment', { state: { vehicle, startDate: formData.startDate, endDate: formData.endDate } });
  };

  if (loading) {
    return <div className="loading-spinner" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading vehicle details...</div>;
  }

  if (!vehicle) {
    return (
      <div className="no-results" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h2>Vehicle Not Found</h2>
        <Link to="/rent" className="back-btn" style={{ marginTop: '1rem' }}><FiArrowLeft /> Back to Rentals</Link>
      </div>
    );
  }

  return (
    <div className="vehicle-details-page">
      {/* Top Navigation */}
      <div className="sales-nav">
        <div className="sales-nav-left" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link to="/home"><img src="/logo.png" alt="Samarasinghe Motors Logo" style={{ height: '65px', objectFit: 'contain' }} /></Link>
          <Link to="/rent" className="back-btn" style={{ margin: 0 }}><FiArrowLeft /> Back to Rentals</Link>
        </div>
      </div>

      <div className="details-container">
        {/* Left Side: Image and Specs */}
        <div className="details-info">
          <div className="details-image-container">
            <img src={vehicle.image} alt={`${vehicle.make} ${vehicle.model}`} className="details-image" />
            <div className="details-condition-badge" style={{ background: 'var(--primary)' }}>For Rent</div>
          </div>
          
          <div className="details-header">
            <h1 className="details-title">{vehicle.yearOfManufacture} {vehicle.make} {vehicle.model}</h1>
            <div className="details-price">Rs. {vehicle.pricePerDay.toLocaleString()} <span style={{fontSize: '1rem', color: 'var(--text-secondary)'}}>/ day</span></div>
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
              <span className="spec-label"><FiCalendar style={{ color: '#00b4d8' }} /> Year</span>
              <span className="spec-value">{vehicle.yearOfManufacture}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label"><FiSettings style={{ color: '#00b4d8' }} /> Transmission</span>
              <span className="spec-value">{vehicle.transmission}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label"><FiDroplet style={{ color: '#00b4d8' }} /> Fuel Type</span>
              <span className="spec-value">{vehicle.fuelType}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label"><FiZap style={{ color: '#00b4d8' }} /> Consumption</span>
              <span className="spec-value">{vehicle.fuelConsumption} km/l</span>
            </div>
            <div className="spec-item">
              <span className="spec-label"><FiUsers style={{ color: '#00b4d8' }} /> Seats</span>
              <span className="spec-value">{vehicle.seats} Persons</span>
            </div>
            <div className="spec-item">
              <span className="spec-label"><FiNavigation style={{ color: '#00b4d8' }} /> Daily Limit</span>
              <span className="spec-value">{vehicle.dailyMileageLimit || 100} km</span>
            </div>
            <div className="spec-item">
              <span className="spec-label"><FiDollarSign style={{ color: '#00b4d8' }} /> Extra Km Charge</span>
              <span className="spec-value">Rs. {vehicle.extraKmCharge || 50} / km</span>
            </div>
          </div>
          
          <div className="details-description">
            <h3>Description</h3>
            <p>{vehicle.description || 'No description provided.'}</p>
            
            <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', borderLeft: '4px solid var(--primary)' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)', fontSize: '1.1rem' }}>Need Help?</h4>
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                Call us directly at <strong style={{ color: 'var(--primary)', fontSize: '1.2rem' }}>+94 77 123 4567</strong> for immediate assistance with your booking.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Booking Form */}
        <div className="inquiry-section">
          <div className="inquiry-card">
            <h2>Book this vehicle</h2>
            <p>Select your dates and provide payment proof to complete your booking.</p>
            
            {vehicle.status !== 'Available' ? (
              <div style={{ padding: '1.5rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', marginTop: '1rem', textAlign: 'center' }}>
                <p style={{ color: '#ef4444', fontWeight: 'bold', margin: 0 }}>This vehicle is currently {vehicle.status.toLowerCase()} and cannot be booked.</p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Please check back later or browse other available vehicles.</p>
              </div>
            ) : submitStatus.success ? (
              <div className="success-message">
                <FiCheckCircle size={24} />
                <span>Your booking has been submitted! Redirecting to profile...</span>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="inquiry-form">
                <div className="form-group" style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label><FiCalendar /> Start Date</label>
                    <input 
                      type="date" 
                      name="startDate" 
                      value={formData.startDate} 
                      min={new Date().toISOString().split('T')[0]}
                      onChange={handleInputChange} 
                      required 
                      className="auth-input"
                      style={{ marginTop: '0.5rem', width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label><FiCalendar /> End Date</label>
                    <input 
                      type="date" 
                      name="endDate" 
                      value={formData.endDate} 
                      min={formData.startDate || new Date().toISOString().split('T')[0]}
                      onChange={handleInputChange} 
                      required 
                      className="auth-input"
                      style={{ marginTop: '0.5rem', width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                    />
                  </div>
                </div>

                <button type="submit" className="submit-inquiry-btn" style={{ marginTop: '1.5rem', width: '100%' }}>
                  Proceed to Payment
                </button>
              </form>
            )}
          </div>

          {/* Active Promotions */}
          {promotions.length > 0 && (
            <div className="inquiry-card" style={{ marginTop: '2rem', background: 'rgba(52, 211, 153, 0.05)', border: '1px solid rgba(52, 211, 153, 0.3)' }}>
              <h3 style={{ color: '#34d399', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FiTag /> Rental Discounts
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {promotions.map(promo => (
                  <div key={promo._id} style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid #34d399' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h4 style={{ margin: '0 0 0.5rem 0', color: 'white', fontSize: '1.1rem' }}>{promo.title}</h4>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', background: 'rgba(52, 211, 153, 0.2)', color: '#34d399', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                        <FiPercent /> {promo.discountPercentage}% OFF
                      </span>
                    </div>
                    <p style={{ margin: '0 0 0.8rem 0', color: 'var(--text-secondary)' }}>{promo.description}</p>
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.5rem 0.8rem', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Promo Code:</span>
                      <strong style={{ letterSpacing: '1px', color: '#34d399' }}>{promo.promoCode}</strong>
                    </div>
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

export default RentVehicleDetails;
