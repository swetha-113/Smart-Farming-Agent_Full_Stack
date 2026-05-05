/**
 * Disease Detection Controller
 * Uses sharp to analyze actual pixel color distribution in the uploaded leaf image.
 *
 * KEY FIX: Background pixels (white, near-white, very light) are EXCLUDED from analysis.
 * Only actual leaf pixels are classified. This prevents PNG white backgrounds from
 * being misidentified as Powdery Mildew or other diseases.
 *
 * Color logic (applied only to non-background pixels):
 *   Dominant green, low damage   → Healthy Leaf
 *   High yellow pixels           → Yellow Leaf Spot / Nutrient Deficiency
 *   High white/pale ON LEAF      → Powdery Mildew
 *   High brown pixels            → Early Blight / Brown Spot
 *   High dark/black pixels       → Late Blight
 *   Mixed brown + yellow         → Bacterial Leaf Spot
 *   Moderate green loss + brown  → Corn Leaf Blight
 *   Low green + mixed damage     → Rice Blast
 *
 * Same image → same result (fully deterministic).
 */

const sharp = require('sharp');
const store = require('../store/inMemoryStore');

// ─── Disease Database ─────────────────────────────────────────────────────────
const DISEASES = {
  HEALTHY: {
    name: 'Healthy Leaf',
    cause: 'No disease detected. The leaf appears healthy with normal green coloration and no visible lesions or discoloration.',
    treatment: ['No treatment required. The leaf is healthy.'],
    prevention: [
      'Continue regular crop monitoring every 3–5 days',
      'Maintain balanced NPK fertilization',
      'Ensure proper irrigation — avoid waterlogging',
      'Keep field clean of fallen leaves and debris',
    ],
    severity: 'none',
    baseConfidence: 0.93,
  },
  POWDERY_MILDEW: {
    name: 'Powdery Mildew',
    cause: 'Caused by fungal species (Erysiphe, Podosphaera). Appears as white or pale powdery coating directly on the leaf surface. Thrives in dry weather with high humidity.',
    treatment: [
      'Apply sulfur-based fungicide (wettable sulfur) every 7 days',
      'Spray neem oil solution (5 ml/L water) as organic option',
      'Remove and destroy heavily infected leaves immediately',
      'Apply potassium bicarbonate spray for quick knockdown',
    ],
    prevention: [
      'Improve air circulation — avoid dense planting',
      'Avoid overhead irrigation; use drip irrigation',
      'Plant resistant varieties when available',
      'Apply preventive fungicide during high-risk periods',
    ],
    severity: 'mild',
    baseConfidence: 0.87,
  },
  YELLOW_SPOT: {
    name: 'Yellow Leaf Spot / Nutrient Deficiency',
    cause: 'Yellow patches indicate either fungal leaf spot (Septoria, Cercospora) or nitrogen/magnesium deficiency. Yellow interveinal chlorosis suggests micronutrient deficiency.',
    treatment: [
      'Apply foliar spray of micronutrients (Mg, Fe, Mn) if deficiency suspected',
      'For fungal cause: apply mancozeb or chlorothalonil fungicide',
      'Remove yellowed leaves to prevent spread',
      'Apply balanced NPK fertilizer with micronutrients',
    ],
    prevention: [
      'Maintain proper soil pH (6.0–7.0) for nutrient availability',
      'Regular soil testing every season',
      'Avoid excessive watering which leaches nutrients',
      'Apply organic compost to improve soil health',
    ],
    severity: 'moderate',
    baseConfidence: 0.85,
  },
  EARLY_BLIGHT: {
    name: 'Early Blight / Brown Spot',
    cause: 'Caused by the fungus Alternaria solani. Produces brown circular spots with concentric rings (target-board pattern). Thrives in warm, humid conditions with temperatures 24–29°C.',
    treatment: [
      'Apply copper-based fungicide (copper oxychloride) every 7–10 days',
      'Remove and destroy all infected leaves immediately',
      'Apply chlorothalonil or mancozeb fungicide',
      'Use systemic fungicide (azoxystrobin) for severe infection',
    ],
    prevention: [
      'Rotate crops — avoid planting in same field for 2–3 years',
      'Avoid overhead irrigation; use drip irrigation',
      'Maintain proper plant spacing (45–60 cm) for air circulation',
      'Apply mulch to prevent soil splash onto lower leaves',
    ],
    severity: 'moderate',
    baseConfidence: 0.88,
  },
  LATE_BLIGHT: {
    name: 'Late Blight / Leaf Blight',
    cause: 'Caused by Phytophthora infestans. Creates dark brown to black water-soaked lesions. Spreads extremely rapidly in cool (10–20°C), wet weather.',
    treatment: [
      'Apply systemic fungicide: metalaxyl + mancozeb immediately',
      'Spray cymoxanil-based fungicide every 5–7 days',
      'Remove ALL infected plant material and destroy (do not compost)',
      'Increase plant spacing to improve airflow',
    ],
    prevention: [
      'Use certified disease-free seeds and resistant varieties',
      'Avoid wetting foliage during irrigation',
      'Monitor weather — apply preventive fungicide before rain',
      'Destroy volunteer plants and crop debris after harvest',
    ],
    severity: 'severe',
    baseConfidence: 0.90,
  },
  BACTERIAL_SPOT: {
    name: 'Bacterial Leaf Spot',
    cause: 'Caused by Xanthomonas bacteria. Produces small water-soaked spots that turn brown with yellow halos. Spreads through water splash, infected tools, and wind-driven rain.',
    treatment: [
      'Apply copper-based bactericide (copper hydroxide) every 7 days',
      'Remove infected plant parts with sterilized tools',
      'Avoid working with plants when foliage is wet',
      'Apply streptomycin sulfate for severe bacterial infection',
    ],
    prevention: [
      'Use disease-free certified seeds',
      'Sanitize all gardening tools with 10% bleach solution',
      'Avoid overhead irrigation — use drip system',
      'Maintain proper plant spacing for air circulation',
    ],
    severity: 'moderate',
    baseConfidence: 0.83,
  },
  RICE_BLAST: {
    name: 'Rice Blast',
    cause: 'Caused by Magnaporthe oryzae. Creates diamond-shaped lesions with gray centers and brown borders. Most destructive rice disease worldwide.',
    treatment: [
      'Apply tricyclazole fungicide at first sign of infection',
      'Spray isoprothiolane or propiconazole fungicide',
      'Drain fields periodically to reduce leaf wetness',
      'Apply silicon fertilizer to strengthen cell walls',
    ],
    prevention: [
      'Use blast-resistant rice varieties',
      'Balanced fertilization — avoid excess nitrogen',
      'Maintain proper water management',
      'Avoid late-evening irrigation which increases leaf wetness',
    ],
    severity: 'severe',
    baseConfidence: 0.86,
  },
  CORN_BLIGHT: {
    name: 'Corn Leaf Blight',
    cause: 'Caused by Helminthosporium turcicum. Creates long, elliptical tan/gray lesions on corn leaves. Common in humid, warm climates.',
    treatment: [
      'Apply foliar fungicide (propiconazole or azoxystrobin) at early stage',
      'Use resistant corn hybrids in future planting',
      'Remove severely infected lower leaves',
    ],
    prevention: [
      'Plant resistant hybrids with Ht gene resistance',
      'Crop rotation with non-host crops (soybean, wheat)',
      'Avoid excessive nitrogen fertilization',
      'Ensure proper field drainage',
    ],
    severity: 'moderate',
    baseConfidence: 0.84,
  },
};

