/**
 * Home Page
 * Hero section + feature cards
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  Leaf, FlaskConical, CloudSun, Sprout, Droplets,
  ArrowRight, Zap, Shield, BarChart3, Brain
} from 'lucide-react';

const features = [
  {
    icon: FlaskConical,
    title: 'Leaf Disease Detection',
    description: 'Upload a leaf photo and get instant AI-powered disease diagnosis with treatment recommendations.',
    link: '/disease',
    color: 'green',
    gradient: 'from-green-600/20 to-green-500/5',
    border: 'border-green-500/20',
    iconBg: 'bg-green-500/20 text-green-400',
  },
  {
    icon: CloudSun,
    title: 'Weather Report',
    description: 'Real-time weather data with smart farming advice based on temperature, humidity, and rainfall.',
    link: '/weather',
    color: 'blue',
    gradient: 'from-blue-600/20 to-blue-500/5',
    border: 'border-blue-500/20',
    iconBg: 'bg-blue-500/20 text-blue-400',
  },
  {
    icon: Sprout,
    title: 'Soil Recommendation',
    description: 'Analyze soil pH, NPK values, and moisture to get fertilizer and improvement recommendations.',
    link: '/soil',
    color: 'purple',
    gradient: 'from-purple-600/20 to-purple-500/5',
    border: 'border-purple-500/20',
    iconBg: 'bg-purple-500/20 text-purple-400',
  },
  {
    icon: Droplets,
    title: 'Irrigation Advice',
    description: 'Smart irrigation recommendations combining soil moisture and weather data for optimal watering.',
    link: '/irrigation',
    color: 'blue',
    gradient: 'from-cyan-600/20 to-cyan-500/5',
    border: 'border-cyan-500/20',
    iconBg: 'bg-cyan-500/20 text-cyan-400',
  },
];

const stats = [
  { value: '95%', label: 'Detection Accuracy' },
  { value: '10+', label: 'Disease Types' },
  { value: '50+', label: 'Crop Varieties' },
  { value: '24/7', label: 'AI Assistance' },
];

const benefits = [
  { icon: Brain, title: 'AI-Powered Analysis', desc: 'Advanced machine learning models trained on thousands of plant images' },
  { icon: Zap, title: 'Real-Time Insights', desc: 'Instant recommendations based on live weather and soil data' },
  { icon: Shield, title: 'Crop Protection', desc: 'Early disease detection prevents crop loss before it spreads' },
  { icon: BarChart3, title: 'Data-Driven Farming', desc: 'Make informed decisions with comprehensive analytics and history' },
];

export default function HomePage() {
  return (
    <div className="bg-hero min-h-screen">
      {/* ─── Hero Section ─────────────────────────────────────────────────── */}
      <section className="relative pt-28 pb-20 px-4 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 dots-bg opacity-30" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-10 w-64 h-64 bg-green-600/8 rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 glass-purple rounded-full text-sm text-purple-300 mb-8 animate-fade-in">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            AI-Powered Smart Farming Platform
          </div>

          {/* Title */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight animate-slide-up">
            Autonomous{' '}
            <span className="text-gradient">Smart Farming</span>
            <br />
            <span className="text-4xl sm:text-5xl lg:text-6xl">Agent</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in">
            Harness the power of AI to detect crop diseases, analyze soil health, monitor weather,
            and receive real-time farming recommendations — all in one platform.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-16 animate-slide-up">
            <Link to="/dashboard" className="btn-primary flex items-center gap-2 text-base px-8 py-4">
              <Zap className="w-5 h-5" />
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/disease" className="btn-secondary flex items-center gap-2 text-base px-8 py-4">
              <FlaskConical className="w-5 h-5" />
              Detect Disease
            </Link>
            <Link to="/weather" className="btn-secondary flex items-center gap-2 text-base px-8 py-4">
              <CloudSun className="w-5 h-5" />
              Check Weather
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="glass rounded-2xl p-4 text-center">
                <div className="text-2xl font-black text-gradient-purple">{stat.value}</div>
                <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Feature Cards ─────────────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Everything You Need to{' '}
              <span className="text-gradient">Farm Smarter</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Four powerful tools working together to maximize your crop yield and minimize losses.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Link
                key={feature.title}
                to={feature.link}
                className={`group rounded-2xl p-6 bg-gradient-to-br border transition-all duration-300 hover:scale-105 hover:shadow-xl ${feature.gradient} ${feature.border}`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feature.iconBg} group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">{feature.description}</p>
                <div className="flex items-center gap-1 text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                  Try Now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Benefits Section ──────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent to-dark-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Why Choose <span className="text-gradient">Smart Farming?</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b) => (
              <div key={b.title} className="glass rounded-2xl p-6 text-center hover:border-purple-500/30 transition-all">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
                  <b.icon className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{b.title}</h3>
                <p className="text-gray-400 text-sm">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ────────────────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="glass-purple rounded-3xl p-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-blue-600/10" />
            <div className="relative">
              <Leaf className="w-12 h-12 text-green-400 mx-auto mb-4 animate-float" />
              <h2 className="text-3xl font-bold text-white mb-4">
                Start Farming Smarter Today
              </h2>
              <p className="text-gray-400 mb-8 max-w-lg mx-auto">
                Join thousands of farmers using AI to protect their crops and maximize yields.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/register" className="btn-primary flex items-center gap-2">
                  Create Free Account <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/about" className="btn-secondary">
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-4 text-center text-gray-500 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Leaf className="w-4 h-4 text-green-400" />
          <span className="text-white font-medium">Autonomous Smart Farming Agent</span>
        </div>
        <p>Built with React, Node.js, and AI/ML • Final Year Project Demo</p>
      </footer>
    </div>
  );
}
