const express = require('express');
const router = express.Router();
const { getHistory, deleteHistory, clearHistory } = require('../controllers/historyController');
const { optionalAuth, protect } = require('../middleware/authMiddleware');

router.get('/history', optionalAuth, getHistory);
router.delete('/history', protect, clearHistory);
router.delete('/history/:id', optionalAuth, deleteHistory);

module.exports = router;
