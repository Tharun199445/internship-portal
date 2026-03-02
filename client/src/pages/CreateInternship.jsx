import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createInternship } from '../api';

export default function CreateInternship() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    skills: '',
    location: '',
    duration: '',
    stipend: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description) {
      setError('Title and description are required');
      return;
    }
    setLoading(true);
    try {
      await createInternship(form);
      navigate('/company/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create internship');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>📝 Post New Internship</h1>
      </div>

      <div className="form-card">
        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text" name="title" placeholder="e.g. Frontend Developer Intern"
              value={form.title} onChange={handleChange} required
            />
          </div>
          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description" placeholder="Describe the internship role, responsibilities, requirements..."
              value={form.description} onChange={handleChange} rows={5} required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Skills (comma-separated)</label>
              <input
                type="text" name="skills" placeholder="React, Node.js, Python"
                value={form.skills} onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input
                type="text" name="location" placeholder="Remote / Mumbai / Bangalore"
                value={form.location} onChange={handleChange}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Duration</label>
              <input
                type="text" name="duration" placeholder="3 months"
                value={form.duration} onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Stipend</label>
              <input
                type="text" name="stipend" placeholder="₹10,000/month"
                value={form.stipend} onChange={handleChange}
              />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Post Internship'}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
