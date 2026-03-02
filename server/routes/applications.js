const express = require('express');
const db = require('../db');
const { authenticate, requireRole } = require('../middleware/auth');
const router = express.Router();

// Student: Apply for internship
router.post('/', authenticate, requireRole('student'), (req, res) => {
  try {
    const { internship_id, resume_url, resume_path, motivation_text } = req.body;
    if (!internship_id || !resume_url) {
      return res.status(400).json({ error: 'Internship ID and resume URL are required' });
    }

    const iid = parseInt(internship_id);
    const internship = db.findOne('internships', i => i.id === iid);
    if (!internship) {
      return res.status(404).json({ error: 'Internship not found' });
    }

    const existing = db.findOne('applications', a => a.student_id === req.user.id && a.internship_id === iid);
    if (existing) {
      return res.status(409).json({ error: 'You have already applied for this internship' });
    }

    const application = db.insert('applications', {
      student_id: req.user.id,
      internship_id: iid,
      resume_url,
      resume_path: resume_path || null,
      motivation_text: motivation_text || '',
      status: 'pending',
      applied_at: new Date().toISOString()
    });

    res.status(201).json(application);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

// Student: Get my applications
router.get('/mine', authenticate, requireRole('student'), (req, res) => {
  try {
    const applications = db.findAll('applications', a => a.student_id === req.user.id)
      .map(a => {
        const internship = db.findOne('internships', i => i.id === a.internship_id);
        const company = internship ? db.findOne('companies', c => c.id === internship.company_id) : null;
        return {
          ...a,
          title: internship ? internship.title : '',
          description: internship ? internship.description : '',
          location: internship ? internship.location : '',
          stipend: internship ? internship.stipend : '',
          duration: internship ? internship.duration : '',
          company_name: company ? company.company_name : 'Unknown'
        };
      })
      .sort((a, b) => new Date(b.applied_at) - new Date(a.applied_at));
    res.json(applications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Company: Get applicants for a specific internship (only own)
router.get('/internship/:internshipId', authenticate, requireRole('company'), (req, res) => {
  try {
    const iid = parseInt(req.params.internshipId);
    const internship = db.findOne('internships', i => i.id === iid && i.company_id === req.user.id);
    if (!internship) {
      return res.status(404).json({ error: 'Internship not found or access denied' });
    }
    const applicants = db.findAll('applications', a => a.internship_id === iid)
      .map(a => {
        const student = db.findOne('students', s => s.id === a.student_id);
        return {
          ...a,
          student_name: student ? student.name : 'Unknown',
          student_email: student ? student.email : ''
        };
      })
      .sort((a, b) => new Date(b.applied_at) - new Date(a.applied_at));
    res.json(applicants);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Company: Update application status
router.patch('/:id/status', authenticate, requireRole('company'), (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'shortlisted', 'accepted', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const appId = parseInt(req.params.id);
    const application = db.findOne('applications', a => a.id === appId);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const internship = db.findOne('internships', i => i.id === application.internship_id);
    if (!internship || internship.company_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updated = db.update('applications', appId, { status });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
