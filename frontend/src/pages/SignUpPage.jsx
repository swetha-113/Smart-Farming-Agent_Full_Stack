/**
 * Sign Up Page — clean modern UI, correct field mapping
 * Fields: name, email, password, confirmPassword, location (all separate)
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Leaf, Mail, Lock, Eye, EyeOff, User, MapPin,
  UserPlus, LogIn, AlertCircle, CheckCircle2, Sprout
} from 'lucide-react';

/* Password strength indicator */
const PasswordStrength = ({ password }) => {
  if (!password) return null;
  const checks = [
    password.length >= 6,
    password.length >= 10,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score  = checks.filter(Boolean).length;
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  const colors = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'];
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1,2,3,4,5].map((i) => (
          <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
               style={{ background: i <= score ? colors[score] : 'rgba(255,255,255,0.1)' }} />
        ))}
      </div>
      <p className="text-xs" style={{ color: colors[score] || '#9ca3af' }}>{labels[score]}</p>
    </div>
  );
};

/* Reusable input wrapper with left icon */
const Field = ({ label, optional, error, icon: Icon, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-300 mb-1.5">
      {label}{optional && <span className="text-gray-600 font-normal ml-1">(optional)</span>}
    </label>
    <div className="relative">
      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
        <Icon className="w-4 h-4 text-gray-500" />
      </span>
      {children}
    </div>
    {error && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
  </div>
);

const inputCls = (hasError) =>
  `w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-gray-500
   border transition-all duration-200 focus:outline-none
   ${hasError
     ? 'bg-red-500/5 border-red-500/50 focus:border-red-500/70'
     : 'bg-white/5 border-white/10 focus:border-green-500/50 focus:bg-white/8'}`;

export default function SignUpPage() {
  const { signup } = useAuth();
  const navigate   = useNavigate();

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', location: '',
  });
  const [errors,   setErrors]   = useState({});
  const [showPwd,  setShowPwd]  = useState(false);
  const [showCPwd, setShowCPwd] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [apiErr,   setApiErr]   = useState('');

  /* Update a single field, clear its error */
  const set = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    setErrors((p) => ({ ...p, [field]: '' }));
    setApiErr('');
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim() || form.name.trim().length < 2)
      e.name = 'Name must be at least 2 characters';
    if (!form.email.trim())
      e.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email.trim()))
      e.email = 'Enter a valid email address';
    if (!form.password)
      e.password = 'Password is required';
    else if (form.password.length < 6)
      e.password = 'Minimum 6 characters';
    if (!form.confirmPassword)
      e.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword)
      e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiErr('');
    if (!validate()) return;
    setLoading(true);
    try {
      await signup(form.name, form.email, form.password, form.location);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setApiErr(err.message || 'Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const pwdMatch = form.confirmPassword && form.password === form.confirmPassword;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 relative overflow-hidden"
         style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #0d1a0d 50%, #0a0a1a 100%)' }}>

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-[120px]"
             style={{ background: 'rgba(34,197,94,0.08)', transform: 'translate(30%,-30%)' }} />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-[120px]"
             style={{ background: 'rgba(168,85,247,0.10)', transform: 'translate(-30%,30%)' }} />
        <div className="absolute inset-0 dots-bg opacity-20" />
      </div>

      <div className="relative w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-7">
          <Link to="/" className="inline-flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl
                            group-hover:scale-110 transition-transform duration-300"
                 style={{ background: 'linear-gradient(135deg,#16a34a,#3b82f6,#7c3aed)' }}>
              <Leaf className="w-7 h-7 text-white" />
            </div>
            <span className="text-xl font-black text-white">
              Smart<span className="text-gradient">Farm</span>
            </span>
          </Link>
          <p className="text-gray-500 text-sm mt-1">Create your free farming account</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-7 shadow-2xl"
             style={{
               background: 'rgba(13,13,20,0.92)',
               backdropFilter: 'blur(24px)',
               border: '1px solid rgba(34,197,94,0.15)',
               boxShadow: '0 0 0 1px rgba(34,197,94,0.08), 0 25px 50px rgba(0,0,0,0.5)',
             }}>

          <h1 className="text-xl font-bold text-white mb-0.5">Join Smart Farming 🌱</h1>
          <p className="text-gray-500 text-sm mb-5">Fill in your details to get started</p>

          {/* API error banner */}
          {apiErr && (
            <div className="flex items-start gap-2 px-3 py-2.5 mb-4 rounded-xl text-red-400 text-sm"
                 style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{apiErr}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate autoComplete="off" className="space-y-3.5">

            {/* Name */}
            <Field label="Full Name" error={errors.name} icon={User}>
              <input
                type="text"
                name="sf_name"
                value={form.name}
                onChange={set('name')}
                placeholder="e.g. Swetha Farmer"
                autoComplete="off"
                className={inputCls(!!errors.name)}
              />
            </Field>

            {/* Email */}
            <Field label="Email Address" error={errors.email} icon={Mail}>
              <input
                type="email"
                name="sf_email"
                value={form.email}
                onChange={set('email')}
                placeholder="you@example.com"
                autoComplete="off"
                className={inputCls(!!errors.email)}
              />
            </Field>

            {/* Location (optional) */}
            <Field label="Location" optional error={errors.location} icon={MapPin}>
              <input
                type="text"
                name="sf_location"
                value={form.location}
                onChange={set('location')}
                placeholder="e.g. Punjab, India"
                autoComplete="off"
                className={inputCls(false)}
              />
            </Field>

            {/* Password */}
            <Field label="Password" error={errors.password} icon={Lock}>
              <input
                type={showPwd ? 'text' : 'password'}
                name="sf_password"
                value={form.password}
                onChange={set('password')}
                placeholder="Min. 6 characters"
                autoComplete="new-password"
                className={`${inputCls(!!errors.password)} pr-10`}
              />
              <button type="button" onClick={() => setShowPwd((p) => !p)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-300">
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <PasswordStrength password={form.password} />
            </Field>

            {/* Confirm Password */}
            <Field label="Confirm Password" error={errors.confirmPassword} icon={Lock}>
              <input
                type={showCPwd ? 'text' : 'password'}
                name="sf_confirm_password"
                value={form.confirmPassword}
                onChange={set('confirmPassword')}
                placeholder="Re-enter password"
                autoComplete="new-password"
                className={`${inputCls(!!errors.confirmPassword)} pr-10`}
              />
              <button type="button" onClick={() => setShowCPwd((p) => !p)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-300">
                {showCPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              {pwdMatch && (
                <span className="absolute inset-y-0 right-8 flex items-center pointer-events-none">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                </span>
              )}
            </Field>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-white text-sm mt-1
                         transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100
                         flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg,#16a34a,#3b82f6,#7c3aed)',
                boxShadow: '0 8px 25px rgba(34,197,94,0.25)',
              }}>
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating account...</>
              ) : (
                <><UserPlus className="w-4 h-4" />Create Account</>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-gray-600 text-xs">Already have an account?</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <Link to="/signin"
            className="w-full py-2.5 rounded-xl font-semibold text-sm text-center block
                       text-purple-400 hover:text-purple-300 transition-colors
                       flex items-center justify-center gap-2"
            style={{ border: '1px solid rgba(168,85,247,0.25)', background: 'rgba(168,85,247,0.05)' }}>
            <LogIn className="w-4 h-4" />
            Sign in instead
          </Link>
        </div>
      </div>
    </div>
  );
}
