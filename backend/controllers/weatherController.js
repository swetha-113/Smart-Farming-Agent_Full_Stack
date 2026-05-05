/**
 * Weather Controller
 * Fully integrated with OpenWeatherMap API.
 * Fetches current weather + 5-day forecast.
 * Generates comprehensive farming advice for every weather condition.
 */

const axios = require('axios');
const store = require('../store/inMemoryStore');

const OWM_BASE    = 'https://api.openweathermap.org/data/2.5';
const OWM_ICON    = 'https://openweathermap.org/img/wn';

// ─── Comprehensive Farming Advice Engine ─────────────────────────────────────
const generateFarmingAdvice = ({ temp, feelsLike, humidity, description, rain,
                                  windSpeed, clouds, pressure, visibility, uvi = 0 }) => {
  const advice   = [];
  const warnings = [];
  const actions  = []; // immediate action items

  const desc = (description || '').toLowerCase();

  // ── Temperature ────────────────────────────────────────────────────────────
  if (temp >= 42) {
    warnings.push('🔴 Extreme heat (≥42°C) — severe crop stress risk. Halt all field work.');
    actions.push('Install shade nets immediately for vegetables and fruit crops');
    actions.push('Irrigate twice daily — early morning and late evening only');
    actions.push('Apply kaolin clay spray to reduce leaf temperature');
  } else if (temp >= 38) {
    warnings.push('🟠 Very high temperature (38–42°C) — heat stress likely on most crops');
    actions.push('Increase irrigation frequency — water in early morning (5–7 AM)');
    actions.push('Avoid any field work between 11 AM and 4 PM');
    advice.push('🌡️ Consider mulching to keep soil cool and retain moisture');
  } else if (temp >= 35) {
    warnings.push('🟡 High temperature (35–38°C) — monitor crops for wilting');
    advice.push('🌡️ Increase irrigation frequency to prevent heat stress');
    advice.push('☀️ Best time for field work: early morning or after 5 PM');
  } else if (temp >= 30) {
    advice.push('☀️ Warm weather (30–35°C) — maintain regular irrigation schedule');
    advice.push('🌱 Good conditions for warm-season crops (tomato, cotton, maize)');
  } else if (temp >= 22) {
    advice.push('🌤️ Ideal temperature range (22–30°C) — optimal for most crops');
    advice.push('🌱 Excellent conditions for planting, transplanting, and field work');
  } else if (temp >= 15) {
    advice.push('🌿 Mild temperature (15–22°C) — good for cool-season crops');
    advice.push('🥬 Ideal for wheat, potato, leafy vegetables, and legumes');
  } else if (temp >= 8) {
    advice.push('🌨️ Cool weather (8–15°C) — reduce irrigation frequency');
    advice.push('🥬 Suitable for cool-season crops; protect seedlings at night');
  } else if (temp >= 2) {
    warnings.push('🔵 Near-freezing temperatures — frost risk for sensitive crops');
    actions.push('Cover sensitive plants with frost cloth or plastic sheets tonight');
    actions.push('Avoid irrigation — wet soil increases frost damage');
  } else {
    warnings.push('🔴 Freezing temperature (below 0°C) — severe frost damage expected');
    actions.push('Move potted plants indoors immediately');
    actions.push('Apply anti-frost spray on fruit trees and vegetables');
    actions.push('Do NOT irrigate — water on leaves will freeze and cause damage');
  }

  // ── Humidity ───────────────────────────────────────────────────────────────
  if (humidity >= 90) {
    warnings.push('🔴 Very high humidity (≥90%) — critical fungal disease risk');
    actions.push('Apply preventive fungicide (mancozeb or copper-based) immediately');
    actions.push('Improve field drainage and air circulation between plants');
    advice.push('🍄 Inspect crops daily for early signs of blight, mildew, and rust');
  } else if (humidity >= 80) {
    warnings.push('🟠 High humidity (80–90%) — high risk of fungal diseases (blight, mildew, rust)');
    advice.push('🍄 Apply preventive fungicide spray to protect crops');
    advice.push('💨 Improve air circulation — avoid dense planting');
    advice.push('🚿 Avoid overhead irrigation; switch to drip irrigation');
  } else if (humidity >= 70) {
    advice.push('💧 Moderate-high humidity (70–80%) — monitor for early fungal signs');
    advice.push('🔍 Check undersides of leaves for mildew or rust spots');
  } else if (humidity >= 50) {
    advice.push('✅ Comfortable humidity (50–70%) — good conditions for most crops');
  } else if (humidity >= 30) {
    advice.push('🏜️ Low humidity (30–50%) — increase irrigation to prevent moisture stress');
    advice.push('🪨 Apply mulch to reduce soil evaporation');
  } else {
    warnings.push('🟠 Very low humidity (<30%) — severe drought stress risk');
    actions.push('Irrigate immediately and apply thick mulch layer');
    actions.push('Consider misting for nursery seedlings and transplants');
  }

  // ── Rain / Precipitation ───────────────────────────────────────────────────
  if (rain >= 50) {
    warnings.push('🔴 Heavy rainfall (≥50mm) — waterlogging and root rot risk');
    actions.push('Ensure all field drainage channels are clear and functional');
    actions.push('Postpone all fertilizer and pesticide applications');
    actions.push('Check for soil erosion on slopes and terraced fields');
  } else if (rain >= 20) {
    warnings.push('🟠 Moderate-heavy rain (20–50mm) — avoid field operations');
    advice.push('🌧️ Skip irrigation completely — soil will be adequately moist');
    advice.push('🚜 Avoid heavy machinery in fields to prevent soil compaction');
  } else if (rain >= 5) {
    advice.push('🌦️ Light to moderate rain (5–20mm) — skip irrigation today');
    advice.push('🌱 Good natural watering — monitor soil moisture after rain');
  } else if (rain > 0) {
    advice.push('🌂 Light drizzle — may not be sufficient; check soil moisture depth');
    advice.push('💧 Supplement with irrigation if topsoil dries within 24 hours');
  } else {
    advice.push('☀️ No rainfall — proceed with scheduled irrigation as planned');
  }

  // ── Wind ───────────────────────────────────────────────────────────────────
  if (windSpeed >= 50) {
    warnings.push('🔴 Storm-force winds (≥50 km/h) — severe crop damage risk');
    actions.push('Stake and support all tall crops (maize, sunflower, sugarcane)');
    actions.push('Secure all greenhouse covers, nets, and irrigation equipment');
    actions.push('Do NOT spray any chemicals — complete drift risk');
  } else if (windSpeed >= 30) {
    warnings.push('🟠 Strong winds (30–50 km/h) — avoid all spraying operations');
    advice.push('🌬️ Support young plants and stake tall crops against wind damage');
    advice.push('🚫 Postpone pesticide and fertilizer spraying until winds calm');
  } else if (windSpeed >= 20) {
    advice.push('💨 Moderate winds (20–30 km/h) — spray only in early morning');
    advice.push('🌿 Good for drying wet foliage and reducing fungal risk');
  } else if (windSpeed >= 10) {
    advice.push('🍃 Light breeze (10–20 km/h) — good conditions for spraying');
  } else {
    advice.push('🌫️ Calm conditions — ideal for precision pesticide application');
  }

  // ── Sky Conditions ─────────────────────────────────────────────────────────
  if (desc.includes('thunderstorm') || desc.includes('thunder')) {
    warnings.push('⛈️ Thunderstorm — halt all field work immediately');
    actions.push('Move workers and equipment to shelter');
    actions.push('Disconnect electrical irrigation pumps');
  } else if (desc.includes('tornado') || desc.includes('squall')) {
    warnings.push('🌪️ Severe weather alert — seek shelter immediately');
  } else if (desc.includes('heavy rain') || desc.includes('heavy intensity')) {
    warnings.push('🌧️ Heavy rain in progress — avoid field operations');
  } else if (desc.includes('drizzle') || desc.includes('light rain')) {
    advice.push('🌦️ Light rain — good for recently transplanted seedlings');
  } else if (desc.includes('snow') || desc.includes('sleet') || desc.includes('blizzard')) {
    warnings.push('❄️ Snow/sleet — protect crops with covers; avoid irrigation');
    actions.push('Remove snow accumulation from greenhouse roofs');
  } else if (desc.includes('fog') || desc.includes('mist') || desc.includes('haze')) {
    advice.push('🌫️ Foggy conditions — high moisture on leaves, fungal risk elevated');
    advice.push('🔍 Inspect crops for early blight and mildew after fog clears');
  } else if (desc.includes('smoke') || desc.includes('dust') || desc.includes('sand')) {
    warnings.push('🌫️ Poor air quality — dust/smoke may clog stomata on leaves');
    advice.push('💦 Wash crop foliage with clean water after dust settles');
  } else if (desc.includes('clear') || desc.includes('sunny')) {
    advice.push('🌞 Clear skies — excellent for harvesting, drying, and field work');
    advice.push('📸 Good visibility for crop scouting and disease inspection');
  } else if (desc.includes('overcast') || desc.includes('broken clouds')) {
    advice.push('⛅ Overcast — reduced evaporation; good for transplanting seedlings');
    advice.push('🌱 Ideal conditions for applying foliar fertilizers');
  } else if (desc.includes('scattered clouds') || desc.includes('few clouds')) {
    advice.push('🌤️ Partly cloudy — good all-round farming conditions');
  }

  // ── Pressure ───────────────────────────────────────────────────────────────
  if (pressure < 990) {
    warnings.push('📉 Low atmospheric pressure — storm or heavy rain likely approaching');
    advice.push('🌧️ Prepare for incoming rain; check field drainage in advance');
  } else if (pressure > 1025) {
    advice.push('📈 High pressure system — stable, dry weather expected for next 24–48 hours');
  }

  // ── Visibility ─────────────────────────────────────────────────────────────
  if (visibility < 1) {
    warnings.push('🌫️ Very poor visibility (<1 km) — avoid operating machinery');
  }

  // ── Combined conditions ────────────────────────────────────────────────────
  if (temp > 30 && humidity > 75) {
    warnings.push('🌡️💧 Hot + humid combination — peak fungal and bacterial disease risk');
    advice.push('🍄 Apply broad-spectrum fungicide as preventive measure');
  }
  if (temp < 15 && humidity > 80) {
    warnings.push('❄️💧 Cool + humid — ideal conditions for late blight and downy mildew');
    advice.push('🔍 Inspect potato, tomato, and grape crops for blight symptoms');
  }
  if (rain > 0 && windSpeed > 20) {
    advice.push('🌧️💨 Rainy + windy — bacterial diseases spread rapidly; inspect after storm');
  }

  return { advice, warnings, actions };
};

