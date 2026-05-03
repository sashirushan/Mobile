import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSearch, FiFilter } from 'react-icons/fi';

const images = [
  '/hero-car.png',
  '/hero-car-2.png',
  '/hero-car-3.png'
];

const Rentals = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentBg, setCurrentBg] = useState(0);
  const [filters, setFilters] = useState({
    search: '',
    vehicleType: '',
    make: '',
    yearOfManufacture: '',
    transmission: '',
    fuelType: '',
    minFuelConsumption: '',
    maxFuelConsumption: '',
    minSeats: '',
    maxSeats: '',
    minPrice: '',
    maxPrice: ''
  });

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams(
        Object.entries(filters).filter(([_, v]) => v !== '')
      ).toString();

      const response = await fetch(`https://ravishing-illumination-production.up.railway.app/api/rentals?${queryParams}`);
      const data = await response.json();
      setVehicles(data);
    } catch (error) {
      console.error('Error fetching rentals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [filters]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchVehicles();
  };

  const handleViewDetails = (vehicleId) => {
    navigate(`/rent/${vehicleId}`);
  };

  return (
    <div className="sales-page"> {/* Reusing sales-page class for identical layout */}
      {/* Background Slides */}
      {images.map((imgUrl, idx) => (
        <div 
          key={idx}
          className="sales-bg-slide"
          style={{ 
            backgroundImage: `url(${imgUrl})`,
            opacity: currentBg === idx ? 1 : 0 
          }}
        />
      ))}

      {/* Top Navigation */}
      <div className="sales-nav">
        <div className="sales-nav-left" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link to="/home"><img src="/logo.png" alt="Samarasinghe Motors Logo" style={{ height: '65px', objectFit: 'contain' }} /></Link>
          <Link to="/home" className="back-btn" style={{ margin: 0 }}><FiArrowLeft /> Back to Portal</Link>
        </div>
        <div className="search-bar-container">
          <form onSubmit={handleSearchSubmit} className="search-form">
            <FiSearch className="search-icon" />
            <input 
              type="text" 
              name="search"
              placeholder="Search make or model..." 
              value={filters.search}
              onChange={handleFilterChange}
              className="search-input"
            />
          </form>
        </div>
      </div>

      <div className="sales-content">
        {/* Left Sidebar Filter */}
        <aside className="sales-sidebar">
          <div className="filter-header">
            <FiFilter />
            <h3>Rental Filters</h3>
          </div>
          
          <div className="filter-group">
            <label>Vehicle Type</label>
            <select name="vehicleType" value={filters.vehicleType} onChange={handleFilterChange}>
              <option value="">All Types</option>
              <option value="Car">Car</option>
              <option value="Van">Van</option>
              <option value="SUV">SUV</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Make</label>
            <select name="make" value={filters.make} onChange={handleFilterChange}>
              <option value="">All Makes</option>
              <option value="Toyota">Toyota</option>
              <option value="Honda">Honda</option>
              <option value="Nissan">Nissan</option>
              <option value="BMW">BMW</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Manufacture Year</label>
            <input 
              type="number" 
              name="yearOfManufacture" 
              placeholder="e.g. 2022" 
              value={filters.yearOfManufacture}
              onChange={handleFilterChange}
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'white' }}
            />
          </div>

          <div className="filter-group">
            <label>Transmission</label>
            <select name="transmission" value={filters.transmission} onChange={handleFilterChange}>
              <option value="">Any</option>
              <option value="Automatic">Automatic</option>
              <option value="Manual">Manual</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Fuel Type</label>
            <select name="fuelType" value={filters.fuelType} onChange={handleFilterChange}>
              <option value="">Any</option>
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Electric">Electric</option>
            </select>
          </div>

          <div className="filter-group price-group">
            <label>Avg Fuel Consumption (km/l)</label>
            <div className="price-inputs">
              <input 
                type="number" 
                name="minFuelConsumption" 
                placeholder="Min" 
                value={filters.minFuelConsumption}
                onChange={handleFilterChange}
              />
              <span>-</span>
              <input 
                type="number" 
                name="maxFuelConsumption" 
                placeholder="Max" 
                value={filters.maxFuelConsumption}
                onChange={handleFilterChange}
              />
            </div>
          </div>

          <div className="filter-group price-group">
            <label>No. of Seats</label>
            <div className="price-inputs">
              <input 
                type="number" 
                name="minSeats" 
                placeholder="Min" 
                value={filters.minSeats}
                onChange={handleFilterChange}
              />
              <span>-</span>
              <input 
                type="number" 
                name="maxSeats" 
                placeholder="Max" 
                value={filters.maxSeats}
                onChange={handleFilterChange}
              />
            </div>
          </div>

          <div className="filter-group price-group">
            <label>Price per Day (Rs.)</label>
            <div className="price-inputs">
              <input 
                type="number" 
                name="minPrice" 
                placeholder="Min" 
                value={filters.minPrice}
                onChange={handleFilterChange}
              />
              <span>-</span>
              <input 
                type="number" 
                name="maxPrice" 
                placeholder="Max" 
                value={filters.maxPrice}
                onChange={handleFilterChange}
              />
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="sales-main">
          <div className="results-header">
            <h2>Available for Rent</h2>
            <span className="results-count">{vehicles.length} results</span>
          </div>

          {loading ? (
            <div className="loading-spinner">Loading...</div>
          ) : vehicles.length === 0 ? (
            <div className="no-results">
              <p>No rental vehicles found matching your criteria.</p>
            </div>
          ) : (
            <div className="vehicle-grid">
              {vehicles.map((vehicle) => (
                <Link key={vehicle._id} to={`/rent/${vehicle._id}`} className="vehicle-card" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                  <div className="vehicle-img-container" style={{ position: 'relative' }}>
                    <img src={vehicle.image} alt={`${vehicle.make} ${vehicle.model}`} />
                    <div style={{ 
                      position: 'absolute', 
                      top: '10px', 
                      right: '10px', 
                      padding: '0.4rem 0.8rem', 
                      borderRadius: '4px', 
                      fontWeight: 'bold', 
                      fontSize: '0.85rem', 
                      color: 'white', 
                      background: vehicle.status === 'Booked' ? '#ef4444' : vehicle.status === 'Maintenance' ? '#f59e0b' : '#34d399',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
                    }}>
                      {vehicle.status}
                    </div>
                  </div>
                  <div className="vehicle-details">
                    <h3>{vehicle.yearOfManufacture} {vehicle.make} {vehicle.model}</h3>
                    <div style={{ color: '#fbbf24', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>⭐ {vehicle.averageRating ? vehicle.averageRating.toFixed(1) : 'New'}</span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>({vehicle.reviews?.length || 0} reviews)</span>
                    </div>
                    <div className="vehicle-price" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                      Rs. {vehicle.pricePerDay.toLocaleString()} <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>/ day</span>
                    </div>
                    
                    <div className="vehicle-specs" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '1rem' }}>
                      <span style={{ background: 'rgba(255,255,255,0.05)', padding: '0.3rem 0.6rem', borderRadius: '4px' }}>
                        💺 {vehicle.seats} Seats
                      </span>
                      <span style={{ background: 'rgba(255,255,255,0.05)', padding: '0.3rem 0.6rem', borderRadius: '4px' }}>
                        ⛽ {vehicle.fuelConsumption} km/l
                      </span>
                      <span style={{ background: 'rgba(255,255,255,0.05)', padding: '0.3rem 0.6rem', borderRadius: '4px' }}>
                        {vehicle.transmission}
                      </span>
                      <span style={{ background: 'rgba(255,255,255,0.05)', padding: '0.3rem 0.6rem', borderRadius: '4px' }}>
                        {vehicle.fuelType}
                      </span>
                    </div>
                    
                    <p className="vehicle-desc">{vehicle.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Rentals;
