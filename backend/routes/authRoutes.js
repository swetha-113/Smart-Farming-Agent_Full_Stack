/**
 * Auth Routes
 * POST /api/auth/signup   — register new user (name, email, password, location)
 * POST /api/auth/login    — login user (email, password)
 * POST /api/auth/signin   — alias for /login
 * GET  /api/auth/profile  — get logged-in user profile (requires JWT)
 */

const express  = require('express');
const router   = express.Router();
const { signup, login, getProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Primary routes
router.post('/signup',  signup);   // POST /api/auth/signup
router.post('/login',   login);    // POST /api/auth/login

// Aliases
router.post('/signin',   login);   // same as /login
router.post('/register', signup);  // same as /signup

// Protected
router.get('/profile', protect, getProfile);  // GET /api/auth/profile
router.get('/me',      protect, getProfile);  // alias

module.exports = router;
