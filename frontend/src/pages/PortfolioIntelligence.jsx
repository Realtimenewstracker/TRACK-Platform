import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase, ArrowLeft, Plus, BellRing, Target,
  TrendingUp, AlertCircle, Play, Square, Activity,
  Globe, Loader2, Trash2
} from 'lucide-react';
import { authHeaders, API_BASE } from '../lib/auth';

export default function PortfolioIntelligence() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const [newRule, setNewRule] = useState({
    name: '',
    type: 'STOCK_MENTION',
    target: '',
    minImportance: 'MEDIUM'
  });

  // Load alerts from database on mount
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/alerts`, { headers: authHeaders() });
        if (res.status === 401) { navigate('/login'); return; }
        const data = await res.json();
        setAlerts(data);
      } catch {
        setError('Could not load alert rules.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAlerts();
  }, [navigate]);

  const toggleAlertStatus = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/alerts/${id}/toggle`, {
        method: 'PATCH',
        headers: authHeaders()
      });
      const updated = await res.json();
      setAlerts(alerts.map(a => a._id === id ? updated : a));
    } catch {
      setError('Could not update alert.');
    }
  };

  const deleteAlert = async (id) => {
    try {
      await fetch(`${API_BASE}/api/alerts/${id}`, {
        method: 'DELETE',
        headers: authHeaders()
      });
      setAlerts(alerts.filter(a => a._id !== id));
    } catch {
      setError('Could not delete alert.');
    }
  };

  const handleCreateRule = async (e) => {
    e.preventDefault();
    if (!newRule.name || !newRule.target) return;
    setIsSaving(true);
    setError('');

    try {
      const body = {
        name: newRule.name,
        type: newRule.type,
        minImportance: newRule.minImportance,
        ...(newRule.type === 'STOCK_MENTION'
          ? { targetTickers: newRule.target.split(',').map(s => s.trim().toUpperCase()) }
          : { targetTheme: newRule.target })
      };

      const res = await fetch(`${API_BASE}/api/alerts`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(body)
      });

      const created = await res.json();
      if (!res.ok) throw new Error(created.error);

      setAlerts([created, ...alerts]);
      setNewRule({ name: '', type: 'STOCK_MENTION', target: '', minImportance: 'MEDIUM' });
    } catch (err) {
      setError(err.message || 'Could not create alert rule.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1220] flex flex-col font-sans">

      {/* Header */}
      <header className="flex items-center justify-between p-6 border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-300" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.2)]">
              <Briefcase className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-wide">Smart Alert Rules</h1>
              <p className="text-xs text-purple-400 uppercase tracking-widest font-mono">Portfolio & Theme Engine</p>
            </div>
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="mx-6 mt-4 bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Column: Active Rules */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              Active Monitoring Protocols
            </h2>
            <span className="text-sm font-mono text-gray-400 bg-white/5 px-3 py-1 rounded-full border border-white/10">
              {alerts.filter(a => a.isActive).length} / {alerts.length} ONLINE
            </span>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            </div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <BellRing className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No active rules yet. Create one using the form →</p>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.map(alert => (
                <div
                  key={alert._id}
                  className={`bg-black/40 backdrop-blur-md border rounded-2xl p-5 transition-all ${
                    alert.isActive
                      ? 'border-cyan-500/30 shadow-[0_0_20px_rgba(34,211,238,0.05)]'
                      : 'border-white/5 opacity-60'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl border ${
                        alert.isActive
                          ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                          : 'bg-gray-800 border-gray-700 text-gray-500'
                      }`}>
                        {alert.type === 'STOCK_MENTION' ? <Target className="w-6 h-6" /> : <TrendingUp className="w-6 h-6" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-semibold text-white">{alert.name}</h3>
                          <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-mono border ${
                            alert.isActive
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-gray-800 text-gray-400 border-gray-700'
                          }`}>
                            {alert.isActive ? 'ACTIVE' : 'STANDBY'}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-400 mt-2">
                          <span className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded border border-white/5">
                            <span className="text-gray-500 text-xs uppercase tracking-wider">Target:</span>
                            <span className="text-white font-mono">
                              {alert.targetTickers?.join(', ') || alert.targetTheme || '—'}
                            </span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <AlertCircle className="w-4 h-4 text-gray-500" />
                            Min: {alert.minImportance}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleAlertStatus(alert._id)}
                        className={`p-2 rounded-lg border transition-colors ${
                          alert.isActive
                            ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                        }`}
                      >
                        {alert.isActive ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                      </button>
                      <button
                        onClick={() => deleteAlert(alert._id)}
                        className="p-2 rounded-lg border border-white/10 text-gray-500 hover:text-red-400 hover:border-red-500/30 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Rule Creator */}
        <div className="lg:col-span-4">
          <div className="bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-2xl p-6 sticky top-28">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <BellRing className="w-5 h-5 text-purple-400" />
              Establish New Rule
            </h3>

            <form onSubmit={handleCreateRule} className="space-y-5">
              {/* Rule Name */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-gray-400 uppercase tracking-wider">Rule Designation</label>
                <input
                  type="text"
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  placeholder="e.g. Reliance Bear Case"
                  className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition-all"
                  required
                />
              </div>

              {/* Type Selection */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-gray-400 uppercase tracking-wider">Tracking Vector</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewRule({ ...newRule, type: 'STOCK_MENTION' })}
                    className={`p-3 border rounded-xl flex flex-col items-center gap-2 transition-all ${
                      newRule.type === 'STOCK_MENTION'
                        ? 'bg-purple-500/20 border-purple-500/50 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                        : 'bg-black/40 border-white/10 text-gray-500 hover:border-white/30'
                    }`}
                  >
                    <Target className="w-5 h-5" />
                    <span className="text-xs font-semibold">Specific Stock</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewRule({ ...newRule, type: 'MACRO_THEME' })}
                    className={`p-3 border rounded-xl flex flex-col items-center gap-2 transition-all ${
                      newRule.type === 'MACRO_THEME'
                        ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                        : 'bg-black/40 border-white/10 text-gray-500 hover:border-white/30'
                    }`}
                  >
                    {/* Globe was missing from imports in the original — fixed */}
                    <Globe className="w-5 h-5" />
                    <span className="text-xs font-semibold">Macro Theme</span>
                  </button>
                </div>
              </div>

              {/* Target Input */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-gray-400 uppercase tracking-wider">
                  Target {newRule.type === 'STOCK_MENTION' ? 'Ticker(s)' : 'Sector / Theme'}
                </label>
                <input
                  type="text"
                  value={newRule.target}
                  onChange={(e) => setNewRule({ ...newRule, target: e.target.value })}
                  placeholder={newRule.type === 'STOCK_MENTION' ? 'e.g. RELIANCE, TCS' : 'e.g. IT Services, Inflation'}
                  className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition-all font-mono"
                  required
                />
              </div>

              {/* Threshold Selection */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-gray-400 uppercase tracking-wider">Severity Threshold</label>
                <select
                  value={newRule.minImportance}
                  onChange={(e) => setNewRule({ ...newRule, minImportance: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all appearance-none"
                >
                  <option value="LOW">LOW — Notify on any mention</option>
                  <option value="MEDIUM">MEDIUM — Moderate impact or higher</option>
                  <option value="HIGH">HIGH — Significant market-moving news</option>
                  <option value="CRITICAL">CRITICAL — Major shocks only</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-300 mt-6 shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] disabled:opacity-50"
              >
                {isSaving
                  ? <Loader2 className="w-5 h-5 animate-spin" />
                  : <><Plus className="w-5 h-5" /> Initialize Protocol</>
                }
              </button>
            </form>
          </div>
        </div>

      </main>
    </div>
  );
}
