/**
 * Leaf Disease Detection Page
 * Colorful: purple, black, pink, green theme with glassmorphism
 */

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  FlaskConical, Upload, ImageIcon, AlertTriangle, CheckCircle2,
  Leaf, Shield, Zap, ChevronRight, RotateCcw, Download
} from 'lucide-react';
import { predictDisease } from '../utils/api';
import toast from 'react-hot-toast';

const severityConfig = {
  none:     { label: 'Healthy',  cls: 'text-green-400 bg-green-500/15 border-green-500/30' },
  mild:     { label: 'Mild',     cls: 'text-yellow-400 bg-yellow-500/15 border-yellow-500/30' },
  moderate: { label: 'Moderate', cls: 'text-orange-400 bg-orange-500/15 border-orange-500/30' },
  severe:   { label: 'Severe',   cls: 'text-red-400 bg-red-500/15 border-red-500/30' },
};

export default function DiseasePage() {
  const [file,     setFile]     = useState(null);
  const [preview,  setPreview]  = useState(null);
  const [result,   setResult]   = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const onDrop = useCallback((accepted) => {
    const f = accepted[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setError('');
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxSize: 5 * 1024 * 1024,
    multiple: false,
    onDropRejected: () => toast.error('File too large or invalid type (max 5 MB, images only)'),
  });

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const res = await predictDisease(file);
      setResult(res.data);
      toast.success('Analysis complete!');
    } catch (err) {
      setError(err.message || 'Analysis failed');
      toast.error('Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError('');
  };

  const sev = result ? (severityConfig[result.severity] || severityConfig.mild) : null;

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 relative overflow-hidden"
         style={{ background: 'radial-gradient(ellipse at top left, rgba(168,85,247,0.12) 0%, transparent 50%), radial-gradient(ellipse at bottom right, rgba(236,72,153,0.10) 0%, transparent 50%), #0a0a0f' }}>

      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600/15 rounded-full blur-[80px]" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-pink-600/12 rounded-full blur-[80px]" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-green-600/8 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute inset-0 dots-bg opacity-20" />
      </div>

      <div className="relative max-w-5xl mx-auto">

        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm text-pink-300 mb-4"
               style={{ background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.25)' }}>
            <FlaskConical className="w-4 h-4" />
            AI-Powered Leaf Analysis
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">
            Leaf Disease{' '}
            <span style={{ background: 'linear-gradient(135deg,#a855f7,#ec4899,#4ade80)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              Detection
            </span>
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Upload a clear photo of the affected leaf. Our AI model will identify the disease and provide treatment recommendations.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">

          {/* ── Left: Upload ──────────────────────────────────────────────── */}
          <div className="space-y-5">

            {/* Dropzone */}
            <div
              {...getRootProps()}
              className={`relative rounded-3xl p-1 cursor-pointer transition-all duration-300 ${
                isDragActive ? 'scale-[1.02]' : 'hover:scale-[1.01]'
              }`}
              style={{
                background: isDragActive
                  ? 'linear-gradient(135deg,rgba(168,85,247,0.5),rgba(236,72,153,0.5),rgba(74,222,128,0.5))'
                  : 'linear-gradient(135deg,rgba(168,85,247,0.25),rgba(236,72,153,0.2),rgba(74,222,128,0.2))',
              }}
            >
              <input {...getInputProps()} />
              <div className="rounded-[20px] p-8 text-center"
                   style={{ background: 'rgba(10,10,15,0.9)', backdropFilter: 'blur(12px)' }}>
                {preview ? (
                  <div className="space-y-4">
                    <div className="relative inline-block">
                      <img src={preview} alt="Leaf preview"
                           className="max-h-52 max-w-full rounded-2xl object-contain mx-auto shadow-2xl shadow-purple-500/20" />
                      <div className="absolute inset-0 rounded-2xl ring-2 ring-purple-500/40" />
                    </div>
                    <p className="text-gray-400 text-sm">{file?.name}</p>
                    <p className="text-gray-600 text-xs">Click or drag to replace</p>
                  </div>
                ) : (
                  <div className="py-6">
                    <div className="w-20 h-20 rounded-2xl mx-auto mb-5 flex items-center justify-center"
                         style={{ background: 'linear-gradient(135deg,rgba(168,85,247,0.2),rgba(236,72,153,0.2))' }}>
                      {isDragActive
                        ? <Leaf className="w-10 h-10 text-green-400 animate-bounce" />
                        : <Upload className="w-10 h-10 text-purple-400" />}
                    </div>
                    <p className="text-white font-semibold text-lg mb-1">
                      {isDragActive ? 'Drop it here!' : 'Upload Leaf Image'}
                    </p>
                    <p className="text-gray-500 text-sm mb-4">Drag & drop or click to browse</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {['JPG', 'PNG', 'WEBP'].map((t) => (
                        <span key={t} className="px-2 py-0.5 rounded-md text-xs text-gray-400"
                              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                          {t}
                        </span>
                      ))}
                      <span className="px-2 py-0.5 rounded-md text-xs text-gray-400"
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        Max 5MB
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-red-400 text-sm"
                   style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleAnalyze}
                disabled={!file || loading}
                className="flex-1 py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2
                           transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]
                           disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#ec4899,#16a34a)', boxShadow: '0 8px 30px rgba(168,85,247,0.3)' }}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Analyze Leaf
                  </>
                )}
              </button>
              {(file || result) && (
                <button onClick={reset}
                  className="px-4 py-3.5 rounded-xl text-gray-400 hover:text-white transition-colors"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <RotateCcw className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Tips */}
            <div className="rounded-2xl p-4"
                 style={{ background: 'rgba(74,222,128,0.05)', border: '1px solid rgba(74,222,128,0.15)' }}>
              <p className="text-green-400 text-sm font-semibold mb-2 flex items-center gap-1">
                <Leaf className="w-4 h-4" /> Tips for best results
              </p>
              <ul className="text-gray-400 text-xs space-y-1">
                <li>• Use a clear, well-lit photo of the leaf</li>
                <li>• Focus on the affected area showing symptoms</li>
                <li>• Avoid blurry or dark images</li>
                <li>• Single leaf works better than whole plant</li>
              </ul>
            </div>
          </div>

          {/* ── Right: Results ────────────────────────────────────────────── */}
          <div>
            {!result && !loading && (
              <div className="h-full rounded-3xl flex flex-col items-center justify-center p-10 text-center"
                   style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4"
                     style={{ background: 'linear-gradient(135deg,rgba(168,85,247,0.15),rgba(236,72,153,0.15))' }}>
                  <ImageIcon className="w-10 h-10 text-purple-400" />
                </div>
                <p className="text-gray-400 font-medium mb-1">Results will appear here</p>
                <p className="text-gray-600 text-sm">Upload a leaf image and click Analyze</p>
              </div>
            )}

            {loading && (
              <div className="h-full rounded-3xl flex flex-col items-center justify-center p-10 text-center"
                   style={{ background: 'rgba(168,85,247,0.04)', border: '1px solid rgba(168,85,247,0.15)' }}>
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                     style={{ background: 'linear-gradient(135deg,rgba(168,85,247,0.2),rgba(236,72,153,0.2))' }}>
                  <FlaskConical className="w-10 h-10 text-purple-400 animate-pulse" />
                </div>
                <p className="text-white font-semibold mb-1">Analyzing leaf...</p>
                <p className="text-gray-500 text-sm">AI model is processing your image</p>
                <div className="flex gap-1 mt-4">
                  {[0,1,2].map((i) => (
                    <div key={i} className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"
                         style={{ animationDelay: `${i*0.15}s` }} />
                  ))}
                </div>
              </div>
            )}

            {result && (
              <div className="space-y-4 animate-fade-in">

                {/* Disease name + confidence */}
                <div className="rounded-2xl p-5 relative overflow-hidden"
                     style={{ background: 'linear-gradient(135deg,rgba(168,85,247,0.12),rgba(236,72,153,0.08))', border: '1px solid rgba(168,85,247,0.25)' }}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="text-gray-400 text-xs mb-1">Detected Disease</p>
                      <h2 className="text-xl font-black text-white">{result.disease}</h2>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border flex-shrink-0 ${sev.cls}`}>
                      {sev.label}
                    </span>
                  </div>
                  {/* Confidence bar */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">Confidence</span>
                      <span className="text-white font-bold">{result.confidencePercent}</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                      <div className="h-full rounded-full transition-all duration-1000"
                           style={{
                             width: result.confidencePercent,
                             background: 'linear-gradient(90deg,#a855f7,#ec4899,#4ade80)',
                           }} />
                    </div>
                  </div>
                </div>

                {/* Cause */}
                <div className="rounded-2xl p-4"
                     style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <p className="text-pink-400 text-xs font-semibold uppercase tracking-wide mb-2">Cause</p>
                  <p className="text-gray-300 text-sm leading-relaxed">{result.cause}</p>
                </div>

                {/* Treatment */}
                <div className="rounded-2xl p-4"
                     style={{ background: 'rgba(74,222,128,0.05)', border: '1px solid rgba(74,222,128,0.2)' }}>
                  <p className="text-green-400 text-xs font-semibold uppercase tracking-wide mb-3 flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5" /> Treatment
                  </p>
                  <ul className="space-y-2">
                    {result.treatment.map((t, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                        <ChevronRight className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Prevention */}
                <div className="rounded-2xl p-4"
                     style={{ background: 'rgba(96,165,250,0.05)', border: '1px solid rgba(96,165,250,0.2)' }}>
                  <p className="text-blue-400 text-xs font-semibold uppercase tracking-wide mb-3 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Prevention
                  </p>
                  <ul className="space-y-2">
                    {result.prevention.map((p, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                        <ChevronRight className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>

                <p className="text-gray-600 text-xs text-center">
                  Analyzed at {new Date(result.analyzedAt).toLocaleString()}
                </p>

                {/* Color analysis breakdown */}
                {result.colorAnalysis && (
                  <div className="rounded-2xl p-4"
                       style={{ background: 'rgba(168,85,247,0.04)', border: '1px solid rgba(168,85,247,0.15)' }}>
                    <p className="text-purple-400 text-xs font-semibold uppercase tracking-wide mb-3">
                      Image Color Analysis
                    </p>
                    <div className="space-y-2">
                      {[
                        { label: 'Healthy Green', value: result.colorAnalysis.green,  color: '#4ade80' },
                        { label: 'Yellow Patches', value: result.colorAnalysis.yellow, color: '#facc15' },
                        { label: 'Brown Lesions',  value: result.colorAnalysis.brown,  color: '#a16207' },
                        { label: 'Dark/Necrotic',  value: result.colorAnalysis.dark,   color: '#6b7280' },
                        { label: 'White/Pale',     value: result.colorAnalysis.white,  color: '#e2e8f0' },
                      ].map((row) => (
                        <div key={row.label}>
                          <div className="flex justify-between text-xs mb-0.5">
                            <span className="text-gray-400">{row.label}</span>
                            <span className="text-white font-medium">{row.value}</span>
                          </div>
                          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{ width: row.value, background: row.color, opacity: 0.8 }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
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
