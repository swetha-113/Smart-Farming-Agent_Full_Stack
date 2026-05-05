/**
 * Weather Controller — OpenWeatherMap API integration
 */

const axios = require('axios');
const store = require('../store/inMemoryStore');

const OWM_BASE = 'https://api.openweathermap.org/data/2.5';
const OWM_ICON = 'https://openweathermap.org/img/wn';

const generateFarmingAdvice = ({ temp, humidity, description, rain, windSpeed, pressure }) => {
  const advice = [], warnings = [], actions = [];
  const desc = (description || '').toLowerCase();

  if (temp >= 42) { warnings.push('🔴 Extreme heat (≥42°C) — severe crop stress risk'); actions.push('Install shade nets immediately'); actions.push('Irrigate twice daily — early morning and late evening only'); }
  else if (temp >= 38) { warnings.push('🟠 Very high temperature (38–42°C) — heat stress likely'); actions.push('Increase irrigation frequency'); advice.push('🌡️ Avoid field work between 11 AM and 4 PM'); }
  else if (temp >= 35) { warnings.push('🟡 High temperature (35–38°C) — monitor crops for wilting'); advice.push('🌡️ Increase irrigation frequency'); }
  else if (temp >= 30) { advice.push('☀️ Warm weather — maintain regular irrigation schedule'); }
  else if (temp >= 22) { advice.push('🌤️ Ideal temperature range — optimal for most crops'); }
  else if (temp >= 15) { advice.push('🌿 Mild temperature — good for cool-season crops'); }
  else if (temp >= 2)  { warnings.push('🔵 Near-freezing — frost risk for sensitive crops'); actions.push('Cover sensitive plants with frost cloth tonight'); }
  else { warnings.push('🔴 Freezing temperature — severe frost damage expected'); actions.push('Move potted plants indoors immediately'); }

  if (humidity >= 90) { warnings.push('🔴 Very high humidity (≥90%) — critical fungal disease risk'); actions.push('Apply preventive fungicide immediately'); }
  else if (humidity >= 80) { warnings.push('🟠 High humidity — high risk of fungal diseases (blight, mildew, rust)'); advice.push('🍄 Apply preventive fungicide spray'); }
  else if (humidity >= 70) { advice.push('💧 Moderate-high humidity — monitor for early fungal signs'); }
  else if (humidity >= 50) { advice.push('✅ Comfortable humidity — good conditions for most crops'); }
  else if (humidity < 30)  { warnings.push('🟠 Very low humidity — severe drought stress risk'); actions.push('Irrigate immediately and apply thick mulch layer'); }

  if (rain >= 50) { warnings.push('🔴 Heavy rainfall — waterlogging and root rot risk'); actions.push('Ensure all field drainage channels are clear'); }
  else if (rain >= 20) { warnings.push('🟠 Moderate-heavy rain — avoid field operations'); advice.push('🌧️ Skip irrigation completely'); }
  else if (rain >= 5)  { advice.push('🌦️ Light to moderate rain — skip irrigation today'); }
  else if (rain > 0)   { advice.push('🌂 Light drizzle — check soil moisture depth'); }
  else                 { advice.push('☀️ No rainfall — proceed with scheduled irrigation'); }

  if (windSpeed >= 50) { warnings.push('🔴 Storm-force winds — severe crop damage risk'); actions.push('Stake and support all tall crops'); }
  else if (windSpeed >= 30) { warnings.push('🟠 Strong winds — avoid all spraying operations'); }
  else if (windSpeed >= 20) { advice.push('💨 Moderate winds — spray only in early morning'); }

  if (desc.includes('thunderstorm')) { warnings.push('⛈️ Thunderstorm — halt all field work immediately'); }
  else if (desc.includes('snow') || desc.includes('sleet')) { warnings.push('❄️ Snow/sleet — protect crops with covers'); }
  else if (desc.includes('fog') || desc.includes('mist'))   { advice.push('🌫️ Foggy conditions — fungal risk elevated'); }
  else if (desc.includes('clear') || desc.includes('sunny')){ advice.push('🌞 Clear skies — excellent for harvesting and field work'); }
  else if (desc.includes('overcast')) { advice.push('⛅ Overcast — good for transplanting seedlings'); }

  if (pressure < 990) { warnings.push('📉 Low atmospheric pressure — storm likely approaching'); }

  return { advice, warnings, actions };
};

const processForecast = (forecastList) => {
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
    windSpeed:   Math.round((item.wind.speed || 0) * 3.6),
    clouds:      item.clouds.all,
  }));
};

