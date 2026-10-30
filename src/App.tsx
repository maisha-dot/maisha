/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { BreakingTicker } from './components/BreakingTicker';
import { CategoryFilter } from './components/CategoryFilter';
import { NewsCard } from './components/NewsCard';
import { ArticleDetailModal } from './components/ArticleDetailModal';
import { GlobalTrackerView } from './components/GlobalTrackerView';
import { AIIntelligenceView } from './components/AIIntelligenceView';
import { AdminDashboardView } from './components/AdminDashboardView';
import { NotificationDrawer } from './components/NotificationDrawer';
import { NotificationSettingsModal } from './components/NotificationSettingsModal';
import { RwandaUpdatesHub } from './components/RwandaUpdatesHub';
import { RwandaRadarDashboard } from './components/RwandaRadarDashboard';
import { TopAdvertisementBanner } from './components/TopAdvertisementBanner';
import { BottomAdvertisementBanner } from './components/BottomAdvertisementBanner';
import { AdvertisePortalModal } from './components/AdvertisePortalModal';
import {
  NewsArticle,
  NewsCategory,
  NewsSource,
  BreakingAlert,
  AdminStats,
  UserPreferences,
  AIAnalysisData,
} from './types/news';
import {
  Radio,
  Flame,
  Globe2,
  RefreshCw,
  Sparkles,
  Compass,
  AlertTriangle,
  Bookmark,
  TrendingUp,
  Shield,
  Layers,
  ArrowUpRight,
  MapPin,
} from 'lucide-react';

