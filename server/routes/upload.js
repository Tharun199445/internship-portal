const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticate } = require('../middleware/auth');
const { supabaseAdmin } = require('../supabaseAuth');

const router = express.Router();

// Use multer memory storage so we can forward the buffer to Supabase
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, and DOCX files are allowed'), false);
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Upload resume endpoint
router.post('/resume', authenticate, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Build a unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileName = `${req.user.id}_${uniqueSuffix}${path.extname(req.file.originalname)}`;

    // Upload to Supabase Storage using the service-role client (bypasses RLS)
    const { data, error: uploadError } = await supabaseAdmin.storage
      .from('resume-files')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return res.status(500).json({ error: 'Failed to upload resume: ' + uploadError.message });
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('resume-files')
      .getPublicUrl(fileName);

    res.json({
      success: true,
      resume_url: publicUrl,
      resume_path: fileName,
      filename: req.file.originalname,
      size: req.file.size
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message || 'Failed to upload file' });
  }
});

module.exports = router;
