import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// --- PAGES ---
import AuthScreen from './pages/AuthScreen';
import MasterDashboard from './pages/MasterDashboard';
import StockIntelligence from './pages/StockIntelligence';
import GeopoliticalMap from './pages/GeopoliticalMap';
import PortfolioIntelligence from './pages/PortfolioIntelligence';
import AdminPanel from './pages/admin/AdminPanel';

// --- GLOBAL UI OVERLAYS ---
import NotificationCenter from './components/ui/NotificationCenter';
import AIChat from './components/ui/AIChat';

/**
 * Main Application Router
 * Note: In a full production environment, you would wrap the internal routes 
 * with a <ProtectedRoute> component that verifies the user's JWT token.
 */
export default function App() {
  return (
    <Router>
      {/* Global Application Wrapper (Ensures consistent background and text colors) */}
      <div className="relative min-h-screen bg-[#0B1220] text-white font-sans overflow-x-hidden">
        
        {/* --- GLOBAL COMPONENTS --- */}
        {/* These render on top of every page. You can uncomment them once you create the files. */}
        
        {/* <NotificationCenter /> */}
        
        {/* Fixed AI Assistant Chatbot (Bottom Right) */}
        {/* <div className="fixed bottom-6 right-6 z-40 w-96 hidden md:block">
          <AIChat />
        </div> */}

        {/* --- ROUTING ENGINE --- */}
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<AuthScreen />} />
          
          {/* Protected Application Routes */}
          <Route path="/dashboard" element={<MasterDashboard />} />
          
          {/* Dynamic route for specific stocks (e.g., /stock/RELIANCE) */}
          <Route path="/stock/:ticker" element={<StockIntelligence />} />
          
          <Route path="/map" element={<GeopoliticalMap />} />
          <Route path="/portfolio" element={<PortfolioIntelligence />} />
          
          {/* Admin / Settings */}
          <Route path="/admin" element={<AdminPanel />} />
          
          {/* Fallback Route: Redirects any unknown URL to the login screen */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        
      </div>
    </Router>
  );
}


