const express = require('express');
const router  = express.Router();
const { getSoilRecommendation } = require('../controllers/soilController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.post('/soil-recommendation', optionalAuth, getSoilRecommendation);

module.exports = router;
