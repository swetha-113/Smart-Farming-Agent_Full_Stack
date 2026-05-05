/**
 * MongoDB Atlas connection with graceful in-memory fallback.
 * If Atlas DNS/network fails, app continues with in-memory store.
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.log('ℹ️  MONGODB_URI not set — using in-memory mode');
    return false;
  }
  if (uri.includes('<username>') || uri.includes('<password>') || uri.includes('<cluster>')) {
    console.warn('⚠️  MONGODB_URI has placeholder values — using in-memory mode');
    return false;
  }

  try {
    console.log('🔄 Connecting to MongoDB Atlas...');
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS:         8000,
      socketTimeoutMS:          30000,
      family: 4,   // force IPv4 — avoids IPv6 DNS issues on Windows
    });
    console.log(`✅ MongoDB Atlas connected: ${mongoose.connection.host}`);
    return true;
  } catch (err) {
    // Show a short message — don't crash the server
    console.warn(`⚠️  MongoDB Atlas unavailable (${err.message.split('\n')[0]})`);
    console.warn('   Running in in-memory mode — data will not persist between restarts.');
    console.warn('   Fix: whitelist your IP in Atlas → Network Access → Add IP Address');
    return false;
  }
};

module.exports = connectDB;
