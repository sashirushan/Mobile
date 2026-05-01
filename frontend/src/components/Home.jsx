import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowRight, FiUser, FiLogOut, FiPhone, FiMapPin, FiMail, FiTag, FiCalendar } from 'react-icons/fi';
import ChatBot from './ChatBot';

const images = [
  '/hero-car.png',
  '/hero-car-2.png',
  '/hero-car-3.png'
];

const Home = () => {
  const navigate = useNavigate();
  const [currentBg, setCurrentBg] = useState(0);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }

    const interval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="portal-container">
      {/* Background Slides */}
      {images.map((imgUrl, idx) => (
        <div 
          key={idx}
          className="home-bg-slide"
          style={{ 
            backgroundImage: `url(${imgUrl})`,
            opacity: currentBg === idx ? 1 : 0 
          }}
        />
      ))}

      {/* Right Upper Corner Profile & Logout */}
      <div className="profile-header">
        <div className="user-profile" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
          <div className="user-icon-circle">
            <FiUser size={20} />
          </div>
          <span>My Profile</span>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <FiLogOut size={16} /> Logout
        </button>
      </div>

      <div className="portal-header">
        <img src="/logo.png" alt="Samarasinghe Motors Logo" onClick={() => navigate('/home')} style={{ cursor: 'pointer' }} />
        <h1>Samarasinghe Motors</h1>
        <p>Select your intended portal below to continue</p>
      </div>

      <div className="portal-grid">
        {/* Vehicle Sales Card */}
        <div className="portal-card" onClick={() => navigate('/sales')}>
          <div className="card-img-wrapper">
            <img src="/sale_portal_bg.png" alt="Vehicle Sales" />
          </div>
          <div className="card-content">
            <div className="card-icon-main">
              <FiTag />
            </div>
            <h2>Vehicle Sales</h2>
            <p>Find your dream car from our premium collection. Quality, performance, and excellence you can trust.</p>
            <button className="card-btn">
              Explore Sales <FiArrowRight />
            </button>
          </div>
        </div>

        {/* Vehicle Rentals Card */}
        <div className="portal-card" onClick={() => navigate('/rent')}>
          <div className="card-img-wrapper">
            <img src="/rent_portal_bg.png" alt="Vehicle Rentals" />
          </div>
          <div className="card-content">
            <div className="card-icon-main">
              <FiCalendar />
            </div>
            <h2>Vehicle Rentals</h2>
            <p>Rent the perfect car for any occasion. Flexible plans, great prices, and unmatched comfort.</p>
            <button className="card-btn">
              Explore Rentals <FiArrowRight />
            </button>
          </div>
        </div>
      </div>

      {/* About Description */}
      <div className="portal-about">
        <h2>Experience Automotive Excellence</h2>
        <p>
          At Samarasinghe Motors, we pride ourselves on delivering an unparalleled automotive experience. 
          Whether you're looking to own a masterpiece or experience the thrill of a high-performance rental, 
          our curated selection meets the highest standards of luxury and engineering.
        </p>
      </div>

      {/* Modern Contact Footer */}
      <div className="portal-footer">
        <div className="footer-item">
          <FiPhone size={18} />
          <span>+94 77 123 4567</span>
        </div>
        <div className="footer-item">
          <FiMapPin size={18} />
          <span>No 45, Kandy Road, Colombo 03</span>
        </div>
        <div className="footer-item">
          <FiMail size={18} />
          <span>info@samarasinghemotors.com</span>
        </div>
      </div>

      <ChatBot />
    </div>
  );
};

export default Home;
