import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  Legend,
} from 'recharts';
import { TrendsData, TrendingTopic } from '../types/news';
import {
  TrendingUp,
  BarChart3,
  Layers,
  Sparkles,
  Flame,
  ArrowUpRight,
  ShieldAlert,
  Compass,
  MapPin,
} from 'lucide-react';

interface GlobalTrendsChartProps {
  trendsData: TrendsData | null;
  loading: boolean;
  onSelectTopic: (topic: TrendingTopic) => void;
  onOpenRwandaHub: () => void;
}

export const GlobalTrendsChart: React.FC<GlobalTrendsChartProps> = ({
  trendsData,
  loading,
  onSelectTopic,
  onOpenRwandaHub,
}) => {
  const [chartMode, setChartMode] = useState<'trends' | 'sources' | 'topics'>('trends');

  if (loading || !trendsData) {
    return (
      <div className="bg-[#050a18] border border-slate-800 rounded-2xl p-8 text-center space-y-3">
        <div className="inline-block w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-mono-radar text-slate-400">
          Calculating 7-day multi-source telemetry and velocity curves...
        </p>
      </div>
    );
  }

  const { dailyTrends, sourceVolumes, trendingTopics, totalArticlesWeek, rwandaWeeklyCount } = trendsData;

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#040814]/95 border border-slate-700/80 p-3 rounded-xl shadow-2xl font-mono-radar text-xs text-white space-y-1.5 backdrop-blur-md">
          <p className="font-bold text-red-400 border-b border-slate-800 pb-1">{label}</p>
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4 text-[11px]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-slate-300">{entry.name}:</span>
              </span>
              <span className="font-bold text-white">{entry.value} dispatches</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#050a18] border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-6 shadow-xl">
      {/* Header and Toggle Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-850">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-mono-radar font-bold text-emerald-400 uppercase tracking-widest">
              RECHARTS TELEMETRY VISUALIZATION
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-radar text-white tracking-wide">
            7-DAY NEWS TRENDS & SOURCE RADAR VOLUME
          </h2>
          <p className="text-xs text-slate-400 font-mono-radar">
            Multilateral analysis of incoming dispatch velocities, regional distribution, and top publisher contributions.
          </p>
        </div>

        {/* View Switcher Pills */}
        <div className="flex items-center gap-1.5 bg-[#030611] p-1 rounded-xl border border-slate-800 font-radar text-xs">
          <button
            onClick={() => setChartMode('trends')}
            className={`px-3 py-1.5 rounded-lg font-bold tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              chartMode === 'trends'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>7-Day Curve</span>
          </button>

          <button
            onClick={() => setChartMode('sources')}
            className={`px-3 py-1.5 rounded-lg font-bold tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              chartMode === 'sources'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Source Share</span>
          </button>

          <button
            onClick={() => setChartMode('topics')}
            className={`px-3 py-1.5 rounded-lg font-bold tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              chartMode === 'topics'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Trending Topics</span>
          </button>
        </div>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 font-mono-radar">
        <div
          onClick={onOpenRwandaHub}
          className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-950/40 via-[#071222] to-[#040814] border border-emerald-700/50 hover:border-emerald-500 transition-all cursor-pointer group space-y-1"
        >
          <div className="flex items-center justify-between text-[11px] text-emerald-300 font-bold">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-400" />
              RWANDA 7D VOLUME
            </span>
            <span className="bg-emerald-900/60 px-1.5 py-0.2 rounded text-[10px] text-emerald-300">
              +88% VELOCITY
            </span>
          </div>
          <div className="text-2xl font-black font-radar text-white group-hover:text-emerald-300 transition-colors">
            {rwandaWeeklyCount} Dispatches
          </div>
          <p className="text-[10px] text-slate-400 flex items-center gap-1">
            <span>Tap to explore Rwanda alerts hub</span>
            <ArrowUpRight className="w-3 h-3 text-emerald-400" />
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 uppercase block">7-DAY TOTAL MONITORED</span>
          <div className="text-2xl font-black font-radar text-white">
            {totalArticlesWeek} Stories
          </div>
          <span className="text-[10px] text-slate-500">Across 12 global categories</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 uppercase block">ACTIVE WIRE SOURCES</span>
          <div className="text-2xl font-black font-radar text-white">
            {sourceVolumes.length} Syndicates
          </div>
          <span className="text-[10px] text-emerald-400">100% legitimate RSS feeds</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 uppercase block">TOP SURGING THEME</span>
          <div className="text-sm font-bold font-radar text-amber-300 truncate">
            {trendingTopics[0]?.topic}
          </div>
          <span className="text-[10px] text-red-400 font-bold flex items-center gap-1">
            <Flame className="w-3 h-3" />
            Surging +{trendingTopics[0]?.velocityChangePercent}% this week
          </span>
        </div>
      </div>

      {/* Main Chart Canvas */}
      {chartMode === 'trends' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono-radar text-slate-400">
            <span>DAILY VOLUME BREAKDOWN ACROSS KEY THEATERS</span>
            <span className="text-slate-500">Units: Tracked Articles / Day</span>
          </div>

          <div className="h-72 sm:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRwanda" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="colorAfrica" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="colorWorld" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="colorSecurity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="dayLabel"
                  stroke="#64748b"
                  tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'JetBrains Mono' }}
                />
                <YAxis
                  stroke="#64748b"
                  tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'JetBrains Mono' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: 11, fontFamily: 'JetBrains Mono', paddingTop: 10 }}
                />
                <Area
                  type="monotone"
                  name="Rwanda News"
                  dataKey="rwandaNews"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorRwanda)"
                />
                <Area
                  type="monotone"
                  name="Africa News"
                  dataKey="africaNews"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorAfrica)"
                />
                <Area
                  type="monotone"
                  name="Security & Conflicts"
                  dataKey="securityConflicts"
                  stroke="#ef4444"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorSecurity)"
                />
                <Area
                  type="monotone"
                  name="World News"
                  dataKey="worldNews"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorWorld)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Source Share Bar Chart */}
      {chartMode === 'sources' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono-radar text-slate-400">
            <span>VOLUME SHARE BY ORIGINAL PUBLISHER</span>
            <span className="text-slate-500">Top 8 Intercepted Feeds</span>
          </div>

          <div className="h-72 sm:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sourceVolumes}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 40, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis
                  type="number"
                  stroke="#64748b"
                  tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'JetBrains Mono' }}
                />
                <YAxis
                  dataKey="sourceName"
                  type="category"
                  stroke="#64748b"
                  width={130}
                  tick={{ fontSize: 11, fill: '#cbd5e1', fontFamily: 'JetBrains Mono' }}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as { sourceName: string; count: number; percentage: number };
                      return (
                        <div className="bg-[#040814] border border-slate-700 p-2.5 rounded-lg text-xs font-mono-radar text-white">
                          <p className="font-bold text-emerald-400">{data.sourceName}</p>
                          <p className="text-slate-300">Volume: {data.count} stories ({data.percentage}%)</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {sourceVolumes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Trending Topics Velocity Table */}
      {chartMode === 'topics' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono-radar text-slate-400">
            <span>SURGING DISPATCHES OVER THE LAST 7 DAYS</span>
            <span className="text-slate-500">Sorted by Velocity & Frequency</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {trendingTopics.map((top, idx) => (
              <div
                key={top.id}
                onClick={() => onSelectTopic(top)}
                className="p-3.5 rounded-xl bg-[#080e1e] border border-slate-800 hover:border-red-500/70 transition-all cursor-pointer group space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-red-600/20 border border-red-500/40 text-red-400 flex items-center justify-center text-xs font-bold font-mono-radar">
                      #{idx + 1}
                    </span>
                    <span className="text-[10px] font-mono-radar text-slate-400">
                      {top.region}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono-radar font-bold px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800">
                    +{top.velocityChangePercent}% SURGE
                  </span>
                </div>

                <h4 className="text-xs sm:text-sm font-bold font-radar text-white group-hover:text-red-400 transition-colors leading-snug">
                  {top.topic}
                </h4>

                <div className="flex items-center justify-between text-[11px] font-mono-radar text-slate-400 pt-1 border-t border-slate-850">
                  <span className="text-slate-300">{top.category}</span>
                  <span className="text-red-400 group-hover:underline">FILTER DISPATCHES &rarr;</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
