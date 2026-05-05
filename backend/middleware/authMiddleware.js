/**
 * Auth Middleware
 * Works with both MongoDB users and in-memory store users.
 */

const jwt   = require('jsonwebtoken');
const store = require('../store/inMemoryStore');

const JWT_SECRET = process.env.JWT_SECRET || 'smartfarm_secret_2024';

const isMongoose = () => {
  try {
    const mongoose = require('mongoose');
    return mongoose.connection.readyState === 1;
  } catch { return false; }
};

// Require valid JWT
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer '))
      return res.status(401).json({ success: false, message: 'Not authorized — no token' });

    const token   = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    if (isMongoose()) {
      const User = require('../models/User');
      const user = await User.findById(decoded.id).select('-password');
      if (!user)
        return res.status(401).json({ success: false, message: 'User not found' });
      req.user = user;
    } else {
      const user = store.findUserById(decoded.id);
      if (!user)
        return res.status(401).json({ success: false, message: 'User not found' });
      req.user = user;
    }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Not authorized — token invalid' });
  }
};

// Attach user if token present, never block
const optionalAuth = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token   = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      if (isMongoose()) {
        const User = require('../models/User');
        req.user = await User.findById(decoded.id).select('-password') || null;
      } else {
        req.user = store.findUserById(decoded.id) || null;
      }
    }
  } catch { /* ignore */ }
  next();
};

module.exports = { protect, optionalAuth };
