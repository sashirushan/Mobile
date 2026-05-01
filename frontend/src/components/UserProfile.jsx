import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { FiUser, FiPhone, FiMapPin, FiMail, FiStar, FiCalendar, FiClock, FiMessageCircle } from 'react-icons/fi';

const UserProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [userInquiries, setUserInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('rentals');
  
  // Edit Profile State
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', phone: '', address: '' });

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      // For this prototype, we rely on local storage to identify the user
      // In a real app, we would verify the token via an /api/auth/me route
      // Let's fetch the list of users and match by username since we don't store userId in localStorage yet.
      // Wait, we need the userId to fetch bookings. Let's find the user by fetching all and matching.
      
      try {
        if (!token) {
          navigate('/login');
          return;
        }

        const resUsers = await axios.get('http://localhost:5000/api/users');
        const loggedInUsername = localStorage.getItem('username');
        let currentUser = null;
        
        if (loggedInUsername) {
          currentUser = resUsers.data.find(u => u.username === loggedInUsername);
        }
        
        if (!currentUser) {
          currentUser = resUsers.data.find(u => u.role === 'user');
        }
        
        if (!currentUser && resUsers.data.length > 0) {
          currentUser = resUsers.data[0];
        }

        if (currentUser) {
          setUser(currentUser);
          setFormData({
            fullName: currentUser.fullName || '',
            phone: currentUser.phone || '',
            address: currentUser.address || ''
          });

          // Fetch History
          const resHistory = await axios.get(`http://localhost:5000/api/bookings/user/${currentUser._id}`);
          setHistory(resHistory.data);

          // Fetch Inquiries
          if (currentUser.email) {
            const resInquiries = await axios.get(`http://localhost:5000/api/inquiries/user/${currentUser.email}`);
            setUserInquiries(resInquiries.data);
          }
        }
      } catch (err) {
        console.error('Error fetching profile data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/users/${user._id}`, formData);
      setUser({ ...user, ...formData });
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to update profile');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await axios.put(`http://localhost:5000/api/bookings/${bookingId}/cancel`);
      alert('Your booking canceled. we will contact you soon for the refund.');
      // Refresh history
      const resHistory = await axios.get(`http://localhost:5000/api/bookings/user/${user._id}`);
      setHistory(resHistory.data);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const handleEndBooking = async (id) => {
    if (window.confirm('Are you sure you want to end this booking and return the vehicle?')) {
      try {
        await axios.put(`http://localhost:5000/api/bookings/${id}/end`);
        // Refresh history
        const resHistory = await axios.get(`http://localhost:5000/api/bookings/user/${user._id}`);
        setHistory(resHistory.data);
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.message || 'Failed to end booking');
      }
    }
  };

  const openReviewModal = (vehicle) => {
    setSelectedVehicle(vehicle);
    setRating(5);
    setFeedback('');
    setReviewModalOpen(true);
  };

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:5000/api/rentals/${selectedVehicle._id}/reviews`, {
        userId: user._id,
        username: user.fullName || user.username,
        rating,
        feedback
      });
      setReviewModalOpen(false);
      alert('Thank you for your feedback! Your rating has been added.');
    } catch (err) {
      console.error(err);
      alert('Failed to submit review');
    }
  };

  if (loading) {
    return <div style={{ color: 'white', textAlign: 'center', marginTop: '100px' }}>Loading Profile...</div>;
  }

  return (
    <div className="portal-container" style={{ paddingTop: '100px', minHeight: '100vh', background: 'var(--bg-dark)' }}>
      {/* Top Navigation */}
      <div className="sales-nav" style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '1.5rem 2.5rem' }}>
        <div className="sales-nav-left" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link to="/home"><img src="/logo.png" alt="Samarasinghe Motors Logo" style={{ height: '65px', objectFit: 'contain' }} /></Link>
        </div>
      </div>

      <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
          {/* Profile Card */}
          <div className="glass-card" style={{ padding: '2rem', height: 'fit-content' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--primary)', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 'bold' }}>
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <h2 style={{ margin: 0 }}>{user?.fullName || user?.username}</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Premium Member</p>
            </div>

            {isEditing ? (
              <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Full Name</label>
                  <input type="text" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} className="auth-input" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Phone Number</label>
                  <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="auth-input" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Address</label>
                  <textarea value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="auth-input" rows="3"></textarea>
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button type="button" onClick={() => setIsEditing(false)} className="btn-outline" style={{ flex: 1, padding: '0.8rem', borderRadius: '8px' }}>Cancel</button>
                  <button type="submit" className="btn-primary" style={{ flex: 1, padding: '0.8rem', borderRadius: '8px' }}>Save</button>
                </div>
              </form>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <FiMail size={20} color="var(--primary)" /> <span>{user?.email || 'No email provided'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <FiPhone size={20} color="var(--primary)" /> <span>{user?.phone || 'No phone provided'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <FiMapPin size={20} color="var(--primary)" /> <span>{user?.address || 'No address provided'}</span>
                </div>
                <button onClick={() => setIsEditing(true)} className="btn-primary" style={{ marginTop: '1rem', padding: '0.8rem', borderRadius: '8px', width: '100%' }}>
                  Edit Profile
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Tabs for Rentals and Inquiries */}
          <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '1.5rem' }}>
              <button 
                onClick={() => setActiveTab('rentals')} 
                style={{ flex: 1, padding: '1rem', background: 'none', border: 'none', borderBottom: activeTab === 'rentals' ? '2px solid var(--primary)' : '2px solid transparent', color: activeTab === 'rentals' ? 'white' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.3s' }}
              >
                <FiClock /> Previous Rentals
              </button>
              <button 
                onClick={() => setActiveTab('inquiries')} 
                style={{ flex: 1, padding: '1rem', background: 'none', border: 'none', borderBottom: activeTab === 'inquiries' ? '2px solid var(--primary)' : '2px solid transparent', color: activeTab === 'inquiries' ? 'white' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.3s' }}
              >
                <FiMessageCircle /> My Inquiries
              </button>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {activeTab === 'rentals' ? (
                <>
                  {history.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
                      <FiClock size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                      <p>You haven't rented any vehicles yet.</p>
                      <button onClick={() => navigate('/rent')} className="btn-outline" style={{ marginTop: '1rem', padding: '0.5rem 1rem', borderRadius: '8px' }}>Browse Rentals</button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      {history.map(booking => (
                        <div key={booking._id} style={{ display: 'flex', gap: '1.5rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <img src={booking.vehicle?.image} alt="Vehicle" style={{ width: '120px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                          <div style={{ flex: 1 }}>
                            <h3 style={{ margin: '0 0 0.5rem 0' }}>{booking.vehicle?.make} {booking.vehicle?.model}</h3>
                            <p style={{ color: 'var(--text-secondary)', margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>
                              <FiCalendar style={{ marginRight: '0.5rem' }} /> Rented on {new Date(booking.createdAt).toLocaleDateString()}
                            </p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', marginBottom: '1rem', fontSize: '0.9rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <strong style={{ color: 'var(--text-secondary)' }}>Payment Status:</strong> 
                                <span className={`status-badge ${booking.paymentStatus === 'Rejected' ? 'danger' : booking.paymentStatus === 'Accepted' ? 'success' : 'pending'}`}>{booking.paymentStatus}</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <strong style={{ color: 'var(--text-secondary)' }}>Booking Status:</strong> 
                                <span className={`status-badge ${booking.status === 'Cancelled' ? 'danger' : booking.status === 'Confirmed' ? 'success' : 'pending'}`}>{booking.status}</span>
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                              {booking.status === 'Confirmed' || booking.status === 'Completed' ? (
                                <button onClick={() => openReviewModal(booking.vehicle)} className="btn-primary" style={{ padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <FiStar /> Leave a Review
                                </button>
                              ) : null}
                              {booking.status === 'Pending' && (
                                <button onClick={() => handleCancelBooking(booking._id)} className="btn-outline" style={{ padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.9rem', color: '#ef4444', borderColor: '#ef4444' }}>
                                  Cancel Booking
                                </button>
                              )}
                              {booking.status === 'Confirmed' && (
                                <button onClick={() => handleEndBooking(booking._id)} className="btn-outline" style={{ padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.9rem', color: '#f59e0b', borderColor: '#f59e0b' }}>
                                  End Booking
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <>
                  {userInquiries.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
                      <FiMessageCircle size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                      <p>You haven't made any inquiries yet.</p>
                      <button onClick={() => navigate('/sales')} className="btn-outline" style={{ marginTop: '1rem', padding: '0.5rem 1rem', borderRadius: '8px' }}>Browse Vehicles</button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      {userInquiries.map(inquiry => (
                        <div key={inquiry._id} style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <div>
                              <h3 style={{ margin: '0 0 0.5rem 0' }}>Inquiry about: {inquiry.vehicleId?.make} {inquiry.vehicleId?.model}</h3>
                              <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>
                                <FiCalendar style={{ marginRight: '0.5rem' }} /> {new Date(inquiry.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <span className={`status-badge ${inquiry.status === 'Rejected' ? 'danger' : inquiry.status === 'Accepted' || inquiry.status === 'Replied' ? 'success' : 'pending'}`}>
                              {inquiry.status}
                            </span>
                          </div>
                          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                            <p style={{ margin: 0, color: 'var(--text-secondary)' }}><strong>Your Message:</strong></p>
                            <p style={{ margin: '0.5rem 0 0 0' }}>{inquiry.message}</p>
                          </div>
                          {inquiry.replyMessage && (
                            <div style={{ background: 'rgba(0, 180, 216, 0.1)', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid var(--primary)' }}>
                              <p style={{ margin: 0, color: 'var(--primary)' }}><strong>Reply from Admin:</strong></p>
                              <p style={{ margin: '0.5rem 0 0 0' }}>{inquiry.replyMessage}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {reviewModalOpen && selectedVehicle && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '550px', padding: '2.5rem' }}>
            <div className="modal-header" style={{ marginBottom: '1.5rem', borderBottom: 'none' }}>
              <h2 style={{ fontSize: '1.8rem' }}>Rate Your Experience</h2>
              <button className="icon-btn" onClick={() => setReviewModalOpen(false)}>✕</button>
            </div>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <img src={selectedVehicle.image} alt="Vehicle" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '12px', marginBottom: '1rem', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} />
              <h3 style={{ fontSize: '1.4rem', color: 'var(--primary)' }}>{selectedVehicle.make} {selectedVehicle.model}</h3>
            </div>
            
            <form onSubmit={submitReview}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.8rem', marginBottom: '2rem' }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <FiStar 
                    key={star} 
                    size={36} 
                    style={{ 
                      cursor: 'pointer', 
                      fill: star <= rating ? '#fbbf24' : 'transparent', 
                      color: star <= rating ? '#fbbf24' : 'rgba(255,255,255,0.15)',
                      transition: 'all 0.2s'
                    }} 
                    onClick={() => setRating(star)} 
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                  />
                ))}
              </div>
              
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.8rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>Your Feedback</label>
                <textarea 
                  value={feedback} 
                  onChange={(e) => setFeedback(e.target.value)} 
                  rows="5" 
                  placeholder="Tell us what you thought about this vehicle..."
                  required
                  style={{
                    width: '100%',
                    padding: '1.2rem',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(0, 180, 216, 0.3)',
                    borderRadius: '12px',
                    color: 'white',
                    fontFamily: 'inherit',
                    fontSize: '1rem',
                    resize: 'vertical',
                    boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.2)',
                    transition: 'border-color 0.3s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(0, 180, 216, 0.3)'}
                ></textarea>
              </div>
              
              <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1.2rem', borderRadius: '12px', fontWeight: 'bold', fontSize: '1.1rem', letterSpacing: '1px' }}>
                Submit Review
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
