import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHome, FiUsers, FiBox, FiLogOut, FiSettings, FiActivity, FiStar, FiMessageCircle, FiCreditCard, FiTag, FiDownload, FiNavigation, FiTrendingUp, FiCheckCircle } from 'react-icons/fi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AdminSales from './AdminSales';
import AdminRentals from './AdminRentals';
import AdminUsers from './AdminUsers';
import AdminReviews from './AdminReviews';
import AdminInquiries from './AdminInquiries';
import AdminPayments from './AdminPayments';
import AdminPromotions from './AdminPromotions';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ 
    totalVehicles: 0, 
    saleVehicles: 0,
    rentVehicles: 0,
    activeRentals: 0, 
    registeredUsers: 0,
    totalIncome: 0,
    totalPromotions: 0,
    activePromotions: 0,
    revenueData: []
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    // Basic protection
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token || role !== 'admin') {
      navigate('/login');
    } else {
      fetchDashboardData();
    }
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch('https://ravishing-illumination-production.up.railway.app/api/admin/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setRecentActivity(data.recentActivity);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async (type = 'overview') => {
    try {
      setDownloading(true);
      const response = await fetch(`https://ravishing-illumination-production.up.railway.app/api/admin/report/weekly/${type}`);
      
      if (!response.ok) throw new Error('Failed to download report');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type.charAt(0).toUpperCase() + type.slice(1)}_Weekly_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading report:', err);
      alert('Failed to download report. Please try again later.');
    } finally {
      setDownloading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <div className="admin-container">
      {/* Static Admin Background */}
      <div 
        className="sales-bg-slide"
        style={{ 
          backgroundImage: `url('/admin-bg.png')`,
          opacity: 1 
        }}
      />

      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <img src="/logo.png" alt="Logo" />
        </div>
        
        <nav className="admin-nav">
          <button 
            className={`admin-nav-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <FiActivity /> Overview
          </button>
          <button 
            className={`admin-nav-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <FiUsers /> Users
          </button>
          <button 
            className={`admin-nav-btn ${activeTab === 'sales' ? 'active' : ''}`}
            onClick={() => setActiveTab('sales')}
          >
            <FiBox /> Sale
          </button>
          <button 
            className={`admin-nav-btn ${activeTab === 'rentals' ? 'active' : ''}`}
            onClick={() => setActiveTab('rentals')}
          >
            <FiBox /> Rent
          </button>
          <button 
            className={`admin-nav-btn ${activeTab === 'payments' ? 'active' : ''}`}
            onClick={() => setActiveTab('payments')}
          >
            <FiCreditCard /> Payment and Booking
          </button>
          <button 
            className={`admin-nav-btn ${activeTab === 'inquiries' ? 'active' : ''}`}
            onClick={() => setActiveTab('inquiries')}
          >
            <FiMessageCircle /> Inquiries
          </button>
          <button 
            className={`admin-nav-btn ${activeTab === 'promotions' ? 'active' : ''}`}
            onClick={() => setActiveTab('promotions')}
          >
            <FiTag /> Promotion and Campaign
          </button>
          <button 
            className={`admin-nav-btn ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            <FiStar /> Reviews
          </button>
          <button 
            className={`admin-nav-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <FiSettings /> Settings
          </button>

          <div style={{ marginTop: '2rem', padding: '0 1rem' }}>
            <button 
              onClick={() => handleDownloadReport('overview')} 
              disabled={downloading}
              className="auth-button" 
              style={{ 
                width: '100%', 
                padding: '0.8rem', 
                fontSize: '0.9rem',
                opacity: downloading ? 0.7 : 1,
                cursor: downloading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <FiDownload /> {downloading ? 'Generating...' : 'Overview Report'}
            </button>
          </div>
        </nav>

        <div className="admin-sidebar-footer" style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button onClick={handleLogout} className="btn-outline" style={{ width: '100%', color: 'var(--primary)', borderColor: 'rgba(0, 180, 216, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.8rem', background: 'transparent', borderRadius: '8px', cursor: 'pointer' }}>
            <FiLogOut /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main">
        <header className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="admin-header-title">
            <h1>Dashboard Overview</h1>
            <p>Welcome back, System Administrator</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <a 
              href="https://en.aika168.com/Monitor.aspx" 
              target="_blank" 
              rel="noopener noreferrer"
              className="auth-button"
              style={{ 
                padding: '0.6rem 1.2rem', 
                fontSize: '0.9rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                textDecoration: 'none',
                width: 'auto',
                margin: 0,
                borderRadius: '8px'
              }}
            >
              <FiNavigation /> Track our Vehicles
            </a>
            <div className="admin-profile" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '1rem' }}>
              <div className="admin-avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>A</div>
              <span>Admin</span>
            </div>
            <button onClick={handleLogout} className="btn-outline" style={{ padding: '0.5rem 1rem', color: 'var(--primary)', borderColor: 'rgba(0, 180, 216, 0.3)', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', borderRadius: '8px', cursor: 'pointer' }}>
              <FiLogOut /> Logout
            </button>
          </div>
        </header>

        <div className="admin-content">
          {activeTab === 'overview' && (
            <>
              {/* Dashboard Overview Cards */}
              <div className="admin-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="admin-stat-card">
                  <div className="stat-icon" style={{ backgroundColor: 'rgba(0, 180, 216, 0.2)', color: 'var(--primary)' }}>
                    <FiBox size={24} />
                  </div>
                  <div className="stat-details">
                    <h3>Total Vehicles</h3>
                    <p style={{ margin: '0.2rem 0', fontSize: '1.5rem', fontWeight: 'bold' }}>{loading ? '...' : stats.totalVehicles}</p>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {stats.saleVehicles} Sale | {stats.rentVehicles} Rent
                    </div>
                  </div>
                </div>
                
                <div className="admin-stat-card">
                  <div className="stat-icon" style={{ backgroundColor: 'rgba(52, 211, 153, 0.2)', color: '#34d399' }}>
                    <FiActivity size={24} />
                  </div>
                  <div className="stat-details">
                    <h3>Active Rentals</h3>
                    <p style={{ margin: '0.2rem 0', fontSize: '1.5rem', fontWeight: 'bold' }}>{loading ? '...' : stats.activeRentals}</p>
                  </div>
                </div>

                <div className="admin-stat-card">
                  <div className="stat-icon" style={{ backgroundColor: 'rgba(167, 139, 250, 0.2)', color: '#a78bfa' }}>
                    <FiUsers size={24} />
                  </div>
                  <div className="stat-details">
                    <h3>Registered Users</h3>
                    <p style={{ margin: '0.2rem 0', fontSize: '1.5rem', fontWeight: 'bold' }}>{loading ? '...' : stats.registeredUsers}</p>
                  </div>
                </div>

                <div className="admin-stat-card">
                  <div className="stat-icon" style={{ backgroundColor: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24' }}>
                    <FiTrendingUp size={24} />
                  </div>
                  <div className="stat-details">
                    <h3>Total Income</h3>
                    <p style={{ margin: '0.2rem 0', fontSize: '1.5rem', fontWeight: 'bold' }}>{loading ? '...' : `Rs. ${stats.totalIncome.toLocaleString()}`}</p>
                  </div>
                </div>

                <div className="admin-stat-card">
                  <div className="stat-icon" style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>
                    <FiTag size={24} />
                  </div>
                  <div className="stat-details">
                    <h3>Promotions</h3>
                    <p style={{ margin: '0.2rem 0', fontSize: '1.5rem', fontWeight: 'bold' }}>{loading ? '...' : stats.totalPromotions}</p>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {stats.activePromotions} Active Campaigns
                    </div>
                  </div>
                </div>
              </div>

              {/* Revenue Chart Section */}
              <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <h2 style={{ margin: 0 }}>Revenue Overview (Last 7 Days)</h2>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Updated real-time from confirmed payments
                  </div>
                </div>
                <div style={{ width: '100%', height: '300px' }}>
                  {loading ? (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading chart...</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stats.revenueData}>
                        <defs>
                          <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis 
                          dataKey="date" 
                          stroke="var(--text-secondary)" 
                          fontSize={12} 
                          tickFormatter={(str) => {
                            const date = new Date(str);
                            return date.toLocaleDateString(undefined, { weekday: 'short' });
                          }}
                        />
                        <YAxis 
                          stroke="var(--text-secondary)" 
                          fontSize={12} 
                          tickFormatter={(val) => `Rs.${val/1000}k`}
                        />
                        <Tooltip 
                          contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                          formatter={(val) => [`Rs. ${val.toLocaleString()}`, 'Revenue']}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="amount" 
                          stroke="var(--primary)" 
                          strokeWidth={3}
                          fillOpacity={1} 
                          fill="url(#colorAmount)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Placeholder for Data Table */}
              <div className="admin-recent-section">
                <div className="section-header">
                  <h2>Recent Activity</h2>
                  <button className="view-all-btn">View All</button>
                </div>
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Action</th>
                        <th>User</th>
                        <th>Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr><td colSpan="5" style={{ textAlign: 'center' }}>Loading...</td></tr>
                      ) : recentActivity.length === 0 ? (
                        <tr><td colSpan="5" style={{ textAlign: 'center' }}>No recent activity.</td></tr>
                      ) : (
                        recentActivity.map((item, idx) => (
                          <tr key={idx}>
                            <td>#{item.id.substring(item.id.length - 4)}</td>
                            <td>{item.action}</td>
                            <td>{item.user}</td>
                            <td>{new Date(item.date).toLocaleString()}</td>
                            <td><span className={`status-badge ${item.status === 'Completed' ? 'success' : 'pending'}`}>{item.status}</span></td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeTab === 'sales' && <AdminSales onDownloadReport={() => handleDownloadReport('sales')} />}
          {activeTab === 'rentals' && <AdminRentals onDownloadReport={() => handleDownloadReport('rentals')} />}
          {activeTab === 'users' && <AdminUsers onDownloadReport={() => handleDownloadReport('users')} />}
          {activeTab === 'reviews' && <AdminReviews onDownloadReport={() => handleDownloadReport('reviews')} />}
          {activeTab === 'inquiries' && <AdminInquiries onDownloadReport={() => handleDownloadReport('inquiries')} />}
          {activeTab === 'payments' && <AdminPayments onDownloadReport={() => handleDownloadReport('payments')} />}
          {activeTab === 'promotions' && <AdminPromotions onDownloadReport={() => handleDownloadReport('promotions')} />}

        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
