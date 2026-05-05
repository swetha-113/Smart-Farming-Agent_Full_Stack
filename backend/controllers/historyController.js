/**
 * History Controller — In-Memory version
 */

const store = require('../store/inMemoryStore');

// GET /api/history
const getHistory = (req, res) => {
  try {
    const { type, limit = 20, page = 1 } = req.query;
    const userId = req.user ? req.user.id : null;

    const { records, total } = store.getHistoryByUser(
      userId, type || null, parseInt(limit), parseInt(page)
    );

    res.json({
      success: true,
      data: {
        history: records,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/history/:id
const deleteHistory = (req, res) => {
  try {
    const deleted = store.deleteHistoryById(req.params.id);
    if (!deleted)
      return res.status(404).json({ success: false, message: 'History entry not found' });
    res.json({ success: true, message: 'Entry deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/history
const clearHistory = (req, res) => {
  try {
    if (!req.user)
      return res.status(401).json({ success: false, message: 'Authentication required' });
    const count = store.clearHistoryByUser(req.user.id);
    res.json({ success: true, message: `Cleared ${count} entries` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getHistory, deleteHistory, clearHistory };
