import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Globe, 
  ArrowLeft, 
  AlertTriangle, 
  ShieldAlert, 
  Crosshair, 
  Activity,
  Flame,
  Info
} from 'lucide-react';

// Mock Data for Global Intelligence
const REGIONS = [
  { 
    id: 'mideast', 
    name: 'Middle East', 
    riskLevel: 'CRITICAL', 
    activeEvents: 5, 
    coords: { top: '45%', left: '58%' },
    headline: "Supply Chain Disruption in Red Sea",
    impactedSectors: ["Energy", "Logistics", "Defense"]
  },
  { 
    id: 'asia', 
    name: 'Asia Pacific', 
    riskLevel: 'HIGH', 
    activeEvents: 3, 
    coords: { top: '40%', left: '78%' },
    headline: "Tech Export Restrictions Tighten",
    impactedSectors: ["Semiconductors", "IT Services"]
  },
  { 
    id: 'europe', 
    name: 'Europe', 
    riskLevel: 'MEDIUM', 
    activeEvents: 2, 
    coords: { top: '30%', left: '52%' },
    headline: "ECB Hints at Rate Cuts",
    impactedSectors: ["Banking", "Auto"]
  },
  { 
    id: 'americas', 
    name: 'North America', 
    riskLevel: 'MEDIUM', 
    activeEvents: 4, 
    coords: { top: '35%', left: '22%' },
    headline: "Federal Reserve Holds Rates Steady",
    impactedSectors: ["Tech", "Real Estate"]
  },
];

export default function GeopoliticalMap() {
  const navigate = useNavigate();
  const [selectedRegion, setSelectedRegion] = useState(REGIONS[0]);

  // Helper for risk colors
  const getRiskColor = (level) => {
    switch(level) {
      case 'CRITICAL': return 'text-red-500 bg-red-500/20 border-red-500/50';
      case 'HIGH': return 'text-orange-500 bg-orange-500/20 border-orange-500/50';
      case 'MEDIUM': return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/50';
      default: return 'text-cyan-400 bg-cyan-500/20 border-cyan-500/50';
    }
  };

  const getRiskGlow = (level) => {
    switch(level) {
      case 'CRITICAL': return 'shadow-[0_0_30px_rgba(239,68,68,0.6)] bg-red-500';
      case 'HIGH': return 'shadow-[0_0_30px_rgba(249,115,22,0.6)] bg-orange-500';
      case 'MEDIUM': return 'shadow-[0_0_30px_rgba(250,204,21,0.6)] bg-yellow-400';
      default: return 'shadow-[0_0_30px_rgba(34,211,238,0.6)] bg-cyan-400';
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1220] flex flex-col font-sans overflow-hidden">
      
      {/* Header */}
      <header className="flex items-center justify-between p-6 border-b border-white/5 bg-black/20 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-300" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.2)]">
              <Globe className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-wide">Geopolitical Theater</h1>
              <p className="text-xs text-cyan-400 uppercase tracking-widest font-mono">Global Risk Assessment</p>
            </div>
          </div>
        </div>
        
        {/* Global Status */}
        <div className="flex items-center gap-3 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl">
          <Flame className="w-4 h-4 text-red-500 animate-pulse" />
          <span className="text-sm font-medium text-red-500 tracking-wider">DEFCON 3</span>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row relative">
        
        {/* Abstract Cyber Map Area */}
        <div className="flex-1 relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-[#0B1220] to-[#0B1220] overflow-hidden">
          
          {/* Grid Background (Simulating a tactical screen) */}
          <div className="absolute inset-0" style={{ 
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
            backgroundSize: '30px 30px'
          }}></div>

          {/* Latitude / Longitude Decorative Lines */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-cyan-500/20 border-t border-cyan-500/20 dashed"></div>
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-cyan-500/20 border-l border-cyan-500/20 dashed"></div>

          {/* Map Hotspots */}
          {REGIONS.map((region) => (
            <div 
              key={region.id}
              onClick={() => setSelectedRegion(region)}
              className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group z-10"
              style={{ top: region.coords.top, left: region.coords.left }}
            >
              {/* Pulsing rings */}
              <div className={`absolute inset-0 rounded-full animate-ping opacity-75 ${getRiskGlow(region.riskLevel)} h-8 w-8 -ml-4 -mt-4`}></div>
              
              {/* Core dot */}
              <div className={`relative z-10 w-4 h-4 rounded-full border-2 border-[#0B1220] ${getRiskGlow(region.riskLevel)} transition-transform group-hover:scale-150`}></div>
              
              {/* Label */}
              <div className={`absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 bg-black/80 backdrop-blur-md border rounded-lg text-xs font-mono transition-opacity ${selectedRegion.id === region.id ? 'border-cyan-500/50 text-cyan-400 opacity-100' : 'border-white/10 text-gray-400 opacity-0 group-hover:opacity-100'}`}>
                {region.name}
              </div>
            </div>
          ))}

          {/* Map HUD Elements */}
          <div className="absolute bottom-6 left-6 font-mono text-[10px] text-gray-500 uppercase tracking-widest leading-loose">
            <p>LAT: 45.0000° N</p>
            <p>LONG: 12.0000° E</p>
            <p>SYS: ONLINE</p>
          </div>
        </div>

        {/* Intelligence Sidebar */}
        <div className="w-full lg:w-96 bg-black/40 backdrop-blur-xl border-l border-white/10 flex flex-col z-20 shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">
          <div className="p-6 border-b border-white/10 bg-white/5">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Crosshair className="w-5 h-5 text-cyan-400" />
              Sector Analysis
            </h2>
            <p className="text-xs text-gray-400 mt-1">Select a region on the map to view intel.</p>
          </div>

          {selectedRegion && (
            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar space-y-6">
              
              {/* Region Header */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-2xl font-bold text-white">{selectedRegion.name}</h3>
                  <span className={`px-3 py-1 rounded-md text-xs font-bold tracking-wider border ${getRiskColor(selectedRegion.riskLevel)}`}>
                    {selectedRegion.riskLevel}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Activity className="w-4 h-4 text-cyan-500" />
                  <span>{selectedRegion.activeEvents} Active Market Events</span>
                </div>
              </div>

              {/* Primary Intel Card */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-start gap-3 mb-3">
                  <ShieldAlert className="w-5 h-5 text-gray-300 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-white">Latest Intelligence</h4>
                    <p className="text-sm text-gray-300 mt-1 leading-relaxed">
                      "{selectedRegion.headline}"
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-white/10">
                  <h5 className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">Vulnerable Sectors (NSE/BSE)</h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedRegion.impactedSectors.map((sector, i) => (
                      <span key={i} className="px-2 py-1 bg-black/50 border border-white/10 rounded text-xs text-cyan-200">
                        {sector}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button className="w-full py-3 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                <Info className="w-4 h-4" />
                View Detailed Briefing
              </button>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}

