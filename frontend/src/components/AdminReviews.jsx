import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiTrash2, FiStar, FiDownload } from 'react-icons/fi';
const AdminReviews = ({ onDownloadReport }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await axios.get('https://ravishing-illumination-production.up.railway.app/api/admin/reviews');
      setReviews(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (vehicleId, reviewId) => {
    if (window.confirm('Are you sure you want to delete this review? The average rating for this vehicle will be automatically recalculated.')) {
      try {
        await axios.delete(`https://ravishing-illumination-production.up.railway.app/api/rentals/${vehicleId}/reviews/${reviewId}`);
        fetchReviews();
      } catch (err) {
        console.error(err);
        alert('Error deleting review');
      }
    }
  };

  return (
    <div className="admin-subcomponent">
      <div className="section-header" style={{ background: 'transparent', border: 'none', padding: '0 0 1.5rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Manage Reviews & Feedback</h2>
        <button className="btn-outline" onClick={onDownloadReport} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.5rem', borderRadius: '12px', color: 'var(--primary)', borderColor: 'var(--primary)', background: 'transparent', cursor: 'pointer' }}>
          <FiDownload /> Weekly Report
        </button>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Vehicle</th>
              <th>User</th>
              <th>Rating</th>
              <th>Feedback</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ textAlign: 'center' }}>Loading reviews...</td></tr>
            ) : reviews.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center' }}>No reviews found in the system.</td></tr>
            ) : (
              reviews.map(review => (
                <tr key={review._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <img src={review.vehicleImage} alt="Car" style={{ width: '50px', height: '35px', objectFit: 'cover', borderRadius: '4px' }} />
                      <span style={{ fontWeight: 'bold' }}>{review.vehicleMake} {review.vehicleModel}</span>
                    </div>
                  </td>
                  <td>{review.username}</td>
                  <td>
                    <div style={{ display: 'flex', color: '#fbbf24' }}>
                      {[...Array(review.rating)].map((_, i) => <FiStar key={i} fill="#fbbf24" size={14} />)}
                      {[...Array(5 - review.rating)].map((_, i) => <FiStar key={i + review.rating} color="rgba(255,255,255,0.2)" size={14} />)}
                    </div>
                  </td>
                  <td style={{ maxWidth: '300px', whiteSpace: 'normal', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                    "{review.feedback}"
                  </td>
                  <td>{new Date(review.date).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="icon-btn delete" onClick={() => handleDelete(review.vehicleId, review._id)} title="Delete Review">
                        <FiTrash2 />
                      </button>
                    </div>
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

export default AdminReviews;
