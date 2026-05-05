/**
 * Soil Recommendation Controller
 */

const store = require('../store/inMemoryStore');

const analyzeSoil = ({ moisture, ph, nitrogen, phosphorus, potassium, cropType }) => {
  const analysis = [], recommendations = [], fertilizers = [], warnings = [];
  let healthScore = 100;

  if (ph < 5.5) { warnings.push('🔴 Highly acidic soil (pH < 5.5)'); recommendations.push('Apply agricultural lime to raise pH'); healthScore -= 20; analysis.push({ parameter: 'pH', value: ph, status: 'critical', label: 'Highly Acidic' }); }
  else if (ph < 6.0) { warnings.push('🟡 Acidic soil (pH 5.5–6.0)'); recommendations.push('Apply dolomitic lime'); healthScore -= 10; analysis.push({ parameter: 'pH', value: ph, status: 'warning', label: 'Acidic' }); }
  else if (ph <= 7.0) { recommendations.push('✅ Soil pH is optimal (6.0–7.0)'); analysis.push({ parameter: 'pH', value: ph, status: 'good', label: 'Optimal' }); }
  else if (ph <= 7.5) { recommendations.push('Add sulfur to lower pH slightly'); healthScore -= 5; analysis.push({ parameter: 'pH', value: ph, status: 'warning', label: 'Slightly Alkaline' }); }
  else { warnings.push('🔴 Alkaline soil (pH > 7.5)'); recommendations.push('Apply elemental sulfur'); healthScore -= 15; analysis.push({ parameter: 'pH', value: ph, status: 'critical', label: 'Alkaline' }); }

  if (nitrogen < 20) { warnings.push('🟡 Low nitrogen — yellowing of leaves expected'); fertilizers.push('Apply urea (46-0-0) at 50 kg/acre'); healthScore -= 15; analysis.push({ parameter: 'Nitrogen (N)', value: nitrogen, status: 'low', label: 'Deficient' }); }
  else if (nitrogen <= 50) { analysis.push({ parameter: 'Nitrogen (N)', value: nitrogen, status: 'good', label: 'Adequate' }); }
  else { warnings.push('⚠️ Excess nitrogen'); recommendations.push('Reduce nitrogen fertilizer'); healthScore -= 5; analysis.push({ parameter: 'Nitrogen (N)', value: nitrogen, status: 'high', label: 'Excess' }); }

  if (phosphorus < 15) { warnings.push('🟡 Low phosphorus — poor root development'); fertilizers.push('Apply Single Super Phosphate (SSP) at 40 kg/acre'); healthScore -= 10; analysis.push({ parameter: 'Phosphorus (P)', value: phosphorus, status: 'low', label: 'Deficient' }); }
  else if (phosphorus <= 40) { analysis.push({ parameter: 'Phosphorus (P)', value: phosphorus, status: 'good', label: 'Adequate' }); }
  else { recommendations.push('Avoid additional phosphorus fertilization'); healthScore -= 3; analysis.push({ parameter: 'Phosphorus (P)', value: phosphorus, status: 'high', label: 'Excess' }); }

  if (potassium < 15) { warnings.push('🟡 Low potassium — weak stems, poor fruit quality'); fertilizers.push('Apply Muriate of Potash (MOP) at 30 kg/acre'); healthScore -= 10; analysis.push({ parameter: 'Potassium (K)', value: potassium, status: 'low', label: 'Deficient' }); }
  else if (potassium <= 40) { analysis.push({ parameter: 'Potassium (K)', value: potassium, status: 'good', label: 'Adequate' }); }
  else { healthScore -= 3; analysis.push({ parameter: 'Potassium (K)', value: potassium, status: 'high', label: 'Excess' }); }

  let irrigationNeeded = false;
  if (moisture < 20) { warnings.push('🔴 Critical moisture — immediate irrigation required'); recommendations.push('Irrigate immediately'); irrigationNeeded = true; healthScore -= 20; analysis.push({ parameter: 'Soil Moisture', value: `${moisture}%`, status: 'critical', label: 'Very Dry' }); }
  else if (moisture < 40) { recommendations.push('💧 Schedule irrigation within 24 hours'); irrigationNeeded = true; healthScore -= 10; analysis.push({ parameter: 'Soil Moisture', value: `${moisture}%`, status: 'warning', label: 'Dry' }); }
  else if (moisture <= 70) { recommendations.push('✅ Soil moisture is optimal'); analysis.push({ parameter: 'Soil Moisture', value: `${moisture}%`, status: 'good', label: 'Optimal' }); }
  else { warnings.push('⚠️ Waterlogged soil — risk of root rot'); recommendations.push('Improve drainage'); healthScore -= 15; analysis.push({ parameter: 'Soil Moisture', value: `${moisture}%`, status: 'high', label: 'Waterlogged' }); }

  healthScore = Math.max(0, Math.min(100, healthScore));
  const soilImprovementTips = [
    '🌱 Add organic compost to improve soil structure',
    '🪱 Encourage earthworm activity by reducing chemical inputs',
    '🌿 Practice crop rotation to naturally replenish nutrients',
    '🍂 Use cover crops (legumes) to fix atmospheric nitrogen',
  ];
  if (moisture < 40) soilImprovementTips.push('🪨 Add mulch layer to reduce evaporation');

  return {
    healthScore,
    healthLabel: healthScore >= 80 ? 'Excellent' : healthScore >= 60 ? 'Good' : healthScore >= 40 ? 'Fair' : 'Poor',
    analysis, recommendations, fertilizers, warnings, irrigationNeeded, soilImprovementTips,
  };
};

const getSoilRecommendation = async (req, res) => {
  try {
    const { moisture, ph, nitrogen, phosphorus, potassium, cropType } = req.body;
    if (moisture === undefined || ph === undefined || nitrogen === undefined || phosphorus === undefined || potassium === undefined)
      return res.status(400).json({ success: false, message: 'Please provide all soil parameters' });

    const soilData = { moisture: parseFloat(moisture), ph: parseFloat(ph), nitrogen: parseFloat(nitrogen), phosphorus: parseFloat(phosphorus), potassium: parseFloat(potassium), cropType: cropType || '' };
    const result = analyzeSoil(soilData);
    store.addHistory({ userId: req.user ? req.user.id : null, type: 'soil', input: soilData, result });
    res.json({ success: true, data: { input: soilData, ...result } });
  } catch (err) {
    console.error('Soil error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getSoilRecommendation };
