const express = require('express');
const router = express.Router();
const { getCropRecommendation } = require('../controllers/cropController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.post('/crop-recommendation', optionalAuth, getCropRecommendation);

module.exports = router;
