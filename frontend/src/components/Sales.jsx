import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiSearch, FiFilter } from 'react-icons/fi';

const images = [
  '/hero-car.png',
  '/hero-car-2.png',
  '/hero-car-3.png'
];

const Sales = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentBg, setCurrentBg] = useState(0);
  const [filters, setFilters] = useState({
    search: '',
    vehicleType: '',
    make: '',
    yearOfManufacture: '',
    condition: '',
    transmission: '',
    maxMileage: '',
    minPrice: '',
    maxPrice: ''
  });

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams(
        Object.entries(filters).filter(([_, v]) => v !== '')
      ).toString();

      const response = await fetch(`http://localhost:5000/api/sales?${queryParams}`);
      const data = await response.json();
      setVehicles(data);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
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

  return (
    <div className="sales-page">
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
            <h3>Filters</h3>
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
              <option value="Mercedes">Mercedes</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Year of Manufacture</label>
            <input 
              type="number" 
              name="yearOfManufacture" 
              placeholder="e.g. 2020" 
              value={filters.yearOfManufacture}
              onChange={handleFilterChange}
              className="filter-input-text"
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'white' }}
            />
          </div>

          <div className="filter-group">
            <label>Condition</label>
            <select name="condition" value={filters.condition} onChange={handleFilterChange}>
              <option value="">Any Condition</option>
              <option value="Brand New">Brand New</option>
              <option value="Reconditioned">Reconditioned</option>
              <option value="Used">Used</option>
            </select>
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
            <label>Max Mileage (km)</label>
            <input 
              type="number" 
              name="maxMileage" 
              placeholder="e.g. 50000" 
              value={filters.maxMileage}
              onChange={handleFilterChange}
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'white' }}
            />
          </div>

          <div className="filter-group price-group">
            <label>Price Range (Rs.)</label>
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
            <h2>Available Vehicles</h2>
            <span className="results-count">{vehicles.length} results</span>
          </div>

          {loading ? (
            <div className="loading-spinner">Loading...</div>
          ) : vehicles.length === 0 ? (
            <div className="no-results">
              <p>No vehicles found matching your criteria.</p>
            </div>
          ) : (
            <div className="vehicle-grid">
              {vehicles.map((vehicle) => (
                <Link key={vehicle._id} to={`/sales/${vehicle._id}`} className="vehicle-card" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                  <div className="vehicle-img-container">
                    <img src={vehicle.image} alt={`${vehicle.make} ${vehicle.model}`} />
                    <span className="vehicle-condition">{vehicle.condition}</span>
                  </div>
                  <div className="vehicle-details">
                    <h3>{vehicle.yearOfManufacture} {vehicle.make} {vehicle.model}</h3>
                    <div className="vehicle-price">Rs. {vehicle.price.toLocaleString()}</div>
                    <div className="vehicle-specs">
                      <span>{vehicle.mileage.toLocaleString()} km</span>
                      <span>{vehicle.transmission}</span>
                      <span>{vehicle.fuelType}</span>
                    </div>
                    {vehicle.condition === 'Used' && vehicle.registeredYear && (
                      <div className="vehicle-specs" style={{ marginTop: '-0.5rem', marginBottom: '1rem', color: 'var(--primary)' }}>
                        <span>Registered Year: {vehicle.registeredYear}</span>
                      </div>
                    )}
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

export default Sales;
