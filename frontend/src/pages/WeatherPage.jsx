/**
 * Weather Report Page — Live OpenWeatherMap integration
 */

import React, { useState } from 'react';
import {
  CloudSun, Search, Thermometer, Droplets, Wind,
  Eye, Gauge, Sunrise, Sunset, AlertTriangle, Leaf,
  MapPin, Zap, Calendar
} from 'lucide-react';
import { getWeather } from '../utils/api';

export default function WeatherPage() {
  const [city,    setCity]    = useState('');
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!city.trim()) return;
    setLoading(true);
    setError('');
    setData(null);
    try {
      const res = await getWeather(city.trim());
      setData(res.data);
    } catch (err) {
      setError(err.message || 'City not found. Please check the spelling and try again.');
    } finally {
      setLoading(false);
    }
  };

  const weatherCards = data ? [
    {
      label: 'Temperature', value: `${data.temperature}°C`,
      sub: `Feels like ${data.feelsLike}°C`,
      icon: Thermometer, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20',
    },
    {
      label: 'Humidity', value: `${data.humidity}%`,
      sub: data.humidity > 80 ? 'High — fungal risk' : data.humidity < 30 ? 'Low — drought risk' : 'Comfortable',
      icon: Droplets, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20',
    },
    {
      label: 'Wind Speed', value: `${data.windSpeed} km/h`,
      sub: data.windGust ? `Gusts up to ${data.windGust} km/h` : 'Current wind',
      icon: Wind, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20',
    },
    {
      label: 'Visibility', value: `${data.visibility} km`,
      sub: data.visibility < 2 ? 'Very poor' : data.visibility < 5 ? 'Poor' : 'Good',
      icon: Eye, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20',
    },
    {
      label: 'Pressure', value: `${data.pressure} hPa`,
      sub: data.pressure < 990 ? 'Low — storm likely' : data.pressure > 1025 ? 'High — stable' : 'Normal',
      icon: Gauge, color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20',
    },
    {
      label: 'Cloud Cover', value: `${data.clouds}%`,
      sub: data.rain > 0 ? `Rain: ${data.rain} mm` : 'No precipitation',
      icon: CloudSun, color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/20',
    },
  ] : [];

  return (
    <div
      className="min-h-screen pt-20 pb-12 px-4 relative overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at top, rgba(59,130,246,0.1) 0%, transparent 60%), #0a0a0f' }}
    >
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-10 w-80 h-80 bg-blue-600/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-cyan-600/10 rounded-full blur-[80px]" />
        <div className="absolute inset-0 dots-bg opacity-15" />
      </div>

      <div className="relative max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm text-blue-300 mb-4"
            style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)' }}
          >
            <CloudSun className="w-4 h-4" />
            Real-Time Weather + Farming Advice
          </div>
          <h1 className="text-4xl font-black text-white mb-3">
            Weather{' '}
            <span style={{ background: 'linear-gradient(135deg,#3b82f6,#06b6d4,#4ade80)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Report
            </span>
          </h1>
          <p className="text-gray-400">Enter any city to get live weather data and farming recommendations</p>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-8 max-w-lg mx-auto">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none z-10">
              <MapPin className="w-4 h-4 text-gray-500" />
            </span>
            <input
              type="text"
              value={city}
              onChange={(e) => { setCity(e.target.value); setError(''); }}
              placeholder="e.g. Delhi, Mumbai, Chennai, Kolkata"
              style={{ paddingLeft: '2.75rem' }}
              className="w-full py-3 pr-4 bg-white/5 border border-white/10 rounded-xl text-white
                         placeholder-gray-500 focus:outline-none focus:border-blue-500/50
                         focus:bg-white/10 transition-all duration-200"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !city.trim()}
            className="px-5 py-3 rounded-xl font-semibold text-white flex items-center gap-2
                       transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg,#2563eb,#0891b2)', boxShadow: '0 4px 20px rgba(59,130,246,0.3)' }}
          >
            {loading
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <Search className="w-4 h-4" />}
            Search
          </button>
        </form>

        {/* Error */}
        {error && (
          <div
            className="flex items-center gap-2 px-4 py-3 rounded-xl text-red-400 text-sm mb-6 max-w-lg mx-auto"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}
          >
            <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-16">
            <div className="spinner mx-auto mb-4" />
            <p className="text-gray-400 text-sm">Fetching live weather data...</p>
          </div>
        )}

        {/* Results */}
        {data && !loading && (
          <div className="space-y-6 animate-fade-in">

            {/* Hero card */}
            <div
              className="rounded-3xl p-6 text-center relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg,rgba(37,99,235,0.18),rgba(8,145,178,0.12))', border: '1px solid rgba(59,130,246,0.3)' }}
            >
              <div className="absolute inset-0 opacity-5"
                   style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
              <div className="relative">
                <p className="text-blue-300 text-sm mb-2 flex items-center justify-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {data.city}{data.country ? `, ${data.country}` : ''}
                </p>

                {/* Weather icon from OWM */}
                {data.iconUrl && (
                  <img
                    src={data.iconUrl}
                    alt={data.description}
                    className="w-20 h-20 mx-auto -my-2"
                    style={{ filter: 'drop-shadow(0 0 12px rgba(96,165,250,0.5))' }}
                  />
                )}

                <div className="text-7xl font-black text-white mb-1 leading-none">
                  {data.temperature}°C
                </div>
                <p className="text-gray-300 capitalize text-lg mb-1">{data.description}</p>
                <p className="text-gray-500 text-sm">
                  Min {data.tempMin}°C &nbsp;/&nbsp; Max {data.tempMax}°C
                </p>

                <div className="flex justify-center gap-8 mt-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <Sunrise className="w-4 h-4 text-orange-400" /> {data.sunrise}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Sunset className="w-4 h-4 text-pink-400" /> {data.sunset}
                  </span>
                </div>
              </div>
            </div>

            {/* Metric cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {weatherCards.map((c) => (
                <div key={c.label} className={`glass rounded-2xl p-4 border ${c.border} hover:scale-105 transition-transform`}>
                  <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center mb-3`}>
                    <c.icon className={`w-4 h-4 ${c.color}`} />
                  </div>
                  <div className={`text-xl font-black ${c.color}`}>{c.value}</div>
                  <div className="text-gray-400 text-xs font-medium mt-0.5">{c.label}</div>
                  <div className="text-gray-600 text-xs">{c.sub}</div>
                </div>
              ))}
            </div>

            {/* 5-day forecast */}
            {data.forecast?.length > 0 && (
              <div
                className="rounded-2xl p-5"
                style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.2)' }}
              >
                <p className="text-blue-400 font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> 5-Day Forecast
                </p>
                <div className="grid grid-cols-5 gap-2">
                  {data.forecast.map((day, i) => (
                    <div key={i} className="text-center rounded-xl p-2"
                         style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <p className="text-gray-400 text-xs font-semibold mb-1">{day.day}</p>
                      {day.icon && (
                        <img
                          src={`https://openweathermap.org/img/wn/${day.icon}.png`}
                          alt={day.description}
                          className="w-10 h-10 mx-auto"
                        />
                      )}
                      <p className="text-white text-sm font-bold">{day.tempMax}°</p>
                      <p className="text-gray-500 text-xs">{day.tempMin}°</p>
                      {day.rain > 0 && (
                        <p className="text-blue-400 text-xs mt-0.5">{day.rain}mm</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Immediate actions */}
            {data.actions?.length > 0 && (
              <div
                className="rounded-2xl p-5"
                style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.25)' }}
              >
                <p className="text-red-400 font-semibold mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4" /> Immediate Actions Required
                </p>
                <ul className="space-y-2">
                  {data.actions.map((a, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="text-red-400 font-bold flex-shrink-0">→</span> {a}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Farming advice */}
            {data.farmingAdvice?.length > 0 && (
              <div
                className="rounded-2xl p-5"
                style={{ background: 'rgba(74,222,128,0.05)', border: '1px solid rgba(74,222,128,0.2)' }}
              >
                <p className="text-green-400 font-semibold mb-3 flex items-center gap-2">
                  <Leaf className="w-4 h-4" /> Farming Advice
                </p>
                <ul className="space-y-2">
                  {data.farmingAdvice.map((a, i) => (
                    <li key={i} className="text-gray-300 text-sm leading-relaxed">{a}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Warnings */}
            {data.warnings?.length > 0 && (
              <div
                className="rounded-2xl p-5"
                style={{ background: 'rgba(251,146,60,0.05)', border: '1px solid rgba(251,146,60,0.25)' }}
              >
                <p className="text-orange-400 font-semibold mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Weather Warnings
                </p>
                <ul className="space-y-2">
                  {data.warnings.map((w, i) => (
                    <li key={i} className="text-gray-300 text-sm leading-relaxed">{w}</li>
                  ))}
                </ul>
              </div>
            )}

            <p className="text-center text-gray-600 text-xs">
              Last updated: {new Date(data.fetchedAt).toLocaleString('en-IN')}
            </p>
          </div>
        )}

        {/* Empty state */}
        {!data && !loading && !error && (
          <div className="text-center py-16">
            <CloudSun className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Search for any city to see live weather</p>
            <p className="text-gray-600 text-sm mt-1">Try: Delhi, Mumbai, Chennai, Bangalore, Kolkata</p>
          </div>
        )}
      </div>
    </div>
  );
}
