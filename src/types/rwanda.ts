export type RwandaCategory =
  | 'All'
  | 'Rwanda Breaking News'
  | 'Latest Rwanda News'
  | 'Government Announcements'
  | 'Politics and Governance'
  | 'Security and Public Safety'
  | 'Business and Economy'
  | 'Education'
  | 'Health'
  | 'Technology'
  | 'Infrastructure and Construction'
  | 'Agriculture'
  | 'Sports'
  | 'Entertainment'
  | 'International Relations';

export type RwandaProvince =
  | 'All Provinces'
  | 'Kigali City'
  | 'Northern Province'
  | 'Southern Province'
  | 'Eastern Province'
  | 'Western Province'
  | 'National';

export type RwandaPublisherName =
  | 'IGIHE'
  | 'The New Times Rwanda'
  | 'Kigali Today'
  | 'KT Press'
  | 'RBA'
  | 'TV1 Rwanda'
  | 'Isango Star'
  | 'Radio10'
  | 'Umuseke'
  | 'Umuryango'
  | 'Inyarwanda'
  | 'Taarifa Rwanda'
  | 'Rwanda Dispatch'
  | 'Government of Rwanda';

export interface RwandaAIAnalysis {
  summary: string;
  bulletPoints: string[];
  confirmedFacts: string[];
  allegations: string[];
  unverifiedReports: string[];
  englishText: string;
  kinyarwandaText: string;
  frenchText: string;
  publisherComparison?: string;
  isDeveloping: boolean;
  impactScore: number;
  analyzedAt: string;
}

export interface RwandaArticle {
  id: string;
  title: string;
  description: string;
  contentSnippet?: string;
  url: string;
  publisher: RwandaPublisherName;
  publisherId: string;
  category: RwandaCategory;
  province: RwandaProvince;
  district?: string;
  imageUrl?: string;
  publishedAt: string; // ISO
  detectedAt: string;  // ISO
  isBreaking: boolean;
  isDeveloping: boolean;
  isGovAnnouncement: boolean;
  urgencyLevel: 'NORMAL' | 'HIGH' | 'CRITICAL';
  verificationStatus: 'CONFIRMED' | 'ALLEGATION' | 'UNVERIFIED';
  readTimeMinutes: number;
  tags?: string[];
  aiAnalysis?: RwandaAIAnalysis;
}

export interface RwandaSourceHealth {
  id: string;
  name: RwandaPublisherName;
  feedUrl: string;
  websiteUrl: string;
  language: 'rw' | 'en' | 'fr' | 'multi';
  type: 'PUBLIC_RSS' | 'API_PUBLIC' | 'OFFICIAL_PORTAL';
  status: 'ACTIVE' | 'INACTIVE' | 'ERROR';
  lastSuccessfulCheck: string | null;
  lastArticleDetected: string | null;
  articlesCollected: number;
  collectionFrequencySec: number;
  responseTimeMs: number;
  consecutiveFailures: number;
  errorMessage?: string;
}

export interface RwandaStats {
  totalArticles: number;
  breakingCount: number;
  govAnnouncementsCount: number;
  activeSources: number;
  totalSources: number;
  failedSources: number;
  monitoringCoveragePercent: number; // Actual, e.g. 84.6%
  articlesToday: number;
  lastCollectionTimestamp: string;
}