// ─── 5-Day Forecast Processor ─────────────────────────────────────────────────
const processForecast = (forecastList) => {
  // Group by date, take midday reading for each day
  const days = {};
  forecastList.forEach((item) => {
    const date = item.dt_txt.split(' ')[0];
    const hour = parseInt(item.dt_txt.split(' ')[1]);
    if (!days[date] || Math.abs(hour - 12) < Math.abs(parseInt(days[date].dt_txt.split(' ')[1]) - 12)) {
      days[date] = item;
    }
  });

  return Object.values(days).slice(0, 5).map((item) => ({
    date:        item.dt_txt.split(' ')[0],
    day:         new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
    tempMax:     Math.round(item.main.temp_max),
    tempMin:     Math.round(item.main.temp_min),
    temp:        Math.round(item.main.temp),
    humidity:    item.main.humidity,
    description: item.weather[0].description,
    icon:        item.weather[0].icon,
    rain:        item.rain ? (item.rain['3h'] || 0) : 0,
    windSpeed:   Math.round(item.wind.speed * 3.6), // m/s → km/h
    clouds:      item.clouds.all,
  }));
};

// ─── Main Handler ─────────────────────────────────────────────────────────────
const getWeather = async (req, res) => {
  try {
    const { city, lat, lon } = req.query;

    if (!city && (!lat || !lon)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a city name or coordinates',
      });
    }

    const apiKey = process.env.OPENWEATHER_API_KEY;

    // ── No API key → rich mock data ──────────────────────────────────────────
    if (!apiKey || apiKey === 'your_openweathermap_api_key_here') {
      console.warn('⚠️  No valid OPENWEATHER_API_KEY found — returning mock data');
      const mockData = buildMockData(city || 'Demo City');
      return res.json({ success: true, data: mockData, isMock: true });
    }

    console.log(`🌤️  Fetching live weather for: ${city || `${lat},${lon}`} | key: ${apiKey.slice(0,8)}...`);

    // ── Build query param ────────────────────────────────────────────────────
    const locationParam = city
      ? `q=${encodeURIComponent(city)}`
      : `lat=${lat}&lon=${lon}`;

    // ── Fetch current weather + 5-day forecast in parallel ───────────────────
    const [currentRes, forecastRes] = await Promise.all([
      axios.get(`${OWM_BASE}/weather?${locationParam}&appid=${apiKey}&units=metric`),
      axios.get(`${OWM_BASE}/forecast?${locationParam}&appid=${apiKey}&units=metric`),
    ]);

    const w = currentRes.data;
    const f = forecastRes.data;

    // ── Build current weather object ─────────────────────────────────────────
    const windKmh = Math.round((w.wind?.speed || 0) * 3.6); // m/s → km/h

    const current = {
      city:        w.name,
      country:     w.sys.country,
      temperature: Math.round(w.main.temp),
      feelsLike:   Math.round(w.main.feels_like),
      tempMin:     Math.round(w.main.temp_min),
      tempMax:     Math.round(w.main.temp_max),
      humidity:    w.main.humidity,
      pressure:    w.main.pressure,
      description: w.weather[0].description,
      icon:        w.weather[0].icon,
      iconUrl:     `${OWM_ICON}/${w.weather[0].icon}@2x.png`,
      windSpeed:   windKmh,
      windDeg:     w.wind?.deg || 0,
      windGust:    w.wind?.gust ? Math.round(w.wind.gust * 3.6) : null,
      visibility:  w.visibility ? Math.round(w.visibility / 100) / 10 : 10, // km
      rain:        w.rain ? (w.rain['1h'] || w.rain['3h'] || 0) : 0,
      snow:        w.snow ? (w.snow['1h'] || w.snow['3h'] || 0) : 0,
      clouds:      w.clouds?.all || 0,
      sunrise:     new Date(w.sys.sunrise * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      sunset:      new Date(w.sys.sunset  * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      timezone:    w.timezone,
      fetchedAt:   new Date(),
    };

    // ── Generate farming advice ───────────────────────────────────────────────
    const { advice, warnings, actions } = generateFarmingAdvice({
      temp:        current.temperature,
      feelsLike:   current.feelsLike,
      humidity:    current.humidity,
      description: current.description,
      rain:        current.rain,
      windSpeed:   current.windSpeed,
      clouds:      current.clouds,
      pressure:    current.pressure,
      visibility:  current.visibility,
    });

    // ── Process 5-day forecast ────────────────────────────────────────────────
    const forecast = processForecast(f.list);

    const result = { ...current, farmingAdvice: advice, warnings, actions, forecast };

    // ── Save to history ───────────────────────────────────────────────────────
    store.addHistory({
      userId: req.user ? req.user.id : null,
      type:   'weather',
      input:  { city: current.city },
      result: {
        city:        current.city,
        temperature: current.temperature,
        description: current.description,
        humidity:    current.humidity,
      },
    });

    res.json({ success: true, data: result });

  } catch (error) {
    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        message: 'City not found. Please check the spelling and try again.',
      });
    }
    if (error.response?.status === 401) {
      return res.status(401).json({
        success: false,
        message: 'Invalid API key. Please check your OPENWEATHER_API_KEY in .env',
      });
    }
    console.error('Weather error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch weather data. Please try again.' });
  }
};

