/**
 * History Page
 */

import React, { useState, useEffect } from 'react';
import { History, FlaskConical, CloudSun, Sprout, Droplets, Leaf, Trash2, RefreshCw, AlertTriangle } from 'lucide-react';
import { getHistory, deleteHistoryEntry, clearHistory } from '../utils/api';
import toast from 'react-hot-toast';

const typeConfig = {
  disease:   { icon: FlaskConical, label: 'Disease Detection', color: 'text-pink-400 bg-pink-500/15 border-pink-500/25' },
  weather:   { icon: CloudSun,     label: 'Weather Report',    color: 'text-blue-400 bg-blue-500/15 border-blue-500/25' },
  soil:      { icon: Sprout,       label: 'Soil Analysis',     color: 'text-green-400 bg-green-500/15 border-green-500/25' },
  irrigation:{ icon: Droplets,     label: 'Irrigation Advice', color: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/25' },
  crop:      { icon: Leaf,         label: 'Crop Recommendation',color: 'text-purple-400 bg-purple-500/15 border-purple-500/25' },
};

const getSummary = (h) => {
  if (h.type === 'disease')    return h.result?.disease || 'Disease detected';
  if (h.type === 'weather')    return `${h.input?.city} — ${h.result?.temperature}°C`;
  if (h.type === 'soil')       return `pH: ${h.input?.ph}, Score: ${h.result?.healthScore}/100`;
  if (h.type === 'irrigation') return `Moisture: ${h.input?.moisture}% → ${h.result?.action}`;
  if (h.type === 'crop')       return `Top: ${h.result?.topCrops?.[0]?.name || 'N/A'}`;
  return 'Analysis completed';
};

export default function HistoryPage() {
  const [history,  setHistory]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('all');
  const [clearing, setClearing] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getHistory({ type: filter === 'all' ? undefined : filter, limit: 50 });
      setHistory(res.data?.history || []);
    } catch { toast.error('Failed to load history'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filter]);

  const handleDelete = async (id) => {
    try {
      await deleteHistoryEntry(id);
      setHistory((p) => p.filter((h) => h.id !== id));
      toast.success('Entry deleted');
    } catch { toast.error('Delete failed'); }
  };

  const handleClear = async () => {
    if (!window.confirm('Clear all history? This cannot be undone.')) return;
    setClearing(true);
    try {
      await clearHistory();
      setHistory([]);
      toast.success('History cleared');
    } catch { toast.error('Failed to clear history'); }
    finally { setClearing(false); }
  };

  const filters = ['all', 'disease', 'weather', 'soil', 'irrigation', 'crop'];

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 relative overflow-hidden"
         style={{ background: 'radial-gradient(ellipse at top, rgba(168,85,247,0.06) 0%, transparent 60%), #0a0a0f' }}>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 dots-bg opacity-15" />
      </div>

      <div className="relative max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white flex items-center gap-3">
              <History className="w-7 h-7 text-purple-400" />
              Activity History
            </h1>
            <p className="text-gray-400 text-sm mt-1">Your past analyses and recommendations</p>
          </div>
          <div className="flex gap-2">
            <button onClick={load} className="p-2.5 rounded-xl text-gray-400 hover:text-white transition-colors"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <RefreshCw className="w-4 h-4" />
            </button>
            {history.length > 0 && (
              <button onClick={handleClear} disabled={clearing}
                className="px-3 py-2.5 rounded-xl text-red-400 hover:text-red-300 text-sm flex items-center gap-1.5 transition-colors disabled:opacity-50"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <Trash2 className="w-4 h-4" /> Clear All
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {filters.map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all capitalize ${
                filter === f
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                  : 'text-gray-400 hover:text-white'
              }`}
              style={filter !== f ? { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' } : {}}>
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="spinner mx-auto" />
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-16 rounded-3xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <History className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-400 font-medium">No history found</p>
            <p className="text-gray-600 text-sm mt-1">Start using the tools to build your activity history</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((h) => {
              const cfg  = typeConfig[h.type] || typeConfig.crop;
              const Icon = cfg.icon;
              return (
                <div key={h.id} className="glass rounded-2xl p-4 flex items-center gap-4 hover:border-purple-500/25 transition-all group">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-white text-sm font-semibold">{cfg.label}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs border ${cfg.color}`}>{h.type}</span>
                    </div>
                    <p className="text-gray-400 text-xs truncate">{getSummary(h)}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-gray-600 text-xs hidden sm:block">
                      {new Date(h.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <button onClick={() => handleDelete(h.id)}
                      className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                      style={{ background: 'rgba(239,68,68,0.08)' }}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
