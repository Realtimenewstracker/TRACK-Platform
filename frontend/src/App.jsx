import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Pages
import AuthScreen from './pages/AuthScreen';
import MasterDashboard from './pages/MasterDashboard';
import StockIntelligence from './pages/StockIntelligence';
import GeopoliticalMap from './pages/GeopoliticalMap';
import PortfolioIntelligence from './pages/PortfolioIntelligence';
import AdminPanel from './pages/admin/AdminPanel';

// Global UI overlays
import NotificationCenter from './components/ui/NotificationCenter';
import AIChat from './components/ui/AIChat';
import ProtectedRoute from './components/ui/ProtectedRoute';

export default function App() {
  return (
    <Router>
      <div className="relative min-h-screen bg-[#0B1220] text-white font-sans overflow-x-hidden">
        <Routes>
          {/* Public */}
          <Route path="/login" element={<AuthScreen />} />

          {/* Protected routes — all require a valid JWT */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <>
                  <NotificationCenter />
                  <AIChat />
                  <MasterDashboard />
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/stock/:ticker"
            element={<ProtectedRoute><StockIntelligence /></ProtectedRoute>}
          />
          <Route
            path="/map"
            element={<ProtectedRoute><GeopoliticalMap /></ProtectedRoute>}
          />
          <Route
            path="/portfolio"
            element={<ProtectedRoute><PortfolioIntelligence /></ProtectedRoute>}
          />
          {/* Admin-only — regular users are redirected to /dashboard */}
          <Route
            path="/admin"
            element={<ProtectedRoute adminOnly><AdminPanel /></ProtectedRoute>}
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}
