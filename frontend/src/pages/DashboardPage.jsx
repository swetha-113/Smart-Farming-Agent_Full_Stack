/**
 * Dashboard Page — summary cards + quick links
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Leaf, CloudSun, Droplets, FlaskConical, Sprout,
  BarChart3, TrendingUp, Activity, ArrowRight, History,
  Thermometer, Wind, Eye
} from 'lucide-react';
import { getHistory } from '../utils/api';

const quickLinks = [
  { to: '/disease',   label: 'Detect Disease',    icon: FlaskConical, color: 'from-pink-600/30 to-purple-600/20',  border: 'border-pink-500/30',   iconCls: 'text-pink-400 bg-pink-500/20' },
  { to: '/weather',   label: 'Check Weather',     icon: CloudSun,     color: 'from-blue-600/30 to-cyan-600/20',    border: 'border-blue-500/30',   iconCls: 'text-blue-400 bg-blue-500/20' },
  { to: '/soil',      label: 'Soil Analysis',     icon: Sprout,       color: 'from-green-600/30 to-emerald-600/20',border: 'border-green-500/30',  iconCls: 'text-green-400 bg-green-500/20' },
  { to: '/irrigation',label: 'Irrigation Advice', icon: Droplets,     color: 'from-cyan-600/30 to-blue-600/20',    border: 'border-cyan-500/30',   iconCls: 'text-cyan-400 bg-cyan-500/20' },
  { to: '/crops',     label: 'Crop Recommend',    icon: Leaf,         color: 'from-purple-600/30 to-pink-600/20',  border: 'border-purple-500/30', iconCls: 'text-purple-400 bg-purple-500/20' },
  { to: '/history',   label: 'View History',      icon: History,      color: 'from-orange-600/30 to-yellow-600/20',border: 'border-orange-500/30', iconCls: 'text-orange-400 bg-orange-500/20' },
];

const statCards = [
  { label: 'AI Accuracy',      value: '95%',  icon: Activity,    color: 'text-green-400',  bg: 'bg-green-500/10',  border: 'border-green-500/20' },
  { label: 'Disease Types',    value: '7+',   icon: FlaskConical,color: 'text-pink-400',   bg: 'bg-pink-500/10',   border: 'border-pink-500/20' },
  { label: 'Crop Varieties',   value: '10+',  icon: Leaf,        color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  { label: 'Recommendations',  value: '24/7', icon: TrendingUp,  color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/20' },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [recentHistory, setRecentHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    getHistory({ limit: 5 })
      .then((res) => setRecentHistory(res.data?.history || []))
      .catch(() => {})
      .finally(() => setHistoryLoading(false));
  }, []);

  const typeIcon = { disease: FlaskConical, weather: CloudSun, soil: Sprout, irrigation: Droplets, crop: Leaf };
  const typeColor = {
    disease:   'text-pink-400 bg-pink-500/15 border-pink-500/25',
    weather:   'text-blue-400 bg-blue-500/15 border-blue-500/25',
    soil:      'text-green-400 bg-green-500/15 border-green-500/25',
    irrigation:'text-cyan-400 bg-cyan-500/15 border-cyan-500/25',
    crop:      'text-purple-400 bg-purple-500/15 border-purple-500/25',
  };

  return (
    <div className="bg-page min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-6xl mx-auto">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-green-500 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white">
                Welcome back, <span className="text-gradient">{user?.name?.split(' ')[0]}</span> 👋
              </h1>
              <p className="text-gray-400 text-sm">Here's your farming overview</p>
            </div>
          </div>
        </div>

        {/* ── Stat Cards ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {statCards.map((s) => (
            <div key={s.label} className={`glass rounded-2xl p-5 border ${s.border} hover:scale-105 transition-transform`}>
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-gray-400 text-xs mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Quick Links ─────────────────────────────────────────────────── */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5 text-purple-400" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickLinks.map((q) => (
              <Link
                key={q.to}
                to={q.to}
                className={`group rounded-2xl p-4 bg-gradient-to-br border ${q.color} ${q.border}
                            hover:scale-105 transition-all duration-300 text-center`}
              >
                <div className={`w-10 h-10 rounded-xl ${q.iconCls} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                  <q.icon className="w-5 h-5" />
                </div>
                <p className="text-white text-xs font-semibold leading-tight">{q.label}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Recent Activity ─────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-green-400" />
              Recent Activity
            </h2>
            <Link to="/history" className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {historyLoading ? (
            <div className="glass rounded-2xl p-8 text-center">
              <div className="spinner mx-auto" />
            </div>
          ) : recentHistory.length === 0 ? (
            <div className="glass rounded-2xl p-10 text-center">
              <Leaf className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No activity yet. Start by detecting a disease or checking the weather!</p>
              <Link to="/disease" className="btn-primary inline-flex items-center gap-2 mt-4 text-sm">
                <FlaskConical className="w-4 h-4" /> Get Started
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentHistory.map((h) => {
                const Icon = typeIcon[h.type] || Leaf;
                const cls  = typeColor[h.type] || 'text-gray-400 bg-gray-500/15 border-gray-500/25';
                return (
                  <div key={h.id} className="glass rounded-xl p-4 flex items-center gap-4 hover:border-purple-500/30 transition-all">
                    <div className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 ${cls}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium capitalize">{h.type} Analysis</p>
                      <p className="text-gray-500 text-xs truncate">
                        {h.type === 'disease' && h.result?.disease}
                        {h.type === 'weather' && h.input?.city}
                        {h.type === 'soil'    && `pH: ${h.input?.ph}, N: ${h.input?.nitrogen}`}
                        {h.type === 'irrigation' && `Moisture: ${h.input?.moisture}%`}
                        {h.type === 'crop'    && `pH: ${h.input?.ph}, Temp: ${h.input?.temperature}°C`}
                      </p>
                    </div>
                    <span className="text-gray-600 text-xs flex-shrink-0">
                      {new Date(h.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
