import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1a1a35',
              color: '#e2e8f0',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              borderRadius: '12px',
            },
            success: {
              iconTheme: { primary: '#4ade80', secondary: '#0a0a0f' },
            },
            error: {
              iconTheme: { primary: '#f87171', secondary: '#0a0a0f' },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
