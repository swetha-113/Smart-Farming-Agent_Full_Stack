const express = require('express');
const router  = express.Router();
const { getIrrigationAdvice } = require('../controllers/irrigationController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.post('/irrigation-advice', optionalAuth, getIrrigationAdvice);

module.exports = router;
