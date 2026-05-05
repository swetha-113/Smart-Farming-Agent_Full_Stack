const express = require('express');
const router = express.Router();
const { getWeather } = require('../controllers/weatherController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.get('/weather', optionalAuth, getWeather);

module.exports = router;