const DEFAULT_PREFERENCES: UserPreferences = {
  notificationsEnabled: true,
  soundAlerts: true,
  minUrgency: 'ALL',
  selectedCategories: [
    'World News',
    'Africa News',
    'Rwanda News',
    'Security and Conflicts',
    'Politics',
    'Business and Economy',
    'Technology',
  ],
  selectedCountries: ['Rwanda', 'DR Congo', 'Kenya', 'United States', 'United Kingdom'],
  theme: 'radar-dark',
  language: 'en',
};

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('radar');
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [tickerArticles, setTickerArticles] = useState<NewsArticle[]>([]);
  const [totalArticles, setTotalArticles] = useState<number>(0);
  const [loadingArticles, setLoadingArticles] = useState<boolean>(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory>('All');
  const [selectedCountry, setSelectedCountry] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [breakingOnly, setBreakingOnly] = useState<boolean>(false);

  // Stats & Sources
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [sources, setSources] = useState<NewsSource[]>([]);
  const [alerts, setAlerts] = useState<BreakingAlert[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  // UI Modals
  const [selectedArticleModal, setSelectedArticleModal] = useState<NewsArticle | null>(null);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState<boolean>(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState<boolean>(false);
  const [rwandaHubOpen, setRwandaHubOpen] = useState<boolean>(false);
  const [advertiseModalOpen, setAdvertiseModalOpen] = useState<boolean>(false);
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isSweeping, setIsSweeping] = useState<boolean>(false);
  const [lastSweepTime, setLastSweepTime] = useState<string>('Just now');

  // Synthesize radar audio alert chime using Web Audio API
  const playRadarSiren = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.35);

      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch {
      // AudioContext could be blocked by browser policy prior to gesture
    }
  }, [soundEnabled]);

  // Load articles from backend
  const fetchArticles = useCallback(() => {
    setLoadingArticles(true);
    const params = new URLSearchParams();
    if (selectedCategory && selectedCategory !== 'All') params.append('category', selectedCategory);
    if (selectedCountry && selectedCountry !== 'All') params.append('country', selectedCountry);
    if (searchQuery) params.append('query', searchQuery);
    if (breakingOnly || activeTab === 'breaking') params.append('breakingOnly', 'true');
    params.append('limit', '40');

    fetch(`/api/news?${params.toString()}`)
      .then((res) => res.json())
      .then((data: { articles: NewsArticle[]; total: number }) => {
        setArticles(data.articles || []);
        setTotalArticles(data.total || 0);
        setLoadingArticles(false);
      })
      .catch((err) => {
        console.error('Failed to fetch articles:', err);
        setLoadingArticles(false);
      });
  }, [selectedCategory, selectedCountry, searchQuery, breakingOnly, activeTab]);

  // Load ticker, alerts, sources, stats
  const fetchMetadata = useCallback(() => {
    fetch('/api/ticker')
      .then((res) => res.json())
      .then((data: NewsArticle[]) => setTickerArticles(data))
      .catch((e) => console.error(e));

    fetch('/api/notifications')
      .then((res) => res.json())
      .then((data: BreakingAlert[]) => setAlerts(data))
      .catch((e) => console.error(e));

    fetch('/api/sources')
      .then((res) => res.json())
      .then((data: NewsSource[]) => setSources(data))
      .catch((e) => console.error(e));

    fetch('/api/stats')
      .then((res) => res.json())
      .then((data: AdminStats) => setStats(data))
      .catch((e) => console.error(e));
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  useEffect(() => {
    fetchMetadata();
    // Poll updates every 60 seconds
    const interval = setInterval(() => {
      fetchArticles();
      fetchMetadata();
    }, 60000);
    return () => clearInterval(interval);
  }, [fetchArticles, fetchMetadata]);

  // Force radar sweep across all RSS feeds
  const handleTriggerSweep = async () => {
    setIsSweeping(true);
    try {
      const res = await fetch('/api/monitor/sweep', { method: 'POST' });
      const data = await res.json();
      fetchArticles();
      fetchMetadata();
      setLastSweepTime(new Date().toLocaleTimeString());
      if (data.newCount > 0) {
        playRadarSiren();
      }
    } catch (e) {
      console.error('Sweep error:', e);
    } finally {
      setIsSweeping(false);
    }
  };

  // Toggle bookmark
  const handleToggleBookmark = async (articleId: string) => {
    try {
      const res = await fetch('/api/bookmarks/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId }),
      });
      const data = await res.json();
      setBookmarkedIds((prev) => {
        const next = new Set(prev);
        if (data.isBookmarked) {
          next.add(articleId);
        } else {
          next.delete(articleId);
        }
        return next;
      });
    } catch (e) {
      console.error('Bookmark error:', e);
    }
  };

  // Gemini AI Analysis requester
  const handleRequestAIAnalysis = async (targetArticle: Partial<NewsArticle>): Promise<AIAnalysisData | null> => {
    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId: targetArticle.id,
          articleData: targetArticle,
        }),
      });
      if (!res.ok) throw new Error('AI analysis failed');
      const data: AIAnalysisData = await res.json();
      // Update article locally if present
      if (targetArticle.id) {
        setArticles((prev) =>
          prev.map((a) => (a.id === targetArticle.id ? { ...a, aiAnalysis: data } : a))
        );
      }
      return data;
    } catch (err) {
      console.error('AI Analysis error:', err);
      return null;
    }
  };

  // Add source handler
  const handleAddSource = async (newSrc: { name: string; feedUrl: string; category: NewsCategory; country: string }) => {
    try {
      const res = await fetch('/api/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSrc),
      });
      if (res.ok) {
        const created = await res.json();
        setSources((prev) => [...prev, created]);
        handleTriggerSweep();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Toggle source handler
  const handleToggleSource = async (id: string) => {
    try {
      const res = await fetch(`/api/sources/${id}/toggle`, { method: 'PATCH' });
      if (res.ok) {
        const updated = await res.json();
        setSources((prev) => prev.map((s) => (s.id === id ? updated : s)));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Manual broadcast alert
  const handleBroadcastAlert = async (newAlert: { title: string; summary: string; category: NewsCategory; source: string }) => {
    try {
      const res = await fetch('/api/notifications/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAlert),
      });
      if (res.ok) {
        const createdAlert = await res.json();
        setAlerts((prev) => [createdAlert, ...prev]);
        playRadarSiren();
        fetchArticles();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Filter bookmarked articles
  const displayedArticles = activeTab === 'bookmarks'
    ? articles.filter((a) => bookmarkedIds.has(a.id))
    : articles;

  const featuredLead = displayedArticles[0];
  const regularArticles = displayedArticles.slice(1);

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans selection:bg-red-600 selection:text-white">
      {/* 1. High Velocity Marquee Breaking Ticker */}
      <BreakingTicker
        articles={tickerArticles}
        onSelectArticle={(a) => setSelectedArticleModal(a)}
      />

      {/* 2. Global Radar Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'breaking') setBreakingOnly(true);
          else if (breakingOnly && tab === 'radar') setBreakingOnly(false);
        }}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        alerts={alerts}
        unreadAlertsCount={alerts.length}
        onOpenNotifications={() => setNotificationDrawerOpen(true)}
        onOpenSettings={() => setSettingsModalOpen(true)}
        onOpenRwandaHub={() => setActiveTab('rwanda')}
        onOpenAdvertise={() => setAdvertiseModalOpen(true)}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        onTriggerSweep={handleTriggerSweep}
        isSweeping={isSweeping}
      />

      {/* 2b. High-Impact Top Billboard Advertisement */}
      <TopAdvertisementBanner
        onOpenAdvertisePortal={() => setAdvertiseModalOpen(true)}
      />

      {/* 3. Main Body Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-7">
        {/* VIEW: LIVE RADAR & BREAKING WIRE */}
        {(activeTab === 'radar' || activeTab === 'breaking' || activeTab === 'bookmarks') && (
          <div className="space-y-6">
            {/* Radar Telemetry Subheader */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#060b18] border border-slate-800/80 rounded-xl px-4 py-2.5 text-xs font-mono-radar">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  RADAR ACTIVE
                </span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-400">
                  MONITORING <span className="text-white font-bold">{sources.filter((s) => s.isActive).length}</span> FEEDS
                </span>
                <span className="hidden md:inline text-slate-600">|</span>
                <span className="hidden md:inline text-slate-400">
                  STORIES IN RADAR: <span className="text-white font-bold">{totalArticles}</span>
                </span>
              </div>

              <div className="flex items-center gap-2 text-slate-400">
                <span>LAST SWEEP: {lastSweepTime}</span>
              </div>
            </div>

            {/* Category and Country Filters */}
            <CategoryFilter
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => setSelectedCategory(cat)}
              selectedCountry={selectedCountry}
              onSelectCountry={(country) => setSelectedCountry(country)}
              breakingOnly={breakingOnly || activeTab === 'breaking'}
              onToggleBreakingOnly={() => setBreakingOnly(!breakingOnly)}
            />

            {/* Quick Rwanda Updates Broadcast Banner */}
            {!searchQuery && selectedCategory !== 'Rwanda News' && (
              <div className="bg-[#0c0c0c] border border-neutral-800 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#E60026]/20 border border-[#E60026]/40 flex items-center justify-center text-sm shrink-0">
                    🇷🇼
                  </div>
                  <div className="text-left">
                    <span className="font-bold text-white font-radar text-xs sm:text-sm flex items-center gap-2">
                      <span>RWANDA RADAR MONITORING DESK</span>
                      <span className="bg-[#E60026] text-white text-[10px] px-1.5 py-0.2 rounded font-mono-radar font-bold">
                        OFFICIAL
                      </span>
                    </span>
                    <p className="text-[11px] text-neutral-300 font-sans">
                      Dedicated live monitoring of IGIHE, The New Times, Kigali Today, KT Press, RBA, and official government releases.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setActiveTab('rwanda')}
                    className="px-3.5 py-1.5 rounded-lg bg-[#E60026] hover:bg-[#cc0020] text-white font-radar font-bold text-xs cursor-pointer shadow-md flex items-center gap-1.5"
                  >
                    <span>OPEN RWANDA RADAR</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setRwandaHubOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 text-xs font-mono-radar cursor-pointer"
                  >
                    Alert Channels
                  </button>
                </div>
              </div>
            )}

            {/* Search feedback notice */}
            {searchQuery && (
              <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl flex items-center justify-between text-xs font-mono-radar">
                <span>
                  Filtering by keyword: <strong className="text-red-400">&ldquo;{searchQuery}&rdquo;</strong> ({displayedArticles.length} results)
                </span>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-slate-400 hover:text-white underline cursor-pointer"
                >
                  Clear filter
                </button>
              </div>
            )}

            {/* Bookmarks view header if in bookmarks */}
            {activeTab === 'bookmarks' && (
              <div className="bg-[#080e1e] border border-amber-800/40 p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-400 font-radar font-bold">
                  <Bookmark className="w-5 h-5 fill-current" />
                  <span>SAVED DISPATCHES ({displayedArticles.length})</span>
                </div>
                <span className="text-xs font-mono-radar text-slate-400">
                  Locally archived articles for quick retrieval
                </span>
              </div>
            )}

            {/* Loading Skeleton */}
            {loadingArticles && displayedArticles.length === 0 ? (
              <div className="py-24 text-center space-y-4">
                <div className="inline-block w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                <h3 className="text-lg font-radar font-bold text-white">
                  Intercepting International Wire Transmissions...
                </h3>
                <p className="text-xs font-mono-radar text-slate-400">
                  Querying BBC, Al Jazeera, The New Times Rwanda, Africanews, TechCrunch, and scientific feeds.
                </p>
              </div>
            ) : displayedArticles.length === 0 ? (
              <div className="py-20 text-center bg-[#060b18] rounded-2xl border border-slate-800 space-y-3">
                <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
                <h3 className="text-lg font-bold font-radar text-white">
                  No Dispatches Found Matching Active Filter
                </h3>
                <p className="text-xs font-mono-radar text-slate-400">
                  Try adjusting the category, country geolocation, or search parameters.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setSelectedCountry('All');
                    setSearchQuery('');
                    setBreakingOnly(false);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-radar font-bold cursor-pointer"
                >
                  RESET ALL FILTERS
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Featured Top Story (Only on main radar and when no search) */}
                {featuredLead && !searchQuery && activeTab === 'radar' && selectedCategory === 'All' && (
                  <NewsCard
                    article={featuredLead}
                    onOpenArticle={(a) => setSelectedArticleModal(a)}
                    onOpenAI={(a) => setSelectedArticleModal(a)}
                    isBookmarked={bookmarkedIds.has(featuredLead.id)}
                    onToggleBookmark={handleToggleBookmark}
                    isFeatured={true}
                  />
                )}

                {/* News Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {(searchQuery || activeTab !== 'radar' || selectedCategory !== 'All' ? displayedArticles : regularArticles).map((article) => (
                    <NewsCard
                      key={article.id}
                      article={article}
                      onOpenArticle={(a) => setSelectedArticleModal(a)}
                      onOpenAI={(a) => setSelectedArticleModal(a)}
                      isBookmarked={bookmarkedIds.has(article.id)}
                      onToggleBookmark={handleToggleBookmark}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW: 🇷🇼 RWANDA NEWS RADAR DEDICATED DASHBOARD */}
        {activeTab === 'rwanda' && (
          <RwandaRadarDashboard
            onBackToGlobalRadar={() => setActiveTab('radar')}
          />
        )}

        {/* VIEW: GLOBAL NEWS TRACKER */}
        {activeTab === 'global' && (
          <GlobalTrackerView
            onSelectCountry={(country) => {
              setSelectedCountry(country);
              setActiveTab('radar');
            }}
            onSelectArticle={(article) => setSelectedArticleModal(article)}
            onSelectCategory={(cat) => {
              setSelectedCategory(cat as NewsCategory);
              setActiveTab('radar');
            }}
            onSearchQuery={(q) => {
              setSearchQuery(q);
              setActiveTab('radar');
            }}
            onEnableRwandaPush={() => {
              playRadarSiren();
              if (typeof Notification !== 'undefined') {
                Notification.requestPermission().then((res) => {
                  if (res === 'granted') {
                    new Notification('IMPAMOPRESS RWANDA RADAR', {
                      body: 'Amakuru yihutirwa y\'u Rwanda: Push notifications enabled.',
                    });
                  }
                });
              }
            }}
          />
        )}

        {/* VIEW: AI NEWS INTELLIGENCE LAB */}
        {activeTab === 'intel' && (
          <AIIntelligenceView
            articles={articles}
            onRequestAIAnalysis={handleRequestAIAnalysis}
          />
        )}

        {/* VIEW: ADMIN MONITORING DESK */}
        {activeTab === 'admin' && (
          <AdminDashboardView
            stats={stats}
            sources={sources}
            onToggleSource={handleToggleSource}
            onAddSource={handleAddSource}
            onTriggerSweep={handleTriggerSweep}
            isSweeping={isSweeping}
            onBroadcastAlert={handleBroadcastAlert}
          />
        )}
      </main>

      {/* 4. Full Article Detail & Gemini AI Modal */}
      <ArticleDetailModal
        article={selectedArticleModal}
        onClose={() => setSelectedArticleModal(null)}
        isBookmarked={selectedArticleModal ? bookmarkedIds.has(selectedArticleModal.id) : false}
        onToggleBookmark={handleToggleBookmark}
        onRequestAIAnalysis={handleRequestAIAnalysis}
      />

      {/* 5. Notification Slide-over Drawer */}
      <NotificationDrawer
        isOpen={notificationDrawerOpen}
        onClose={() => setNotificationDrawerOpen(false)}
        alerts={alerts}
        onSelectAlert={(alert) => {
          setNotificationDrawerOpen(false);
          const found = articles.find((a) => a.id === alert.articleId);
          if (found) {
            setSelectedArticleModal(found);
          } else {
            // Virtual article from manual alert
            setSelectedArticleModal({
              id: alert.id,
              title: alert.title,
              description: alert.summary,
              url: '#',
              source: alert.source,
              sourceId: 'manual',
              category: alert.category,
              publishedAt: alert.timestamp,
              detectedAt: alert.timestamp,
              isBreaking: true,
              isDeveloping: true,
              urgencyLevel: 'CRITICAL',
              verificationStatus: 'VERIFIED',
              readTimeMinutes: 2,
            });
          }
        }}
        onOpenSettings={() => {
          setNotificationDrawerOpen(false);
          setSettingsModalOpen(true);
        }}
        onClearAlerts={() => setAlerts([])}
      />

      {/* 6. Notification Settings & Audio Siren Modal */}
      <NotificationSettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        preferences={preferences}
        onUpdatePreferences={(updated) => setPreferences((prev) => ({ ...prev, ...updated }))}
        onTestNotification={() => {
          playRadarSiren();
          const testAlert: BreakingAlert = {
            id: 'test-' + Date.now(),
            title: 'TEST BULLETIN: High-Impact Dispatches Monitored on Radar',
            summary: 'Audio radar siren and browser alerts tested successfully on IMPAMOPRESS RADAR HOT NEWS.',
            category: 'World News',
            source: 'IMPAMOPRESS RADAR DESK',
            urgency: 'CRITICAL',
            timestamp: new Date().toISOString(),
          };
          setAlerts((prev) => [testAlert, ...prev]);
        }}
      />

      {/* 7. Rwanda News Updates Hub Modal */}
      <RwandaUpdatesHub
        isOpen={rwandaHubOpen}
        onClose={() => setRwandaHubOpen(false)}
        onFilterRwandaOnly={() => {
          setSelectedCategory('Rwanda News');
          setSelectedCountry('Rwanda');
          setActiveTab('radar');
        }}
        onEnableRwandaPush={() => {
          playRadarSiren();
          if (typeof Notification !== 'undefined') {
            Notification.requestPermission().then((res) => {
              if (res === 'granted') {
                new Notification('IMPAMOPRESS RWANDA RADAR', {
                  body: 'Amakuru y\'u Rwanda: Priority alert subscription active.',
                });
              }
            });
          }
        }}
      />

      {/* 6b. Dedicated Bottom Website Advertisement */}
      <BottomAdvertisementBanner
        onOpenAdvertisePortal={() => setAdvertiseModalOpen(true)}
      />

      {/* 7. Professional Newsroom Footer */}
      <footer className="mt-16 bg-[#02050c] border-t border-slate-800 text-slate-400 text-xs font-mono-radar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          {/* Advertise With Us Top Banner in Footer */}
          <div className="bg-black border border-[#E60026] rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-black">
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="bg-[#E60026] text-white text-[10px] font-bold px-1.5 py-0.5 rounded font-radar uppercase">
                  PARTNER WITH US
                </span>
                <span className="text-white font-radar font-bold text-sm tracking-wider uppercase">
                  ADVERTISE ON IMPAMOPRESS RADAR HOT NEWS
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-sans">
                Self-service advertising portal with direct MTN Mobile Money checkout. Top billboards ($10/week with MP4 video) & bottom displays ($5/week).
              </p>
            </div>

            <button
              onClick={() => setAdvertiseModalOpen(true)}
              className="bg-[#E60026] hover:bg-red-700 text-white font-radar font-bold text-xs uppercase px-5 py-2.5 rounded flex items-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-[#E60026]/40 shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>ADVERTISE WITH US</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Branding Column */}
            <div className="space-y-3 md:col-span-1">
              <div className="flex items-center gap-2">
                <span className="text-lg font-black font-radar text-white tracking-wider">
                  IMPAMOPRESS
                </span>
                <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded font-radar">
                  RADAR
                </span>
              </div>
              <p className="text-red-400 font-bold text-[11px] tracking-wider">
                &ldquo;BE FIRST. KNOW MORE. STAY AHEAD.&rdquo;
              </p>
              <p className="text-slate-500 text-[11px] font-sans leading-relaxed">
                Autonomous real-time international news intelligence engine monitoring legitimate press syndicates, regional agencies, and verified wires 24 hours a day, 7 days a week.
              </p>
            </div>

            {/* News Categories */}
            <div className="space-y-2">
              <h4 className="text-white font-radar font-bold uppercase tracking-wider text-xs">
                Key Desks
              </h4>
              <ul className="space-y-1 text-[11px] text-slate-400">
                <li className="hover:text-red-400 cursor-pointer" onClick={() => setSelectedCategory('Rwanda News')}>Rwanda News Desk</li>
                <li className="hover:text-red-400 cursor-pointer" onClick={() => setSelectedCategory('Africa News')}>Pan-Africa Coverage</li>
                <li className="hover:text-red-400 cursor-pointer" onClick={() => setSelectedCategory('Security and Conflicts')}>Security & Conflict Radar</li>
                <li className="hover:text-red-400 cursor-pointer" onClick={() => setSelectedCategory('Business and Economy')}>Global Markets & Economy</li>
                <li className="hover:text-red-400 cursor-pointer" onClick={() => setSelectedCategory('Technology')}>Technology & Artificial Intelligence</li>
              </ul>
            </div>

            {/* Architecture & AI Intelligence */}
            <div className="space-y-2">
              <h4 className="text-white font-radar font-bold uppercase tracking-wider text-xs">
                Commercial & Advertising
              </h4>
              <ul className="space-y-1 text-[11px] text-slate-400">
                <li className="text-white hover:text-[#E60026] cursor-pointer font-bold" onClick={() => setAdvertiseModalOpen(true)}>
                  &bull; Self-Service Advertising Portal
                </li>
                <li className="hover:text-white cursor-pointer" onClick={() => setAdvertiseModalOpen(true)}>
                  &bull; Top Premium Billboard ($10/Week)
                </li>
                <li className="hover:text-white cursor-pointer" onClick={() => setAdvertiseModalOpen(true)}>
                  &bull; Bottom Website Showcase ($5/Week)
                </li>
                <li className="hover:text-white cursor-pointer" onClick={() => setAdvertiseModalOpen(true)}>
                  &bull; MTN Mobile Money (MoMo Code: 2031802)
                </li>
                <li className="hover:text-white cursor-pointer" onClick={() => setAdvertiseModalOpen(true)}>
                  &bull; Campaign Analytics & Performance
                </li>
              </ul>
            </div>

            {/* Newsroom Ethics & Original Attribution */}
            <div className="space-y-2">
              <h4 className="text-white font-radar font-bold uppercase tracking-wider text-xs">
                Editorial Integrity
              </h4>
              <p className="text-[11px] text-slate-500 font-sans leading-relaxed">
                IMPAMOPRESS RADAR HOT NEWS provides direct links and unambiguous credit to original publishers (BBC, The New Times Rwanda, Al Jazeera, Reuters, etc.). All dispatches preserve original publication timestamps alongside platform interception records.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
            <div>
              &copy; {new Date().getFullYear()} IMPAMOPRESS RADAR HOT NEWS. All rights reserved.
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setAdvertiseModalOpen(true)}
                className="text-[#E60026] hover:text-white font-bold cursor-pointer"
              >
                ADVERTISE WITH US
              </button>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>SYSTEM STATUS: OPERATIONAL</span>
              </span>
              <span>KIGALI &bull; GENEVA &bull; LONDON</span>
            </div>
          </div>
        </div>
      </footer>

      {/* 8. Self-Service Advertising & MTN MoMo Payment Portal */}
      <AdvertisePortalModal
        isOpen={advertiseModalOpen}
        onClose={() => setAdvertiseModalOpen(false)}
      />
    </div>
  );
}
