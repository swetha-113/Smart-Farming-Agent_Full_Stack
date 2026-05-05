/**
 * History Model
 * Stores all user activity: disease predictions, weather searches, soil recommendations
 */

const mongoose = require('mongoose');

const historySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // Allow anonymous usage
    },
    type: {
      type: String,
      enum: ['disease', 'weather', 'soil', 'irrigation', 'crop'],
      required: true,
    },
    input: {
      type: mongoose.Schema.Types.Mixed, // Flexible input data
      required: true,
    },
    result: {
      type: mongoose.Schema.Types.Mixed, // Flexible result data
      required: true,
    },
    sessionId: {
      type: String,
      default: null, // For anonymous session tracking
    },
  },
  { timestamps: true }
);

// Index for faster queries
historySchema.index({ userId: 1, createdAt: -1 });
historySchema.index({ type: 1 });

module.exports = mongoose.model('History', historySchema);
