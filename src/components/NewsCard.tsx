import React from 'react';
import {
  ExternalLink,
  Sparkles,
  Bookmark,
  Radio,
  Clock,
  Radar,
  Share2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { NewsArticle } from '../types/news';

interface NewsCardProps {
  article: NewsArticle;
  onOpenArticle: (article: NewsArticle) => void;
  onOpenAI: (article: NewsArticle) => void;
  isBookmarked: boolean;
  onToggleBookmark: (articleId: string) => void;
  isFeatured?: boolean;
}

export const NewsCard: React.FC<NewsCardProps> = ({
  article,
  onOpenArticle,
  onOpenAI,
  isBookmarked,
  onToggleBookmark,
  isFeatured = false,
}) => {
  const formatTimeAgo = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${Math.floor(diffHours / 24)}d ago`;
    } catch {
      return 'Recent';
    }
  };

  const shareStory = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: `[IMPAMOPRESS RADAR] ${article.title}`,
        url: article.url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(article.url);
    }
  };

  if (isFeatured) {
    return (
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-b from-[#0e172e] to-[#060a16] border border-red-500/30 p-5 sm:p-7 shadow-2xl hover:border-red-500/60 transition-all group">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="bg-red-600 text-white font-bold text-xs px-2.5 py-1 rounded font-radar tracking-wider flex items-center gap-1.5 shadow-md shadow-red-600/40">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              FEATURED RADAR LEAD
            </span>
            <span className="bg-slate-800 text-slate-300 text-xs px-2.5 py-1 rounded font-mono-radar font-semibold border border-slate-700">
              {article.category}
            </span>
            {article.country && (
              <span className="text-xs text-red-400 font-mono-radar font-semibold">
                📍 {article.country}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs font-mono-radar text-slate-400">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>PUB: {formatTimeAgo(article.publishedAt)}</span>
            <span className="text-slate-600">|</span>
            <Radar className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
            <span className="text-emerald-400 font-semibold">RADAR DETECTED</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-4">
            <h2
              onClick={() => onOpenArticle(article)}
              className="text-xl sm:text-2xl md:text-3xl font-bold font-radar text-white leading-tight cursor-pointer hover:text-red-400 transition-colors"
            >
              {article.title}
            </h2>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed line-clamp-3">
              {article.description}
            </p>

            {/* Source & Actions Bar */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-slate-200 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700 font-mono-radar">
                  Source: {article.source}
                </span>
                <span className="text-slate-500 font-mono-radar">
                  {article.readTimeMinutes}m read
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* AI Analysis button */}
                <button
                  onClick={() => onOpenAI(article)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600 border border-red-500/50 hover:border-red-400 text-red-300 hover:text-white text-xs font-radar font-bold tracking-wider transition-all cursor-pointer shadow-md"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>AI INTELLIGENCE</span>
                </button>

                {/* Bookmark */}
                <button
                  onClick={() => onToggleBookmark(article.id)}
                  className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                    isBookmarked
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                  title={isBookmarked ? 'Remove bookmark' : 'Save article'}
                >
                  <Bookmark className="w-4 h-4 fill-current" />
                </button>

                {/* Direct Link to Publisher */}
                {article.url && article.url !== '#' && (
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-mono-radar transition-all"
                  >
                    <span>ORIGINAL WIRE</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Visual Thumbnail */}
          {article.imageUrl && (
            <div
              onClick={() => onOpenArticle(article)}
              className="lg:col-span-4 relative rounded-lg overflow-hidden border border-slate-800 h-52 sm:h-64 lg:h-auto cursor-pointer group"
            >
              <img
                src={article.imageUrl}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11px] font-mono-radar text-slate-300">
                <span className="bg-black/70 px-2 py-0.5 rounded backdrop-blur-sm border border-slate-700/50">
                  {article.source}
                </span>
                <span className="text-red-400 font-bold bg-black/70 px-2 py-0.5 rounded border border-red-500/30">
                  LIVE FEED
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <article className="flex flex-col justify-between rounded-xl bg-[#080e1e]/90 border border-slate-800 hover:border-slate-700 hover:shadow-xl hover:shadow-red-950/20 transition-all duration-200 overflow-hidden group">
      {/* Thumbnail Header */}
      {article.imageUrl && (
        <div
          onClick={() => onOpenArticle(article)}
          className="relative h-44 w-full overflow-hidden bg-slate-950 cursor-pointer"
        >
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080e1e] via-[#080e1e]/30 to-transparent" />

          {/* Badges Overlay */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2">
            <span
              className={`text-[10px] font-radar font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow-md ${
                article.isBreaking
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'bg-slate-900/90 text-slate-300 border border-slate-700'
              }`}
            >
              {article.isBreaking ? 'BREAKING' : article.category}
            </span>

            {article.country && (
              <span className="text-[10px] font-mono-radar bg-black/80 text-slate-300 px-2 py-0.5 rounded backdrop-blur-sm border border-slate-800">
                {article.country}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Content Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          {/* Metadata bar */}
          <div className="flex items-center justify-between text-[11px] font-mono-radar text-slate-400">
            <span className="font-semibold text-slate-300">{article.source}</span>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-slate-500" />
              <span>{formatTimeAgo(article.publishedAt)}</span>
            </div>
          </div>

          {/* Title */}
          <h3
            onClick={() => onOpenArticle(article)}
            className="text-base sm:text-lg font-bold font-radar text-white leading-snug cursor-pointer group-hover:text-red-400 transition-colors line-clamp-3"
          >
            {article.title}
          </h3>

          {/* Description snippet */}
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed line-clamp-2">
            {article.description}
          </p>
        </div>

        {/* Footer & Actions */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
          {/* AI Intelligence quick trigger */}
          <button
            onClick={() => onOpenAI(article)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-950/40 hover:bg-red-900/60 border border-red-700/40 text-red-300 text-[11px] font-radar font-bold transition-all cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>AI INTEL</span>
          </button>

          <div className="flex items-center gap-1.5">
            <button
              onClick={shareStory}
              className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 cursor-pointer"
              title="Share story"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onToggleBookmark(article.id)}
              className={`p-1.5 rounded border transition-all cursor-pointer ${
                isBookmarked
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-400 hover:text-white'
              }`}
              title={isBookmarked ? 'Saved' : 'Save'}
            >
              <Bookmark className="w-3.5 h-3.5 fill-current" />
            </button>

            {article.url && article.url !== '#' && (
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
                title="View original publisher article"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};
