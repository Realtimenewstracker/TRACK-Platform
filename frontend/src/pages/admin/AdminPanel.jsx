import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Terminal, Database, Server, Cpu, 
  Activity, Play, Square, Trash2, Plus, RefreshCw, AlertTriangle
} from 'lucide-react';

// Mock Data for Admin Dashboard
const INITIAL_FEEDS = [
  { id: 1, name: "Moneycontrol Top News", url: "https://www.moneycontrol.com/rss/MCtopnews.xml", status: "ACTIVE", lastSync: "2 mins ago" },
  { id: 2, name: "Economic Times Markets", url: "https://economictimes.indiatimes.com/markets/rss.cms", status: "ACTIVE", lastSync: "5 mins ago" },
  { id: 3, name: "Reuters India", url: "https://reuters.com/india/rss", status: "ERROR", lastSync: "1 hour ago" },
];

export default function AdminPanel() {
  const navigate = useNavigate();
  const [feeds, setFeeds] = useState(INITIAL_FEEDS);
  const [isEngineRunning, setIsEngineRunning] = useState(true);
  const [newFeedUrl, setNewFeedUrl] = useState('');

  // Simulated System Stats
  const systemStats = [
    { label: "MongoDB Atlas", value: "CONNECTED", icon: <Database className="w-5 h-5 text-emerald-400" />, status: "good" },
    { label: "Redis Queue", value: "OPTIMAL", icon: <Server className="w-5 h-5 text-emerald-400" />, status: "good" },
    { label: "Gemini API Quota", value: "84% USED", icon: <Cpu className="w-5 h-5 text-yellow-400" />, status: "warning" },
    { label: "Active WebSockets", value: "142", icon: <Activity className="w-5 h-5 text-cyan-400" />, status: "good" },
  ];

  const handleAddFeed = (e) => {
    e.preventDefault();
    if (!newFeedUrl) return;
    
    setFeeds([...feeds, {
      id: Date.now(),
      name: "Custom RSS Feed",
      url: newFeedUrl,
      status: "ACTIVE",
      lastSync: "Just now"
    }]);
    setNewFeedUrl('');
  };

  const removeFeed = (id) => {
    setFeeds(feeds.filter(feed => feed.id !== id));
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
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              <Terminal className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-wide">System Override</h1>
              <p className="text-xs text-red-400 uppercase tracking-widest font-mono">Administrator Access Only</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsEngineRunning(!isEngineRunning)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold tracking-wider transition-colors border ${
              isEngineRunning 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20' 
                : 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
            }`}
          >
            {isEngineRunning ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            {isEngineRunning ? 'HALT ENGINE' : 'START ENGINE'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        
        {/* Top Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {systemStats.map((stat, idx) => (
            <div key={idx} className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-mono text-gray-500 uppercase tracking-wider">{stat.label}</span>
                {stat.icon}
              </div>
              <div className={`text-lg font-bold ${stat.status === 'warning' ? 'text-yellow-400' : 'text-white'}`}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Background Queue Monitor */}
          <div className="lg:col-span-5 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 pb-4 border-b border-white/10">
              <Activity className="w-5 h-5 text-cyan-400" />
              BullMQ Worker Status
            </h3>

            <div className="space-y-6">
              {/* Queue 1: News Ingestion */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white font-medium">news-ingestion (RSS)</span>
                  <span className="text-emerald-400 font-mono">Idle</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-2">
                  <div className="bg-emerald-400 h-2 rounded-full w-0 transition-all"></div>
                </div>
                <div className="flex justify-between mt-2 text-[10px] text-gray-500 font-mono">
                  <span>Waiting: 0</span>
                  <span>Active: 0</span>
                  <span>Failed: 0</span>
                </div>
              </div>

              {/* Queue 2: AI Analysis */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white font-medium">ai-analysis (Gemini)</span>
                  <span className="text-cyan-400 font-mono animate-pulse">Processing...</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-2">
                  <div className="bg-cyan-400 h-2 rounded-full w-[45%] transition-all"></div>
                </div>
                <div className="flex justify-between mt-2 text-[10px] text-gray-500 font-mono">
                  <span>Waiting: 14</span>
                  <span>Active: 2</span>
                  <span className="text-red-400">Failed: 1</span>
                </div>
              </div>
            </div>
          </div>

          {/* RSS Feed Management */}
          <div className="lg:col-span-7 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-purple-400" />
                Data Source Management
              </h3>
              <button className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
                <RefreshCw className="w-3 h-3" /> Force Sync
              </button>
            </div>

            {/* Add New Feed */}
            <form onSubmit={handleAddFeed} className="flex gap-3 mb-6">
              <input 
                type="url" 
                value={newFeedUrl}
                onChange={(e) => setNewFeedUrl(e.target.value)}
                placeholder="Enter new RSS/XML feed URL..."
                className="flex-1 bg-black/50 border border-white/10 rounded-xl py-2 px-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition-all font-mono"
              />
              <button 
                type="submit"
                className="px-4 py-2 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-xl hover:bg-purple-500/30 transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <Plus className="w-4 h-4" /> Add Source
              </button>
            </form>

            {/* Active Feeds List */}
            <div className="space-y-3">
              {feeds.map((feed) => (
                <div key={feed.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
                  <div className="flex-1 truncate pr-4">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="text-sm font-semibold text-white">{feed.name}</h4>
                      <span className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded font-mono border ${
                        feed.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'
                      }`}>
                        {feed.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 font-mono truncate">{feed.url}</p>
                  </div>
                  
                  <div className="flex items-center gap-6 shrink-0">
                    <div className="text-right hidden sm:block">
                      <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Last Sync</div>
                      <div className="text-xs text-gray-300 font-mono">{feed.lastSync}</div>
                    </div>
                    <button 
                      onClick={() => removeFeed(feed.id)}
                      className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
          </div>
        </div>
      </main>
    </div>
  );
}