// ─── Background pixel detector ────────────────────────────────────────────────
/**
 * Returns true if this RGB pixel is a background pixel that should be IGNORED.
 * Catches: white backgrounds, near-white, very light gray, transparent-rendered white.
 */
function isBackground(r, g, b) {
  const brightness = (r + g + b) / 3;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const saturation = max === 0 ? 0 : (max - min) / max;

  // Very bright AND low saturation = white/light background
  if (brightness > 210 && saturation < 0.15) return true;

  // Very light gray
  if (r > 200 && g > 200 && b > 200) return true;

  return false;
}

// ─── Image Color Analyzer ─────────────────────────────────────────────────────
/**
 * Analyzes pixel color distribution of a leaf image using sharp.
 * EXCLUDES background pixels from all calculations.
 *
 * @param {string} imagePath
 * @returns {Promise<object>} Color percentages relative to leaf pixels only
 */
async function analyzeImageColors(imagePath) {
  const { data, info } = await sharp(imagePath)
    .resize(150, 150, { fit: 'fill' })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  let leafPixels  = 0; // total non-background pixels
  let greenCount  = 0;
  let yellowCount = 0;
  let brownCount  = 0;
  let darkCount   = 0;
  let whiteCount  = 0; // white ON the leaf (not background)
  let redCount    = 0;

  for (let i = 0; i < data.length; i += 3) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // ── Skip background pixels ──────────────────────────────────────────────
    if (isBackground(r, g, b)) continue;

    leafPixels++;

    // ── Compute HSV ─────────────────────────────────────────────────────────
    const max   = Math.max(r, g, b);
    const min   = Math.min(r, g, b);
    const delta = max - min;
    const brightness  = max / 255;
    const saturation  = max === 0 ? 0 : delta / max;

    let hue = 0;
    if (delta !== 0) {
      if (max === r)      hue = 60 * (((g - b) / delta) % 6);
      else if (max === g) hue = 60 * ((b - r) / delta + 2);
      else                hue = 60 * ((r - g) / delta + 4);
      if (hue < 0) hue += 360;
    }

    // ── Classify leaf pixel ─────────────────────────────────────────────────

    // Very dark / necrotic (late blight, severe lesions)
    if (brightness < 0.20) {
      darkCount++;
    }
    // White/pale ON the leaf itself (powdery mildew coating)
    else if (brightness > 0.80 && saturation < 0.20) {
      whiteCount++;
    }
    // Healthy green
    else if (hue >= 70 && hue <= 170 && saturation > 0.18 && brightness > 0.12) {
      greenCount++;
    }
    // Yellow (nutrient deficiency, yellow spot)
    else if (hue >= 38 && hue < 70 && saturation > 0.22 && brightness > 0.30) {
      yellowCount++;
    }
    // Brown (early blight, brown spot)
    else if (hue >= 8 && hue < 38 && saturation > 0.15 && brightness > 0.15 && brightness < 0.80) {
      brownCount++;
    }
    // Red / rust
    else if ((hue < 10 || hue > 340) && saturation > 0.28 && brightness > 0.22) {
      redCount++;
    }
    // Anything else on the leaf counts as green-ish (veins, shadows)
    else {
      greenCount++;
    }
  }

  // If almost no leaf pixels detected (e.g. blank/non-leaf image), treat as healthy
  if (leafPixels < 200) {
    return { green: 100, yellow: 0, brown: 0, dark: 0, white: 0, red: 0, leafPixels };
  }

  const pct = (n) => parseFloat(((n / leafPixels) * 100).toFixed(2));

  return {
    green:  pct(greenCount),
    yellow: pct(yellowCount),
    brown:  pct(brownCount),
    dark:   pct(darkCount),
    white:  pct(whiteCount),
    red:    pct(redCount),
    leafPixels,
  };
}

