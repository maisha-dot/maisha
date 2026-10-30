import React from 'react';
import { Radio, Flame, ExternalLink, Sparkles } from 'lucide-react';
import { NewsArticle } from '../types/news';

interface BreakingTickerProps {
  articles: NewsArticle[];
  onSelectArticle: (article: NewsArticle) => void;
}

export const BreakingTicker: React.FC<BreakingTickerProps> = ({ articles, onSelectArticle }) => {
  if (!articles || articles.length === 0) return null;

  return (
    <div className="bg-[#0b1120] border-y border-red-900/50 relative overflow-hidden flex items-center h-11 text-xs select-none">
      {/* Red Breaking Radar Badge */}
      <div className="bg-red-600 text-white font-bold px-3 py-1.5 h-full flex items-center gap-1.5 z-20 shrink-0 uppercase tracking-wider font-radar text-xs shadow-lg shadow-red-600/30">
        <Radio className="w-3.5 h-3.5 animate-pulse text-white" />
        <span className="hidden sm:inline">RADAR HOT DISPATCH</span>
        <span className="sm:hidden">RADAR</span>
        <Flame className="w-3.5 h-3.5 text-amber-300" />
      </div>

      {/* Marquee Track */}
      <div className="flex-1 overflow-hidden relative flex items-center h-full">
        <div className="animate-marquee hover:[animation-play-state:paused] flex items-center gap-8 pl-4">
          {articles.map((item, idx) => (
            <button
              key={`${item.id}-${idx}`}
              onClick={() => onSelectArticle(item)}
              className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors cursor-pointer group text-left whitespace-nowrap"
            >
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
              <span className="font-semibold text-red-400 font-mono-radar text-[11px] uppercase tracking-wider">
                [{item.source}]
              </span>
              <span className="group-hover:underline font-medium text-slate-200 text-xs">
                {item.title}
              </span>
              <span className="text-[10px] text-slate-400 font-mono-radar bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700/60">
                {new Date(item.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="text-slate-600 mx-2">|</span>
            </button>
          ))}
          {/* Duplicate loop items for seamless infinite marquee */}
          {articles.map((item, idx) => (
            <button
              key={`${item.id}-dup-${idx}`}
              onClick={() => onSelectArticle(item)}
              className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors cursor-pointer group text-left whitespace-nowrap"
            >
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500" />
              <span className="font-semibold text-red-400 font-mono-radar text-[11px] uppercase tracking-wider">
                [{item.source}]
              </span>
              <span className="group-hover:underline font-medium text-slate-200 text-xs">
                {item.title}
              </span>
              <span className="text-[10px] text-slate-400 font-mono-radar bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700/60">
                {new Date(item.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="text-slate-600 mx-2">|</span>
            </button>
          ))}
        </div>
      </div>

      <div className="hidden lg:flex items-center gap-2 px-3 bg-[#0b1120] text-slate-400 font-mono-radar text-[11px] z-20 border-l border-slate-800 shrink-0">
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        <span>AUTONOMOUS RSS FEED SYNC</span>
      </div>
    </div>
  );
};
