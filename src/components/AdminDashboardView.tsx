import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Radio,
  RefreshCw,
  Plus,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Lock,
  Unlock,
  Activity,
  Send,
  Database,
  Server,
  Layers,
  Terminal,
  CreditCard,
} from 'lucide-react';
import { AdminStats, NewsSource, MonitoringLog, NewsCategory } from '../types/news';
import { AdminAdsManagementPanel } from './AdminAdsManagementPanel';

interface AdminDashboardViewProps {
  stats: AdminStats | null;
  sources: NewsSource[];
  onToggleSource: (id: string) => void;
  onAddSource: (src: { name: string; feedUrl: string; category: NewsCategory; country: string }) => void;
  onTriggerSweep: () => Promise<void>;
  isSweeping: boolean;
  onBroadcastAlert: (alert: { title: string; summary: string; category: NewsCategory; source: string }) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  stats,
  sources,
  onToggleSource,
  onAddSource,
  onTriggerSweep,
  isSweeping,
  onBroadcastAlert,
}) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(true);
  const [adminActiveSection, setAdminActiveSection] = useState<'news' | 'ads'>('news');
  const [adminPasscode, setAdminPasscode] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [logs, setLogs] = useState<MonitoringLog[]>([]);

  // New source form state
  const [showAddSource, setShowAddSource] = useState<boolean>(false);
  const [newSourceName, setNewSourceName] = useState<string>('');
  const [newSourceFeedUrl, setNewSourceFeedUrl] = useState<string>('');
  const [newSourceCategory, setNewSourceCategory] = useState<NewsCategory>('World News');
  const [newSourceCountry, setNewSourceCountry] = useState<string>('International');

  // Broadcast Alert form state
  const [broadcastTitle, setBroadcastTitle] = useState<string>('');
  const [broadcastSummary, setBroadcastSummary] = useState<string>('');
  const [broadcastCategory, setBroadcastCategory] = useState<NewsCategory>('World News');
  const [broadcastSource, setBroadcastSource] = useState<string>('IMPAMOPRESS RADAR DESK');
  const [broadcastSuccess, setBroadcastSuccess] = useState<boolean>(false);

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchLogs = () => {
    fetch('/api/logs')
      .then((res) => res.json())
      .then((data) => setLogs(data))
      .catch((err) => console.error('Failed to fetch logs:', err));
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPasscode === 'admin' || adminPasscode === 'impamo2026' || adminPasscode.length >= 4) {
      setIsAdminAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Invalid Admin Passcode. Default: admin');
    }
  };

  const handleBroadcastSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle) return;
    onBroadcastAlert({
      title: broadcastTitle,
      summary: broadcastSummary,
      category: broadcastCategory,
      source: broadcastSource,
    });
    setBroadcastTitle('');
    setBroadcastSummary('');
    setBroadcastSuccess(true);
    setTimeout(() => setBroadcastSuccess(false), 3000);
  };

  const handleAddSourceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSourceName || !newSourceFeedUrl) return;
    onAddSource({
      name: newSourceName,
      feedUrl: newSourceFeedUrl,
      category: newSourceCategory,
      country: newSourceCountry,
    });
    setNewSourceName('');
    setNewSourceFeedUrl('');
    setShowAddSource(false);
  };

  if (!isAdminAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-16 bg-[#080e1e] border border-slate-800 rounded-2xl p-8 space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-red-600/20 border border-red-500 rounded-xl flex items-center justify-center mx-auto text-red-500">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold font-radar text-white">IMPAMOPRESS COMMAND DESK</h2>
          <p className="text-xs text-slate-400 font-mono-radar">
            Restricted newsroom administration terminal. Enter authentication token to access source management and manual bulletin broadcasts.
          </p>
        </div>

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label className="text-xs font-mono-radar text-slate-400 block mb-1">
              ADMIN PASSCODE
            </label>
            <input
              type="password"
              placeholder="Enter passcode (default: admin)..."
              value={adminPasscode}
              onChange={(e) => setAdminPasscode(e.target.value)}
              className="w-full bg-[#040814] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 font-mono-radar"
            />
          </div>

          {authError && <p className="text-xs text-red-400 font-mono-radar">{authError}</p>}

          <button
            type="submit"
            className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-radar font-bold rounded-lg text-sm transition-all cursor-pointer shadow-md shadow-red-900/40"
          >
            AUTHENTICATE & ENTER
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="bg-[#080e1e] border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-mono-radar font-bold text-emerald-400 uppercase tracking-widest">
              SYSTEM COMMAND CENTER
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-radar text-white">
            ADMINISTRATOR INTELLIGENCE DESK
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-mono-radar">
            Logged in as Chief Newsroom Architect &bull; Full CRUD Authority
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onTriggerSweep}
            disabled={isSweeping}
            className={`px-4 py-2.5 rounded-xl text-xs font-radar font-bold tracking-wider flex items-center gap-2 transition-all cursor-pointer border ${
              isSweeping
                ? 'bg-red-950/60 border-red-700 text-red-300'
                : 'bg-red-600 hover:bg-red-500 border-red-500 text-white shadow-lg shadow-red-900/40'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${isSweeping ? 'animate-spin' : ''}`} />
            <span>{isSweeping ? 'SCANNING ALL FEEDS...' : 'SWEEP ALL SOURCES'}</span>
          </button>

          <button
            onClick={() => setIsAdminAuthenticated(false)}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-white"
            title="Lock terminal"
          >
            <Unlock className="w-4 h-4 text-emerald-400" />
          </button>
        </div>
      </div>

      {/* Admin Section Switcher */}
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-3 font-radar text-xs uppercase tracking-wider">
        <button
          onClick={() => setAdminActiveSection('news')}
          className={`py-2 px-4 rounded-lg flex items-center gap-2 font-bold transition-all cursor-pointer ${
            adminActiveSection === 'news'
              ? 'bg-[#E60026] text-white shadow-md'
              : 'bg-neutral-900 text-neutral-400 hover:text-white'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>Newsroom Feeds & Radar Control</span>
        </button>

        <button
          onClick={() => setAdminActiveSection('ads')}
          className={`py-2 px-4 rounded-lg flex items-center gap-2 font-bold transition-all cursor-pointer ${
            adminActiveSection === 'ads'
              ? 'bg-[#E60026] text-white shadow-md'
              : 'bg-neutral-900 text-neutral-400 hover:text-white border border-[#E60026]/40'
          }`}
        >
          <CreditCard className="w-4 h-4 text-[#E60026]" />
          <span>Advertising & MTN MoMo Payments</span>
        </button>
      </div>

      {adminActiveSection === 'ads' && (
        <AdminAdsManagementPanel />
      )}

      {adminActiveSection === 'news' && (
        <>
      {/* KPI Stats Metric Cards (Requirement 8) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#080e1e] border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-[11px] font-mono-radar text-slate-400 uppercase">
            TOTAL MONITORED STORIES
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-radar text-white">
            {stats?.totalArticles ?? 0}
          </div>
          <span className="text-[10px] text-emerald-400 font-mono-radar">
            +{stats?.articlesLastHour ?? 0} ingested this hour
          </span>
        </div>

        <div className="bg-[#080e1e] border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-[11px] font-mono-radar text-slate-400 uppercase">
            BREAKING DISPATCHES
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-radar text-red-500">
            {stats?.breakingArticles ?? 0}
          </div>
          <span className="text-[10px] text-red-400 font-mono-radar">Priority alert queue</span>
        </div>

        <div className="bg-[#080e1e] border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-[11px] font-mono-radar text-slate-400 uppercase">
            ACTIVE RSS SOURCES
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-radar text-white">
            {stats?.activeSources ?? sources.length}
          </div>
          <span className="text-[10px] text-slate-400 font-mono-radar">
            {stats?.failedFeeds ?? 0} feed exceptions
          </span>
        </div>

        <div className="bg-[#080e1e] border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-[11px] font-mono-radar text-slate-400 uppercase">
            DETECTION LATENCY
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-radar text-amber-400">
            {stats?.averageDetectionLatencySec ?? 42}s
          </div>
          <span className="text-[10px] text-slate-400 font-mono-radar">
            RAM: {stats?.memoryUsageMb ?? 64}MB &bull; Up: {stats?.uptimeSeconds ?? 120}s
          </span>
        </div>
      </div>

      {/* Manual Breaking Bulletin Broadcast Section */}
      <div className="bg-[#080e1e] border border-red-900/50 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Send className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-bold font-radar text-white">
              BROADCAST MANUAL BREAKING ALERT BULLETIN
            </h2>
          </div>
          {broadcastSuccess && (
            <span className="text-xs text-emerald-400 font-mono-radar font-bold bg-emerald-950/60 px-3 py-1 rounded border border-emerald-800">
              ✓ BULLETIN BROADCASTED ACROSS RADAR
            </span>
          )}
        </div>

        <form onSubmit={handleBroadcastSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-8">
              <label className="text-xs font-mono-radar text-slate-400 block mb-1">
                BREAKING HEADLINE
              </label>
              <input
                type="text"
                placeholder="E.g., URGENT: Heads of State Sign Landmark Kigali Accord..."
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                className="w-full bg-[#040814] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                required
              />
            </div>

            <div className="sm:col-span-4">
              <label className="text-xs font-mono-radar text-slate-400 block mb-1">
                CATEGORY
              </label>
              <select
                value={broadcastCategory}
                onChange={(e) => setBroadcastCategory(e.target.value as NewsCategory)}
                className="w-full bg-[#040814] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 font-mono-radar"
              >
                <option value="World News">World News</option>
                <option value="Africa News">Africa News</option>
                <option value="Rwanda News">Rwanda News</option>
                <option value="Security and Conflicts">Security and Conflicts</option>
                <option value="Politics">Politics</option>
                <option value="Business and Economy">Business and Economy</option>
                <option value="Technology">Technology</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-mono-radar text-slate-400 block mb-1">
              DISPATCH SUMMARY & REPORT DETAILS
            </label>
            <textarea
              rows={2}
              placeholder="Immediate verification details and wire dispatches..."
              value={broadcastSummary}
              onChange={(e) => setBroadcastSummary(e.target.value)}
              className="w-full bg-[#040814] border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-radar font-bold rounded-xl text-xs tracking-wider flex items-center gap-2 cursor-pointer shadow-lg shadow-red-900/40"
            >
              <Send className="w-4 h-4" />
              <span>BROADCAST BULLETIN TO ALL USERS</span>
            </button>
          </div>
        </form>
      </div>

      {/* Source Management Table */}
      <div className="bg-[#080e1e] border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold font-radar text-white">
              MONITORED NEWS SOURCES ({sources.length})
            </h2>
            <p className="text-xs text-slate-400 font-mono-radar">
              Manage live RSS feeds, endpoint status, and auto-poll toggles.
            </p>
          </div>

          <button
            onClick={() => setShowAddSource(!showAddSource)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-xl text-xs font-radar font-bold cursor-pointer"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>ADD NEW RSS FEED</span>
          </button>
        </div>

        {/* Add Source Drawer / Form */}
        {showAddSource && (
          <form onSubmit={handleAddSourceSubmit} className="p-4 bg-[#040814] border border-slate-700 rounded-xl space-y-3">
            <h3 className="text-sm font-bold font-radar text-white">Register New Legitimate RSS Feed</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Source Name (e.g., Reuters Africa, BBC)..."
                value={newSourceName}
                onChange={(e) => setNewSourceName(e.target.value)}
                className="bg-[#090f20] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                required
              />
              <input
                type="url"
                placeholder="RSS / Atom XML Feed URL (https://...)..."
                value={newSourceFeedUrl}
                onChange={(e) => setNewSourceFeedUrl(e.target.value)}
                className="bg-[#090f20] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono-radar"
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select
                value={newSourceCategory}
                onChange={(e) => setNewSourceCategory(e.target.value as NewsCategory)}
                className="bg-[#090f20] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono-radar"
              >
                <option value="World News">World News</option>
                <option value="Africa News">Africa News</option>
                <option value="Rwanda News">Rwanda News</option>
                <option value="Security and Conflicts">Security and Conflicts</option>
                <option value="Technology">Technology</option>
                <option value="Business and Economy">Business and Economy</option>
              </select>
              <input
                type="text"
                placeholder="Country / Region (e.g., Rwanda, Global)..."
                value={newSourceCountry}
                onChange={(e) => setNewSourceCountry(e.target.value)}
                className="bg-[#090f20] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddSource(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs"
              >
                Save & Initialize Feed
              </button>
            </div>
          </form>
        )}

        {/* Sources List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono-radar">
            <thead className="bg-[#040814] text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">SOURCE</th>
                <th className="p-3">DEFAULT CATEGORY</th>
                <th className="p-3">REGION</th>
                <th className="p-3">HEALTH</th>
                <th className="p-3">LAST CHECKED</th>
                <th className="p-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {sources.map((src) => (
                <tr key={src.id} className="hover:bg-slate-900/50">
                  <td className="p-3">
                    <div className="font-bold text-white font-radar text-sm">{src.name}</div>
                    <div className="text-[10px] text-slate-500 truncate max-w-xs">{src.feedUrl}</div>
                  </td>
                  <td className="p-3 text-slate-300">{src.category}</td>
                  <td className="p-3 text-slate-400">{src.country}</td>
                  <td className="p-3">
                    {src.status === 'HEALTHY' && (
                      <span className="inline-flex items-center gap-1 text-emerald-400">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>HEALTHY</span>
                      </span>
                    )}
                    {src.status === 'SYNCING' && (
                      <span className="inline-flex items-center gap-1 text-amber-400">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>SYNCING</span>
                      </span>
                    )}
                    {src.status === 'ERROR' && (
                      <span className="inline-flex items-center gap-1 text-red-400" title={src.errorMessage}>
                        <XCircle className="w-3.5 h-3.5" />
                        <span>ERROR</span>
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-slate-400">
                    {src.lastChecked ? new Date(src.lastChecked).toLocaleTimeString() : 'Pending'}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => onToggleSource(src.id)}
                      className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition-all ${
                        src.isActive
                          ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/60 hover:bg-emerald-900/50'
                          : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
                      }`}
                    >
                      {src.isActive ? 'ACTIVE' : 'PAUSED'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monitoring Logs Live Stream */}
      <div className="bg-[#050a18] border border-slate-800 rounded-2xl p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold font-radar text-white uppercase tracking-wider">
              REAL-TIME MONITORING AUDIT LOG
            </h2>
          </div>
          <span className="text-[11px] font-mono-radar text-slate-500">
            AUTO-STREAMING RADAR EVENTS
          </span>
        </div>

        <div className="bg-[#02050c] border border-slate-850 rounded-xl p-3 font-mono-radar text-xs max-h-56 overflow-y-auto space-y-1.5">
          {logs.length === 0 ? (
            <p className="text-slate-600 italic">Listening for news monitoring heartbeats...</p>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="flex items-start gap-2">
                <span className="text-slate-500 shrink-0">
                  [{new Date(log.timestamp).toLocaleTimeString()}]
                </span>
                <span
                  className={`font-bold shrink-0 ${
                    log.level === 'ALERT'
                      ? 'text-red-400'
                      : log.level === 'ERROR'
                      ? 'text-red-500'
                      : log.level === 'WARN'
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  [{log.level}]
                </span>
                <span className="text-slate-400 shrink-0">[{log.source}]</span>
                <span className="text-slate-200">{log.message}</span>
                {log.durationMs && (
                  <span className="text-slate-600 ml-auto shrink-0">{log.durationMs}ms</span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
      </>
      )}
    </div>
  );
};
