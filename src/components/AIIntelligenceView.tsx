import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Languages,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  TrendingUp,
  FileText,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react';
import { NewsArticle, AIAnalysisData } from '../types/news';

interface AIIntelligenceViewProps {
  articles: NewsArticle[];
  onRequestAIAnalysis: (article: Partial<NewsArticle>) => Promise<AIAnalysisData | null>;
}

export const AIIntelligenceView: React.FC<AIIntelligenceViewProps> = ({
  articles,
  onRequestAIAnalysis,
}) => {
  const [selectedArticleId, setSelectedArticleId] = useState<string>(articles[0]?.id || '');
  const [customText, setCustomText] = useState<string>('');
  const [customTitle, setCustomTitle] = useState<string>('');
  const [customSource, setCustomSource] = useState<string>('Custom Press Wire');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<AIAnalysisData | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const handleAnalyze = async () => {
    setLoading(true);
    setAnalysis(null);

    let targetArticle: Partial<NewsArticle>;
    if (isCustomMode) {
      if (!customTitle || !customText) {
        setLoading(false);
        return;
      }
      targetArticle = {
        title: customTitle,
        description: customText,
        source: customSource,
        category: 'World News',
      };
    } else {
      const found = articles.find((a) => a.id === selectedArticleId);
      if (!found) {
        setLoading(false);
        return;
      }
      targetArticle = found;
    }

    try {
      const result = await onRequestAIAnalysis(targetArticle);
      if (result) {
        setAnalysis(result);
      }
    } finally {
      setLoading(false);
    }
  };

  const copyAnalysis = () => {
    if (!analysis) return;
    const text = `[IMPAMOPRESS RADAR AI INTELLIGENCE]
BRIEFING: ${analysis.summary}

VERIFIED FACTS:
${analysis.keyFacts.map((f) => `- ${f}`).join('\n')}

KINYARWANDA EDITION:
${analysis.kinyarwandaTitle}
${analysis.kinyarwandaSummary}

IMPACT SCORE: ${analysis.impactScore}/100 (${analysis.geopoliticalSignificance})`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-950/40 via-[#070e22] to-[#040814] p-6 rounded-2xl border border-red-700/40 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-mono-radar font-bold text-red-400 uppercase tracking-widest">
                GEMINI AI DISPATCH INTELLIGENCE
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-radar text-white tracking-wide">
              RADAR AI NEWS INTELLIGENCE LAB
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Extract verified facts, separate contentious allegations from rumor, calculate geopolitical disruption scores, and synthesize fluent Kinyarwanda & English briefs.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsCustomMode(!isCustomMode)}
              className={`px-3 py-2 rounded-lg text-xs font-radar font-bold tracking-wider transition-all border cursor-pointer ${
                isCustomMode
                  ? 'bg-amber-600 border-amber-500 text-white'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              {isCustomMode ? 'Select Monitored Story' : 'Analyze Custom Wire / Text'}
            </button>
          </div>
        </div>
      </div>

      {/* Input Selection Box */}
      <div className="bg-[#080e1e] p-5 rounded-2xl border border-slate-800 space-y-4">
        {!isCustomMode ? (
          <div className="space-y-2">
            <label className="text-xs font-mono-radar text-slate-400 uppercase tracking-wider block">
              Choose Live Monitored Story to Analyze:
            </label>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <select
                value={selectedArticleId}
                onChange={(e) => setSelectedArticleId(e.target.value)}
                className="md:col-span-10 bg-[#040814] border border-slate-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-red-500 font-mono-radar"
              >
                {articles.map((a) => (
                  <option key={a.id} value={a.id}>
                    [{a.source}] {a.title.slice(0, 85)}...
                  </option>
                ))}
              </select>

              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="md:col-span-2 px-4 py-3 bg-red-600 hover:bg-red-500 disabled:bg-slate-800 text-white font-radar font-bold rounded-xl text-xs sm:text-sm tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-red-900/40"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-300" />}
                <span>{loading ? 'ANALYZING...' : 'RUN AI'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="News Headline / Story Title..."
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="bg-[#040814] border border-slate-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-red-500"
              />
              <input
                type="text"
                placeholder="Publisher / Source (e.g., Reuters, IGIHE, New Times)..."
                value={customSource}
                onChange={(e) => setCustomSource(e.target.value)}
                className="bg-[#040814] border border-slate-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-red-500 font-mono-radar"
              />
            </div>
            <textarea
              rows={4}
              placeholder="Paste article body or dispatch wire content here for deep intelligence analysis..."
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              className="w-full bg-[#040814] border border-slate-700 rounded-lg p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-red-500 leading-relaxed font-sans"
            />
            <div className="flex justify-end">
              <button
                onClick={handleAnalyze}
                disabled={loading || !customTitle || !customText}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-500 disabled:bg-slate-800 text-white font-radar font-bold rounded-xl text-xs sm:text-sm tracking-wider flex items-center gap-2 transition-all cursor-pointer"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>{loading ? 'PROCESSING INTELLIGENCE...' : 'ANALYZE TEXT'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Intelligence Results Canvas */}
      {loading && (
        <div className="py-20 text-center space-y-4 bg-[#080e1e] rounded-2xl border border-slate-800">
          <div className="inline-block w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <h3 className="text-lg font-radar font-bold text-white">
            Running Multilateral News Intelligence Synthesis...
          </h3>
          <p className="text-xs text-slate-400 font-mono-radar">
            Applying verification heuristics and generating dual-language briefings.
          </p>
        </div>
      )}

      {analysis && !loading && (
        <div className="bg-[#080e1e] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-7 shadow-2xl">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="bg-red-600 text-white font-bold text-xs px-2.5 py-1 rounded font-radar tracking-wider">
                INTELLIGENCE REPORT READY
              </span>
              <span className="text-xs font-mono-radar text-slate-400">
                Generated {new Date(analysis.analyzedAt).toLocaleTimeString()}
              </span>
            </div>

            <button
              onClick={copyAnalysis}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-mono-radar cursor-pointer transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'COPIED TO CLIPBOARD' : 'EXPORT REPORT'}</span>
            </button>
          </div>

          {/* Scores Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#040814] border border-slate-800 space-y-2">
              <span className="text-[11px] font-mono-radar text-slate-400 uppercase">
                DISRUPTION INDEX
              </span>
              <div className="text-3xl font-black font-radar text-red-400">
                {analysis.impactScore} <span className="text-xs text-slate-500 font-normal">/ 100</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-red-500 h-full rounded-full"
                  style={{ width: `${analysis.impactScore}%` }}
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#040814] border border-slate-800 space-y-1">
              <span className="text-[11px] font-mono-radar text-slate-400 uppercase">
                GEOPOLITICAL SCOPE
              </span>
              <div className="text-xl font-bold font-radar text-white mt-1">
                {analysis.geopoliticalSignificance}
              </div>
              <p className="text-[11px] text-slate-400">Regional & international diplomatic footprint</p>
            </div>

            <div className="p-4 rounded-xl bg-[#040814] border border-slate-800 space-y-1">
              <span className="text-[11px] font-mono-radar text-slate-400 uppercase">
                VERIFICATION RATIO
              </span>
              <div className="text-xl font-bold font-radar text-emerald-400 mt-1">
                {analysis.keyFacts.length} Verified Facts
              </div>
              <p className="text-[11px] text-slate-400">
                {analysis.allegations.length} Claims &bull; {analysis.unconfirmed.length} Developing
              </p>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="p-5 rounded-xl bg-[#040814] border border-slate-800 space-y-3">
            <h3 className="font-bold text-white font-radar uppercase text-sm tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-red-500" />
              Executive Strategic Briefing
            </h3>
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-sans">
              {analysis.summary}
            </p>
            <div className="pt-2 border-t border-slate-850 space-y-1.5">
              {analysis.bulletPoints.map((bp, i) => (
                <div key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-300">
                  <span className="text-red-400 font-bold">&bull;</span>
                  <span>{bp}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tri-Partite Fact Verification (Verified vs Allegations vs Unconfirmed) */}
          <div className="space-y-3">
            <h3 className="font-bold text-white font-radar uppercase text-sm tracking-wider">
              Verification & Credibility Breakdown
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 1. Verified */}
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase font-radar">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verified Information</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {analysis.keyFacts.map((fact, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-500 font-bold">&bull;</span>
                      <span>{fact}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 2. Allegations */}
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase font-radar">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Attributed Claims / Allegations</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {analysis.allegations.length > 0 ? (
                    analysis.allegations.map((claim, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-amber-500 font-bold">&bull;</span>
                        <span>{claim}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-slate-500 italic">No disputed allegations reported.</li>
                  )}
                </ul>
              </div>

              {/* 3. Unconfirmed */}
              <div className="p-4 rounded-xl bg-red-950/20 border border-red-800/40 space-y-2">
                <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase font-radar">
                  <HelpCircle className="w-4 h-4" />
                  <span>Unconfirmed / Developing</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {analysis.unconfirmed.length > 0 ? (
                    analysis.unconfirmed.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-red-500 font-bold">&bull;</span>
                        <span>{item}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-slate-500 italic">No speculative details flagged.</li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Kinyarwanda Translation Section */}
          <div className="p-5 rounded-xl bg-gradient-to-r from-amber-950/30 via-[#040814] to-slate-900 border border-amber-800/40 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold font-radar text-sm uppercase">
              <Languages className="w-4 h-4" />
              <span>Incamake n&apos;Ubusobanuro mu Kinyarwanda</span>
            </div>
            <h4 className="text-base sm:text-lg font-bold font-radar text-amber-200">
              {analysis.kinyarwandaTitle}
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed font-sans">
              {analysis.kinyarwandaSummary}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
