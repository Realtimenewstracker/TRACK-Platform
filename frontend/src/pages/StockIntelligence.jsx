import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Target, TrendingUp, TrendingDown, 
  Activity, AlertTriangle, Shield, Cpu, Clock, 
  BarChart2, Zap
} from 'lucide-react';

export default function StockIntelligence() {
  const { ticker } = useParams(); // Grabs the ticker from the URL (e.g., /stock/RELIANCE)
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  // Simulated AI Data for the specific stock
  const mockData = {
    price: "₹2,845.50",
    change: "+1.2%",
    trend: "up",
    sentiment: "BULLISH",
    aiSummary: `TRACK AI has detected a strong bullish divergence for ${ticker.toUpperCase()} over the last 72 hours. Recent government PLI scheme announcements and favorable raw material costs have significantly de-risked the upcoming quarterly earnings. Institutional accumulation is highly probable.`,
    metrics: [
      { label: "Volatility Risk", value: "Low", color: "text-emerald-400" },
      { label: "AI Confidence", value: "88%", color: "text-cyan-400" },
      { label: "Sector Trend", value: "Positive", color: "text-emerald-400" },
    ],
    recentEvents: [
      {
        id: 1,
        time: "2 hours ago",
        title: "Raw Material Costs Drop 12%",
        impact: "POSITIVE",
        importance: "HIGH"
      },
      {
        id: 2,
        time: "1 day ago",
        title: "Export Tariffs Maintained by Commerce Ministry",
        impact: "NEUTRAL",
        importance: "MEDIUM"
      },
      {
        id: 3,
        time: "3 days ago",
        title: "Major Competitor Faces Supply Chain Issues",
        impact: "POSITIVE",
        importance: "HIGH"
      }
    ]
  };

  useEffect(() => {
    // Simulate network fetch
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, [ticker]);

  const getImpactColor = (impact) => {
    if (impact === 'POSITIVE') return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30';
    if (impact === 'NEGATIVE') return 'text-red-400 bg-red-400/10 border-red-400/30';
    return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
  };

  return (
    <div className="min-h-screen bg-[#0B1220] flex flex-col font-sans">
      
      {/* Header */}
      <header className="flex items-center justify-between p-6 border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} // Goes back to the previous page
            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-300" />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.15)]">
              <Target className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-wide">{ticker.toUpperCase()}</h1>
              <p className="text-xs text-gray-400 font-mono tracking-widest">NSE EQUITY</p>
            </div>
          </div>
        </div>

        {/* Live Price Header */}
        <div className="text-right">
          <div className="text-2xl font-bold text-white font-mono">{mockData.price}</div>
          <div className={`text-sm font-bold flex items-center justify-end gap-1 ${mockData.trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
            {mockData.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {mockData.change} (Live)
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
        
        {isLoading ? (
          <div className="col-span-12 flex flex-col items-center justify-center h-64 space-y-4">
            <Cpu className="w-10 h-10 text-cyan-500 animate-pulse" />
            <p className="text-cyan-400 font-mono text-sm tracking-widest animate-pulse">COMPILING AI DOSSIER...</p>
          </div>
        ) : (
          <>
            {/* Left Column: AI Analysis & Metrics */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Sentinel Summary Box */}
              <div className="bg-gradient-to-br from-cyan-900/20 to-blue-900/10 border border-cyan-500/30 rounded-2xl p-6 relative overflow-hidden shadow-[0_0_30px_rgba(34,211,238,0.05)]">
                <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500 shadow-[0_0_15px_rgba(34,211,238,1)]"></div>
                
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-cyan-400" />
                    AI Sentinel Briefing
                  </h2>
                  <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded text-emerald-400 text-xs font-bold tracking-widest">
                    {mockData.sentiment}
                  </span>
                </div>
                
                <p className="text-gray-300 leading-relaxed text-sm">
                  {mockData.aiSummary}
                </p>
              </div>

              {/* Quick Metrics Grid */}
              <div className="grid grid-cols-3 gap-4">
                {mockData.metrics.map((metric, idx) => (
                  <div key={idx} className="bg-black/40 border border-white/10 rounded-xl p-4 flex flex-col items-center justify-center text-center hover:border-white/20 transition-colors">
                    <span className="text-xs text-gray-500 font-mono uppercase tracking-wider mb-2">{metric.label}</span>
                    <span className={`text-xl font-bold ${metric.color}`}>{metric.value}</span>
                  </div>
                ))}
              </div>

              {/* Placeholder for future TradingView Chart integration */}
              <div className="bg-black/40 border border-white/10 rounded-2xl p-6 h-80 flex flex-col items-center justify-center text-gray-500">
                <BarChart2 className="w-12 h-12 mb-3 opacity-20" />
                <p className="text-sm font-mono uppercase tracking-widest">Advanced Charting Module</p>
                <p className="text-xs mt-2 opacity-50">(Integrate TradingView Lightweight Charts Here)</p>
              </div>

            </div>

            {/* Right Column: Event Timeline */}
            <div className="lg:col-span-4 space-y-6">
              
              <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 h-full">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 pb-4 border-b border-white/10">
                  <Activity className="w-5 h-5 text-purple-400" />
                  Impact Timeline
                </h3>

                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                  
                  {mockData.recentEvents.map((event, index) => (
                    <div key={event.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      
                      {/* Timeline Dot */}
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#0B1220] bg-black shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ${
                        event.impact === 'POSITIVE' ? 'text-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]' : 
                        event.impact === 'NEGATIVE' ? 'text-red-400 shadow-[0_0_10px_rgba(248,113,113,0.5)]' : 
                        'text-gray-400'
                      }`}>
                        {event.impact === 'POSITIVE' ? <TrendingUp className="w-4 h-4" /> : 
                         event.impact === 'NEGATIVE' ? <TrendingDown className="w-4 h-4" /> : 
                         <Activity className="w-4 h-4" />}
                      </div>
                      
                      {/* Event Card */}
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getImpactColor(event.impact)}`}>
                            {event.impact}
                          </span>
                          <time className="text-[10px] font-mono text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {event.time}
                          </time>
                        </div>
                        <h4 className="text-sm font-semibold text-white mt-2 leading-snug">{event.title}</h4>
                      </div>
                      
                    </div>
                  ))}

                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

