/**
 * Sign In Page — clean modern UI, correct field mapping
 * Fields: email (email only), password
 */

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, Mail, Lock, Eye, EyeOff, LogIn, Sprout, AlertCircle } from 'lucide-react';

const inputCls = (hasError) =>
  `w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-gray-500
   border transition-all duration-200 focus:outline-none
   ${hasError
     ? 'bg-red-500/5 border-red-500/50 focus:border-red-500/70'
     : 'bg-white/5 border-white/10 focus:border-purple-500/50 focus:bg-white/8'}`;

export default function SignInPage() {
  const { login } = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();
  const from       = location.state?.from?.pathname || '/dashboard';

  const [form,    setForm]    = useState({ email: '', password: '' });
  const [errors,  setErrors]  = useState({});
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiErr,  setApiErr]  = useState('');

  const set = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    setErrors((p) => ({ ...p, [field]: '' }));
    setApiErr('');
  };

  const validate = () => {
    const e = {};
    if (!form.email.trim())
      e.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email.trim()))
      e.email = 'Enter a valid email address';
    if (!form.password)
      e.password = 'Password is required';
    else if (form.password.length < 6)
      e.password = 'Minimum 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiErr('');
    if (!validate()) return;
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setApiErr(err.message || 'Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 relative overflow-hidden"
         style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #0f0a1a 50%, #0a0f0a 100%)' }}>

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full blur-[120px]"
             style={{ background: 'rgba(168,85,247,0.10)', transform: 'translate(-30%,-30%)' }} />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-[120px]"
             style={{ background: 'rgba(236,72,153,0.08)', transform: 'translate(30%,30%)' }} />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 rounded-full blur-[100px]"
             style={{ background: 'rgba(34,197,94,0.06)', transform: 'translate(-50%,-50%)' }} />
        <div className="absolute inset-0 dots-bg opacity-20" />
      </div>

      <div className="relative w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-7">
          <Link to="/" className="inline-flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl
                            group-hover:scale-110 transition-transform duration-300"
                 style={{ background: 'linear-gradient(135deg,#7c3aed,#ec4899,#16a34a)' }}>
              <Leaf className="w-7 h-7 text-white" />
            </div>
            <span className="text-xl font-black text-white">
              Smart<span className="text-gradient">Farm</span>
            </span>
          </Link>
          <p className="text-gray-500 text-sm mt-1">Sign in to your farming dashboard</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-7 shadow-2xl"
             style={{
               background: 'rgba(13,13,20,0.92)',
               backdropFilter: 'blur(24px)',
               border: '1px solid rgba(168,85,247,0.15)',
               boxShadow: '0 0 0 1px rgba(168,85,247,0.08), 0 25px 50px rgba(0,0,0,0.5)',
             }}>

          <h1 className="text-xl font-bold text-white mb-0.5">Welcome back 👋</h1>
          <p className="text-gray-500 text-sm mb-5">Enter your credentials to continue</p>

          {/* API error */}
          {apiErr && (
            <div className="flex items-start gap-2 px-3 py-2.5 mb-4 rounded-xl text-red-400 text-sm"
                 style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{apiErr}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate autoComplete="off" className="space-y-4">

            {/* Hidden honeypot inputs — prevent browser autofill from mapping wrong fields */}
            <input type="text"     style={{ display: 'none' }} aria-hidden="true" readOnly />
            <input type="password" style={{ display: 'none' }} aria-hidden="true" readOnly />

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                  <Mail className="w-4 h-4 text-gray-500" />
                </span>
                <input
                  type="email"
                  name="sf_email"
                  value={form.email}
                  onChange={set('email')}
                  placeholder="you@example.com"
                  autoComplete="username"
                  className={inputCls(!!errors.email)}
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />{errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                  <Lock className="w-4 h-4 text-gray-500" />
                </span>
                <input
                  type={showPwd ? 'text' : 'password'}
                  name="sf_password"
                  value={form.password}
                  onChange={set('password')}
                  placeholder="Your password"
                  autoComplete="current-password"
                  className={`${inputCls(!!errors.password)} pr-10`}
                />
                <button type="button" onClick={() => setShowPwd((p) => !p)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-300">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />{errors.password}
                </p>
              )}
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-white text-sm
                         transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100
                         flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg,#7c3aed,#ec4899,#3b82f6)',
                boxShadow: '0 8px 25px rgba(124,58,237,0.3)',
              }}>
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in...</>
              ) : (
                <><LogIn className="w-4 h-4" />Sign In</>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-gray-600 text-xs">Don't have an account?</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <Link to="/signup"
            className="w-full py-2.5 rounded-xl font-semibold text-sm text-center block
                       text-green-400 hover:text-green-300 transition-colors
                       flex items-center justify-center gap-2"
            style={{ border: '1px solid rgba(34,197,94,0.25)', background: 'rgba(34,197,94,0.05)' }}>
            <Sprout className="w-4 h-4" />
            Create a free account
          </Link>
        </div>
      </div>
    </div>
  );
}
