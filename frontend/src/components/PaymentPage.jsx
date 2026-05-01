import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiCheckCircle, FiUploadCloud } from 'react-icons/fi';

const heroImages = [
  '/hero-car.png',
  '/hero-car-2.png',
  '/hero-car-3.png'
];

const PaymentPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [receiptImage, setReceiptImage] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [currentBg, setCurrentBg] = useState(0);
  
  // Background animation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  
  // Promo code state
  const [promoCode, setPromoCode] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [promoMessage, setPromoMessage] = useState('');
  const [promoError, setPromoError] = useState('');
  const [applyingPromo, setApplyingPromo] = useState(false);

  // If accessed directly without state
  if (!state || !state.vehicle) {
    return (
      <div className="no-results" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h2>Invalid Payment Session</h2>
        <Link to="/rent" className="back-btn" style={{ marginTop: '1rem' }}><FiArrowLeft /> Back to Rentals</Link>
      </div>
    );
  }

  const { vehicle, startDate, endDate } = state;
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Calculate days (minimum 1 day)
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const totalDays = diffDays > 0 ? diffDays : 1;
  const baseAmount = totalDays * vehicle.pricePerDay;
  const discountAmount = (baseAmount * discountPercentage) / 100;
  const finalAmount = baseAmount - discountAmount;

  const handleApplyPromo = async () => {
    if (!promoCode) return;
    setApplyingPromo(true);
    setPromoError('');
    setPromoMessage('');
    try {
      const res = await fetch(`http://localhost:5000/api/promotions/verify/${promoCode}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setDiscountPercentage(data.discountPercentage);
        setPromoMessage(`Promo code applied! ${data.title} (${data.discountPercentage}% OFF)`);
      } else {
        setDiscountPercentage(0);
        setPromoError(data.message || 'Invalid or expired promo code');
      }
    } catch (err) {
      setPromoError('Failed to verify promo code');
    } finally {
      setApplyingPromo(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate size (e.g. max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptImage(reader.result); // Base64 string
        setReceiptPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!receiptImage) {
      setError("Please upload the bank receipt image.");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Find current user
      const resUsers = await fetch('http://localhost:5000/api/users');
      const users = await resUsers.json();
      const loggedInUsername = localStorage.getItem('username');
      let currentUser = null;
      
      if (loggedInUsername) {
        currentUser = users.find(u => u.username === loggedInUsername);
      }
      
      if (!currentUser) {
        currentUser = users.find(u => u.role === 'user');
      }
      
      if (!currentUser && users.length > 0) currentUser = users[0];
      
      if (!currentUser) {
        throw new Error('Please log in to book a vehicle');
      }
      
      const response = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser._id,
          vehicleId: vehicle._id,
          startDate,
          endDate,
          receipt: receiptImage,
          totalPrice: finalAmount
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit payment');
      }
      
      setSuccess(true);
      
      // Redirect to profile after short delay
      setTimeout(() => navigate('/profile'), 3000);
    } catch (err) {
      setError(err.message || 'Failed to process payment. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vehicle-details-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      {/* Background Slides (Animated) */}
      {heroImages.map((imgUrl, idx) => (
        <div 
          key={idx}
          className="sales-bg-slide"
          style={{ 
            backgroundImage: `url(${imgUrl})`,
            opacity: currentBg === idx ? 1 : 0,
            zIndex: 0,
            transition: 'opacity 1.5s ease-in-out'
          }}
        />
      ))}

      <div className="sales-nav" style={{ position: 'relative', zIndex: 1 }}>
        <div className="sales-nav-left" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link to="/home"><img src="/logo.png" alt="Samarasinghe Motors Logo" style={{ height: '65px', objectFit: 'contain' }} /></Link>
          <button onClick={() => navigate(-1)} className="back-btn" style={{ margin: 0, background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiArrowLeft /> Back
          </button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', zIndex: 1 }}>
        <div className="glass-card" style={{ maxWidth: '600px', width: '100%', padding: '2.5rem' }}>
          <h2 style={{ textAlign: 'center', color: 'var(--primary)', marginBottom: '1.5rem', fontSize: '2rem' }}>Complete Your Payment</h2>
          
          {success ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <FiCheckCircle size={64} color="#34d399" style={{ marginBottom: '1rem' }} />
              <h3 style={{ color: '#34d399', fontSize: '1.5rem', marginBottom: '1rem' }}>Thank for your booking.</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>We will confirm it soon. An email has been sent to your address.</p>
              <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--primary)' }}>Redirecting to your profile...</p>
            </div>
          ) : (
            <form onSubmit={handlePaymentSubmit}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '2rem' }}>
                <h3 style={{ margin: '0 0 1rem 0', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Booking Summary</h3>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Vehicle:</span>
                  <span style={{ fontWeight: 'bold' }}>{vehicle.make} {vehicle.model}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Rental Period:</span>
                  <span>{start.toLocaleDateString()} - {end.toLocaleDateString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Duration:</span>
                  <span>{totalDays} {totalDays === 1 ? 'day' : 'days'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Rate:</span>
                  <span>Rs. {vehicle.pricePerDay.toLocaleString()} / day</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Base Amount:</span>
                  <span>Rs. {baseAmount.toLocaleString()}</span>
                </div>
                
                {/* Promo Code Section */}
                <div style={{ marginTop: '1rem', marginBottom: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Have a Promo Code?</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input 
                      type="text" 
                      value={promoCode} 
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      placeholder="Enter code" 
                      className="auth-input"
                      style={{ flex: 1, padding: '0.5rem', margin: 0, textTransform: 'uppercase' }}
                      disabled={discountPercentage > 0}
                    />
                    <button 
                      type="button" 
                      onClick={discountPercentage > 0 ? () => { setDiscountPercentage(0); setPromoCode(''); setPromoMessage(''); } : handleApplyPromo}
                      className={discountPercentage > 0 ? "btn-outline" : "btn-primary"}
                      style={{ padding: '0 1rem', borderRadius: '8px' }}
                      disabled={applyingPromo || (!promoCode && discountPercentage === 0)}
                    >
                      {applyingPromo ? '...' : discountPercentage > 0 ? 'Remove' : 'Apply'}
                    </button>
                  </div>
                  {promoMessage && <p style={{ color: '#34d399', fontSize: '0.8rem', marginTop: '0.5rem', marginBottom: 0 }}>{promoMessage}</p>}
                  {promoError && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.5rem', marginBottom: 0 }}>{promoError}</p>}
                </div>

                {discountPercentage > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', color: '#34d399' }}>
                    <span>Discount ({discountPercentage}%):</span>
                    <span>- Rs. {discountAmount.toLocaleString()}</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed rgba(255,255,255,0.2)', fontSize: '1.2rem' }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>Total Amount:</span>
                  <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Rs. {finalAmount.toLocaleString()}</span>
                </div>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Upload Bank Transfer Receipt</label>
                <div style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)', marginBottom: '1.5rem' }}>
                  <p style={{ margin: '0 0 0.3rem 0', fontWeight: 'bold', color: 'white' }}>Samarasinghe Motors</p>
                  <p style={{ margin: '0 0 0.3rem 0', fontSize: '1.2rem', color: 'var(--primary)', fontWeight: 'bold', letterSpacing: '1px' }}>82469272</p>
                  <p style={{ margin: 0, color: 'var(--text-secondary)' }}>People's Bank Kandy</p>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Please upload the bank transfer receipt image below once payment is complete.</p>
                
                <div style={{ border: '2px dashed rgba(255,255,255,0.2)', borderRadius: '12px', padding: '2rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', position: 'relative', overflow: 'hidden' }}>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 10 }}
                  />
                  {receiptPreview ? (
                    <img src={receiptPreview} alt="Receipt Preview" style={{ maxHeight: '200px', maxWidth: '100%', borderRadius: '8px', position: 'relative', zIndex: 1 }} />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', position: 'relative', zIndex: 1 }}>
                      <FiUploadCloud size={48} color="var(--primary)" />
                      <span>Click or drag image to upload</span>
                    </div>
                  )}
                </div>
              </div>

              {error && <div className="error-message" style={{ marginBottom: '1.5rem' }}>{error}</div>}

              <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', borderRadius: '8px' }}>
                {loading ? 'Processing...' : 'Confirm & Upload Receipt'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
