/**
 * Disease Detection Controller
 * Uses sharp to analyze pixel colors — deterministic, no random prediction.
 */

const sharp = require('sharp');
const store = require('../store/inMemoryStore');

const DISEASES = {
  HEALTHY: {
    name: 'Healthy Leaf',
    cause: 'No disease detected. The leaf appears healthy with normal green coloration.',
    treatment: ['No treatment required. Continue regular care.'],
    prevention: [
      'Continue regular crop monitoring every 3–5 days',
      'Maintain balanced NPK fertilization',
      'Ensure proper irrigation — avoid waterlogging',
      'Keep field clean of fallen leaves and debris',
    ],
    severity: 'none',
  },
  POWDERY_MILDEW: {
    name: 'Powdery Mildew',
    cause: 'Caused by fungal species (Erysiphe, Podosphaera). White powdery coating on leaf surface. Thrives in dry weather with high humidity.',
    treatment: [
      'Apply sulfur-based fungicide every 7 days',
      'Spray neem oil solution (5 ml/L water) as organic option',
      'Remove and destroy heavily infected leaves immediately',
    ],
    prevention: [
      'Improve air circulation — avoid dense planting',
      'Avoid overhead irrigation; use drip irrigation',
      'Plant resistant varieties when available',
    ],
    severity: 'mild',
  },
  YELLOW_SPOT: {
    name: 'Yellow Leaf Spot / Nutrient Deficiency',
    cause: 'Yellow patches indicate fungal leaf spot (Septoria, Cercospora) or nitrogen/magnesium deficiency.',
    treatment: [
      'Apply foliar spray of micronutrients (Mg, Fe, Mn)',
      'For fungal cause: apply mancozeb or chlorothalonil fungicide',
      'Remove yellowed leaves to prevent spread',
    ],
    prevention: [
      'Maintain proper soil pH (6.0–7.0)',
      'Regular soil testing every season',
      'Avoid excessive watering which leaches nutrients',
    ],
    severity: 'moderate',
  },
  EARLY_BLIGHT: {
    name: 'Early Blight / Brown Spot',
    cause: 'Caused by Alternaria solani. Brown circular spots with concentric rings. Thrives in warm, humid conditions.',
    treatment: [
      'Apply copper-based fungicide every 7–10 days',
      'Remove and destroy all infected leaves immediately',
      'Apply chlorothalonil or mancozeb fungicide',
    ],
    prevention: [
      'Rotate crops every 2–3 years',
      'Avoid overhead irrigation; use drip irrigation',
      'Maintain proper plant spacing for air circulation',
    ],
    severity: 'moderate',
  },
  LATE_BLIGHT: {
    name: 'Late Blight / Leaf Blight',
    cause: 'Caused by Phytophthora infestans. Dark brown to black water-soaked lesions. Spreads rapidly in cool, wet weather.',
    treatment: [
      'Apply systemic fungicide: metalaxyl + mancozeb immediately',
      'Spray cymoxanil-based fungicide every 5–7 days',
      'Remove ALL infected plant material and destroy',
    ],
    prevention: [
      'Use certified disease-free seeds and resistant varieties',
      'Avoid wetting foliage during irrigation',
      'Monitor weather — apply preventive fungicide before rain',
    ],
    severity: 'severe',
  },
  BACTERIAL_SPOT: {
    name: 'Bacterial Leaf Spot',
    cause: 'Caused by Xanthomonas bacteria. Small water-soaked spots turning brown with yellow halos.',
    treatment: [
      'Apply copper-based bactericide every 7 days',
      'Remove infected plant parts with sterilized tools',
      'Avoid working with plants when foliage is wet',
    ],
    prevention: [
      'Use disease-free certified seeds',
      'Sanitize all gardening tools with 10% bleach solution',
      'Avoid overhead irrigation',
    ],
    severity: 'moderate',
  },
  RICE_BLAST: {
    name: 'Rice Blast',
    cause: 'Caused by Magnaporthe oryzae. Diamond-shaped lesions with gray centers and brown borders.',
    treatment: [
      'Apply tricyclazole fungicide at first sign of infection',
      'Spray isoprothiolane or propiconazole fungicide',
      'Drain fields periodically to reduce leaf wetness',
    ],
    prevention: [
      'Use blast-resistant rice varieties',
      'Balanced fertilization — avoid excess nitrogen',
      'Maintain proper water management',
    ],
    severity: 'severe',
  },
  CORN_BLIGHT: {
    name: 'Corn Leaf Blight',
    cause: 'Caused by Helminthosporium turcicum. Long elliptical tan/gray lesions on corn leaves.',
    treatment: [
      'Apply foliar fungicide (propiconazole or azoxystrobin)',
      'Use resistant corn hybrids in future planting',
      'Remove severely infected lower leaves',
    ],
    prevention: [
      'Plant resistant hybrids',
      'Crop rotation with non-host crops',
      'Avoid excessive nitrogen fertilization',
    ],
    severity: 'moderate',
  },
};

function isBackground(r, g, b) {
  const brightness = (r + g + b) / 3;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const saturation = max === 0 ? 0 : (max - min) / max;
  if (brightness > 210 && saturation < 0.15) return true;
  if (r > 200 && g > 200 && b > 200) return true;
  return false;
}

