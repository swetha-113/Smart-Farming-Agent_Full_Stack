/**
 * Irrigation Recommendation Controller
 */

const store = require('../store/inMemoryStore');

const calculateIrrigation = ({ moisture, temperature, humidity, cropType, soilType }) => {
  let action, urgency, reason, waterAmount = '', nextIrrigationIn = '';
  const tips = [];

  if (moisture < 20) { action = 'IRRIGATE NOW'; urgency = 'critical'; reason = 'Soil moisture is critically low. Crops are at risk of wilting.'; waterAmount = '40-50mm'; nextIrrigationIn = '2-3 days'; tips.push('Apply water slowly to allow deep penetration'); }
  else if (moisture < 35 && temperature > 32) { action = 'IRRIGATE NOW'; urgency = 'high'; reason = 'Low soil moisture combined with high temperature creates severe drought stress.'; waterAmount = '30-40mm'; nextIrrigationIn = '2-3 days'; tips.push('Irrigate in early morning or evening to reduce evaporation'); }
  else if (moisture < 40) { action = 'IRRIGATE SOON'; urgency = 'medium'; reason = 'Soil moisture is below optimal range. Schedule irrigation within 24 hours.'; waterAmount = '25-35mm'; nextIrrigationIn = '3-4 days'; tips.push('Best time to irrigate: early morning (5-8 AM)'); }
  else if (moisture > 75) { action = 'REDUCE IRRIGATION'; urgency = 'low'; reason = 'Soil is waterlogged. Excess moisture can cause root rot.'; nextIrrigationIn = '5-7 days'; tips.push('Improve field drainage if waterlogging persists'); }
  else if (moisture > 60 && humidity > 75) { action = 'DELAY WATERING'; urgency = 'low'; reason = 'Soil moisture is adequate and high humidity reduces evapotranspiration.'; nextIrrigationIn = '3-5 days'; tips.push('High humidity increases fungal disease risk — monitor crops'); }
  else { action = 'MAINTAIN SCHEDULE'; urgency = 'normal'; reason = 'Soil moisture is in optimal range. Continue regular irrigation schedule.'; waterAmount = '20-25mm'; nextIrrigationIn = '3-4 days'; tips.push('Maintain consistent irrigation schedule for best crop performance'); }

  if (cropType) {
    const crop = cropType.toLowerCase();
    if (crop.includes('rice')) tips.push('Rice requires continuous flooding — maintain 5-10cm water level');
    else if (crop.includes('tomato') || crop.includes('pepper')) tips.push('Use drip irrigation for water efficiency');
  }
  if (soilType) {
    const soil = soilType.toLowerCase();
    if (soil.includes('sandy')) tips.push('Sandy soil drains quickly — irrigate more frequently with smaller amounts');
    else if (soil.includes('clay')) tips.push('Clay soil retains water — irrigate less frequently but deeply');
  }

  const getMethod = (c) => {
    if (!c) return 'Drip or sprinkler irrigation recommended';
    const crop = c.toLowerCase();
    if (crop.includes('rice')) return 'Flood irrigation';
    if (crop.includes('tomato') || crop.includes('pepper')) return 'Drip irrigation (most efficient)';
    if (crop.includes('wheat') || crop.includes('corn')) return 'Sprinkler or furrow irrigation';
    return 'Drip or sprinkler irrigation recommended';
  };

  return { action, urgency, reason, waterAmount: waterAmount || 'N/A', nextIrrigationIn, tips, irrigationMethod: getMethod(cropType), bestTimeToIrrigate: temperature > 30 ? 'Early morning (5-8 AM) or evening (6-8 PM)' : 'Morning (6-10 AM)' };
};

const getIrrigationAdvice = async (req, res) => {
  try {
    const { moisture, temperature, humidity, cropType, soilType } = req.body;
    if (moisture === undefined) return res.status(400).json({ success: false, message: 'Soil moisture is required' });

    const inputData = { moisture: parseFloat(moisture), temperature: parseFloat(temperature) || 25, humidity: parseFloat(humidity) || 50, cropType: cropType || '', soilType: soilType || '' };
    const result = calculateIrrigation(inputData);
    store.addHistory({ userId: req.user ? req.user.id : null, type: 'irrigation', input: inputData, result });
    res.json({ success: true, data: { input: inputData, ...result } });
  } catch (err) {
    console.error('Irrigation error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getIrrigationAdvice };
