/**
 * Soil Analysis Page
 */

import React, { useState } from 'react';
import { Sprout, FlaskConical, AlertTriangle, CheckCircle2, ChevronRight, BarChart3 } from 'lucide-react';
import { getSoilRecommendation } from '../utils/api';
import toast from 'react-hot-toast';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';

const statusColor = {
  good:     'text-green-400 bg-green-500/15 border-green-500/30',
  warning:  'text-yellow-400 bg-yellow-500/15 border-yellow-500/30',
  critical: 'text-red-400 bg-red-500/15 border-red-500/30',
  low:      'text-orange-400 bg-orange-500/15 border-orange-500/30',
  high:     'text-blue-400 bg-blue-500/15 border-blue-500/30',
};

export default function SoilPage() {
  const [form, setForm] = useState({ moisture: '', ph: '', nitrogen: '', phosphorus: '', potassium: '', cropType: '' });
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { moisture, ph, nitrogen, phosphorus, potassium } = form;
    if (!moisture || !ph || !nitrogen || !phosphorus || !potassium)
      return toast.error('Please fill all required fields');
    setLoading(true); setError('');
    try {
      const res = await getSoilRecommendation({ ...form });
      setResult(res.data);
      toast.success('Soil analysis complete!');
    } catch (err) {
      setError(err.message); toast.error('Analysis failed');
    } finally { setLoading(false); }
  };

  const radarData = result ? [
    { subject: 'pH',    A: Math.min(100, (result.input.ph / 14) * 100) },
    { subject: 'N',     A: Math.min(100, result.input.nitrogen) },
    { subject: 'P',     A: Math.min(100, result.input.phosphorus) },
    { subject: 'K',     A: Math.min(100, result.input.potassium) },
    { subject: 'Moisture', A: result.input.moisture },
  ] : [];

  const fields = [
    { key: 'moisture',   label: 'Soil Moisture (%)',  placeholder: '0–100', min: 0, max: 100 },
    { key: 'ph',         label: 'pH Value',            placeholder: '0–14',  min: 0, max: 14 },
    { key: 'nitrogen',   label: 'Nitrogen (N) mg/kg',  placeholder: '0–100', min: 0, max: 200 },
    { key: 'phosphorus', label: 'Phosphorus (P) mg/kg',placeholder: '0–100', min: 0, max: 200 },
    { key: 'potassium',  label: 'Potassium (K) mg/kg', placeholder: '0–100', min: 0, max: 200 },
  ];

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 relative overflow-hidden"
         style={{ background: 'radial-gradient(ellipse at top left, rgba(74,222,128,0.08) 0%, transparent 60%), #0a0a0f' }}>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-600/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-600/10 rounded-full blur-[80px]" />
        <div className="absolute inset-0 dots-bg opacity-15" />
      </div>

      <div className="relative max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm text-green-300 mb-4"
               style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.25)' }}>
            <Sprout className="w-4 h-4" /> Soil Health Analysis
          </div>
          <h1 className="text-4xl font-black text-white mb-3">
            Soil{' '}
            <span style={{ background: 'linear-gradient(135deg,#4ade80,#22c55e,#a855f7)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              Recommendation
            </span>
          </h1>
          <p className="text-gray-400">Enter your soil values to get fertilizer and improvement recommendations</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">

          {/* Form */}
          <div className="rounded-3xl p-6"
               style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(74,222,128,0.15)' }}>
            <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-green-400" /> Enter Soil Parameters
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {fields.map((f) => (
                <div key={f.key}>
                  <label className="label">{f.label}</label>
                  <input type="number" value={form[f.key]} onChange={set(f.key)}
                    placeholder={f.placeholder} min={f.min} max={f.max} step="0.1"
                    className="input-field" />
                </div>
              ))}
              <div>
                <label className="label">Crop Type <span className="text-gray-600 font-normal">(optional)</span></label>
                <input type="text" value={form.cropType} onChange={set('cropType')}
                  placeholder="e.g. Tomato, Rice, Wheat" className="input-field" />
              </div>
              {error && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-red-400 text-sm"
                     style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
                  <AlertTriangle className="w-4 h-4" /> {error}
                </div>
              )}
              <button type="submit" disabled={loading}
                className="w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg,#16a34a,#4ade80,#7c3aed)', boxShadow: '0 8px 25px rgba(74,222,128,0.25)' }}>
                {loading ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Analyzing...</> : <><BarChart3 className="w-5 h-5" />Analyze Soil</>}
              </button>
            </form>
          </div>

          {/* Results */}
          <div>
            {!result ? (
              <div className="h-full rounded-3xl flex flex-col items-center justify-center p-10 text-center"
                   style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <Sprout className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                <p className="text-gray-500">Fill in soil values and click Analyze</p>
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in">

                {/* Health score */}
                <div className="rounded-2xl p-5 text-center"
                     style={{ background: 'linear-gradient(135deg,rgba(74,222,128,0.1),rgba(168,85,247,0.08))', border: '1px solid rgba(74,222,128,0.2)' }}>
                  <p className="text-gray-400 text-sm mb-1">Soil Health Score</p>
                  <div className="text-5xl font-black text-white mb-1">{result.healthScore}<span className="text-2xl text-gray-400">/100</span></div>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold border ${result.healthScore >= 80 ? 'text-green-400 bg-green-500/15 border-green-500/30' : result.healthScore >= 60 ? 'text-yellow-400 bg-yellow-500/15 border-yellow-500/30' : 'text-red-400 bg-red-500/15 border-red-500/30'}`}>
                    {result.healthLabel}
                  </span>
                  {/* Score bar */}
                  <div className="mt-3 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <div className="h-full rounded-full transition-all duration-1000"
                         style={{ width: `${result.healthScore}%`, background: 'linear-gradient(90deg,#4ade80,#a855f7)' }} />
                  </div>
                </div>

                {/* Radar chart */}
                <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="text-gray-400 text-xs font-semibold mb-2 text-center">Nutrient Profile</p>
                  <ResponsiveContainer width="100%" height={180}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="rgba(255,255,255,0.1)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                      <Radar dataKey="A" stroke="#4ade80" fill="#4ade80" fillOpacity={0.15} strokeWidth={2} />
                      <Tooltip contentStyle={{ background: '#1a1a35', border: '1px solid rgba(168,85,247,0.3)', borderRadius: 8, color: '#e2e8f0' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {/* Analysis table */}
                <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                  {result.analysis.map((a, i) => (
                    <div key={i} className={`flex items-center justify-between px-4 py-3 ${i % 2 === 0 ? 'bg-white/[0.02]' : ''}`}>
                      <span className="text-gray-300 text-sm">{a.parameter}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-white text-sm font-medium">{a.value}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusColor[a.status] || statusColor.good}`}>{a.label}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Fertilizers */}
                {result.fertilizers?.length > 0 && (
                  <div className="rounded-2xl p-4" style={{ background: 'rgba(168,85,247,0.05)', border: '1px solid rgba(168,85,247,0.2)' }}>
                    <p className="text-purple-400 text-xs font-semibold uppercase tracking-wide mb-2">Fertilizer Suggestions</p>
                    <ul className="space-y-1">
                      {result.fertilizers.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                          <ChevronRight className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />{f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Warnings */}
                {result.warnings?.length > 0 && (
                  <div className="rounded-2xl p-4" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <p className="text-red-400 text-xs font-semibold uppercase tracking-wide mb-2">Warnings</p>
                    <ul className="space-y-1">
                      {result.warnings.map((w, i) => (
                        <li key={i} className="text-sm text-gray-300">{w}</li>
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
