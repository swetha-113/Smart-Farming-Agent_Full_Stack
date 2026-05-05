/**
 * Autonomous Smart Farming Agent — Backend Server
 */

const express   = require('express');
const cors      = require('cors');
const dotenv    = require('dotenv');
const path      = require('path');
const fs        = require('fs');
const connectDB = require('./config/db');

// Load .env first
dotenv.config({ path: path.join(__dirname, '.env') });

const app  = express();
const PORT = parseInt(process.env.PORT, 10) || 5001;

// ── CORS: allow ALL localhost/127.0.0.1 ports in dev ─────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    // Allow no-origin requests (Postman, curl, mobile)
    if (!origin) return callback(null, true);
    // Allow any localhost or 127.0.0.1 origin
    if (
      origin.startsWith('http://localhost:') ||
      origin.startsWith('http://127.0.0.1:') ||
      origin.startsWith('http://[::1]:')
    ) {
      return callback(null, true);
    }
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));
app.options('*', cors());

// ── Body parsers ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Uploads ───────────────────────────────────────────────────────────────────
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api',      require('./routes/diseaseRoutes'));
app.use('/api',      require('./routes/weatherRoutes'));
app.use('/api',      require('./routes/soilRoutes'));
app.use('/api',      require('./routes/irrigationRoutes'));
app.use('/api',      require('./routes/cropRoutes'));
app.use('/api',      require('./routes/historyRoutes'));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  const mongoose = require('mongoose');
  res.json({
    success:   true,
    message:   'Backend running',
    db:        mongoose.connection.readyState === 1
                 ? 'MongoDB Atlas connected'
                 : 'In-memory mode',
    port:      PORT,
    timestamp: new Date(),
  });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const start = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🚀  Server   http://localhost:${PORT}`);
    console.log(`📡  Health   GET  http://localhost:${PORT}/api/health`);
    console.log(`🔐  Signup   POST http://localhost:${PORT}/api/auth/signup`);
    console.log(`🔐  Login    POST http://localhost:${PORT}/api/auth/login`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n❌  Port ${PORT} is already in use!`);
      console.error('    Run: taskkill /F /IM node.exe');
      console.error(`    Then restart: node server.js\n`);
      process.exit(1);
    }
    console.error('Server error:', err);
    process.exit(1);
  });
};

start();
module.exports = app;
