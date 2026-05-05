/**
 * MongoDB Atlas Connection
 * Reads MONGODB_URI from backend/.env
 * Falls back to in-memory store if connection fails.
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  // ── No URI set ──────────────────────────────────────────────────────────────
  if (!uri) {
    console.log('ℹ️  MONGODB_URI not set in .env — running in in-memory mode');
    console.log('   Users and history will be lost when server restarts.');
    return false;
  }

  // ── Placeholder not replaced ────────────────────────────────────────────────
  if (uri.includes('<username>') || uri.includes('<password>') || uri.includes('<cluster>')) {
    console.warn('⚠️  MONGODB_URI still has placeholder values in .env');
    console.warn('   Replace <username>, <password>, <cluster> with your Atlas credentials.');
    console.warn('   Running in in-memory mode for now.');
    return false;
  }

  // ── Try connecting ──────────────────────────────────────────────────────────
  try {
    console.log('🔄 Connecting to MongoDB Atlas...');
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,   // 8 seconds to find a server
      connectTimeoutMS:         10000,  // 10 seconds to establish connection
      socketTimeoutMS:          45000,  // 45 seconds for operations
    });
    console.log(`✅ MongoDB Atlas connected: ${mongoose.connection.host}`);
    return true;
  } catch (err) {
    console.error('❌ MongoDB Atlas connection failed!');
    console.error('   Error:', err.message);
    console.error('   Check: IP whitelist, username/password, cluster name in Atlas.');
    console.warn('⚠️  Falling back to in-memory store (data will not persist).');
    return false;
  }
};

module.exports = connectDB;