// ─── Disease Classifier ───────────────────────────────────────────────────────
/**
 * Maps color distribution (of LEAF pixels only) to a disease.
 * Deterministic — same color profile always gives same result.
 */
function classifyDisease(colors) {
  const { green, yellow, brown, dark, white, red } = colors;

  // Total damage pixels (everything that isn't healthy green)
  const damage = yellow + brown + dark + white + red;

  // ── Rule 1: Healthy — green dominates, very little damage ────────────────
  // A clean leaf: green > 70% of leaf pixels, damage < 15%
  if (green >= 70 && damage < 15) {
    const conf = Math.min(0.97, 0.88 + (green / 100) * 0.12);
    return { diseaseKey: 'HEALTHY', confidence: conf };
  }

  // ── Rule 2: Still mostly healthy — green 55–70%, low damage ──────────────
  if (green >= 55 && damage < 20 && brown < 8 && dark < 5 && yellow < 10) {
    const conf = Math.min(0.94, 0.82 + (green / 100) * 0.10);
    return { diseaseKey: 'HEALTHY', confidence: conf };
  }

  // ── Rule 3: Powdery Mildew — significant white ON the leaf ───────────────
  // Only triggered if white is a meaningful portion of leaf pixels
  if (white > 20 && white > brown && white > yellow && white > dark) {
    const conf = Math.min(0.93, DISEASES.POWDERY_MILDEW.baseConfidence + (white / 100) * 0.35);
    return { diseaseKey: 'POWDERY_MILDEW', confidence: conf };
  }

  // ── Rule 4: Late Blight — dominant dark/black lesions ────────────────────
  if (dark > 18 && dark > brown && dark > yellow) {
    const conf = Math.min(0.94, DISEASES.LATE_BLIGHT.baseConfidence + (dark / 100) * 0.30);
    return { diseaseKey: 'LATE_BLIGHT', confidence: conf };
  }

  // ── Rule 5: Yellow Spot / Nutrient Deficiency ─────────────────────────────
  if (yellow > 15 && yellow > brown && yellow > dark && yellow > white) {
    const conf = Math.min(0.92, DISEASES.YELLOW_SPOT.baseConfidence + (yellow / 100) * 0.38);
    return { diseaseKey: 'YELLOW_SPOT', confidence: conf };
  }

  // ── Rule 6: Bacterial Spot — brown + yellow together ─────────────────────
  if (brown > 10 && yellow > 8 && (yellow / Math.max(brown, 1)) > 0.35) {
    const conf = Math.min(0.90, DISEASES.BACTERIAL_SPOT.baseConfidence + (damage / 100) * 0.28);
    return { diseaseKey: 'BACTERIAL_SPOT', confidence: conf };
  }

  // ── Rule 7: Early Blight — brown dominates ───────────────────────────────
  if (brown > 15 && brown >= yellow && brown > dark) {
    const conf = Math.min(0.93, DISEASES.EARLY_BLIGHT.baseConfidence + (brown / 100) * 0.32);
    return { diseaseKey: 'EARLY_BLIGHT', confidence: conf };
  }

  // ── Rule 8: Late Blight — dark + brown combined ───────────────────────────
  if (dark + brown > 22 && dark > 6) {
    const conf = Math.min(0.91, DISEASES.LATE_BLIGHT.baseConfidence + ((dark + brown) / 100) * 0.22);
    return { diseaseKey: 'LATE_BLIGHT', confidence: conf };
  }

  // ── Rule 9: Corn Blight — moderate green loss, some brown ────────────────
  if (green >= 40 && green < 55 && brown > 8 && damage > 18) {
    const conf = Math.min(0.88, DISEASES.CORN_BLIGHT.baseConfidence + (damage / 100) * 0.22);
    return { diseaseKey: 'CORN_BLIGHT', confidence: conf };
  }

  // ── Rule 10: Rice Blast — low green, mixed damage ────────────────────────
  if (green < 40 && damage > 25) {
    const conf = Math.min(0.88, DISEASES.RICE_BLAST.baseConfidence + (damage / 100) * 0.18);
    return { diseaseKey: 'RICE_BLAST', confidence: conf };
  }

  // ── Rule 11: Mild early blight — green still present but damage visible ──
  if (green >= 40 && damage >= 15 && damage < 30) {
    const conf = Math.min(0.86, 0.76 + (damage / 100) * 0.38);
    return { diseaseKey: 'EARLY_BLIGHT', confidence: conf };
  }

  // ── Fallback: if green still dominates → healthy ──────────────────────────
  if (green >= 50) {
    return { diseaseKey: 'HEALTHY', confidence: 0.80 };
  }

  // ── Last resort ───────────────────────────────────────────────────────────
  return { diseaseKey: 'YELLOW_SPOT', confidence: 0.72 };
}

