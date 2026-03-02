import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMyApplications } from '../api';

const statusColors = {
  pending: 'status-pending',
  shortlisted: 'status-shortlisted',
  accepted: 'status-accepted',
  rejected: 'status-rejected',
};

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading) {
      fetchApplications();
    }
  }, [authLoading]);

  const fetchApplications = async () => {
    try {
      const res = await getMyApplications();
      setApplications(res.data);
    } catch {
      console.error('Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) return <div className="loading">Loading your applications...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>📋 My Applications</h1>
        <p>{applications.length} application{applications.length !== 1 ? 's' : ''}</p>
      </div>

      {applications.length === 0 ? (
        <div className="empty-state">
          <h3>No applications yet</h3>
          <p>Start applying to internships to see them here!</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Internship</th>
                <th>Company</th>
                <th>Location</th>
                <th>Stipend</th>
                <th>Status</th>
                <th>Applied</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id}>
                  <td><strong>{app.title}</strong></td>
                  <td>{app.company_name}</td>
                  <td>{app.location || '—'}</td>
                  <td>{app.stipend || '—'}</td>
                  <td>
                    <span className={`status-badge ${statusColors[app.status]}`}>
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </span>
                  </td>
                  <td>{new Date(app.applied_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
