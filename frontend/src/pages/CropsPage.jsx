/**
 * Crop Recommendation Page
 */

import React, { useState } from 'react';
import { Leaf, AlertTriangle, Zap, ChevronRight } from 'lucide-react';
import { getCropRecommendation } from '../utils/api';
import toast from 'react-hot-toast';

const suitabilityColor = (s) =>
  s >= 80 ? 'text-green-400 bg-green-500/15 border-green-500/30' :
  s >= 60 ? 'text-blue-400 bg-blue-500/15 border-blue-500/30' :
  s >= 40 ? 'text-yellow-400 bg-yellow-500/15 border-yellow-500/30' :
            'text-red-400 bg-red-500/15 border-red-500/30';

export default function CropsPage() {
  const [form, setForm] = useState({ ph: '', temperature: '', humidity: '', rainfall: '', nitrogen: '', phosphorus: '', potassium: '' });
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.ph || !form.temperature) return toast.error('pH and temperature are required');
    setLoading(true); setError('');
    try {
      const res = await getCropRecommendation(form);
      setResult(res.data);
      toast.success('Crop recommendations ready!');
    } catch (err) {
      setError(err.message); toast.error('Failed to get recommendations');
    } finally { setLoading(false); }
  };

  const fields = [
    { key: 'ph',          label: 'Soil pH *',          placeholder: '0–14' },
    { key: 'temperature', label: 'Temperature (°C) *',  placeholder: 'e.g. 25' },
    { key: 'humidity',    label: 'Humidity (%)',         placeholder: 'e.g. 60' },
    { key: 'rainfall',    label: 'Rainfall (mm/month)',  placeholder: 'e.g. 80' },
    { key: 'nitrogen',    label: 'Nitrogen (N) mg/kg',   placeholder: 'e.g. 30' },
    { key: 'phosphorus',  label: 'Phosphorus (P) mg/kg', placeholder: 'e.g. 25' },
    { key: 'potassium',   label: 'Potassium (K) mg/kg',  placeholder: 'e.g. 25' },
  ];

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 relative overflow-hidden"
         style={{ background: 'radial-gradient(ellipse at top, rgba(168,85,247,0.08) 0%, transparent 60%), #0a0a0f' }}>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-green-600/8 rounded-full blur-[80px]" />
        <div className="absolute inset-0 dots-bg opacity-15" />
      </div>

      <div className="relative max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm text-purple-300 mb-4"
               style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.25)' }}>
            <Leaf className="w-4 h-4" /> AI Crop Matching
          </div>
          <h1 className="text-4xl font-black text-white mb-3">
            Crop{' '}
            <span style={{ background: 'linear-gradient(135deg,#a855f7,#3b82f6,#4ade80)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              Recommendation
            </span>
          </h1>
          <p className="text-gray-400">Enter your soil and climate conditions to find the best crops for your farm</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">

          {/* Form */}
          <div className="rounded-3xl p-6" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(168,85,247,0.15)' }}>
            <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
              <Leaf className="w-5 h-5 text-purple-400" /> Farm Conditions
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              {fields.map((f) => (
                <div key={f.key}>
                  <label className="label text-xs">{f.label}</label>
                  <input type="number" value={form[f.key]} onChange={set(f.key)}
                    placeholder={f.placeholder} step="0.1" className="input-field py-2.5 text-sm" />
                </div>
              ))}
              {error && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-red-400 text-xs"
                     style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
                  <AlertTriangle className="w-3.5 h-3.5" /> {error}
                </div>
              )}
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 mt-2"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#3b82f6,#16a34a)', boxShadow: '0 8px 25px rgba(168,85,247,0.25)' }}>
                {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Finding...</> : <><Zap className="w-4 h-4" />Find Crops</>}
              </button>
            </form>
          </div>

          {/* Results */}
          <div className="lg:col-span-2">
            {!result ? (
              <div className="h-full rounded-3xl flex flex-col items-center justify-center p-10 text-center"
                   style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <Leaf className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                <p className="text-gray-500">Enter your farm conditions to see crop recommendations</p>
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in">
                <h2 className="text-lg font-bold text-white">Top Recommendations</h2>
                {result.topRecommendations.map((crop, i) => (
                  <div key={crop.name}
                       className={`rounded-2xl p-5 transition-all hover:scale-[1.01] ${i === 0 ? 'ring-1 ring-purple-500/40' : ''}`}
                       style={{ background: i === 0 ? 'linear-gradient(135deg,rgba(168,85,247,0.1),rgba(74,222,128,0.06))' : 'rgba(255,255,255,0.02)', border: `1px solid ${i === 0 ? 'rgba(168,85,247,0.3)' : 'rgba(255,255,255,0.08)'}` }}>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{crop.emoji}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-white font-bold">{crop.name}</h3>
                            {i === 0 && <span className="px-2 py-0.5 rounded-full text-xs font-bold text-yellow-400 bg-yellow-500/15 border border-yellow-500/30">Best Match</span>}
                          </div>
                          <p className="text-gray-400 text-xs">{crop.description}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border flex-shrink-0 ${suitabilityColor(crop.suitability)}`}>
                        {crop.suitability}%
                      </span>
                    </div>
                    {/* Suitability bar */}
                    <div className="h-1.5 rounded-full overflow-hidden mb-3" style={{ background: 'rgba(255,255,255,0.08)' }}>
                      <div className="h-full rounded-full transition-all duration-1000"
                           style={{ width: `${crop.suitability}%`, background: crop.suitability >= 80 ? 'linear-gradient(90deg,#4ade80,#22c55e)' : crop.suitability >= 60 ? 'linear-gradient(90deg,#3b82f6,#06b6d4)' : 'linear-gradient(90deg,#f59e0b,#ef4444)' }} />
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                      <span>⏱ {crop.growingPeriod}</span>
                      <span>💧 {crop.waterRequirement} water</span>
                      <span className={`px-2 py-0.5 rounded-full border ${suitabilityColor(crop.suitability)}`}>{crop.suitabilityLabel}</span>
                    </div>
                    {crop.reasons?.length > 0 && (
                      <div className="mt-3 space-y-1">
                        {crop.reasons.map((r, j) => (
                          <p key={j} className="text-xs text-gray-500 flex items-start gap-1">
                            <ChevronRight className="w-3 h-3 flex-shrink-0 mt-0.5" />{r}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
