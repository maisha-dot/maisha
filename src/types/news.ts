export type NewsCategory =
  | 'All'
  | 'World News'
  | 'Africa News'
  | 'Rwanda News'
  | 'Politics'
  | 'Business and Economy'
  | 'Technology'
  | 'Science'
  | 'Health'
  | 'Sports'
  | 'Entertainment'
  | 'Security and Conflicts'
  | 'Environment';

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  contentSnippet?: string;
  url: string;
  source: string;
  sourceId: string;
  sourceIcon?: string;
  author?: string;
  category: NewsCategory;
  country?: string;
  region?: string;
  imageUrl?: string;
  publishedAt: string; // ISO date
  detectedAt: string; // When IMPAMOPRESS Radar spotted it
  isBreaking: boolean;
  isDeveloping: boolean;
  urgencyLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  verificationStatus?: 'VERIFIED' | 'ALLEGATION' | 'UNCONFIRMED';
  readTimeMinutes?: number;
  tags?: string[];
  aiAnalysis?: AIAnalysisData;
}

export interface AIAnalysisData {
  summary: string;
  bulletPoints: string[];
  keyFacts: string[];
  allegations: string[];
  unconfirmed: string[];
  kinyarwandaTitle?: string;
  kinyarwandaSummary?: string;
  englishSummary?: string;
  impactScore: number; // 1-100
  geopoliticalSignificance: 'LOCAL' | 'REGIONAL' | 'INTERNATIONAL' | 'GLOBAL_CRISIS';
  similarStoryThemes?: string[];
  coverageComparison?: string;
  analyzedAt: string;
}

export interface NewsSource {
  id: string;
  name: string;
  url: string;
  feedUrl: string;
  category: NewsCategory;
  country: string;
  language: string;
  isActive: boolean;
  lastChecked?: string;
  lastArticleCount?: number;
  status: 'HEALTHY' | 'SYNCING' | 'ERROR';
  errorMessage?: string;
}

export interface RadarGeoHotspot {
  countryCode: string;
  countryName: string;
  region: string;
  lat: number;
  lng: number;
  articleCount: number;
  breakingCount: number;
  threatLevel: 'NORMAL' | 'ELEVATED' | 'HIGH' | 'CRITICAL';
  topHeadline: string;
}

export interface BreakingAlert {
  id: string;
  articleId?: string;
  title: string;
  summary: string;
  category: NewsCategory;
  source: string;
  urgency: 'HIGH' | 'CRITICAL';
  timestamp: string;
  isRead?: boolean;
}

export interface MonitoringLog {
  id: string;
  timestamp: string;
  level: 'INFO' | 'ALERT' | 'WARN' | 'ERROR';
  source: string;
  message: string;
  articlesFound?: number;
  durationMs?: number;
}

export interface UserPreferences {
  notificationsEnabled: boolean;
  soundAlerts: boolean;
  minUrgency: 'ALL' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  selectedCategories: NewsCategory[];
  selectedCountries: string[];
  theme: 'radar-dark';
  language: 'en' | 'rw';
}

export interface AdminStats {
  totalArticles: number;
  breakingArticles: number;
  activeSources: number;
  failedFeeds: number;
  radarSweepsToday: number;
  averageDetectionLatencySec: number;
  articlesLastHour: number;
  uptimeSeconds: number;
  memoryUsageMb: number;
  lastSweepTime: string;
}

export interface DailyTrendPoint {
  date: string;
  dayLabel: string;
  rwandaNews: number;
  africaNews: number;
  worldNews: number;
  securityConflicts: number;
  techBusiness: number;
  total: number;
}

export interface SourceVolumePoint {
  sourceName: string;
  count: number;
  percentage: number;
  status: 'HEALTHY' | 'SYNCING' | 'ERROR';
  color: string;
}

export interface TrendingTopic {
  id: string;
  topic: string;
  category: NewsCategory;
  region: string;
  articleCount: number;
  velocityChangePercent: number; // e.g. +45%
  isDeveloping: boolean;
  urgencyLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface TrendsData {
  dailyTrends: DailyTrendPoint[];
  sourceVolumes: SourceVolumePoint[];
  trendingTopics: TrendingTopic[];
  totalArticlesWeek: number;
  rwandaWeeklyCount: number;
}
