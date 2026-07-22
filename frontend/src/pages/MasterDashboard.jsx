import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import {
  Activity, Globe, Briefcase, Settings, LogOut,
  Search, TrendingUp, TrendingDown,
  Cpu, AlertTriangle, Zap, Radio, RefreshCw
} from 'lucide-react';
import { authHeaders, API_BASE, getUser, clearAuth } from '../lib/auth';

export default function MasterDashboard() {
  const navigate = useNavigate();
  const user = getUser();

  const [stats, setStats] = useState(null);
  const [news, setNews] = useState([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingNews, setIsLoadingNews] = useState(true);
  const [error, setError] = useState('');
  const [liveCount, setLiveCount] = useState(0);

  // Fetch dashboard stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/news/stats`, { headers: authHeaders() });
      if (res.status === 401) { handleLogout(); return; }
      const data = await res.json();
      setStats(data);
    } catch {
      setError('Could not load stats.');
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  // Fetch news feed
  const fetchNews = useCallback(async () => {
    setIsLoadingNews(true);
    try {
      const res = await fetch(`${API_BASE}/api/news?limit=20`, { headers: authHeaders() });
      if (res.status === 401) { handleLogout(); return; }
      const data = await res.json();
      setNews(data.news || []);
    } catch {
      setError('Could not load news feed.');
    } finally {
      setIsLoadingNews(false);
    }
  }, []);

  // Initial load + Socket.IO for live updates
  useEffect(() => {
    fetchStats();
    fetchNews();

    const socket = io(API_BASE || 'http://localhost:5000');
    if (user?.id) socket.emit('join_user_room', user.id);

    // New analyzed article arrives — prepend to feed
    socket.on('news_analyzed', (article) => {
      setNews(prev => [article, ...prev.slice(0, 19)]);
      setLiveCount(c => c + 1);
      // Refresh stats every 5 live articles
      setLiveCount(c => { if (c % 5 === 0) fetchStats(); return c; });
    });

    return () => socket.disconnect();
  }, [fetchStats, fetchNews]);

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const getImportanceBadge = (level) => {
    switch (level) {
      case 'CRITICAL': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'HIGH':     return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'MEDIUM':   return 'bg-yellow-400/20 text-yellow-400 border-yellow-400/50';
      default:         return 'bg-blue-400/20 text-blue-400 border-blue-400/50';
    }
  };

  const getSentimentColor = (sentiment) => {
    if (sentiment === 'BULLISH') return 'text-emerald-400';
    if (sentiment === 'BEARISH') return 'text-red-400';
    return 'text-yellow-400';
  };

  const statCards = stats ? [
    {
      label: 'System Status',
      value: stats.systemStatus,
      icon: <Radio className="w-5 h-5 text-emerald-400" />,
      color: 'text-emerald-400'
    },
    {
      label: 'Analyzed (24h)',
      value: stats.analyzed24h.toLocaleString(),
      icon: <Cpu className="w-5 h-5 text-cyan-400" />,
      color: 'text-cyan-400'
    },
    {
      label: 'Critical Alerts',
      value: stats.criticalAlerts,
      icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
      color: 'text-red-500'
    },
    {
      label: 'Market Sentiment',
      value: stats.marketSentiment,
      icon: stats.marketSentiment === 'BULLISH'
        ? <TrendingUp className="w-5 h-5 text-emerald-400" />
        : <TrendingDown className="w-5 h-5 text-red-400" />,
      color: getSentimentColor(stats.marketSentiment)
    }
  ] : [];

  return (
    <div className="min-h-screen bg-[#0B1220] flex flex-col font-sans">

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-black/40 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex items-center justify-between">

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.2)]">
            <Activity className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide leading-tight">TRACK</h1>
            <p className="text-[10px] text-cyan-400 uppercase tracking-widest font-mono">Terminal v1.0</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
          <Link to="/dashboard" className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm font-medium">
            Live Feed
          </Link>
          <Link to="/map" className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 text-sm font-medium transition-colors flex items-center gap-2">
            <Globe className="w-4 h-4" /> Map
          </Link>
          <Link to="/portfolio" className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 text-sm font-medium transition-colors flex items-center gap-2">
            <Briefcase className="w-4 h-4" /> Portfolio Rules
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <div className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search stocks, themes..."
              className="bg-black/50 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 w-64 transition-all"
            />
          </div>
          <button
            onClick={fetchNews}
            title="Refresh feed"
            className="p-2 text-gray-400 hover:text-cyan-400 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <Link to="/admin" className="p-2 text-gray-400 hover:text-white transition-colors">
            <Settings className="w-5 h-5" />
          </Link>
          <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-400 transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="mx-6 mt-4 bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Live Feed */}
        <div className="lg:col-span-8 space-y-6">

          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {isLoadingStats
              ? [1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 h-20 animate-pulse" />
                ))
              : statCards.map((stat, idx) => (
                  <div key={idx} className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col justify-between hover:border-white/20 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.label}</span>
                      {stat.icon}
                    </div>
                    <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
                  </div>
                ))
            }
          </div>

          {/* Feed Header */}
          <div className="flex items-center justify-between mt-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              Live Intelligence Feed
            </h2>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              LIVE · {liveCount} NEW
            </div>
          </div>

          {/* Feed Content */}
          <div className="space-y-4">
            {isLoadingNews
              ? [1, 2, 3].map(i => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 h-48 animate-pulse" />
                ))
              : news.length === 0
                ? (
                  <div className="text-center py-16 text-gray-500">
                    <Cpu className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p>No analyzed articles yet. The AI queue will populate this feed automatically.</p>
                  </div>
                )
                : news.map((article) => (
                  <div
                    key={article._id}
                    className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:border-cyan-500/30 transition-all group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 group-hover:from-cyan-500/5 transition-all duration-500"></div>

                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${getImportanceBadge(article.importance)}`}>
                            {article.importance}
                          </span>
                          <span className="text-xs text-gray-500 font-mono">
                            {new Date(article.publishDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {article.originalUrl && (
                          <a
                            href={article.originalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-cyan-400/60 hover:text-cyan-400 transition-colors"
                          >
                            Source ↗
                          </a>
                        )}
                      </div>

                      <h3 className="text-lg font-semibold text-white mb-2 leading-tight">
                        {article.title}
                      </h3>

                      <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                        {article.aiSummary}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-4 border-t border-white/10">
                        {article.positiveStocks?.length > 0 && (
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-emerald-400" />
                            <div className="flex flex-wrap gap-1.5">
                              {article.positiveStocks.map(stock => (
                                <button
                                  key={stock}
                                  onClick={() => navigate(`/stock/${stock}`)}
                                  className="text-xs font-medium text-emerald-400 bg-emerald-400/10 hover:bg-emerald-400/20 px-2 py-1 rounded transition-colors"
                                >
                                  {stock}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        {article.negativeStocks?.length > 0 && (
                          <div className="flex items-center gap-2">
                            <TrendingDown className="w-4 h-4 text-red-400" />
                            <div className="flex flex-wrap gap-1.5">
                              {article.negativeStocks.map(stock => (
                                <button
                                  key={stock}
                                  onClick={() => navigate(`/stock/${stock}`)}
                                  className="text-xs font-medium text-red-400 bg-red-400/10 hover:bg-red-400/20 px-2 py-1 rounded transition-colors"
                                >
                                  {stock}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
            }
          </div>
        </div>

        {/* Right Column: Themes + Prompt */}
        <div className="lg:col-span-4 space-y-6">

          {/* Top Themes (live from API) */}
          <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-3 flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" /> Macro Themes
            </h3>
            <div className="space-y-3">
              {isLoadingStats
                ? [1, 2, 3, 4].map(i => (
                    <div key={i} className="h-8 bg-white/5 rounded-lg animate-pulse" />
                  ))
                : (stats?.topThemes || []).length > 0
                  ? stats.topThemes.map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg cursor-pointer transition-colors">
                        <span className="text-sm text-gray-300">{item.theme}</span>
                        <span className="text-xs text-gray-500 font-mono">{item.count} items</span>
                      </div>
                    ))
                  : <p className="text-xs text-gray-500 text-center py-4">No theme data yet.</p>
              }
            </div>
          </div>

          {/* CTA Card */}
          <div className="bg-gradient-to-br from-cyan-900/40 to-blue-900/40 border border-cyan-500/30 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-[40px] pointer-events-none"></div>
            <h3 className="text-lg font-bold text-white mb-2">Automate Your Intelligence</h3>
            <p className="text-sm text-cyan-100/70 mb-4 leading-relaxed">
              Set up natural language rules to have the AI monitor specific sectors or portfolio stocks for you.
            </p>
            <button
              onClick={() => navigate('/portfolio')}
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold py-2.5 rounded-xl transition-colors text-sm shadow-[0_0_15px_rgba(34,211,238,0.4)] hover:shadow-[0_0_25px_rgba(34,211,238,0.6)]"
            >
              Configure Smart Alerts
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}
