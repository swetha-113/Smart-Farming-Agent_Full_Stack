/**
 * Crop Recommendation Controller
 * Suggests suitable crops based on soil and climate conditions
 */

const store = require('../store/inMemoryStore');

// ─── Crop Database ────────────────────────────────────────────────────────────
const CROPS = [
  {
    name: 'Rice',
    emoji: '🌾',
    phRange: [5.5, 7.0],
    tempRange: [20, 35],
    humidityRange: [60, 90],
    rainfallRange: [150, 300],
    nitrogenRange: [30, 80],
    phosphorusRange: [20, 50],
    potassiumRange: [20, 50],
    description: 'Staple food crop, requires flooded conditions and warm climate',
    growingPeriod: '90-150 days',
    waterRequirement: 'High',
  },
  {
    name: 'Wheat',
    emoji: '🌾',
    phRange: [6.0, 7.5],
    tempRange: [10, 25],
    humidityRange: [40, 70],
    rainfallRange: [30, 100],
    nitrogenRange: [40, 80],
    phosphorusRange: [20, 50],
    potassiumRange: [20, 50],
    description: 'Cool-season cereal crop, ideal for temperate climates',
    growingPeriod: '100-130 days',
    waterRequirement: 'Medium',
  },
  {
    name: 'Maize (Corn)',
    emoji: '🌽',
    phRange: [5.8, 7.0],
    tempRange: [18, 32],
    humidityRange: [50, 80],
    rainfallRange: [50, 150],
    nitrogenRange: [40, 80],
    phosphorusRange: [20, 50],
    potassiumRange: [20, 50],
    description: 'Versatile crop used for food, feed, and industrial purposes',
    growingPeriod: '80-110 days',
    waterRequirement: 'Medium-High',
  },
  {
    name: 'Tomato',
    emoji: '🍅',
    phRange: [6.0, 6.8],
    tempRange: [18, 30],
    humidityRange: [40, 70],
    rainfallRange: [40, 100],
    nitrogenRange: [20, 60],
    phosphorusRange: [20, 50],
    potassiumRange: [30, 60],
    description: 'High-value vegetable crop, sensitive to temperature extremes',
    growingPeriod: '60-90 days',
    waterRequirement: 'Medium',
  },
  {
    name: 'Cotton',
    emoji: '🌿',
    phRange: [5.8, 8.0],
    tempRange: [20, 35],
    humidityRange: [40, 70],
    rainfallRange: [50, 150],
    nitrogenRange: [20, 60],
    phosphorusRange: [15, 40],
    potassiumRange: [20, 50],
    description: 'Cash crop requiring warm temperatures and moderate rainfall',
    growingPeriod: '150-180 days',
    waterRequirement: 'Medium',
  },
  {
    name: 'Sugarcane',
    emoji: '🎋',
    phRange: [6.0, 7.5],
    tempRange: [20, 35],
    humidityRange: [60, 90],
    rainfallRange: [100, 250],
    nitrogenRange: [30, 80],
    phosphorusRange: [20, 50],
    potassiumRange: [30, 70],
    description: 'Tropical crop for sugar production, requires long growing season',
    growingPeriod: '270-365 days',
    waterRequirement: 'High',
  },
  {
    name: 'Potato',
    emoji: '🥔',
    phRange: [5.0, 6.5],
    tempRange: [10, 22],
    humidityRange: [50, 80],
    rainfallRange: [50, 120],
    nitrogenRange: [20, 60],
    phosphorusRange: [20, 50],
    potassiumRange: [30, 70],
    description: 'Cool-season tuber crop, prefers slightly acidic soil',
    growingPeriod: '70-120 days',
    waterRequirement: 'Medium',
  },
  {
    name: 'Soybean',
    emoji: '🫘',
    phRange: [6.0, 7.0],
    tempRange: [20, 30],
    humidityRange: [50, 80],
    rainfallRange: [50, 150],
    nitrogenRange: [10, 40],
    phosphorusRange: [20, 50],
    potassiumRange: [20, 50],
    description: 'Legume crop that fixes atmospheric nitrogen, improves soil health',
    growingPeriod: '80-120 days',
    waterRequirement: 'Medium',
  },
  {
    name: 'Groundnut (Peanut)',
    emoji: '🥜',
    phRange: [5.5, 7.0],
    tempRange: [22, 32],
    humidityRange: [40, 70],
    rainfallRange: [50, 120],
    nitrogenRange: [10, 40],
    phosphorusRange: [20, 50],
    potassiumRange: [20, 50],
    description: 'Drought-tolerant legume, good for sandy loam soils',
    growingPeriod: '90-130 days',
    waterRequirement: 'Low-Medium',
  },
  {
    name: 'Banana',
    emoji: '🍌',
    phRange: [5.5, 7.0],
    tempRange: [22, 35],
    humidityRange: [60, 90],
    rainfallRange: [100, 250],
    nitrogenRange: [30, 80],
    phosphorusRange: [20, 50],
    potassiumRange: [40, 80],
    description: 'Tropical fruit crop requiring high potassium and warm climate',
    growingPeriod: '270-365 days',
    waterRequirement: 'High',
  },
];

