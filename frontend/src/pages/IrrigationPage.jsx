/**
 * Irrigation Recommendation Page
 */

import React, { useState } from 'react';
import { Droplets, AlertTriangle, ChevronRight, Zap } from 'lucide-react';
import { getIrrigationAdvice } from '../utils/api';
import toast from 'react-hot-toast';

const urgencyConfig = {
  critical: { label: 'CRITICAL', cls: 'text-red-400 bg-red-500/15 border-red-500/40',         glow: 'shadow-red-500/20' },
  high:     { label: 'HIGH',     cls: 'text-orange-400 bg-orange-500/15 border-orange-500/40', glow: 'shadow-orange-500/20' },
  medium:   { label: 'MEDIUM',   cls: 'text-yellow-400 bg-yellow-500/15 border-yellow-500/40', glow: 'shadow-yellow-500/20' },
  low:      { label: 'LOW',      cls: 'text-green-400 bg-green-500/15 border-green-500/40',    glow: 'shadow-green-500/20' },
  normal:   { label: 'NORMAL',   cls: 'text-blue-400 bg-blue-500/15 border-blue-500/40',       glow: 'shadow-blue-500/20' },
};

export default function IrrigationPage() {
  const [form, setForm] = useState({
    moisture: '', temperature: '', humidity: '', cropType: '', soilType: '',
  });
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.moisture) return toast.error('Soil moisture is required');
    setLoading(true);
    setError('');
    try {
      // rainExpected always false — field removed from UI
      const res = await getIrrigationAdvice({ ...form, rainExpected: false });
      setResult(res.data);
      toast.success('Recommendation ready!');
    } catch (err) {
      setError(err.message);
      toast.error('Failed to get recommendation');
    } finally {
      setLoading(false);
    }
  };

  const urg = result ? (urgencyConfig[result.urgency] || urgencyConfig.normal) : null;

  /* Shared select style — dark background so options are always readable */
  const selectStyle = {
    background: '#0f0f1a',
    color: '#e2e8f0',
    border: '1px solid rgba(255,255,255,0.12)',
  };

  return (
    <div
      className="min-h-screen pt-20 pb-12 px-4 relative overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse at top right, rgba(6,182,212,0.08) 0%, transparent 60%), #0a0a0f',
      }}
    >
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-cyan-600/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-blue-600/10 rounded-full blur-[80px]" />
        <div className="absolute inset-0 dots-bg opacity-15" />
      </div>

      <div className="relative max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm text-cyan-300 mb-4"
            style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.25)' }}
          >
            <Droplets className="w-4 h-4" /> Smart Irrigation System
          </div>
          <h1 className="text-4xl font-black text-white mb-3">
            Irrigation{' '}
            <span
              style={{
                background: 'linear-gradient(135deg,#06b6d4,#3b82f6,#4ade80)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Advice
            </span>
          </h1>
          <p className="text-gray-400">
            Combine soil moisture and weather data for smart watering decisions
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">

          {/* ── Form ──────────────────────────────────────────────────────── */}
          <div
            className="rounded-3xl p-6"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(6,182,212,0.15)' }}
          >
            <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
              <Droplets className="w-5 h-5 text-cyan-400" /> Input Parameters
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Soil Moisture */}
              <div>
                <label className="label">Soil Moisture (%) *</label>
                <input
                  type="number"
                  value={form.moisture}
                  onChange={set('moisture')}
                  placeholder="0 – 100"
                  min="0"
                  max="100"
                  className="input-field"
                />
              </div>

              {/* Temperature + Humidity */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Temperature (°C)</label>
                  <input
                    type="number"
                    value={form.temperature}
                    onChange={set('temperature')}
                    placeholder="e.g. 28"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label">Humidity (%)</label>
                  <input
                    type="number"
                    value={form.humidity}
                    onChange={set('humidity')}
                    placeholder="e.g. 65"
                    min="0"
                    max="100"
                    className="input-field"
                  />
                </div>
              </div>

              {/* Crop Type */}
              <div>
                <label className="label">
                  Crop Type{' '}
                  <span className="text-gray-600 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={form.cropType}
                  onChange={set('cropType')}
                  placeholder="e.g. Tomato, Rice"
                  className="input-field"
                />
              </div>

              {/* Soil Type — dark-themed select */}
              <div>
                <label className="label">
                  Soil Type{' '}
                  <span className="text-gray-600 font-normal">(optional)</span>
                </label>
                <select
                  value={form.soilType}
                  onChange={set('soilType')}
                  className="w-full px-4 py-3 rounded-xl text-white text-sm
                             focus:outline-none focus:border-cyan-500/50
                             transition-all duration-200 cursor-pointer"
                  style={selectStyle}
                >
                  <option value=""        style={{ background: '#0f0f1a', color: '#e2e8f0' }}>Select soil type</option>
                  <option value="sandy"   style={{ background: '#0f0f1a', color: '#e2e8f0' }}>Sandy</option>
                  <option value="clay"    style={{ background: '#0f0f1a', color: '#e2e8f0' }}>Clay</option>
                  <option value="loam"    style={{ background: '#0f0f1a', color: '#e2e8f0' }}>Loam</option>
                  <option value="silt"    style={{ background: '#0f0f1a', color: '#e2e8f0' }}>Silt</option>
                  <option value="sandy loam" style={{ background: '#0f0f1a', color: '#e2e8f0' }}>Sandy Loam</option>
                  <option value="clay loam"  style={{ background: '#0f0f1a', color: '#e2e8f0' }}>Clay Loam</option>
                </select>
              </div>

              {/* Error */}
              {error && (
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-red-400 text-sm"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}
                >
                  <AlertTriangle className="w-4 h-4" /> {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-bold text-white flex items-center
                           justify-center gap-2 transition-all hover:scale-[1.02]
                           active:scale-[0.98] disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg,#0891b2,#3b82f6,#4ade80)',
                  boxShadow: '0 8px 25px rgba(6,182,212,0.25)',
                }}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Get Recommendation
                  </>
                )}
              </button>
            </form>
          </div>

          {/* ── Result ────────────────────────────────────────────────────── */}
          <div>
            {!result ? (
              <div
                className="h-full rounded-3xl flex flex-col items-center justify-center p-10 text-center"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <Droplets className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                <p className="text-gray-500">Fill in the parameters to get irrigation advice</p>
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in">

                {/* Action card */}
                <div
                  className={`rounded-2xl p-6 text-center shadow-xl ${urg.glow}`}
                  style={{
                    background: 'linear-gradient(135deg,rgba(6,182,212,0.1),rgba(59,130,246,0.08))',
                    border: '1px solid rgba(6,182,212,0.25)',
                  }}
                >
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${urg.cls} mb-3 inline-block`}>
                    {urg.label} URGENCY
                  </span>
                  <div className="text-3xl font-black text-white mb-2">{result.action}</div>
                  <p className="text-gray-300 text-sm leading-relaxed">{result.reason}</p>
                </div>

                {/* Detail cards */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Water Amount',    value: result.waterAmount,        color: 'text-blue-400' },
                    { label: 'Next Irrigation', value: result.nextIrrigationIn,   color: 'text-green-400' },
                    { label: 'Best Time',       value: result.bestTimeToIrrigate, color: 'text-purple-400' },
                    { label: 'Method',          value: result.irrigationMethod,   color: 'text-cyan-400' },
                  ].map((d) => (
                    <div
                      key={d.label}
                      className="rounded-xl p-3"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      <p className="text-gray-500 text-xs mb-1">{d.label}</p>
                      <p className={`text-sm font-semibold ${d.color}`}>{d.value}</p>
                    </div>
                  ))}
                </div>

                {/* Tips */}
                {result.tips?.length > 0 && (
                  <div
                    className="rounded-2xl p-4"
                    style={{ background: 'rgba(74,222,128,0.05)', border: '1px solid rgba(74,222,128,0.2)' }}
                  >
                    <p className="text-green-400 text-xs font-semibold uppercase tracking-wide mb-2">
                      Tips
                    </p>
                    <ul className="space-y-1">
                      {result.tips.map((t, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                          <ChevronRight className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
