import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getInternship, applyToInternship, uploadResume } from '../api';

export default function InternshipDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [internship, setInternship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApply, setShowApply] = useState(false);
  const [resume, setResume] = useState(null);
  const [motivation, setMotivation] = useState('');
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!authLoading) {
      fetchInternship();
    }
  }, [id, authLoading]);

  const fetchInternship = async () => {
    try {
      const res = await getInternship(id);
      setInternship(res.data);
    } catch {
      setMessage({ type: 'error', text: 'Internship not found' });
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!resume) {
      setMessage({ type: 'error', text: 'Please upload your resume' });
      return;
    }

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (!allowedTypes.includes(resume.type)) {
      setMessage({ type: 'error', text: 'Only PDF, DOC, or DOCX files are allowed' });
      return;
    }
    if (resume.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File size must be under 5MB' });
      return;
    }

    setApplying(true);
    setMessage({ type: '', text: '' });

    try {
      // Upload resume via server
      const uploadRes = await uploadResume(resume);
      const { resume_url, resume_path } = uploadRes.data;

      // Send application with resume URL
      await applyToInternship({
        internship_id: id,
        resume_url,
        resume_path,
        motivation_text: motivation,
      });

      setMessage({ type: 'success', text: 'Application submitted successfully!' });
      setShowApply(false);
      setResume(null);
      setMotivation('');
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to apply' });
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!internship) return <div className="error-msg">Internship not found</div>;

  return (
    <div className="page">
      <button className="btn btn-outline" onClick={() => navigate(-1)}>← Back</button>

      <div className="detail-card">
        <div className="detail-header">
          <h1>{internship.title}</h1>
          <span className="company-badge">🏢 {internship.company_name}</span>
        </div>

        <div className="detail-meta">
          {internship.location && <span className="meta-item">📍 {internship.location}</span>}
          {internship.duration && <span className="meta-item">⏱ {internship.duration}</span>}
          {internship.stipend && <span className="meta-item">💰 {internship.stipend}</span>}
        </div>

        <div className="detail-section">
          <h3>Description</h3>
          <p>{internship.description}</p>
        </div>

        {internship.skills && (
          <div className="detail-section">
            <h3>Skills Required</h3>
            <div className="skills-list">
              {internship.skills.split(',').map((skill, i) => (
                <span key={i} className="skill-chip">{skill.trim()}</span>
              ))}
            </div>
          </div>
        )}

        <div className="detail-section">
          <small>Posted on {new Date(internship.created_at).toLocaleDateString()}</small>
        </div>

        {message.text && (
          <div className={`msg ${message.type}`}>{message.text}</div>
        )}

        {!showApply ? (
          <button className="btn btn-primary btn-full" onClick={() => setShowApply(true)}>
            Apply Now
          </button>
        ) : (
          <form onSubmit={handleApply} className="apply-form">
            <h3>📄 Submit Your Application</h3>
            <div className="form-group">
              <label>Resume (PDF/DOC/DOCX, max 5MB) *</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setResume(e.target.files[0])}
                required
              />
            </div>
            <div className="form-group">
              <label>Why I'm Applying</label>
              <textarea
                placeholder="Tell the company why you're a great fit for this role..."
                value={motivation}
                onChange={(e) => setMotivation(e.target.value)}
                rows={4}
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={applying}>
                {applying ? 'Submitting...' : 'Submit Application'}
              </button>
              <button type="button" className="btn btn-outline" onClick={() => setShowApply(false)}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
