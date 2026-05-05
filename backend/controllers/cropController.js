/**
 * Crop Recommendation Controller
 */

const store = require('../store/inMemoryStore');

const CROPS = [
  { name: 'Rice', emoji: '🌾', phRange: [5.5,7.0], tempRange: [20,35], humidityRange: [60,90], rainfallRange: [150,300], nitrogenRange: [30,80], phosphorusRange: [20,50], potassiumRange: [20,50], description: 'Staple food crop, requires flooded conditions', growingPeriod: '90-150 days', waterRequirement: 'High' },
  { name: 'Wheat', emoji: '🌾', phRange: [6.0,7.5], tempRange: [10,25], humidityRange: [40,70], rainfallRange: [30,100], nitrogenRange: [40,80], phosphorusRange: [20,50], potassiumRange: [20,50], description: 'Cool-season cereal crop', growingPeriod: '100-130 days', waterRequirement: 'Medium' },
  { name: 'Maize (Corn)', emoji: '🌽', phRange: [5.8,7.0], tempRange: [18,32], humidityRange: [50,80], rainfallRange: [50,150], nitrogenRange: [40,80], phosphorusRange: [20,50], potassiumRange: [20,50], description: 'Versatile crop for food, feed, and industry', growingPeriod: '80-110 days', waterRequirement: 'Medium-High' },
  { name: 'Tomato', emoji: '🍅', phRange: [6.0,6.8], tempRange: [18,30], humidityRange: [40,70], rainfallRange: [40,100], nitrogenRange: [20,60], phosphorusRange: [20,50], potassiumRange: [30,60], description: 'High-value vegetable crop', growingPeriod: '60-90 days', waterRequirement: 'Medium' },
  { name: 'Cotton', emoji: '🌿', phRange: [5.8,8.0], tempRange: [20,35], humidityRange: [40,70], rainfallRange: [50,150], nitrogenRange: [20,60], phosphorusRange: [15,40], potassiumRange: [20,50], description: 'Cash crop requiring warm temperatures', growingPeriod: '150-180 days', waterRequirement: 'Medium' },
  { name: 'Sugarcane', emoji: '🎋', phRange: [6.0,7.5], tempRange: [20,35], humidityRange: [60,90], rainfallRange: [100,250], nitrogenRange: [30,80], phosphorusRange: [20,50], potassiumRange: [30,70], description: 'Tropical crop for sugar production', growingPeriod: '270-365 days', waterRequirement: 'High' },
  { name: 'Potato', emoji: '🥔', phRange: [5.0,6.5], tempRange: [10,22], humidityRange: [50,80], rainfallRange: [50,120], nitrogenRange: [20,60], phosphorusRange: [20,50], potassiumRange: [30,70], description: 'Cool-season tuber crop', growingPeriod: '70-120 days', waterRequirement: 'Medium' },
  { name: 'Soybean', emoji: '🫘', phRange: [6.0,7.0], tempRange: [20,30], humidityRange: [50,80], rainfallRange: [50,150], nitrogenRange: [10,40], phosphorusRange: [20,50], potassiumRange: [20,50], description: 'Legume crop that fixes atmospheric nitrogen', growingPeriod: '80-120 days', waterRequirement: 'Medium' },
  { name: 'Groundnut', emoji: '🥜', phRange: [5.5,7.0], tempRange: [22,32], humidityRange: [40,70], rainfallRange: [50,120], nitrogenRange: [10,40], phosphorusRange: [20,50], potassiumRange: [20,50], description: 'Drought-tolerant legume', growingPeriod: '90-130 days', waterRequirement: 'Low-Medium' },
  { name: 'Banana', emoji: '🍌', phRange: [5.5,7.0], tempRange: [22,35], humidityRange: [60,90], rainfallRange: [100,250], nitrogenRange: [30,80], phosphorusRange: [20,50], potassiumRange: [40,80], description: 'Tropical fruit crop requiring high potassium', growingPeriod: '270-365 days', waterRequirement: 'High' },
];

const calculateSuitability = (crop, conditions) => {
  const { ph, temperature, humidity, rainfall, nitrogen, phosphorus, potassium } = conditions;
  let score = 0, maxScore = 0;
  const reasons = [];

  const checkRange = (value, range, label, weight = 1) => {
    maxScore += weight * 10;
    if (value >= range[0] && value <= range[1]) { score += weight * 10; reasons.push(`✅ ${label} is in optimal range`); }
    else {
      const diff = Math.min(Math.abs(value - range[0]), Math.abs(value - range[1]));
      const partial = Math.max(0, weight * 10 - diff * 2);
      score += partial;
      if (partial < weight * 5) reasons.push(`⚠️ ${label} is outside optimal range`);
    }
  };

  checkRange(ph, crop.phRange, 'Soil pH', 2);
  checkRange(temperature, crop.tempRange, 'Temperature', 2);
  checkRange(humidity, crop.humidityRange, 'Humidity', 1);
  checkRange(rainfall, crop.rainfallRange, 'Rainfall', 1);
  checkRange(nitrogen, crop.nitrogenRange, 'Nitrogen', 1);
  checkRange(phosphorus, crop.phosphorusRange, 'Phosphorus', 1);
  checkRange(potassium, crop.potassiumRange, 'Potassium', 1);

  const suitability = Math.round((score / maxScore) * 100);
  return {
    ...crop, suitability,
    suitabilityLabel: suitability >= 80 ? 'Highly Suitable' : suitability >= 60 ? 'Suitable' : suitability >= 40 ? 'Moderately Suitable' : 'Not Recommended',
    reasons: reasons.slice(0, 3),
  };
};

const getCropRecommendation = async (req, res) => {
  try {
    const { ph, temperature, humidity, rainfall, nitrogen, phosphorus, potassium } = req.body;
    if (!ph || !temperature) return res.status(400).json({ success: false, message: 'Please provide at least soil pH and temperature' });

    const conditions = { ph: parseFloat(ph), temperature: parseFloat(temperature), humidity: parseFloat(humidity) || 60, rainfall: parseFloat(rainfall) || 80, nitrogen: parseFloat(nitrogen) || 30, phosphorus: parseFloat(phosphorus) || 25, potassium: parseFloat(potassium) || 25 };
    const scoredCrops = CROPS.map((c) => calculateSuitability(c, conditions)).sort((a, b) => b.suitability - a.suitability);
    const topCrops = scoredCrops.slice(0, 5);

    store.addHistory({ userId: req.user ? req.user.id : null, type: 'crop', input: conditions, result: { topCrops: topCrops.map((c) => ({ name: c.name, suitability: c.suitability })) } });
    res.json({ success: true, data: { input: conditions, topRecommendations: topCrops, allCrops: scoredCrops } });
  } catch (err) {
    console.error('Crop error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getCropRecommendation };
