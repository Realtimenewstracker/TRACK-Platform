```react
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Activity, Globe, Briefcase, Settings, LogOut, 
  Search, Bell, TrendingUp, TrendingDown, 
  Cpu, AlertTriangle, Zap, Radio
} from 'lucide-react';

// --- MOCK DATA (Replaced by backend API in production) ---
const MOCK_STATS = [
  { label: "System Status", value: "ONLINE", icon: <Radio className="w-5 h-5 text-emerald-400" />, color: "text-emerald-400" },
  { label: "Analyzed (24h)", value: "1,284", icon: <Cpu className="w-5 h-5 text-cyan-400" />, color: "text-cyan-400" },
  { label: "Critical Alerts", value: "3", icon: <AlertTriangle className="w-5 h-5 text-red-500" />, color: "text-red-500" },
  { label: "Market Sentiment", value: "BEARISH", icon: <TrendingDown className="w-5 h-5 text-orange-500" />, color: "text-orange-500" },
];

const MOCK_NEWS = [
  {
    id: 1,
    title: "RBI Unexpectedly Hikes Repo Rate by 25 bps to Tame Inflation",
    time: "2 mins ago",
    importance: "CRITICAL",
    aiSummary: "The Reserve Bank of India raised rates to 6.75% citing persistent core inflation. This will immediately pressure credit-heavy sectors and auto demand.",
    positiveStocks: ["SBI", "HDFCBANK"],
    negativeStocks: ["TATAMOTORS", "DLF", "BAJFINANCE"],
    themes: ["Rate Hikes", "Inflation"]
  },
  {
    id: 2,
    title: "Government Announces ₹15,000 Crore PLI Scheme for Semiconductor Manufacturing",
    time: "14 mins ago",
    importance: "HIGH",
    aiSummary: "Major push for domestic tech manufacturing. Direct subsidies will improve margins for electronics manufacturers and localized supply chains.",
    positiveStocks: ["DIXON", "KAYNES", "CGPOWER"],
    negativeStocks: [],
    themes: ["Capex", "Technology"]
  },
  {
    id: 3,
    title: "Global Oil Prices Drop Below $75 Amid Demand Concerns",
    time: "1 hour ago",
    importance: "MEDIUM",
    aiSummary: "Falling crude prices provide margin relief to paint, aviation, and FMCG sectors, while negatively impacting upstream oil explorers.",
    positiveStocks: ["ASIANPAINT", "INDIGO", "HUL"],
    negativeStocks: ["ONGC", "OIL"],
    themes: ["Commodities", "Energy"]
  }
];

export default function MasterDashboard() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  // Simulate initial data loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const getImportanceBadge = (level) => {
    switch(level) {
      case 'CRITICAL': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'HIGH': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'MEDIUM': return 'bg-yellow-400/20 text-yellow-400 border-yellow-400/50';
      default: return 'bg-blue-400/20 text-blue-400 border-blue-400/50';
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1220] flex flex-col font-sans">
      
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-black/40 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex items-center justify-between">
        
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.2)]">
            <Activity className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide leading-tight">TRACK</h1>
            <p className="text-[10px] text-cyan-400 uppercase tracking-widest font-mono">Terminal v1.0</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
          <Link to="/dashboard" className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm font-medium transition-colors">
            Live Feed
          </Link>
          <Link to="/map" className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 text-sm font-medium transition-colors flex items-center gap-2">
            <Globe className="w-4 h-4" /> Map
          </Link>
          <Link to="/portfolio" className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 text-sm font-medium transition-colors flex items-center gap-2">
            <Briefcase className="w-4 h-4" /> Portfolio Rules
          </Link>
        </nav>

        {/* Search & Actions */}
        <div className="flex items-center gap-4">
          <div className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search stocks, themes..." 
              className="bg-black/50 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 w-64 transition-all"
            />
          </div>
          <button className="p-2 text-gray-400 hover:text-cyan-400 transition-colors">
            <Settings className="w-5 h-5" />
          </button>
          <button 
            onClick={() => navigate('/login')}
            className="p-2 text-gray-400 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Dashboard Layout */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Live Feed (Takes up 8 columns on large screens) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Top Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {MOCK_STATS.map((stat, idx) => (
              <div key={idx} className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col justify-between hover:border-white/20 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.label}</span>
                  {stat.icon}
                </div>
                <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Intelligence Feed Header */}
          <div className="flex items-center justify-between mt-8 mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              Live Intelligence Feed
            </h2>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              SYNCING WITH AI QUEUE
            </div>
          </div>

          {/* Feed Content */}
          <div className="space-y-4">
            {isLoading ? (
              // Skeleton Loaders
              [1, 2, 3].map(i => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 h-48 animate-pulse"></div>
              ))
            ) : (
              MOCK_NEWS.map((news) => (
                <div key={news.id} className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:border-cyan-500/30 transition-all group relative overflow-hidden">
                  
                  {/* Subtle hover glow background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/0 to-cyan-500/0 group-hover:from-cyan-500/5 group-hover:to-transparent transition-all duration-500"></div>

                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${getImportanceBadge(news.importance)}`}>
                          {news.importance}
                        </span>
                        <span className="text-xs text-gray-500 font-mono">{news.time}</span>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-white mb-2 leading-tight">
                      {news.title}
                    </h3>
                    
                    <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                      {news.aiSummary}
                    </p>

                    {/* Stock Impacts */}
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-4 border-t border-white/10">
                      {news.positiveStocks.length > 0 && (
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-emerald-400" />
                          <div className="flex flex-wrap gap-1.5">
                            {news.positiveStocks.map(stock => (
                              <button key={stock} onClick={() => navigate(`/stock/${stock}`)} className="text-xs font-medium text-emerald-400 bg-emerald-400/10 hover:bg-emerald-400/20 px-2 py-1 rounded transition-colors">
                                {stock}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {news.negativeStocks.length > 0 && (
                        <div className="flex items-center gap-2">
                          <TrendingDown className="w-4 h-4 text-red-400" />
                          <div className="flex flex-wrap gap-1.5">
                            {news.negativeStocks.map(stock => (
                              <button key={stock} onClick={() => navigate(`/stock/${stock}`)} className="text-xs font-medium text-red-400 bg-red-400/10 hover:bg-red-400/20 px-2 py-1 rounded transition-colors">
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
            )}
          </div>
        </div>

        {/* Right Column: Active Monitors (Takes up 4 columns) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Trending Themes Card */}
          <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-3 flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" /> Macro Themes
            </h3>
            <div className="space-y-3">
              {[
                { theme: "Interest Rates", count: 42, trend: "up" },
                { theme: "Semiconductor PLI", count: 28, trend: "up" },
                { theme: "Crude Oil Prices", count: 15, trend: "down" },
                { theme: "Rural Consumption", count: 9, trend: "neutral" }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg cursor-pointer transition-colors">
                  <span className="text-sm text-gray-300">{item.theme}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 font-mono">{item.count} items</span>
                    {item.trend === 'up' ? <TrendingUp className="w-3 h-3 text-emerald-400" /> : 
                     item.trend === 'down' ? <TrendingDown className="w-3 h-3 text-red-400" /> : 
                     <Activity className="w-3 h-3 text-gray-400" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Setup Card */}
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

```
