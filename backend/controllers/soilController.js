/**
 * Soil Recommendation Controller
 * Analyzes soil data and provides recommendations
 * Rule-based expert system for soil health analysis
 */

const store = require('../store/inMemoryStore');

/**
 * Analyze soil and generate recommendations
 * @param {object} soilData - Soil input values
 * @returns {object} Analysis and recommendations
 */
const analyzeSoil = (soilData) => {
  const { moisture, ph, nitrogen, phosphorus, potassium, cropType } = soilData;

  const analysis = [];
  const recommendations = [];
  const fertilizers = [];
  const warnings = [];
  let healthScore = 100;

  // ─── pH Analysis ──────────────────────────────────────────────────────────
  if (ph < 5.5) {
    warnings.push('🔴 Highly acidic soil (pH < 5.5) — most nutrients become unavailable');
    recommendations.push('Apply agricultural lime (calcium carbonate) to raise pH');
    recommendations.push('Add wood ash as organic pH amendment');
    healthScore -= 20;
    analysis.push({ parameter: 'pH', value: ph, status: 'critical', label: 'Highly Acidic' });
  } else if (ph < 6.0) {
    warnings.push('🟡 Acidic soil (pH 5.5–6.0) — slightly below optimal range');
    recommendations.push('Apply dolomitic lime to gradually raise pH');
    healthScore -= 10;
    analysis.push({ parameter: 'pH', value: ph, status: 'warning', label: 'Acidic' });
  } else if (ph <= 7.0) {
    analysis.push({ parameter: 'pH', value: ph, status: 'good', label: 'Optimal' });
    recommendations.push('✅ Soil pH is in optimal range (6.0–7.0) — good for most crops');
  } else if (ph <= 7.5) {
    analysis.push({ parameter: 'pH', value: ph, status: 'warning', label: 'Slightly Alkaline' });
    recommendations.push('Add sulfur or acidic organic matter (peat moss) to lower pH slightly');
    healthScore -= 5;
  } else {
    warnings.push('🔴 Alkaline soil (pH > 7.5) — iron, manganese, zinc deficiency likely');
    recommendations.push('Apply elemental sulfur to lower pH');
    recommendations.push('Use acidifying fertilizers like ammonium sulfate');
    healthScore -= 15;
    analysis.push({ parameter: 'pH', value: ph, status: 'critical', label: 'Alkaline' });
  }

  // ─── Nitrogen Analysis ────────────────────────────────────────────────────
  if (nitrogen < 20) {
    warnings.push('🟡 Low nitrogen — yellowing of leaves (chlorosis) expected');
    fertilizers.push('Apply urea (46-0-0) at 50 kg/acre');
    fertilizers.push('Use ammonium nitrate or DAP as nitrogen source');
    recommendations.push('Apply nitrogen-rich organic matter (compost, manure)');
    healthScore -= 15;
    analysis.push({ parameter: 'Nitrogen (N)', value: nitrogen, status: 'low', label: 'Deficient' });
  } else if (nitrogen <= 50) {
    analysis.push({ parameter: 'Nitrogen (N)', value: nitrogen, status: 'good', label: 'Adequate' });
  } else {
    warnings.push('⚠️ Excess nitrogen — may cause excessive vegetative growth, reduce fruiting');
    recommendations.push('Reduce nitrogen fertilizer application');
    healthScore -= 5;
    analysis.push({ parameter: 'Nitrogen (N)', value: nitrogen, status: 'high', label: 'Excess' });
  }

  // ─── Phosphorus Analysis ──────────────────────────────────────────────────
  if (phosphorus < 15) {
    warnings.push('🟡 Low phosphorus — poor root development and delayed maturity');
    fertilizers.push('Apply Single Super Phosphate (SSP) at 40 kg/acre');
    fertilizers.push('Use DAP (18-46-0) as phosphorus source');
    healthScore -= 10;
    analysis.push({ parameter: 'Phosphorus (P)', value: phosphorus, status: 'low', label: 'Deficient' });
  } else if (phosphorus <= 40) {
    analysis.push({ parameter: 'Phosphorus (P)', value: phosphorus, status: 'good', label: 'Adequate' });
  } else {
    analysis.push({ parameter: 'Phosphorus (P)', value: phosphorus, status: 'high', label: 'Excess' });
    recommendations.push('Avoid additional phosphorus fertilization');
    healthScore -= 3;
  }

  // ─── Potassium Analysis ───────────────────────────────────────────────────
  if (potassium < 15) {
    warnings.push('🟡 Low potassium — weak stems, poor fruit quality, disease susceptibility');
    fertilizers.push('Apply Muriate of Potash (MOP) at 30 kg/acre');
    fertilizers.push('Use Sulfate of Potash (SOP) for chloride-sensitive crops');
    healthScore -= 10;
    analysis.push({ parameter: 'Potassium (K)', value: potassium, status: 'low', label: 'Deficient' });
  } else if (potassium <= 40) {
    analysis.push({ parameter: 'Potassium (K)', value: potassium, status: 'good', label: 'Adequate' });
  } else {
    analysis.push({ parameter: 'Potassium (K)', value: potassium, status: 'high', label: 'Excess' });
    healthScore -= 3;
  }

  // ─── Moisture Analysis ────────────────────────────────────────────────────
  let irrigationNeeded = false;
  if (moisture < 20) {
    warnings.push('🔴 Critical moisture level — immediate irrigation required');
    recommendations.push('Irrigate immediately — apply 30-40mm of water');
    irrigationNeeded = true;
    healthScore -= 20;
    analysis.push({ parameter: 'Soil Moisture', value: `${moisture}%`, status: 'critical', label: 'Very Dry' });
  } else if (moisture < 40) {
    recommendations.push('💧 Soil moisture is low — schedule irrigation within 24 hours');
    irrigationNeeded = true;
    healthScore -= 10;
    analysis.push({ parameter: 'Soil Moisture', value: `${moisture}%`, status: 'warning', label: 'Dry' });
  } else if (moisture <= 70) {
    recommendations.push('✅ Soil moisture is optimal — no immediate irrigation needed');
    analysis.push({ parameter: 'Soil Moisture', value: `${moisture}%`, status: 'good', label: 'Optimal' });
  } else {
    warnings.push('⚠️ Waterlogged soil — risk of root rot and anaerobic conditions');
    recommendations.push('Improve drainage — avoid irrigation until moisture drops below 60%');
    healthScore -= 15;
    analysis.push({ parameter: 'Soil Moisture', value: `${moisture}%`, status: 'high', label: 'Waterlogged' });
  }

  // ─── Crop-specific advice ─────────────────────────────────────────────────
  const cropAdvice = getCropSpecificAdvice(cropType, { ph, nitrogen, phosphorus, potassium, moisture });

  // Clamp health score
  healthScore = Math.max(0, Math.min(100, healthScore));

  return {
    healthScore,
    healthLabel: healthScore >= 80 ? 'Excellent' : healthScore >= 60 ? 'Good' : healthScore >= 40 ? 'Fair' : 'Poor',
    analysis,
    recommendations,
    fertilizers,
    warnings,
    irrigationNeeded,
    cropAdvice,
    soilImprovementTips: getSoilImprovementTips(ph, nitrogen, phosphorus, potassium, moisture),
  };
};

