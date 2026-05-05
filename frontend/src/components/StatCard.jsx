import React from 'react';

export default function StatCard({ icon: Icon, label, value, sub, color = 'purple', trend }) {
  const colors = {
    purple: 'from-purple-600/20 to-purple-500/5 border-purple-500/20 text-purple-400',
    green: 'from-green-600/20 to-green-500/5 border-green-500/20 text-green-400',
    blue: 'from-blue-600/20 to-blue-500/5 border-blue-500/20 text-blue-400',
    yellow: 'from-yellow-600/20 to-yellow-500/5 border-yellow-500/20 text-yellow-400',
    red: 'from-red-600/20 to-red-500/5 border-red-500/20 text-red-400',
  };

  const iconBg = {
    purple: 'bg-purple-500/20 text-purple-400',
    green: 'bg-green-500/20 text-green-400',
    blue: 'bg-blue-500/20 text-blue-400',
    yellow: 'bg-yellow-500/20 text-yellow-400',
    red: 'bg-red-500/20 text-red-400',
  };

  return (
    <div className={`rounded-2xl p-5 bg-gradient-to-br border transition-all duration-300 hover:scale-105 hover:shadow-lg ${colors[color]}`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-xl ${iconBg[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            trend > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm font-medium text-gray-300">{label}</div>
      {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
    </div>
  );
}