const buildMockData = (city) => {
  const current = {
    city, country: 'IN', temperature: 32, feelsLike: 36, tempMin: 28, tempMax: 35,
    humidity: 74, pressure: 1008, description: 'partly cloudy', icon: '02d',
    iconUrl: `${OWM_ICON}/02d@2x.png`, windSpeed: 18, windDeg: 220, windGust: 28,
    visibility: 8.5, rain: 0, snow: 0, clouds: 45,
    sunrise: '06:12 AM', sunset: '06:48 PM', fetchedAt: new Date(),
  };
  const { advice, warnings, actions } = generateFarmingAdvice({ temp: current.temperature, humidity: current.humidity, description: current.description, rain: current.rain, windSpeed: current.windSpeed, pressure: current.pressure });
  const forecast = [
    { date: 'Day1', day: 'Mon', tempMax: 34, tempMin: 27, temp: 31, humidity: 70, description: 'sunny',         icon: '01d', rain: 0,  windSpeed: 14, clouds: 10 },
    { date: 'Day2', day: 'Tue', tempMax: 30, tempMin: 25, temp: 28, humidity: 82, description: 'light rain',    icon: '10d', rain: 8,  windSpeed: 22, clouds: 75 },
    { date: 'Day3', day: 'Wed', tempMax: 27, tempMin: 23, temp: 25, humidity: 88, description: 'moderate rain', icon: '10d', rain: 22, windSpeed: 28, clouds: 90 },
    { date: 'Day4', day: 'Thu', tempMax: 29, tempMin: 24, temp: 27, humidity: 76, description: 'overcast',      icon: '04d', rain: 2,  windSpeed: 16, clouds: 80 },
    { date: 'Day5', day: 'Fri', tempMax: 33, tempMin: 26, temp: 30, humidity: 65, description: 'clear sky',     icon: '01d', rain: 0,  windSpeed: 12, clouds: 5  },
  ];
  return { ...current, farmingAdvice: advice, warnings, actions, forecast };
};

const getWeather = async (req, res) => {
  try {
    const { city, lat, lon } = req.query;
    if (!city && (!lat || !lon))
      return res.status(400).json({ success: false, message: 'Please provide a city name' });

    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey || apiKey === 'your_openweathermap_api_key_here') {
      return res.json({ success: true, data: buildMockData(city || 'Demo City'), isMock: true });
    }

    const locationParam = city ? `q=${encodeURIComponent(city)}` : `lat=${lat}&lon=${lon}`;
    const [currentRes, forecastRes] = await Promise.all([
      axios.get(`${OWM_BASE}/weather?${locationParam}&appid=${apiKey}&units=metric`),
      axios.get(`${OWM_BASE}/forecast?${locationParam}&appid=${apiKey}&units=metric`),
    ]);

    const w = currentRes.data;
    const windKmh = Math.round((w.wind?.speed || 0) * 3.6);
    const current = {
      city: w.name, country: w.sys.country,
      temperature: Math.round(w.main.temp), feelsLike: Math.round(w.main.feels_like),
      tempMin: Math.round(w.main.temp_min), tempMax: Math.round(w.main.temp_max),
      humidity: w.main.humidity, pressure: w.main.pressure,
      description: w.weather[0].description, icon: w.weather[0].icon,
      iconUrl: `${OWM_ICON}/${w.weather[0].icon}@2x.png`,
      windSpeed: windKmh, windDeg: w.wind?.deg || 0,
      windGust: w.wind?.gust ? Math.round(w.wind.gust * 3.6) : null,
      visibility: w.visibility ? Math.round(w.visibility / 100) / 10 : 10,
      rain: w.rain ? (w.rain['1h'] || w.rain['3h'] || 0) : 0,
      snow: w.snow ? (w.snow['1h'] || w.snow['3h'] || 0) : 0,
      clouds: w.clouds?.all || 0,
      sunrise: new Date(w.sys.sunrise * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      sunset:  new Date(w.sys.sunset  * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      fetchedAt: new Date(),
    };

    const { advice, warnings, actions } = generateFarmingAdvice({ temp: current.temperature, humidity: current.humidity, description: current.description, rain: current.rain, windSpeed: current.windSpeed, pressure: current.pressure });
    const forecast = processForecast(forecastRes.data.list);
    const result = { ...current, farmingAdvice: advice, warnings, actions, forecast };

    store.addHistory({ userId: req.user ? req.user.id : null, type: 'weather', input: { city: current.city }, result: { city: current.city, temperature: current.temperature, description: current.description } });
    res.json({ success: true, data: result });
  } catch (err) {
    if (err.response?.status === 404) return res.status(404).json({ success: false, message: 'City not found. Please check the spelling.' });
    if (err.response?.status === 401) return res.status(401).json({ success: false, message: 'Invalid OpenWeatherMap API key.' });
    console.error('Weather error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch weather data.' });
  }
};

module.exports = { getWeather };
