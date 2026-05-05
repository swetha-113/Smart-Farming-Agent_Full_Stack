/**
 * Auth Controller
 * signup — POST /api/auth/signup  { name, email, password, location }
 * login  — POST /api/auth/login   { email, password }
 * getProfile — GET /api/auth/profile
 */

const jwt    = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const store  = require('../store/inMemoryStore');

const JWT_SECRET  = process.env.JWT_SECRET || 'smartfarm_secret_2024';
const makeToken   = (id) => jwt.sign({ id }, JWT_SECRET, { expiresIn: '7d' });

const isMongoConnected = () => {
  try { return require('mongoose').connection.readyState === 1; }
  catch { return false; }
};

// POST /api/auth/signup
const signup = async (req, res) => {
  try {
    const { name = '', email = '', password = '', location = '' } = req.body;

    if (!name.trim() || name.trim().length < 2)
      return res.status(400).json({ success: false, message: 'Name must be at least 2 characters' });
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim()))
      return res.status(400).json({ success: false, message: 'Please enter a valid email address' });
    if (!password || password.length < 6)
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });

    const cleanName  = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanLoc   = location.trim();

    if (isMongoConnected()) {
      const User = require('../models/User');
      if (await User.findOne({ email: cleanEmail }))
        return res.status(400).json({ success: false, message: 'Email is already registered' });
      const user = await User.create({ name: cleanName, email: cleanEmail, password, location: cleanLoc });
      const token = makeToken(user._id.toString());
      return res.status(201).json({
        success: true, message: 'Account created successfully', token,
        user: { id: user._id.toString(), name: user.name, email: user.email, location: user.location, role: user.role },
      });
    } else {
      if (store.findUserByEmail(cleanEmail))
        return res.status(400).json({ success: false, message: 'Email is already registered' });
      const passwordHash = await bcrypt.hash(password, 12);
      const user = store.createUser({ name: cleanName, email: cleanEmail, passwordHash, location: cleanLoc });
      const token = makeToken(user.id);
      return res.status(201).json({
        success: true, message: 'Account created successfully', token,
        user: { id: user.id, name: user.name, email: user.email, location: user.location, role: user.role },
      });
    }
  } catch (err) {
    console.error('Signup error:', err.message);
    res.status(500).json({ success: false, message: 'Server error during signup. Please try again.' });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email = '', password = '' } = req.body;

    if (!email.trim()) return res.status(400).json({ success: false, message: 'Email is required' });
    if (!password)     return res.status(400).json({ success: false, message: 'Password is required' });

    const cleanEmail = email.trim().toLowerCase();

    if (isMongoConnected()) {
      const User = require('../models/User');
      const user = await User.findOne({ email: cleanEmail }).select('+password');
      if (!user) return res.status(401).json({ success: false, message: 'Invalid email or password' });
      if (!await user.comparePassword(password))
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      const token = makeToken(user._id.toString());
      return res.json({
        success: true, message: 'Login successful', token,
        user: { id: user._id.toString(), name: user.name, email: user.email, location: user.location, role: user.role },
      });
    } else {
      const user = store.findUserByEmail(cleanEmail);
      if (!user) return res.status(401).json({ success: false, message: 'Invalid email or password' });
      if (!await bcrypt.compare(password, user.passwordHash))
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      const token = makeToken(user.id);
      return res.json({
        success: true, message: 'Login successful', token,
        user: { id: user.id, name: user.name, email: user.email, location: user.location, role: user.role },
      });
    }
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ success: false, message: 'Server error during login. Please try again.' });
  }
};

// GET /api/auth/profile
const getProfile = (req, res) => {
  const u = req.user;
  res.json({
    success: true,
    user: { id: (u._id || u.id).toString(), name: u.name, email: u.email, location: u.location || '', role: u.role },
  });
};

module.exports = { signup, login, getProfile, register: signup, signin: login, getMe: getProfile };
