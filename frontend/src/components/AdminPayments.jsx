import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiCheck, FiX, FiDownload, FiTrash2 } from 'react-icons/fi';
const AdminPayments = ({ onDownloadReport }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/bookings');
      setBookings(res.data);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePaymentStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/bookings/${id}/payment-status`, { paymentStatus: status });
      fetchBookings(); // refresh list
    } catch (err) {
      console.error('Error updating payment status:', err);
      alert('Failed to update status');
    }
  };

  const handleEndBooking = async (id) => {
    if (window.confirm('Are you sure you want to mark this booking as Completed?')) {
      try {
        await axios.put(`http://localhost:5000/api/bookings/${id}/end`);
        fetchBookings();
      } catch (err) {
        console.error(err);
        alert('Failed to end booking');
      }
    }
  };

  const handleDeleteBooking = async (id) => {
    if (window.confirm('Are you sure you want to delete this booking record permanently? This cannot be undone.')) {
      try {
        await axios.delete(`http://localhost:5000/api/bookings/${id}`);
        fetchBookings();
      } catch (err) {
        console.error(err);
        alert('Failed to delete booking');
      }
    }
  };

  return (
    <div className="admin-section">
      <div className="section-header" style={{ background: 'transparent', border: 'none', padding: '0 0 1.5rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Payment & Booking Management</h2>
        <button className="btn-outline" onClick={onDownloadReport} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.5rem', borderRadius: '12px', color: 'var(--primary)', borderColor: 'var(--primary)', background: 'transparent', cursor: 'pointer' }}>
          <FiDownload /> Weekly Report
        </button>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>User Details</th>
              <th>Vehicle</th>
              <th>Receipt Ref</th>
              <th>Date</th>
              <th>Booking Status</th>
              <th>Payment Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" style={{ textAlign: 'center' }}>Loading...</td></tr>
            ) : bookings.length === 0 ? (
              <tr><td colSpan="8" style={{ textAlign: 'center' }}>No bookings found.</td></tr>
            ) : (
              bookings.map((booking) => (
                <tr key={booking._id}>
                  <td>#{booking._id.substring(booking._id.length - 4)}</td>
                  <td>
                    <div><strong>{booking.user?.fullName || booking.user?.username || 'Unknown User'}</strong></div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{booking.user?.email}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{booking.user?.phone}</div>
                  </td>
                  <td>{booking.vehicle?.make} {booking.vehicle?.model}</td>
                  <td>
                    {booking.receipt && booking.receipt.startsWith('data:image') ? (
                      <div style={{ position: 'relative', width: '60px', height: '60px', borderRadius: '4px', overflow: 'hidden', cursor: 'pointer' }} onClick={() => {
                        const newTab = window.open();
                        newTab?.document.write(`<html><body style="margin:0;display:flex;justify-content:center;align-items:center;background:#0f172a;min-height:100vh;"><img src="${booking.receipt}" style="max-width:100%;max-height:100vh;"/></body></html>`);
                      }}>
                        <img src={booking.receipt} alt="Receipt" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ) : (
                      booking.receipt || 'N/A'
                    )}
                  </td>
                  <td>{new Date(booking.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge ${booking.status === 'Cancelled' ? 'danger' : booking.status === 'Confirmed' ? 'success' : 'pending'}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${booking.paymentStatus === 'Rejected' ? 'danger' : booking.paymentStatus === 'Accepted' ? 'success' : 'pending'}`}>
                      {booking.paymentStatus}
                    </span>
                  </td>
                  <td>
                    {booking.paymentStatus === 'Pending' && booking.status !== 'Cancelled' ? (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          className="icon-btn success" 
                          title="Accept Payment"
                          onClick={() => handleUpdatePaymentStatus(booking._id, 'Accepted')}
                        >
                          <FiCheck />
                        </button>
                        <button 
                          className="icon-btn danger" 
                          title="Reject Payment"
                          onClick={() => handleUpdatePaymentStatus(booking._id, 'Rejected')}
                        >
                          <FiX />
                        </button>
                      </div>
                    ) : booking.status === 'Confirmed' ? (
                      <button onClick={() => handleEndBooking(booking._id)} className="btn-outline" style={{ padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', color: '#f59e0b', borderColor: '#f59e0b' }}>
                        Mark Completed
                      </button>
                    ) : (
                      <span style={{ color: 'var(--text-secondary)' }}>Reviewed</span>
                    )}
                    <button 
                      onClick={() => handleDeleteBooking(booking._id)} 
                      className="icon-btn delete" 
                      title="Delete Record"
                      style={{ marginLeft: '0.5rem' }}
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPayments;
