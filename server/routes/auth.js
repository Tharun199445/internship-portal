const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { generateToken } = require('../middleware/auth');
const { supabaseAdmin } = require('../supabaseAuth');
const router = express.Router();

// =============== STUDENT AUTH ===============

router.post('/student/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    const existingStudent = db.findOne('students', s => s.email === email);
    if (existingStudent) {
      return res.status(409).json({ error: 'Email already registered as student' });
    }
    const existingCompany = db.findOne('companies', c => c.email === email);
    if (existingCompany) {
      return res.status(409).json({ error: 'Email already registered as company' });
    }
    const password_hash = await bcrypt.hash(password, 10);
    const student = db.insert('students', { name, email, password_hash, created_at: new Date().toISOString() });

    // Register user in Supabase Auth
    const { data: supaData, error: supaError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: 'student', name }
    });
    if (supaError) {
      console.warn('⚠️ Supabase Auth registration failed (user saved locally):', supaError.message);
    } else {
      console.log('✅ Student registered in Supabase Auth:', email, 'ID:', supaData.user?.id);
    }

    const token = generateToken({ id: student.id, role: 'student', email });
    res.status(201).json({ token, user: { id: student.id, name, email, role: 'student' } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/student/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const company = db.findOne('companies', c => c.email === email);
    if (company) {
      return res.status(401).json({ error: 'This email is registered as a company account' });
    }
    const student = db.findOne('students', s => s.email === email);
    if (!student) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const valid = await bcrypt.compare(password, student.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Sign in with Supabase Auth (keeps session visible in dashboard)
    const { data: supaData, error: supaError } = await supabaseAdmin.auth.signInWithPassword({ email, password });
    if (supaError) {
      // If user doesn't exist in Supabase yet (old account), create them
      if (supaError.message.includes('Invalid login')) {
        const { error: createErr } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { role: 'student', name: student.name }
        });
        if (createErr) {
          console.warn('⚠️ Supabase Auth auto-create failed:', createErr.message);
        } else {
          console.log('✅ Student auto-registered in Supabase Auth:', email);
        }
      } else {
        console.warn('⚠️ Supabase Auth sign-in failed:', supaError.message);
      }
    } else {
      console.log('✅ Student signed in via Supabase Auth:', email);
    }

    const token = generateToken({ id: student.id, role: 'student', email: student.email });
    res.json({ token, user: { id: student.id, name: student.name, email: student.email, role: 'student' } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// =============== COMPANY AUTH ===============

router.post('/company/signup', async (req, res) => {
  try {
    const { company_name, email, password } = req.body;
    if (!company_name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    const existingCompany = db.findOne('companies', c => c.email === email);
    if (existingCompany) {
      return res.status(409).json({ error: 'Email already registered as company' });
    }
    const existingStudent = db.findOne('students', s => s.email === email);
    if (existingStudent) {
      return res.status(409).json({ error: 'Email already registered as student' });
    }
    const password_hash = await bcrypt.hash(password, 10);
    const company = db.insert('companies', { company_name, email, password_hash, created_at: new Date().toISOString() });

    // Register user in Supabase Auth
    const { data: supaData, error: supaError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: 'company', company_name }
    });
    if (supaError) {
      console.warn('⚠️ Supabase Auth registration failed (user saved locally):', supaError.message);
    } else {
      console.log('✅ Company registered in Supabase Auth:', email, 'ID:', supaData.user?.id);
    }

    const token = generateToken({ id: company.id, role: 'company', email });
    res.status(201).json({ token, user: { id: company.id, company_name, email, role: 'company' } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/company/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const student = db.findOne('students', s => s.email === email);
    if (student) {
      return res.status(401).json({ error: 'This email is registered as a student account' });
    }
    const company = db.findOne('companies', c => c.email === email);
    if (!company) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const valid = await bcrypt.compare(password, company.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Sign in with Supabase Auth (keeps session visible in dashboard)
    const { data: supaData, error: supaError } = await supabaseAdmin.auth.signInWithPassword({ email, password });
    if (supaError) {
      // If user doesn't exist in Supabase yet (old account), create them
      if (supaError.message.includes('Invalid login')) {
        const { error: createErr } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { role: 'company', company_name: company.company_name }
        });
        if (createErr) {
          console.warn('⚠️ Supabase Auth auto-create failed:', createErr.message);
        } else {
          console.log('✅ Company auto-registered in Supabase Auth:', email);
        }
      } else {
        console.warn('⚠️ Supabase Auth sign-in failed:', supaError.message);
      }
    } else {
      console.log('✅ Company signed in via Supabase Auth:', email);
    }

    const token = generateToken({ id: company.id, role: 'company', email: company.email });
    res.json({ token, user: { id: company.id, company_name: company.company_name, email: company.email, role: 'company' } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
