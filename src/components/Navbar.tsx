import React, { useState, useEffect } from 'react';
import {
  Radio,
  Flame,
  Globe2,
  Sparkles,
  Bookmark,
  ShieldAlert,
  Bell,
  Search,
  Volume2,
  VolumeX,
  Menu,
  X,
  RefreshCw,
  Compass,
} from 'lucide-react';
import { BreakingAlert } from '../types/news';

export type ActiveTab = 'radar' | 'rwanda' | 'breaking' | 'global' | 'intel' | 'bookmarks' | 'admin';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  alerts: BreakingAlert[];
  unreadAlertsCount: number;
  onOpenNotifications: () => void;
  onOpenSettings: () => void;
  onOpenRwandaHub?: () => void;
  onOpenAdvertise?: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  onTriggerSweep: () => void;
  isSweeping: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  unreadAlertsCount,
  onOpenNotifications,
  onOpenSettings,
  onOpenRwandaHub,
  onOpenAdvertise,
  soundEnabled,
  setSoundEnabled,
  onTriggerSweep,
  isSweeping,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
          ' UTC' +
          (now.getTimezoneOffset() <= 0 ? '+' : '-') +
          Math.abs(Math.floor(now.getTimezoneOffset() / 60))
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'radar', label: 'Live Radar', icon: Radio },
    { id: 'rwanda', label: '🇷🇼 RWANDA RADAR', icon: Compass, badge: 'OFFICIAL' },
    { id: 'breaking', label: 'Breaking Wire', icon: Flame, badge: 'HOT' },
    { id: 'global', label: 'Global Tracker', icon: Globe2 },
    { id: 'intel', label: 'AI Intelligence', icon: Sparkles },
    { id: 'bookmarks', label: 'Saved', icon: Bookmark },
    { id: 'admin', label: 'Admin Desk', icon: ShieldAlert },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#040814]/95 backdrop-blur-md border-b border-slate-800">
      {/* Top micro status bar */}
      <div className="bg-[#02050c] text-[11px] text-slate-400 border-b border-slate-850 px-4 py-1 flex items-center justify-between font-mono-radar">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>RADAR ACTIVE</span>
          </div>
          <span className="hidden md:inline text-slate-500">|</span>
          <span className="hidden md:inline text-slate-400">
            FREQ: <span className="text-slate-300">75s POLLING</span>
          </span>
          <span className="hidden sm:inline text-slate-500">|</span>
          <span className="hidden sm:inline text-slate-400">
            KIGALI &bull; NAIROBI &bull; LONDON &bull; WASHINGTON &bull; GENEVA
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-300 font-medium">{currentTime}</span>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="hover:text-white transition-colors p-0.5 rounded cursor-pointer"
            title={soundEnabled ? 'Mute alert siren' : 'Enable audio alerts'}
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-red-400" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-slate-500" />
            )}
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Logo & Slogan */}
          <div
            onClick={() => setActiveTab('radar')}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-600 via-red-800 to-black rounded-lg flex items-center justify-center border border-red-500/40 shadow-lg shadow-red-900/30 group-hover:border-red-400 transition-all">
              <Compass className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:rotate-45 transition-transform duration-500" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-2xl font-black font-radar tracking-wider text-white">
                  IMPAMOPRESS
                </span>
                <span className="bg-red-600 text-white text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded font-radar tracking-widest shadow-sm">
                  RADAR
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] font-mono-radar font-semibold tracking-wider text-red-400">
                BE FIRST. KNOW MORE. STAY AHEAD.
              </p>
            </div>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search world news, Kigali, politics, defense..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0a1020] border border-slate-700/80 rounded-lg pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-mono-radar"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Actions & Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Rwanda Updates Hub Trigger */}
            {onOpenRwandaHub && (
              <button
                onClick={onOpenRwandaHub}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-600/60 text-emerald-300 text-xs font-radar font-bold tracking-wider transition-all cursor-pointer shadow-sm"
                title="Open Rwanda Updates & Dispatches Hub"
              >
                <span>🇷🇼</span>
                <span className="hidden sm:inline">RWANDA UPDATES</span>
                <span className="sm:hidden">RWANDA</span>
              </button>
            )}

            {/* Force sweep manual radar button */}
            <button
              onClick={onTriggerSweep}
              disabled={isSweeping}
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono-radar font-semibold transition-all cursor-pointer ${
                isSweeping
                  ? 'bg-red-950/40 border-red-800 text-red-300'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
              }`}
              title="Force immediate radar sweep of all international feeds"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSweeping ? 'animate-spin text-red-400' : 'text-slate-400'}`} />
              <span>{isSweeping ? 'SCANNING...' : 'SWEEP FEEDS'}</span>
            </button>

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-lg bg-slate-900/90 border border-slate-700 text-slate-300 hover:text-white hover:border-red-500/70 transition-all cursor-pointer"
              title="Breaking News Alerts"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-slate-200" />
              {unreadAlertsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-mono-radar border-2 border-[#040814] animate-bounce">
                  {unreadAlertsCount > 9 ? '9+' : unreadAlertsCount}
                </span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-1 py-1 border-t border-slate-800/80 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as ActiveTab)}
                className={`relative px-4 py-2 rounded-md font-radar text-xs sm:text-sm font-semibold tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-red-600 text-white shadow-md shadow-red-900/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-850'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && !isActive && (
                  <span className="bg-red-900/80 text-red-400 border border-red-700/50 text-[10px] px-1.5 py-0.2 rounded font-mono-radar font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {onOpenAdvertise && (
            <button
              onClick={onOpenAdvertise}
              className="ml-auto px-3.5 py-1.5 rounded bg-[#E60026] hover:bg-red-700 text-white font-radar text-xs font-bold tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:shadow-[#E60026]/40"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>ADVERTISE WITH US</span>
            </button>
          )}
        </nav>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#070d1d] border-b border-slate-800 px-4 py-3 space-y-2">
          {/* Mobile Search */}
          <div className="relative w-full mb-3">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search news..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#030712] border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs text-white"
            />
          </div>

          {onOpenAdvertise && (
            <button
              onClick={() => {
                onOpenAdvertise();
                setMobileMenuOpen(false);
              }}
              className="w-full bg-[#E60026] hover:bg-red-700 text-white font-radar font-bold text-xs py-2.5 rounded-lg flex items-center justify-center gap-2 tracking-wider uppercase shadow-md cursor-pointer mb-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>ADVERTISE WITH US ($5 - $10/WEEK)</span>
            </button>
          )}

          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as ActiveTab);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-radar font-bold ${
                    isActive ? 'bg-red-600 text-white' : 'bg-slate-900 text-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={() => {
                onTriggerSweep();
                setMobileMenuOpen(false);
              }}
              className="text-xs text-red-400 font-mono-radar flex items-center gap-1.5 py-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>TRIGGER RADAR SWEEP</span>
            </button>
            <button
              onClick={onOpenSettings}
              className="text-xs text-slate-400 hover:text-white"
            >
              Preferences
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