// ─── Rich Mock Data (when no API key) ────────────────────────────────────────
const buildMockData = (city) => {
  const current = {
    city,
    country:     'IN',
    temperature: 32,
    feelsLike:   36,
    tempMin:     28,
    tempMax:     35,
    humidity:    74,
    pressure:    1008,
    description: 'partly cloudy',
    icon:        '02d',
    iconUrl:     `${OWM_ICON}/02d@2x.png`,
    windSpeed:   18,
    windDeg:     220,
    windGust:    28,
    visibility:  8.5,
    rain:        0,
    snow:        0,
    clouds:      45,
    sunrise:     '06:12 AM',
    sunset:      '06:48 PM',
    fetchedAt:   new Date(),
  };

  const { advice, warnings, actions } = generateFarmingAdvice({
    temp:        current.temperature,
    feelsLike:   current.feelsLike,
    humidity:    current.humidity,
    description: current.description,
    rain:        current.rain,
    windSpeed:   current.windSpeed,
    clouds:      current.clouds,
    pressure:    current.pressure,
    visibility:  current.visibility,
  });

  const forecast = [
    { date: 'Today+1', day: 'Mon', tempMax: 34, tempMin: 27, temp: 31, humidity: 70, description: 'sunny',         icon: '01d', rain: 0,  windSpeed: 14, clouds: 10 },
    { date: 'Today+2', day: 'Tue', tempMax: 30, tempMin: 25, temp: 28, humidity: 82, description: 'light rain',    icon: '10d', rain: 8,  windSpeed: 22, clouds: 75 },
    { date: 'Today+3', day: 'Wed', tempMax: 27, tempMin: 23, temp: 25, humidity: 88, description: 'moderate rain', icon: '10d', rain: 22, windSpeed: 28, clouds: 90 },
    { date: 'Today+4', day: 'Thu', tempMax: 29, tempMin: 24, temp: 27, humidity: 76, description: 'overcast',      icon: '04d', rain: 2,  windSpeed: 16, clouds: 80 },
    { date: 'Today+5', day: 'Fri', tempMax: 33, tempMin: 26, temp: 30, humidity: 65, description: 'clear sky',     icon: '01d', rain: 0,  windSpeed: 12, clouds: 5  },
  ];

  return { ...current, farmingAdvice: advice, warnings, actions, forecast };
};

module.exports = { getWeather };
