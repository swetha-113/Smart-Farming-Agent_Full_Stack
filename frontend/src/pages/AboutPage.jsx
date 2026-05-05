/**
 * About Page
 */

import React from 'react';
import { Leaf, Brain, CloudSun, Sprout, Droplets, FlaskConical, Github, Code2, Database, Cpu } from 'lucide-react';

const techStack = [
  { icon: Code2,    label: 'React.js',    desc: 'Frontend UI with hooks and context', color: 'text-blue-400 bg-blue-500/10' },
  { icon: Code2,    label: 'Node.js + Express', desc: 'RESTful API backend', color: 'text-green-400 bg-green-500/10' },
  { icon: Database, label: 'In-Memory Store', desc: 'No-DB mode for easy local setup', color: 'text-purple-400 bg-purple-500/10' },
  { icon: Brain,    label: 'Mock ML Model', desc: 'CNN-ready disease detection structure', color: 'text-pink-400 bg-pink-500/10' },
  { icon: CloudSun, label: 'OpenWeatherMap', desc: 'Real-time weather data API', color: 'text-cyan-400 bg-cyan-500/10' },
  { icon: Cpu,      label: 'JWT Auth',     desc: 'Secure token-based authentication', color: 'text-orange-400 bg-orange-500/10' },
];

const features = [
  { icon: FlaskConical, title: 'Leaf Disease Detection', desc: 'Upload a leaf image and get instant AI-powered disease diagnosis with treatment and prevention tips.', color: 'text-pink-400' },
  { icon: CloudSun,     title: 'Weather Intelligence',   desc: 'Real-time weather data with smart farming advice based on temperature, humidity, and rainfall.', color: 'text-blue-400' },
  { icon: Sprout,       title: 'Soil Analysis',          desc: 'Analyze NPK values, pH, and moisture to get fertilizer recommendations and soil health scores.', color: 'text-green-400' },
  { icon: Droplets,     title: 'Smart Irrigation',       desc: 'Combines soil moisture and weather data to recommend the optimal irrigation action.', color: 'text-cyan-400' },
  { icon: Leaf,         title: 'Crop Recommendation',    desc: 'Suggests the best crops for your soil and climate conditions using a scoring algorithm.', color: 'text-purple-400' },
  { icon: Brain,        title: 'AI Assistant',           desc: 'Built-in chatbot for quick farming queries and guidance on all platform features.', color: 'text-orange-400' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-20 pb-12 px-4 relative overflow-hidden"
         style={{ background: 'radial-gradient(ellipse at top, rgba(168,85,247,0.08) 0%, transparent 60%), #0a0a0f' }}>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-green-600/8 rounded-full blur-[100px]" />
        <div className="absolute inset-0 dots-bg opacity-15" />
      </div>

      <div className="relative max-w-5xl mx-auto">

        {/* Hero */}
        <div className="text-center mb-16">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-600 via-pink-500 to-green-500 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-purple-500/30">
            <Leaf className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">
            About{' '}
            <span style={{ background: 'linear-gradient(135deg,#a855f7,#ec4899,#4ade80)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              Smart Farming
            </span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Autonomous Smart Farming Agent is an AI-powered web platform that helps farmers monitor
            crop health, analyze soil conditions, check weather reports, and receive smart
            recommendations for irrigation, fertilizer, and crop care.
          </p>
        </div>

        {/* Features */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">What It Does</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div key={f.title} className="glass rounded-2xl p-5 hover:border-purple-500/30 transition-all hover:scale-[1.02]">
                <f.icon className={`w-7 h-7 ${f.color} mb-3`} />
                <h3 className="text-white font-bold mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Technology Stack</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {techStack.map((t) => (
              <div key={t.label} className="glass rounded-2xl p-4 flex items-center gap-3 hover:border-purple-500/25 transition-all">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${t.color}`}>
                  <t.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{t.label}</p>
                  <p className="text-gray-500 text-xs">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Platform description */}
        <div
          className="rounded-3xl p-8 text-center"
          style={{
            background: 'linear-gradient(135deg,rgba(168,85,247,0.08),rgba(74,222,128,0.05))',
            border: '1px solid rgba(168,85,247,0.2)',
          }}
        >
          <h2 className="text-2xl font-bold text-white mb-4">About This Platform</h2>
          <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Autonomous Smart Farming Agent is an AI-powered web platform that helps farmers monitor
            crop health, analyze soil conditions, check weather reports, and receive smart
            recommendations for irrigation, fertilizer, and crop care. The disease detection module
            is built to accept a trained CNN model when available, while the recommendation engine
            uses rule-based expert logic for soil, irrigation, and crop decisions — making precision
            agriculture accessible to every farmer.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {['React.js', 'Node.js', 'Express', 'JWT Auth', 'OpenWeatherMap', 'Recharts', 'TailwindCSS', 'Sharp'].map((t) => (
              <span
                key={t}
                className="px-3 py-1 rounded-full text-xs text-purple-300"
                style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)' }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
