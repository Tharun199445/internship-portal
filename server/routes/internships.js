const express = require('express');
const db = require('../db');
const { authenticate, requireRole } = require('../middleware/auth');
const router = express.Router();

// Company: Get only MY internships (must be before /:id)
router.get('/company/mine', authenticate, requireRole('company'), (req, res) => {
  try {
    const internships = db.findAll('internships', i => i.company_id === req.user.id)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    res.json(internships);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all internships (for students)
router.get('/', authenticate, (req, res) => {
  try {
    const internships = db.findAll('internships').map(i => {
      const company = db.findOne('companies', c => c.id === i.company_id);
      return { ...i, company_name: company ? company.company_name : 'Unknown' };
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    res.json(internships);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single internship
router.get('/:id', authenticate, (req, res) => {
  try {
    const internship = db.findOne('internships', i => i.id === parseInt(req.params.id));
    if (!internship) {
      return res.status(404).json({ error: 'Internship not found' });
    }
    const company = db.findOne('companies', c => c.id === internship.company_id);
    res.json({ ...internship, company_name: company ? company.company_name : 'Unknown' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Company: Create internship
router.post('/', authenticate, requireRole('company'), (req, res) => {
  try {
    const { title, description, skills, location, duration, stipend } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }
    const internship = db.insert('internships', {
      company_id: req.user.id,
      title, description,
      skills: skills || '', location: location || '',
      duration: duration || '', stipend: stipend || '',
      created_at: new Date().toISOString()
    });
    res.status(201).json(internship);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Company: Delete internship (only own)
router.delete('/:id', authenticate, requireRole('company'), (req, res) => {
  try {
    const internship = db.findOne('internships', i => i.id === parseInt(req.params.id) && i.company_id === req.user.id);
    if (!internship) {
      return res.status(404).json({ error: 'Internship not found or access denied' });
    }
    db.delete('applications', a => a.internship_id === parseInt(req.params.id));
    db.delete('internships', i => i.id === parseInt(req.params.id));
    res.json({ message: 'Internship deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
