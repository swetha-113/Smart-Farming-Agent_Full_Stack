const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const { predictDisease } = require('../controllers/diseaseController');
const { optionalAuth }   = require('../middleware/authMiddleware');

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename:    (_req, file, cb) => cb(null, `leaf-${Date.now()}-${Math.round(Math.random()*1e9)}${path.extname(file.originalname)}`),
});

const fileFilter = (_req, file, cb) => {
  /jpeg|jpg|png|gif|webp/.test(path.extname(file.originalname).toLowerCase()) && /image/.test(file.mimetype)
    ? cb(null, true) : cb(new Error('Only image files allowed'));
};

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter });

router.post('/predict-disease', optionalAuth, upload.single('image'), predictDisease);

module.exports = router;
