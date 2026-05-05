/**
 * Navbar — responsive, shows Sign In / Sign Up when logged out,
 * user avatar + logout when logged in.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Leaf, LayoutDashboard, CloudSun, FlaskConical, Droplets,
  Sprout, History, Info, Menu, X, LogOut, ChevronDown,
  UserCircle2, Home
} from 'lucide-react';

const navLinks = [
  { path: '/',          label: 'Home',       icon: Home,          public: true  },
  { path: '/dashboard', label: 'Dashboard',  icon: LayoutDashboard, public: false },
  { path: '/disease',   label: 'Disease',    icon: FlaskConical,  public: false },
  { path: '/weather',   label: 'Weather',    icon: CloudSun,      public: false },
  { path: '/soil',      label: 'Soil',       icon: Sprout,        public: false },
  { path: '/irrigation',label: 'Irrigation', icon: Droplets,      public: false },
  { path: '/crops',     label: 'Crops',      icon: Leaf,          public: false },
  { path: '/history',   label: 'History',    icon: History,       public: false },
  { path: '/about',     label: 'About',      icon: Info,          public: true  },
];

export default function Navbar() {
  const [isOpen,       setIsOpen]       = useState(false);
  const [scrolled,     setScrolled]     = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const menuRef  = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setIsOpen(false); setUserMenuOpen(false); }, [location.pathname]);

  // Close user dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setUserMenuOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  // Show all links when authenticated, only public links when not
  const visibleLinks = isAuthenticated ? navLinks : navLinks.filter((l) => l.public);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-dark-900/95 backdrop-blur-xl border-b border-white/5 shadow-xl' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-green-500 flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-white hidden sm:block">
              Smart<span className="text-gradient-purple">Farm</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-0.5">
            {visibleLinks.map(({ path, label, icon: Icon }) => (
              <Link key={path} to={path}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location.pathname === path
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}>
                <Icon className="w-3.5 h-3.5" />
                {label}
              </Link>
            ))}
          </div>

          {/* Auth section */}
          <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
            {isAuthenticated ? (
              <div className="relative" ref={menuRef}>
                <button onClick={() => setUserMenuOpen((p) => !p)}
                  className="flex items-center gap-2 px-3 py-2 glass rounded-xl hover:bg-white/10 transition-all">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-green-500 flex items-center justify-center text-xs font-black text-white">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-300 max-w-[100px] truncate">{user?.name}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 glass rounded-2xl shadow-2xl shadow-purple-500/10 border border-white/10 overflow-hidden animate-slide-up">
                    <div className="px-4 py-3 border-b border-white/10">
                      <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                      <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                      {user?.location && <p className="text-xs text-gray-500 truncate">📍 {user.location}</p>}
                    </div>
                    <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 transition-colors">
                      <LayoutDashboard className="w-4 h-4 text-purple-400" /> Dashboard
                    </Link>
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/signin"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-300 hover:text-white transition-all hover:bg-white/5"
                  style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                  Sign In
                </Link>
                <Link to="/signup"
                  className="px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 active:scale-95"
                  style={{ background: 'linear-gradient(135deg,#7c3aed,#16a34a)', boxShadow: '0 4px 15px rgba(124,58,237,0.3)' }}>
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setIsOpen((p) => !p)}
            className="lg:hidden p-2 rounded-lg glass hover:bg-white/10 transition-colors"
            aria-label="Toggle menu">
            {isOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="lg:hidden border-t border-white/5 animate-slide-up"
             style={{ background: 'rgba(10,10,15,0.98)', backdropFilter: 'blur(20px)' }}>
          <div className="px-4 py-4 space-y-1">
            {visibleLinks.map(({ path, label, icon: Icon }) => (
              <Link key={path} to={path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  location.pathname === path
                    ? 'bg-purple-500/20 text-purple-400'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}>
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}

            <div className="pt-3 border-t border-white/10 space-y-2">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-green-500 flex items-center justify-center text-sm font-black text-white">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{user?.name}</p>
                      <p className="text-gray-500 text-xs">{user?.email}</p>
                    </div>
                  </div>
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/signin" className="block text-center py-3 rounded-xl text-sm font-semibold text-gray-300 hover:text-white transition-all"
                        style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                    Sign In
                  </Link>
                  <Link to="/signup" className="block text-center py-3 rounded-xl text-sm font-bold text-white"
                        style={{ background: 'linear-gradient(135deg,#7c3aed,#16a34a)' }}>
                    Create Account
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
