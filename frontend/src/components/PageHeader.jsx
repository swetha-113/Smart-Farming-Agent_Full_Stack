import React from 'react';

export default function PageHeader({ icon: Icon, title, subtitle, color = 'purple' }) {
  const gradients = {
    purple: 'from-purple-600 to-blue-600',
    green: 'from-green-600 to-teal-600',
    blue: 'from-blue-600 to-cyan-600',
    yellow: 'from-yellow-600 to-orange-600',
  };

  return (
    <div className="mb-8 animate-fade-in">
      <div className="flex items-center gap-4 mb-3">
        <div className={`p-3 rounded-2xl bg-gradient-to-br ${gradients[color]} shadow-lg`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">{title}</h1>
          {subtitle && <p className="text-gray-400 mt-1">{subtitle}</p>}
        </div>
      </div>
      <div className={`h-1 w-24 rounded-full bg-gradient-to-r ${gradients[color]}`} />
    </div>
  );
}
