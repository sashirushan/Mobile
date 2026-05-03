import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiMail, FiLock, FiAlertCircle, FiLogIn, FiUser, FiPhone, FiMapPin } from 'react-icons/fi';

const images = [
  '/hero-car.png',
  '/hero-car-2.png',
  '/hero-car-3.png'
];

const Login = () => {
  const navigate = useNavigate();
  const [currentBg, setCurrentBg] = useState(0);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ 
    username: '', 
    password: '', 
    fullName: '', 
    email: '', 
    phone: '', 
    address: '', 
    confirmPassword: '' 
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isLogin) {
      if (!formData.username || !formData.password) {
        return setError('Please fill in all fields');
      }
    } else {
      if (!formData.username || !formData.password || !formData.fullName || !formData.email || !formData.phone || !formData.address || !formData.confirmPassword) {
        return setError('Please fill in all fields for registration');
      }
      if (formData.password !== formData.confirmPassword) {
        return setError('Passwords do not match');
      }
    }

    setLoading(true);
    
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const res = await axios.post(`https://ravishing-illumination-production.up.railway.app${endpoint}`, formData);
      
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        if (res.data.user && res.data.user.username) {
          localStorage.setItem('username', res.data.user.username);
        }
        
        // Handle Role-Based Redirection
        if (res.data.user && res.data.user.role === 'admin') {
          localStorage.setItem('role', 'admin');
          window.location.href = '/admin';
        } else {
          localStorage.setItem('role', 'user');
          window.location.href = '/home';
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to connect to the server');
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({ 
      username: '', 
      password: '', 
      fullName: '', 
      email: '', 
      phone: '', 
      address: '', 
      confirmPassword: '' 
    });
  };

  return (
    <div className="auth-page">
      {/* Left split - Hero Image Section */}
      <div className="hero-section">
        {/* Background Slides */}
        {images.map((imgUrl, idx) => (
          <div 
            key={idx}
            className="hero-bg-slide"
            style={{ 
              backgroundImage: `url(${imgUrl})`,
              opacity: currentBg === idx ? 1 : 0 
            }}
          />
        ))}
        
        <div className="hero-content hero-brand">
          <img src="/logo.png" alt="Samarasinghe Motors Logo" />
        </div>
        
        <div className="hero-content hero-text">
          <h1>POWER MEETS<br />PRECISION.</h1>
          <p>Experience the thrill of speed, design, and technology working seamlessly together. Log in to access your portal.</p>
        </div>
      </div>

      {/* Right split - Interactive Login Form */}
      <div className="login-section">
        <div className="login-card">
          <div className="login-header">
            <h2>{isLogin ? 'Sign In' : 'Create Account'}</h2>
            <p>{isLogin ? 'Access your personalized dashboard' : 'Join Samarasinghe Motors today'}</p>
          </div>

          {error && (
            <div className="error-message">
              <FiAlertCircle />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="form-group">
                <label>Full Name</label>
                <div className="input-wrapper">
                  <FiUser className="input-icon" />
                  <input
                    type="text"
                    name="fullName"
                    className="form-control"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}

            {!isLogin && (
              <div className="form-group">
                <label>Email Address</label>
                <div className="input-wrapper">
                  <FiMail className="input-icon" />
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}

            {!isLogin && (
              <div className="form-group">
                <label>Phone Number</label>
                <div className="input-wrapper">
                  <FiPhone className="input-icon" />
                  <input
                    type="text"
                    name="phone"
                    className="form-control"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}

            {!isLogin && (
              <div className="form-group">
                <label>Address</label>
                <div className="input-wrapper">
                  <FiMapPin className="input-icon" />
                  <input
                    type="text"
                    name="address"
                    className="form-control"
                    placeholder="Enter your residence address"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label>Username</label>
              <div className="input-wrapper">
                <FiMail className="input-icon" />
                <input
                  type="text"
                  name="username"
                  className="form-control"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="input-wrapper">
                <FiLock className="input-icon" />
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            {!isLogin && (
              <div className="form-group">
                <label>Confirm Password</label>
                <div className="input-wrapper">
                  <FiLock className="input-icon" />
                  <input
                    type="password"
                    name="confirmPassword"
                    className="form-control"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Authenticating...' : (
                <>
                  <FiLogIn /> {isLogin ? 'Enter Portal' : 'Register Now'}
                </>
              )}
            </button>
            <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <span 
                onClick={toggleAuthMode} 
                style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: '600' }}
              >
                {isLogin ? 'Register' : 'Sign In'}
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
