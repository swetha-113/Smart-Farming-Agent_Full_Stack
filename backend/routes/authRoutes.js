const express = require('express');
const router  = express.Router();
const { signup, login, getProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/signup',   signup);
router.post('/login',    login);
router.post('/signin',   login);    // alias
router.post('/register', signup);   // alias
router.get('/profile',   protect, getProfile);
router.get('/me',        protect, getProfile); // alias

module.exports = router;