/**
 * Calculate suitability score for a crop based on input conditions
 */
const calculateSuitability = (crop, conditions) => {
  const { ph, temperature, humidity, rainfall, nitrogen, phosphorus, potassium } = conditions;
  let score = 0;
  let maxScore = 0;
  const reasons = [];

  const checkRange = (value, range, label, weight = 1) => {
    maxScore += weight * 10;
    if (value >= range[0] && value <= range[1]) {
      score += weight * 10;
      reasons.push(`✅ ${label} is in optimal range`);
    } else {
      const diff = Math.min(Math.abs(value - range[0]), Math.abs(value - range[1]));
      const partialScore = Math.max(0, weight * 10 - diff * 2);
      score += partialScore;
      if (partialScore < weight * 5) {
        reasons.push(`⚠️ ${label} is outside optimal range`);
      }
    }
  };

  checkRange(ph, crop.phRange, 'Soil pH', 2);
  checkRange(temperature, crop.tempRange, 'Temperature', 2);
  checkRange(humidity, crop.humidityRange, 'Humidity', 1);
  checkRange(rainfall, crop.rainfallRange, 'Rainfall', 1);
  checkRange(nitrogen, crop.nitrogenRange, 'Nitrogen level', 1);
  checkRange(phosphorus, crop.phosphorusRange, 'Phosphorus level', 1);
  checkRange(potassium, crop.potassiumRange, 'Potassium level', 1);

  const suitabilityPercent = Math.round((score / maxScore) * 100);

  return {
    ...crop,
    suitability: suitabilityPercent,
    suitabilityLabel:
      suitabilityPercent >= 80 ? 'Highly Suitable' :
      suitabilityPercent >= 60 ? 'Suitable' :
      suitabilityPercent >= 40 ? 'Moderately Suitable' : 'Not Recommended',
    reasons: reasons.slice(0, 3), // Top 3 reasons
  };
};

// @desc    Get crop recommendations
// @route   POST /api/crop-recommendation
const getCropRecommendation = async (req, res) => {
  try {
    const { ph, temperature, humidity, rainfall, nitrogen, phosphorus, potassium } = req.body;

    if (!ph || !temperature) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least soil pH and temperature',
      });
    }

    const conditions = {
      ph: parseFloat(ph),
      temperature: parseFloat(temperature),
      humidity: parseFloat(humidity) || 60,
      rainfall: parseFloat(rainfall) || 80,
      nitrogen: parseFloat(nitrogen) || 30,
      phosphorus: parseFloat(phosphorus) || 25,
      potassium: parseFloat(potassium) || 25,
    };

    // Score all crops and sort by suitability
    const scoredCrops = CROPS
      .map((crop) => calculateSuitability(crop, conditions))
      .sort((a, b) => b.suitability - a.suitability);

    const topCrops = scoredCrops.slice(0, 5); // Top 5 recommendations
    const allCrops = scoredCrops;

    // Save to history
    store.addHistory({
      userId: req.user ? req.user.id : null,
      type: 'crop',
      input: conditions,
      result: { topCrops: topCrops.map((c) => ({ name: c.name, suitability: c.suitability })) },
    });

    res.json({
      success: true,
      data: {
        input: conditions,
        topRecommendations: topCrops,
        allCrops,
      },
    });
  } catch (error) {
    console.error('Crop recommendation error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getCropRecommendation };
