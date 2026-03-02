import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllInternships } from '../api';

export default function InternshipList() {
  const [internships, setInternships] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    // Only fetch internships after auth is fully loaded
    if (!authLoading) {
      fetchInternships();
    }
  }, [authLoading]);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(internships);
    } else {
      const q = search.toLowerCase();
      setFiltered(internships.filter(i =>
        i.title.toLowerCase().includes(q) ||
        i.company_name.toLowerCase().includes(q) ||
        i.skills.toLowerCase().includes(q) ||
        i.location.toLowerCase().includes(q)
      ));
    }
  }, [search, internships]);

  const fetchInternships = async () => {
    try {
      const res = await getAllInternships();
      setInternships(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error('Error fetching internships:', err);
      setError('Failed to load internships');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) return <div className="loading">Loading internships...</div>;
  if (error) return <div className="error-msg">{error}</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>🔍 Browse Internships</h1>
        <p>{filtered.length} internship{filtered.length !== 1 ? 's' : ''} available</p>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by title, company, skills, or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <h3>No internships found</h3>
          <p>Try a different search or check back later!</p>
        </div>
      ) : (
        <div className="card-grid">
          {filtered.map((internship) => (
            <div key={internship.id} className="card internship-card">
              <div className="card-header">
                <h3>{internship.title}</h3>
                <span className="company-badge">🏢 {internship.company_name}</span>
              </div>
              <p className="card-desc">{internship.description.substring(0, 120)}...</p>
              <div className="card-tags">
                {internship.location && <span className="tag">📍 {internship.location}</span>}
                {internship.duration && <span className="tag">⏱ {internship.duration}</span>}
                {internship.stipend && <span className="tag">💰 {internship.stipend}</span>}
              </div>
              {internship.skills && (
                <div className="skills-list">
                  {internship.skills.split(',').slice(0, 4).map((skill, i) => (
                    <span key={i} className="skill-chip">{skill.trim()}</span>
                  ))}
                </div>
              )}
              <Link to={`/student/internship/${internship.id}`} className="btn btn-primary btn-full">
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
