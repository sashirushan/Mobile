import React, { useState, useEffect } from 'react';
import { FiCheck, FiX, FiMessageSquare, FiSend, FiLoader, FiDownload, FiTrash2 } from 'react-icons/fi';
const AdminInquiries = ({ onDownloadReport }) => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState({});
  const [processing, setProcessing] = useState(null); // stores the ID of the inquiry currently being processed
  const [selectedInquiry, setSelectedInquiry] = useState(null); // to show full details/reply box

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/inquiries');
      const data = await response.json();
      setInquiries(data);
    } catch (error) {
      console.error('Error fetching inquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      setProcessing(id);
      const response = await fetch(`http://localhost:5000/api/inquiries/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      
      if (response.ok) {
        fetchInquiries();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setProcessing(null);
    }
  };

  const handleSendReply = async (id) => {
    if (!replyText[id]) return;
    
    try {
      setProcessing(id);
      const response = await fetch(`http://localhost:5000/api/inquiries/${id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ replyMessage: replyText[id] })
      });
      
      if (response.ok) {
        const data = await response.json();
        alert("Reply sent successfully! It has been delivered to the customer's email.");
        setReplyText({ ...replyText, [id]: '' });
        fetchInquiries();
      } else {
        alert('Failed to send reply.');
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Error sending reply.');
    } finally {
      setProcessing(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this inquiry permanently?')) return;
    
    try {
      setProcessing(id);
      const response = await fetch(`http://localhost:5000/api/inquiries/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        fetchInquiries();
      } else {
        alert('Failed to delete inquiry.');
      }
    } catch (error) {
      console.error('Error deleting inquiry:', error);
      alert('Error deleting inquiry.');
    } finally {
      setProcessing(null);
    }
  };

  const handleReplyChange = (id, text) => {
    setReplyText(prev => ({ ...prev, [id]: text }));
  };

  return (
    <div className="admin-section">
      <div className="section-header" style={{ background: 'transparent', border: 'none', padding: '0 0 1.5rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Manage Inquiries</h2>
        <button className="btn-outline" onClick={onDownloadReport} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.5rem', borderRadius: '12px', color: 'var(--primary)', borderColor: 'var(--primary)', background: 'transparent', cursor: 'pointer' }}>
          <FiDownload /> Weekly Report
        </button>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Customer</th>
              <th>Vehicle ID</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}><FiLoader className="spin" /> Loading inquiries...</td></tr>
            ) : inquiries.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No inquiries found.</td></tr>
            ) : (
              inquiries.map((inq) => (
                <React.Fragment key={inq._id}>
                  <tr className={selectedInquiry === inq._id ? 'selected-row' : ''}>
                    <td>{new Date(inq.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div><strong>{inq.name}</strong></div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{inq.email}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{inq.phone}</div>
                    </td>
                    <td>
                      {inq.vehicleId ? (
                        <div title={`${inq.vehicleId.make} ${inq.vehicleId.model}`}>
                          {inq.vehicleId._id.substring(inq.vehicleId._id.length - 6)}
                          <div style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>
                            {inq.vehicleId.make} {inq.vehicleId.model}
                          </div>
                        </div>
                      ) : 'N/A'}
                    </td>
                    <td>
                      <span className={`status-badge ${inq.status.toLowerCase()}`}>
                        {inq.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="icon-btn view" 
                          onClick={() => setSelectedInquiry(selectedInquiry === inq._id ? null : inq._id)}
                          title="View Message & Reply"
                        >
                          <FiMessageSquare />
                        </button>
                        
                        {inq.status === 'Pending' && (
                          <>
                            <button 
                              className="icon-btn success" 
                              onClick={() => handleUpdateStatus(inq._id, 'Accepted')}
                              disabled={processing === inq._id}
                              title="Accept"
                            >
                              <FiCheck />
                            </button>
                            <button 
                              className="icon-btn danger" 
                              onClick={() => handleUpdateStatus(inq._id, 'Rejected')}
                              disabled={processing === inq._id}
                              title="Reject"
                            >
                              <FiX />
                            </button>
                          </>
                        )}
                        <button 
                          className="icon-btn delete" 
                          onClick={() => handleDelete(inq._id)}
                          disabled={processing === inq._id}
                          title="Delete Inquiry"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {/* Expanded Row for Details and Reply */}
                  {selectedInquiry === inq._id && (
                    <tr className="expanded-row">
                      <td colSpan="5">
                        <div className="inquiry-details" style={{ padding: '1.5rem', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '8px', borderLeft: '4px solid var(--primary)', margin: '0.5rem 0' }}>
                          <h4 style={{ marginTop: 0, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Message from {inq.name}:</h4>
                          <p style={{ color: 'var(--text-secondary)', background: 'rgba(255, 255, 255, 0.05)', padding: '1rem', borderRadius: '8px', whiteSpace: 'pre-wrap' }}>
                            {inq.message}
                          </p>
                          
                          {inq.status === 'Replied' && inq.replyMessage ? (
                            <div style={{ marginTop: '1.5rem', background: 'rgba(0, 180, 216, 0.05)', border: '1px solid rgba(0, 180, 216, 0.2)', padding: '1rem', borderRadius: '8px' }}>
                              <h4 style={{ marginTop: 0, color: 'var(--primary)' }}>Your Reply:</h4>
                              <p style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', margin: 0 }}>{inq.replyMessage}</p>
                            </div>
                          ) : (
                            <div className="reply-section" style={{ marginTop: '1.5rem' }}>
                              <h4 style={{ marginTop: 0, color: 'var(--text-primary)' }}>Send Reply Email</h4>
                              <textarea 
                                value={replyText[inq._id] || ''}
                                onChange={(e) => handleReplyChange(inq._id, e.target.value)}
                                placeholder="Write your reply here. This will be sent directly to the customer's email..."
                                style={{ width: '100%', padding: '1rem', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'white', minHeight: '100px', marginBottom: '1rem', fontFamily: 'inherit' }}
                              />
                              <button 
                                onClick={() => handleSendReply(inq._id)}
                                disabled={processing === inq._id || !replyText[inq._id]?.trim()}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.5rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                              >
                                {processing === inq._id ? <FiLoader className="spin" /> : <FiSend />} 
                                Send Reply via Email
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminInquiries;
