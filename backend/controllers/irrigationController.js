/**
 * Irrigation Recommendation Controller
 * Combines soil moisture + weather data to recommend irrigation actions
 */

const store = require('../store/inMemoryStore');

/**
 * Determine irrigation recommendation based on soil + weather
 */
const calculateIrrigation = ({ moisture, temperature, humidity, rainExpected, cropType, soilType }) => {
  let action = '';
  let urgency = '';
  let reason = '';
  let waterAmount = '';
  let nextIrrigationIn = '';
  const tips = [];

  // ─── Decision Logic ───────────────────────────────────────────────────────

  if (rainExpected && moisture >= 40) {
    action = 'SKIP';
    urgency = 'low';
    reason = 'Rain is expected and soil moisture is adequate. Irrigating now would cause waterlogging.';
    nextIrrigationIn = 'After rain — reassess in 24-48 hours';
    tips.push('Monitor soil moisture after rainfall');
    tips.push('Ensure proper field drainage before rain');
  } else if (moisture < 20) {
    action = 'IRRIGATE NOW';
    urgency = 'critical';
    reason = 'Soil moisture is critically low. Crops are at risk of wilting and permanent damage.';
    waterAmount = '40-50mm';
    nextIrrigationIn = '2-3 days';
    tips.push('Apply water slowly to allow deep penetration');
    tips.push('Check for signs of wilting — irrigate immediately if observed');
  } else if (moisture < 35 && temperature > 32) {
    action = 'IRRIGATE NOW';
    urgency = 'high';
    reason = 'Low soil moisture combined with high temperature creates severe drought stress.';
    waterAmount = '30-40mm';
    nextIrrigationIn = '2-3 days';
    tips.push('Irrigate in early morning or evening to reduce evaporation');
    tips.push('Consider shade nets to reduce heat stress');
  } else if (moisture < 40) {
    action = 'IRRIGATE SOON';
    urgency = 'medium';
    reason = 'Soil moisture is below optimal range. Schedule irrigation within 24 hours.';
    waterAmount = '25-35mm';
    nextIrrigationIn = '3-4 days';
    tips.push('Best time to irrigate: early morning (5-8 AM)');
  } else if (moisture > 75) {
    action = 'REDUCE IRRIGATION';
    urgency = 'low';
    reason = 'Soil is waterlogged. Excess moisture can cause root rot and anaerobic conditions.';
    nextIrrigationIn = '5-7 days or until moisture drops below 60%';
    tips.push('Improve field drainage if waterlogging persists');
    tips.push('Avoid irrigation until soil moisture drops below 60%');
  } else if (moisture > 60 && humidity > 75) {
    action = 'DELAY WATERING';
    urgency = 'low';
    reason = 'Soil moisture is adequate and high humidity reduces evapotranspiration demand.';
    nextIrrigationIn = '3-5 days';
    tips.push('High humidity increases fungal disease risk — monitor crops closely');
  } else {
    action = 'MAINTAIN SCHEDULE';
    urgency = 'normal';
    reason = 'Soil moisture is in optimal range. Continue with your regular irrigation schedule.';
    waterAmount = '20-25mm';
    nextIrrigationIn = '3-4 days';
    tips.push('Maintain consistent irrigation schedule for best crop performance');
  }

  // Crop-specific adjustments
  if (cropType) {
    const crop = cropType.toLowerCase();
    if (crop.includes('rice') || crop.includes('paddy')) {
      tips.push('Rice requires continuous flooding — maintain 5-10cm water level');
    } else if (crop.includes('drip') || crop.includes('tomato') || crop.includes('pepper')) {
      tips.push('Use drip irrigation for water efficiency with this crop type');
    }
  }

  // Soil type adjustments
  if (soilType) {
    const soil = soilType.toLowerCase();
    if (soil.includes('sandy')) {
      tips.push('Sandy soil drains quickly — irrigate more frequently with smaller amounts');
    } else if (soil.includes('clay')) {
      tips.push('Clay soil retains water — irrigate less frequently but deeply');
    }
  }

  return {
    action,
    urgency,
    reason,
    waterAmount: waterAmount || 'N/A',
    nextIrrigationIn,
    tips,
    irrigationMethod: getIrrigationMethod(cropType),
    bestTimeToIrrigate: temperature > 30 ? 'Early morning (5-8 AM) or evening (6-8 PM)' : 'Morning (6-10 AM)',
  };
};

const getIrrigationMethod = (cropType) => {
  if (!cropType) return 'Drip or sprinkler irrigation recommended';
  const crop = cropType.toLowerCase();
  if (crop.includes('rice')) return 'Flood irrigation';
  if (crop.includes('tomato') || crop.includes('pepper') || crop.includes('cucumber')) return 'Drip irrigation (most efficient)';
  if (crop.includes('wheat') || crop.includes('corn') || crop.includes('maize')) return 'Sprinkler or furrow irrigation';
  return 'Drip or sprinkler irrigation recommended';
};

// @desc    Get irrigation recommendation
// @route   POST /api/irrigation-advice
const getIrrigationAdvice = async (req, res) => {
  try {
    const { moisture, temperature, humidity, rainExpected, cropType, soilType } = req.body;

    if (moisture === undefined) {
      return res.status(400).json({ success: false, message: 'Soil moisture is required' });
    }

    const inputData = {
      moisture: parseFloat(moisture),
      temperature: parseFloat(temperature) || 25,
      humidity: parseFloat(humidity) || 50,
      rainExpected: Boolean(rainExpected),
      cropType: cropType || '',
      soilType: soilType || '',
    };

    const result = calculateIrrigation(inputData);

    // Save to history
    store.addHistory({
      userId: req.user ? req.user.id : null,
      type: 'irrigation',
      input: inputData,
      result,
    });

    res.json({ success: true, data: { input: inputData, ...result } });
  } catch (error) {
    console.error('Irrigation advice error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getIrrigationAdvice };
