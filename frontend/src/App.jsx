import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Chatbot from './components/Chatbot';
import ProtectedRoute from './components/ProtectedRoute';

// Public pages
import HomePage    from './pages/HomePage';
import SignInPage  from './pages/SignInPage';
import SignUpPage  from './pages/SignUpPage';
import AboutPage   from './pages/AboutPage';

// Protected pages
import DashboardPage  from './pages/DashboardPage';
import DiseasePage    from './pages/DiseasePage';
import WeatherPage    from './pages/WeatherPage';
import SoilPage       from './pages/SoilPage';
import IrrigationPage from './pages/IrrigationPage';
import CropsPage      from './pages/CropsPage';
import HistoryPage    from './pages/HistoryPage';

const Protected = ({ children }) => <ProtectedRoute>{children}</ProtectedRoute>;

export default function App() {
  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />
      <main>
        <Routes>
          {/* ── Public ─────────────────────────────────────────────────── */}
          <Route path="/"       element={<HomePage />} />
          <Route path="/about"  element={<AboutPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />

          {/* Legacy aliases so old links still work */}
          <Route path="/login"    element={<Navigate to="/signin" replace />} />
          <Route path="/register" element={<Navigate to="/signup" replace />} />

          {/* ── Protected ──────────────────────────────────────────────── */}
          <Route path="/dashboard"  element={<Protected><DashboardPage /></Protected>} />
          <Route path="/disease"    element={<Protected><DiseasePage /></Protected>} />
          <Route path="/weather"    element={<Protected><WeatherPage /></Protected>} />
          <Route path="/soil"       element={<Protected><SoilPage /></Protected>} />
          <Route path="/irrigation" element={<Protected><IrrigationPage /></Protected>} />
          <Route path="/crops"      element={<Protected><CropsPage /></Protected>} />
          <Route path="/history"    element={<Protected><HistoryPage /></Protected>} />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Chatbot />
    </div>
  );
}