const getCropSpecificAdvice = (cropType, soil) => {
  if (!cropType) return [];
  const crop = cropType.toLowerCase();
  const advice = [];

  if (crop.includes('rice') || crop.includes('paddy')) {
    if (soil.moisture < 60) advice.push('Rice requires high moisture — maintain flooded conditions during growing season');
    if (soil.ph < 5.5 || soil.ph > 7.0) advice.push('Rice prefers pH 5.5–7.0 — adjust accordingly');
  } else if (crop.includes('wheat')) {
    if (soil.ph < 6.0 || soil.ph > 7.5) advice.push('Wheat grows best at pH 6.0–7.5');
    if (soil.nitrogen < 30) advice.push('Wheat is nitrogen-hungry — ensure adequate N supply');
  } else if (crop.includes('tomato')) {
    if (soil.ph < 6.0 || soil.ph > 6.8) advice.push('Tomatoes prefer slightly acidic soil (pH 6.0–6.8)');
    if (soil.potassium < 20) advice.push('Tomatoes need high potassium for fruit quality');
  } else if (crop.includes('corn') || crop.includes('maize')) {
    if (soil.nitrogen < 40) advice.push('Corn is a heavy nitrogen feeder — apply split doses of nitrogen');
  }

  return advice;
};

const getSoilImprovementTips = (ph, n, p, k, moisture) => {
  const tips = [
    '🌱 Add organic compost to improve soil structure and water retention',
    '🪱 Encourage earthworm activity by reducing chemical inputs',
    '🌿 Practice crop rotation to naturally replenish nutrients',
    '🍂 Use cover crops (legumes) to fix atmospheric nitrogen',
  ];

  if (moisture < 40) tips.push('🪨 Add mulch layer (5-10cm) to reduce evaporation and retain moisture');
  if (ph < 6) tips.push('🧪 Test soil pH every season and adjust with lime as needed');

  return tips;
};

// @desc    Analyze soil and get recommendations
// @route   POST /api/soil-recommendation
const getSoilRecommendation = async (req, res) => {
  try {
    const { moisture, ph, nitrogen, phosphorus, potassium, cropType } = req.body;

    // Validate inputs
    if (moisture === undefined || ph === undefined || nitrogen === undefined ||
        phosphorus === undefined || potassium === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all soil parameters: moisture, ph, nitrogen, phosphorus, potassium',
      });
    }

    const soilData = {
      moisture: parseFloat(moisture),
      ph: parseFloat(ph),
      nitrogen: parseFloat(nitrogen),
      phosphorus: parseFloat(phosphorus),
      potassium: parseFloat(potassium),
      cropType: cropType || '',
    };

    const result = analyzeSoil(soilData);

    // Save to history
    store.addHistory({
      userId: req.user ? req.user.id : null,
      type: 'soil',
      input: soilData,
      result,
    });

    res.json({ success: true, data: { input: soilData, ...result } });
  } catch (error) {
    console.error('Soil recommendation error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getSoilRecommendation };
