import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyInternships, deleteInternship } from '../api';

export default function CompanyDashboard() {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const { loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading) {
      fetchInternships();
    }
  }, [authLoading]);

  const fetchInternships = async () => {
    try {
      const res = await getMyInternships();
      setInternships(res.data);
    } catch {
      console.error('Failed to load internships');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this internship and all its applications?')) return;
    try {
      await deleteInternship(id);
      setInternships(prev => prev.filter(i => i.id !== id));
    } catch {
      alert('Failed to delete');
    }
  };

  if (loading) return <div className="loading">Loading your internships...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>🏢 My Internships</h1>
        <Link to="/company/create" className="btn btn-primary">+ Post New Internship</Link>
      </div>

      {internships.length === 0 ? (
        <div className="empty-state">
          <h3>No internships posted yet</h3>
          <p>Create your first internship listing to start receiving applications!</p>
          <Link to="/company/create" className="btn btn-primary">Post Internship</Link>
        </div>
      ) : (
        <div className="card-grid">
          {internships.map((internship) => (
            <div key={internship.id} className="card">
              <div className="card-header">
                <h3>{internship.title}</h3>
              </div>
              <p className="card-desc">{internship.description.substring(0, 100)}...</p>
              <div className="card-tags">
                {internship.location && <span className="tag">📍 {internship.location}</span>}
                {internship.duration && <span className="tag">⏱ {internship.duration}</span>}
                {internship.stipend && <span className="tag">💰 {internship.stipend}</span>}
              </div>
              <div className="card-actions">
                <Link to={`/company/applicants/${internship.id}`} className="btn btn-primary">
                  View Applicants
                </Link>
                <button className="btn btn-danger" onClick={() => handleDelete(internship.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
