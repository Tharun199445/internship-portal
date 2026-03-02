import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getApplicants, updateApplicationStatus } from '../api';

const statusColors = {
  pending: 'status-pending',
  shortlisted: 'status-shortlisted',
  accepted: 'status-accepted',
  rejected: 'status-rejected',
};

export default function ApplicantsView() {
  const { internshipId } = useParams();
  const navigate = useNavigate();
  const { loading: authLoading } = useAuth();
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      fetchApplicants();
    }
  }, [internshipId, authLoading]);

  const fetchApplicants = async () => {
    try {
      const res = await getApplicants(internshipId);
      setApplicants(res.data);
    } catch {
      console.error('Failed to load applicants');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      await updateApplicationStatus(applicationId, newStatus);
      setApplicants(prev =>
        prev.map(a => a.id === applicationId ? { ...a, status: newStatus } : a)
      );
    } catch {
      alert('Failed to update status');
    }
  };

  if (loading) return <div className="loading">Loading applicants...</div>;

  return (
    <div className="page">
      <button className="btn btn-outline" onClick={() => navigate(-1)}>← Back</button>

      <div className="page-header">
        <h1>👥 Applicants</h1>
        <p>{applicants.length} application{applicants.length !== 1 ? 's' : ''}</p>
      </div>

      {applicants.length === 0 ? (
        <div className="empty-state">
          <h3>No applications yet</h3>
          <p>Share your internship listing to attract candidates!</p>
        </div>
      ) : (
        <div className="applicants-list">
          {applicants.map((app) => (
            <div key={app.id} className="applicant-card">
              <div className="applicant-info">
                <div className="applicant-header">
                  <h3>👤 {app.student_name}</h3>
                  <span className={`status-badge ${statusColors[app.status]}`}>
                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </span>
                </div>
                <p className="applicant-email">📧 {app.student_email}</p>
                {app.motivation_text && (
                  <div className="motivation-section">
                    <strong>Why I'm applying:</strong>
                    <p>{app.motivation_text}</p>
                  </div>
                )}
                <div className="applicant-meta">
                  <a
                    href={`http://localhost:5000${app.resume_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline btn-sm"
                  >
                    📄 View Resume
                  </a>
                  <span className="applied-date">
                    Applied: {new Date(app.applied_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="status-actions">
                <button
                  className={`btn btn-sm ${app.status === 'shortlisted' ? 'btn-active' : 'btn-outline'}`}
                  onClick={() => handleStatusChange(app.id, 'shortlisted')}
                >
                  ⭐ Shortlist
                </button>
                <button
                  className={`btn btn-sm ${app.status === 'accepted' ? 'btn-active' : 'btn-outline'}`}
                  onClick={() => handleStatusChange(app.id, 'accepted')}
                >
                  ✅ Accept
                </button>
                <button
                  className={`btn btn-sm ${app.status === 'rejected' ? 'btn-active' : 'btn-outline'}`}
                  onClick={() => handleStatusChange(app.id, 'rejected')}
                >
                  ❌ Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