async function analyzeImageColors(imagePath) {
  const { data } = await sharp(imagePath)
    .resize(150, 150, { fit: 'fill' })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  let leafPixels = 0, greenCount = 0, yellowCount = 0;
  let brownCount = 0, darkCount = 0, whiteCount = 0, redCount = 0;

  for (let i = 0; i < data.length; i += 3) {
    const r = data[i], g = data[i+1], b = data[i+2];
    if (isBackground(r, g, b)) continue;
    leafPixels++;

    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const delta = max - min;
    const brightness = max / 255;
    const saturation = max === 0 ? 0 : delta / max;
    let hue = 0;
    if (delta !== 0) {
      if (max === r)      hue = 60 * (((g - b) / delta) % 6);
      else if (max === g) hue = 60 * ((b - r) / delta + 2);
      else                hue = 60 * ((r - g) / delta + 4);
      if (hue < 0) hue += 360;
    }

    if (brightness < 0.20) darkCount++;
    else if (brightness > 0.80 && saturation < 0.20) whiteCount++;
    else if (hue >= 70 && hue <= 170 && saturation > 0.18 && brightness > 0.12) greenCount++;
    else if (hue >= 38 && hue < 70 && saturation > 0.22 && brightness > 0.30) yellowCount++;
    else if (hue >= 8 && hue < 38 && saturation > 0.15 && brightness > 0.15 && brightness < 0.80) brownCount++;
    else if ((hue < 10 || hue > 340) && saturation > 0.28 && brightness > 0.22) redCount++;
    else greenCount++;
  }

  if (leafPixels < 200) return { green: 100, yellow: 0, brown: 0, dark: 0, white: 0, red: 0, leafPixels };

  const pct = (n) => parseFloat(((n / leafPixels) * 100).toFixed(2));
  return { green: pct(greenCount), yellow: pct(yellowCount), brown: pct(brownCount), dark: pct(darkCount), white: pct(whiteCount), red: pct(redCount), leafPixels };
}

function classifyDisease(colors) {
  const { green, yellow, brown, dark, white, red } = colors;
  const damage = yellow + brown + dark + white + red;

  if (green >= 70 && damage < 15) return { diseaseKey: 'HEALTHY', confidence: Math.min(0.97, 0.88 + (green/100)*0.12) };
  if (green >= 55 && damage < 20 && brown < 8 && dark < 5 && yellow < 10) return { diseaseKey: 'HEALTHY', confidence: Math.min(0.94, 0.82 + (green/100)*0.10) };
  if (white > 20 && white > brown && white > yellow && white > dark) return { diseaseKey: 'POWDERY_MILDEW', confidence: Math.min(0.93, 0.87 + (white/100)*0.35) };
  if (dark > 18 && dark > brown && dark > yellow) return { diseaseKey: 'LATE_BLIGHT', confidence: Math.min(0.94, 0.90 + (dark/100)*0.30) };
  if (yellow > 15 && yellow > brown && yellow > dark && yellow > white) return { diseaseKey: 'YELLOW_SPOT', confidence: Math.min(0.92, 0.85 + (yellow/100)*0.38) };
  if (brown > 10 && yellow > 8 && (yellow / Math.max(brown, 1)) > 0.35) return { diseaseKey: 'BACTERIAL_SPOT', confidence: Math.min(0.90, 0.83 + (damage/100)*0.28) };
  if (brown > 15 && brown >= yellow && brown > dark) return { diseaseKey: 'EARLY_BLIGHT', confidence: Math.min(0.93, 0.88 + (brown/100)*0.32) };
  if (dark + brown > 22 && dark > 6) return { diseaseKey: 'LATE_BLIGHT', confidence: Math.min(0.91, 0.90 + ((dark+brown)/100)*0.22) };
  if (green >= 40 && green < 55 && brown > 8 && damage > 18) return { diseaseKey: 'CORN_BLIGHT', confidence: Math.min(0.88, 0.84 + (damage/100)*0.22) };
  if (green < 40 && damage > 25) return { diseaseKey: 'RICE_BLAST', confidence: Math.min(0.88, 0.86 + (damage/100)*0.18) };
  if (green >= 40 && damage >= 15 && damage < 30) return { diseaseKey: 'EARLY_BLIGHT', confidence: Math.min(0.86, 0.76 + (damage/100)*0.38) };
  if (green >= 50) return { diseaseKey: 'HEALTHY', confidence: 0.80 };
  return { diseaseKey: 'YELLOW_SPOT', confidence: 0.72 };
}

const predictDisease = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Please upload a leaf image' });

    const colors = await analyzeImageColors(req.file.path);
    const { diseaseKey, confidence } = classifyDisease(colors);
    const disease = DISEASES[diseaseKey];

    const result = {
      disease:           disease.name,
      confidence:        parseFloat(confidence.toFixed(2)),
      confidencePercent: `${(confidence * 100).toFixed(1)}%`,
      cause:             disease.cause,
      treatment:         disease.treatment,
      prevention:        disease.prevention,
      severity:          disease.severity,
      imageUrl:          `/uploads/${req.file.filename}`,
      colorAnalysis: {
        green:  `${colors.green}%`,
        yellow: `${colors.yellow}%`,
        brown:  `${colors.brown}%`,
        dark:   `${colors.dark}%`,
        white:  `${colors.white}%`,
      },
      analyzedAt: new Date(),
    };

    store.addHistory({ userId: req.user ? req.user.id : null, type: 'disease', input: { imageName: req.file.originalname }, result });
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('Disease prediction error:', err);
    res.status(500).json({ success: false, message: 'Prediction failed: ' + err.message });
  }
};

module.exports = { predictDisease };