// ─── Main Prediction ──────────────────────────────────────────────────────────
async function analyzeLeaf(imagePath) {
  const colors = await analyzeImageColors(imagePath);
  const { diseaseKey, confidence } = classifyDisease(colors);
  const disease = DISEASES[diseaseKey];

  return {
    disease:           disease.name,
    confidence:        parseFloat(confidence.toFixed(2)),
    confidencePercent: `${(confidence * 100).toFixed(1)}%`,
    cause:             disease.cause,
    treatment:         disease.treatment,
    prevention:        disease.prevention,
    severity:          disease.severity,
    colorAnalysis: {
      green:  `${colors.green}%`,
      yellow: `${colors.yellow}%`,
      brown:  `${colors.brown}%`,
      dark:   `${colors.dark}%`,
      white:  `${colors.white}%`,
    },
  };
}

// ─── Route Handler ────────────────────────────────────────────────────────────
const predictDisease = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a leaf image' });
    }

    const imagePath = req.file.path;
    const imageUrl  = `/uploads/${req.file.filename}`;

    const prediction = await analyzeLeaf(imagePath);

    const result = { ...prediction, imageUrl, analyzedAt: new Date() };

    store.addHistory({
      userId: req.user ? req.user.id : null,
      type:   'disease',
      input:  { imageName: req.file.originalname, imageSize: req.file.size },
      result,
    });

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Disease prediction error:', error);
    res.status(500).json({ success: false, message: 'Prediction failed: ' + error.message });
  }
};

module.exports = { predictDisease };
