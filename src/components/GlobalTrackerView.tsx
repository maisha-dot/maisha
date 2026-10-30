import React, { useState, useEffect } from 'react';
import {
  Globe2,
  AlertTriangle,
  Radio,
  Flame,
  TrendingUp,
  MapPin,
  ExternalLink,
  ChevronRight,
  Shield,
  Layers,
  Sparkles,
  Bell,
  Smartphone,
  ArrowRight,
} from 'lucide-react';
import { RadarGeoHotspot, NewsArticle, TrendsData, TrendingTopic } from '../types/news';
import { GlobalTrendsChart } from './GlobalTrendsChart';
import { RwandaUpdatesHub } from './RwandaUpdatesHub';

interface GlobalTrackerViewProps {
  onSelectCountry: (country: string) => void;
  onSelectArticle: (article: NewsArticle) => void;
  onSelectCategory?: (category: string) => void;
  onSearchQuery?: (query: string) => void;
  onEnableRwandaPush?: () => void;
}

export const GlobalTrackerView: React.FC<GlobalTrackerViewProps> = ({
  onSelectCountry,
  onSelectArticle,
  onSelectCategory,
  onSearchQuery,
  onEnableRwandaPush,
}) => {
  const [hotspots, setHotspots] = useState<RadarGeoHotspot[]>([]);
  const [trendsData, setTrendsData] = useState<TrendsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingTrends, setLoadingTrends] = useState<boolean>(true);
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [activeHotspot, setActiveHotspot] = useState<RadarGeoHotspot | null>(null);
  const [rwandaHubOpen, setRwandaHubOpen] = useState<boolean>(false);

  useEffect(() => {
    // 1. Fetch geo hotspots
    fetch('/api/geo-radar')
      .then((res) => res.json())
      .then((data: RadarGeoHotspot[]) => {
        setHotspots(data);
        if (data.length > 0) setActiveHotspot(data[0]);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load geo radar:', err);
        setLoading(false);
      });

    // 2. Fetch 7-day trend analytics for Recharts
    fetch('/api/analytics/trends')
      .then((res) => res.json())
      .then((data: TrendsData) => {
        setTrendsData(data);
        setLoadingTrends(false);
      })
      .catch((err) => {
        console.error('Failed to load trend analytics:', err);
        setLoadingTrends(false);
      });
  }, []);

  const regions = ['All', 'East Africa', 'Central Africa', 'Horn of Africa', 'Europe', 'Middle East', 'North America'];

  const filteredHotspots = hotspots.filter((h) => {
    if (selectedRegion === 'All') return true;
    return h.region.toLowerCase().includes(selectedRegion.toLowerCase());
  });

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'text-red-500 bg-red-950/60 border-red-700/60';
      case 'HIGH':
        return 'text-orange-400 bg-orange-950/60 border-orange-700/60';
      case 'ELEVATED':
        return 'text-amber-400 bg-amber-950/60 border-amber-700/60';
      default:
        return 'text-emerald-400 bg-emerald-950/60 border-emerald-700/60';
    }
  };

  const handleSelectTrendingTopic = (topic: TrendingTopic) => {
    if (topic.category === 'Rwanda News') {
      onSelectCountry('Rwanda');
    } else if (onSearchQuery) {
      onSearchQuery(topic.topic.split(' ')[0] || topic.topic);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#070e22] via-[#091330] to-[#040814] p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
              <span className="text-xs font-mono-radar font-bold text-red-400 uppercase tracking-widest">
                GEOPOLITICAL RADAR SYSTEM
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-radar text-white tracking-wide">
              GLOBAL NEWS TRACKER & TENSION RADAR
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Real-time geospatial intelligence mapping active headlines, diplomatic shifts, and breaking developments across monitored territories.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Rwanda Updates Action Trigger */}
            <button
              onClick={() => setRwandaHubOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-radar font-bold rounded-xl text-xs tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-950/50 border border-emerald-400/40"
            >
              <span className="text-sm">🇷🇼</span>
              <span>RECEIVE RWANDA UPDATES</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <div className="bg-[#030611] px-4 py-2 rounded-xl border border-slate-700/80 font-mono-radar text-xs hidden sm:block">
              <span className="text-slate-400 block text-[10px]">ACTIVE THEATERS</span>
              <span className="text-base font-bold text-white font-radar">{hotspots.length} COUNTRIES</span>
            </div>
          </div>
        </div>
      </div>

      {/* 1. RECHARTS DATA VISUALIZATION: Trending News Topics and Source Volume Over Last 7 Days */}
      <GlobalTrendsChart
        trendsData={trendsData}
        loading={loadingTrends}
        onSelectTopic={handleSelectTrendingTopic}
        onOpenRwandaHub={() => setRwandaHubOpen(true)}
      />

      {/* Region Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none font-radar text-xs">
        {regions.map((region) => (
          <button
            key={region}
            onClick={() => setSelectedRegion(region)}
            className={`px-3 py-1.5 rounded-lg font-semibold tracking-wider transition-all whitespace-nowrap cursor-pointer border ${
              selectedRegion === region
                ? 'bg-red-600 border-red-500 text-white shadow-md'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {region}
          </button>
        ))}
      </div>

      {/* Main Grid: Interactive Radar Sphere + Hotspot List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Radar Graphic Canvas Mockup */}
        <div className="lg:col-span-7 bg-[#050a18] border border-slate-800 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between min-h-[420px]">
          {/* Radar background grid lines */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-30"></div>

          {/* Concentric radar rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] border border-red-900/30 rounded-full flex items-center justify-center">
              <div className="w-[220px] h-[220px] sm:w-[280px] sm:h-[280px] border border-slate-800/80 rounded-full flex items-center justify-center">
                <div className="w-[120px] h-[120px] sm:w-[150px] sm:h-[150px] border border-slate-700/60 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Rotating radar sweep ray */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] rounded-full overflow-hidden">
              <div className="w-full h-full animate-radar-sweep bg-gradient-to-tr from-red-600/20 via-transparent to-transparent"></div>
            </div>
          </div>

          {/* Header */}
          <div className="relative z-10 flex items-center justify-between text-xs font-mono-radar text-slate-400">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-red-500 animate-pulse" />
              <span className="text-white font-bold uppercase">LIVE GEOSPATIAL RADAR BEACON</span>
            </div>
            <span className="text-emerald-400 font-semibold">SWEEPING SECTORS</span>
          </div>

          {/* Interactive Ping Points */}
          <div className="relative z-10 my-8 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredHotspots.slice(0, 6).map((spot) => {
              const isSelected = activeHotspot?.countryName === spot.countryName;
              return (
                <div
                  key={spot.countryName}
                  onClick={() => setActiveHotspot(spot)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-red-950/80 border-red-500 shadow-lg shadow-red-900/50'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white font-radar">{spot.countryName}</span>
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[10px] font-mono-radar text-slate-400">
                    <span>{spot.articleCount} Dispatches</span>
                    <span className={`px-1 rounded ${getThreatColor(spot.threatLevel)}`}>
                      {spot.threatLevel}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Hotspot Deep Detail */}
          {activeHotspot && (
            <div className="relative z-10 bg-[#070e20]/90 backdrop-blur-md p-4 rounded-xl border border-red-500/40 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-400" />
                  <h3 className="font-bold text-sm font-radar text-white">
                    {activeHotspot.countryName} &bull; {activeHotspot.region}
                  </h3>
                </div>
                <button
                  onClick={() => onSelectCountry(activeHotspot.countryName)}
                  className="text-xs text-red-400 hover:text-white font-mono-radar flex items-center gap-1 font-bold cursor-pointer"
                >
                  <span>VIEW ALL HEADLINES</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-xs text-slate-300 font-medium">
                Latest Wire: &ldquo;{activeHotspot.topHeadline}&rdquo;
              </p>
            </div>
          )}
        </div>

        {/* Hotspots Detailed List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold font-radar text-slate-300 tracking-wider uppercase">
              Trending Countries ({filteredHotspots.length})
            </h2>
            <button
              onClick={() => setRwandaHubOpen(true)}
              className="text-xs text-emerald-400 hover:underline font-mono-radar flex items-center gap-1 font-semibold cursor-pointer"
            >
              <span>Rwanda Channels</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
            {filteredHotspots.map((spot) => (
              <div
                key={spot.countryName}
                onClick={() => {
                  setActiveHotspot(spot);
                  onSelectCountry(spot.countryName);
                }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer group space-y-1.5 ${
                  spot.countryName === 'Rwanda'
                    ? 'bg-emerald-950/20 border-emerald-800/60 hover:border-emerald-500'
                    : 'bg-[#080e1e] border-slate-800 hover:border-red-500/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {spot.countryName === 'Rwanda' && <span className="text-xs">🇷🇼</span>}
                    <span className="font-bold font-radar text-white group-hover:text-red-400 text-sm">
                      {spot.countryName}
                    </span>
                    <span className="text-[10px] font-mono-radar text-slate-400">
                      {spot.region}
                    </span>
                  </div>

                  <span className={`text-[10px] font-mono-radar font-bold px-2 py-0.5 rounded border ${getThreatColor(spot.threatLevel)}`}>
                    {spot.threatLevel}
                  </span>
                </div>

                <p className="text-xs text-slate-400 line-clamp-1 group-hover:text-slate-300">
                  {spot.topHeadline}
                </p>

                <div className="flex items-center justify-between text-[10px] font-mono-radar text-slate-400 pt-1 border-t border-slate-850">
                  <span>{spot.articleCount} tracked reports</span>
                  {spot.breakingCount > 0 ? (
                    <span className="text-red-400 font-bold flex items-center gap-1">
                      <Flame className="w-3 h-3 text-red-500" />
                      {spot.breakingCount} BREAKING
                    </span>
                  ) : (
                    <span className="text-slate-500 group-hover:text-slate-300">EXPLORE DISPATCHES &rarr;</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rwanda News Channels Modal */}
      <RwandaUpdatesHub
        isOpen={rwandaHubOpen}
        onClose={() => setRwandaHubOpen(false)}
        onFilterRwandaOnly={() => onSelectCountry('Rwanda')}
        onEnableRwandaPush={() => {
          if (onEnableRwandaPush) onEnableRwandaPush();
          else if (typeof Notification !== 'undefined') {
            Notification.requestPermission().then((res) => {
              if (res === 'granted') {
                new Notification('IMPAMOPRESS RWANDA RADAR', {
                  body: 'Mwarakoze! Rwanda Priority News alerts successfully enabled.',
                });
              }
            });
          }
        }}
      />
    </div>
  );
};
