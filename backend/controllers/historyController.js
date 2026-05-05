/**
 * History Controller
 */

const store = require('../store/inMemoryStore');

const getHistory = (req, res) => {
  try {
    const { type, limit = 20, page = 1 } = req.query;
    const userId = req.user ? (req.user.id || req.user._id?.toString()) : null;
    const { records, total } = store.getHistoryByUser(userId, type || null, parseInt(limit), parseInt(page));
    res.json({ success: true, data: { history: records, pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) } } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const deleteHistory = (req, res) => {
  try {
    const deleted = store.deleteHistoryById(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'History entry not found' });
    res.json({ success: true, message: 'Entry deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const clearHistory = (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Authentication required' });
    const userId = req.user.id || req.user._id?.toString();
    const count = store.clearHistoryByUser(userId);
    res.json({ success: true, message: `Cleared ${count} entries` });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

module.exports = { getHistory, deleteHistory, clearHistory };
