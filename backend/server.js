/**
 * Autonomous Smart Farming Agent — Backend Server
 * Port: 5001 | MongoDB Atlas + in-memory fallback
 */

const express   = require('express');
const cors      = require('cors');
const dotenv    = require('dotenv');
const path      = require('path');
const fs        = require('fs');
const connectDB = require('./config/db');

dotenv.config({ path: path.join(__dirname, '.env') });

const app  = express();
const PORT = parseInt(process.env.PORT, 10) || 5001;

// ── CORS: allow any localhost origin ─────────────────────────────────────────
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:') ||
        origin.startsWith('http://[::1]:')) return cb(null, true);
    cb(new Error('CORS blocked: ' + origin));
  },
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS','PATCH'],
  allowedHeaders: ['Content-Type','Authorization','Accept'],
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
    db:        mongoose.connection.readyState === 1 ? 'MongoDB Atlas connected' : 'In-memory mode',
    port:      PORT,
    timestamp: new Date(),
  });
});

// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal Server Error' });
});

app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

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
      console.error(`\n❌  Port ${PORT} already in use!`);
      console.error('    Run: taskkill /F /IM node.exe   then restart\n');
      process.exit(1);
    }
    console.error('Server error:', err);
    process.exit(1);
  });
};

start();
module.exports = app;
