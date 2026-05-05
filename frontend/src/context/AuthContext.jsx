/**
 * Auth Context
 * Uses relative /api paths → Vite proxy → backend on localhost:5001
 * No CORS issues, works on any port (5173, 5174, etc.)
 *
 * signup  POST /api/auth/signup  { name, email, password, location }
 * login   POST /api/auth/login   { email, password }
 * profile GET  /api/auth/profile
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

// Relative baseURL — goes through Vite proxy, no CORS
const authApi = axios.create({
  baseURL: '',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Friendly error messages
authApi.interceptors.response.use(
  (res) => res,
  (err) => {
    let message;
    if (!err.response) {
      message = 'Backend server is not running. Please start the backend on port 5001.';
    } else {
      const status    = err.response.status;
      const serverMsg = err.response.data?.message;
      if (status === 401) message = serverMsg || 'Invalid email or password.';
      else if (status === 400) message = serverMsg || 'Please check your input.';
      else if (status === 500) message = serverMsg || 'Server error. Please try again.';
      else message = serverMsg || err.message || 'Something went wrong.';
    }
    return Promise.reject(new Error(message));
  }
);

const setAuthHeader = (token) => {
  if (token) {
    authApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    axios.defaults.headers.common['Authorization']   = `Bearer ${token}`;
  } else {
    delete authApi.defaults.headers.common['Authorization'];
    delete axios.defaults.headers.common['Authorization'];
  }
};

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(() => localStorage.getItem('sf_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      setAuthHeader(token);
      fetchProfile();
    } else {
      setAuthHeader(null);
      setLoading(false);
    }
  }, [token]);

  const fetchProfile = async () => {
    try {
      const res = await authApi.get('/api/auth/profile');
      setUser(res.data.user);
    } catch {
      clearAuth();
    } finally {
      setLoading(false);
    }
  };

  const clearAuth = () => {
    localStorage.removeItem('sf_token');
    setToken(null);
    setUser(null);
    setAuthHeader(null);
  };

  // POST /api/auth/signup — { name, email, password, location }
  const signup = async (name, email, password, location = '') => {
    const res = await authApi.post('/api/auth/signup', {
      name:     name.trim(),
      email:    email.trim().toLowerCase(),
      password,
      location: location.trim(),
    });
    const { token: t, user: u } = res.data;
    localStorage.setItem('sf_token', t);
    setAuthHeader(t);
    setToken(t);
    setUser(u);
    toast.success(`Welcome, ${u.name}! 🌱`);
    return res.data;
  };

  // POST /api/auth/login — { email, password }
  const login = async (email, password) => {
    const res = await authApi.post('/api/auth/login', {
      email:    email.trim().toLowerCase(),
      password,
    });
    const { token: t, user: u } = res.data;
    localStorage.setItem('sf_token', t);
    setAuthHeader(t);
    setToken(t);
    setUser(u);
    toast.success(`Welcome back, ${u.name}! 🌿`);
    return res.data;
  };

  const logout = () => {
    clearAuth();
    toast.success('Signed out successfully');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      signup,
      login,
      logout,
      signin:          login,
      register:        signup,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
