/**
 * History Model (Mongoose) — used when MongoDB is connected
 */

const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  type:      { type: String, enum: ['disease','weather','soil','irrigation','crop'], required: true },
  input:     { type: mongoose.Schema.Types.Mixed, required: true },
  result:    { type: mongoose.Schema.Types.Mixed, required: true },
}, { timestamps: true });

historySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.models.History || mongoose.model('History', historySchema);
