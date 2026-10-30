import React, { useState, useEffect } from 'react';
import {
  X,
  ExternalLink,
  Sparkles,
  Bookmark,
  Share2,
  Clock,
  Radar,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  Volume2,
  VolumeX,
  Languages,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { NewsArticle, AIAnalysisData } from '../types/news';

interface ArticleDetailModalProps {
  article: NewsArticle | null;
  onClose: () => void;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  onRequestAIAnalysis: (article: NewsArticle) => Promise<AIAnalysisData | null>;
}

export const ArticleDetailModal: React.FC<ArticleDetailModalProps> = ({
  article,
  onClose,
  isBookmarked,
  onToggleBookmark,
  onRequestAIAnalysis,
}) => {
  const [activeTab, setActiveTab] = useState<'content' | 'ai' | 'kinyarwanda'>('content');
  const [analysis, setAnalysis] = useState<AIAnalysisData | null>(article?.aiAnalysis || null);
  const [loadingAI, setLoadingAI] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  useEffect(() => {
    if (article) {
      setAnalysis(article.aiAnalysis || null);
      setActiveTab('content');
      setIsSpeaking(false);
      window.speechSynthesis?.cancel();
    }
  }, [article]);

  if (!article) return null;

  const handleRunAI = async () => {
    if (analysis) {
      setActiveTab('ai');
      return;
    }
    setLoadingAI(true);
    setActiveTab('ai');
    try {
      const data = await onRequestAIAnalysis(article);
      if (data) {
        setAnalysis(data);
      }
    } finally {
      setLoadingAI(false);
    }
  };

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const textToSpeak = `${article.title}. Reported by ${article.source}. ${article.description}`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#090f20] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Top Header Bar */}
        <div className="bg-[#040814] px-5 py-3.5 border-b border-slate-800 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2 text-xs font-mono-radar">
            <span className="bg-red-600 text-white font-bold px-2 py-0.5 rounded font-radar tracking-wider text-[11px]">
              {article.isBreaking ? 'BREAKING WIRE' : 'RADAR DISPATCH'}
            </span>
            <span className="text-slate-400">ID: {article.id.slice(0, 12)}</span>
            <span className="hidden sm:inline text-slate-600">|</span>
            <span className="hidden sm:inline text-slate-300 font-semibold">{article.source}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSpeak}
              className={`p-1.5 rounded-lg border text-xs font-mono-radar flex items-center gap-1 transition-all cursor-pointer ${
                isSpeaking
                  ? 'bg-red-600 border-red-500 text-white animate-pulse'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
              }`}
              title="Read aloud"
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{isSpeaking ? 'STOP' : 'LISTEN'}</span>
            </button>

            <button
              onClick={() => onToggleBookmark(article.id)}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                isBookmarked
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              <Bookmark className="w-4 h-4 fill-current" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="bg-[#060b18] px-5 py-2 border-b border-slate-800 flex items-center gap-2 overflow-x-auto shrink-0 font-radar text-xs font-semibold">
          <button
            onClick={() => setActiveTab('content')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'content'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Dispatch Details
          </button>

          <button
            onClick={handleRunAI}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'ai'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-red-950/40 text-red-300 hover:bg-red-900/50 border border-red-800/40'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI News Intelligence</span>
            {loadingAI && <span className="animate-spin text-xs">🌀</span>}
          </button>

          <button
            onClick={() => {
              if (!analysis) {
                handleRunAI();
              }
              setActiveTab('kinyarwanda');
            }}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'kinyarwanda'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-950/30 text-amber-300 hover:bg-amber-900/40 border border-amber-800/30'
            }`}
          >
            <Languages className="w-3.5 h-3.5 text-amber-400" />
            <span>Kinyarwanda Edition</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1 text-slate-200">
          {activeTab === 'content' && (
            <div className="space-y-5">
              {/* Image banner */}
              {article.imageUrl && (
                <div className="w-full h-64 sm:h-80 rounded-xl overflow-hidden border border-slate-800 relative bg-black">
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs font-mono-radar text-slate-300">
                    <span className="bg-black/80 px-2 py-1 rounded border border-slate-700">
                      Photo Credit / Wire Agency: {article.source}
                    </span>
                    <span className="bg-red-600/90 text-white px-2 py-1 rounded font-bold font-radar">
                      {article.category}
                    </span>
                  </div>
                </div>
              )}

              {/* Title & Metadata */}
              <div className="space-y-3">
                <h1 className="text-2xl sm:text-3xl font-bold font-radar text-white leading-tight">
                  {article.title}
                </h1>

                <div className="flex flex-wrap items-center gap-3 text-xs font-mono-radar text-slate-400 bg-[#050a16] p-3 rounded-lg border border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-slate-200">
                    <span className="text-red-400 font-bold">SOURCE:</span>
                    <span>{article.source}</span>
                  </div>
                  <span>&bull;</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Published: {new Date(article.publishedAt).toLocaleString()}</span>
                  </div>
                  <span>&bull;</span>
                  <div className="flex items-center gap-1 text-emerald-400">
                    <Radar className="w-3.5 h-3.5" />
                    <span>Radar Detected: {new Date(article.detectedAt).toLocaleTimeString()}</span>
                  </div>
                  {article.country && (
                    <>
                      <span>&bull;</span>
                      <span className="text-amber-400">Region: {article.country}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Lead Paragraph */}
              <div className="prose prose-invert max-w-none text-slate-300 text-base sm:text-lg leading-relaxed space-y-4">
                <p className="font-medium text-slate-100 bg-slate-900/50 p-4 rounded-lg border-l-4 border-red-600">
                  {article.description}
                </p>

                {article.contentSnippet && article.contentSnippet !== article.description && (
                  <p>{article.contentSnippet}</p>
                )}
              </div>

              {/* Quick AI Trigger Box */}
              {!analysis && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-red-950/40 via-slate-900 to-[#0c162e] border border-red-700/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1 text-center sm:text-left">
                    <h4 className="font-radar font-bold text-white text-sm flex items-center justify-center sm:justify-start gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      Run AI News Intelligence & Verification
                    </h4>
                    <p className="text-xs text-slate-400">
                      Generate executive summary, verify facts vs claims, and translate to Kinyarwanda.
                    </p>
                  </div>
                  <button
                    onClick={handleRunAI}
                    disabled={loadingAI}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-radar font-bold tracking-wider shrink-0 transition-all cursor-pointer shadow-lg shadow-red-900/30"
                  >
                    {loadingAI ? 'ANALYZING...' : 'ANALYZE STORY'}
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-6">
              {loadingAI ? (
                <div className="py-16 text-center space-y-4">
                  <div className="inline-block w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                  <h3 className="text-lg font-radar font-bold text-white">
                    Processing Strategic Intelligence via Gemini AI...
                  </h3>
                  <p className="text-xs text-slate-400 font-mono-radar">
                    Extracting verified statements, cross-referencing wires, and evaluating geopolitical significance.
                  </p>
                </div>
              ) : analysis ? (
                <div className="space-y-6">
                  {/* Significance and Impact Meter */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                      <span className="text-[11px] font-mono-radar text-slate-400 uppercase">
                        GEOPOLITICAL IMPACT SCORE
                      </span>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-3xl font-black font-radar text-red-400">
                          {analysis.impactScore} / 100
                        </span>
                        <div className="flex-1 bg-slate-800 h-2.5 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 h-full rounded-full transition-all duration-1000"
                            style={{ width: `${analysis.impactScore}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-mono-radar text-slate-400 uppercase">
                          SIGNIFICANCE TIER
                        </span>
                        <h4 className="text-xl font-bold font-radar text-white mt-1">
                          {analysis.geopoliticalSignificance}
                        </h4>
                      </div>
                      <TrendingUp className="w-8 h-8 text-red-500" />
                    </div>
                  </div>

                  {/* Executive Briefing */}
                  <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
                    <h3 className="text-sm font-radar font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      Executive Strategic Briefing
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed font-medium">
                      {analysis.summary}
                    </p>
                    <ul className="space-y-2 pt-2 border-t border-slate-800/80">
                      {analysis.bulletPoints.map((bp, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-300">
                          <span className="text-red-500 font-bold">&bull;</span>
                          <span>{bp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Fact Verification Breakdown (Requirement 6) */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Verified Facts */}
                    <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40 space-y-2">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-bold font-radar text-xs uppercase">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Verified Facts ({analysis.keyFacts.length})</span>
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-300">
                        {analysis.keyFacts.map((fact, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-emerald-500">&bull;</span>
                            <span>{fact}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Official Allegations & Claims */}
                    <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40 space-y-2">
                      <div className="flex items-center gap-1.5 text-amber-400 font-bold font-radar text-xs uppercase">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Attributed Allegations</span>
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-300">
                        {analysis.allegations.length > 0 ? (
                          analysis.allegations.map((claim, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-amber-500">&bull;</span>
                              <span>{claim}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-slate-500 italic">No contentious allegations flagged.</li>
                        )}
                      </ul>
                    </div>

                    {/* Unconfirmed Reports */}
                    <div className="p-4 rounded-xl bg-red-950/20 border border-red-800/40 space-y-2">
                      <div className="flex items-center gap-1.5 text-red-400 font-bold font-radar text-xs uppercase">
                        <HelpCircle className="w-4 h-4" />
                        <span>Unconfirmed / Developing</span>
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-300">
                        {analysis.unconfirmed.length > 0 ? (
                          analysis.unconfirmed.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-red-500">&bull;</span>
                              <span>{item}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-slate-500 italic">No unverified rumors detected.</li>
                        )}
                      </ul>
                    </div>
                  </div>

                  {/* Cross-Publisher Comparison */}
                  {analysis.coverageComparison && (
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-1">
                      <span className="font-mono-radar text-slate-500 uppercase font-semibold">
                        Multi-Source Wire Context
                      </span>
                      <p>{analysis.coverageComparison}</p>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}

          {activeTab === 'kinyarwanda' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-700/40 space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-bold font-radar text-sm">
                  <Languages className="w-4 h-4" />
                  <span>Amakuru mu Kinyarwanda — Ibisobanuro bya AI Intelligence</span>
                </div>
                <p className="text-xs text-slate-400">
                  Ubusobanuro nyabwo n&apos;incamake y&apos;iyi nkuru mu rurimi rw&apos;Ikinyarwanda.
                </p>
              </div>

              {loadingAI ? (
                <div className="py-12 text-center text-slate-400">
                  <div className="inline-block w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                  <p className="text-xs font-mono-radar">Guhindura mu Kinyarwanda biracyakorwa...</p>
                </div>
              ) : analysis?.kinyarwandaTitle ? (
                <div className="space-y-4">
                  <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                    <h2 className="text-xl sm:text-2xl font-bold font-radar text-amber-200">
                      {analysis.kinyarwandaTitle}
                    </h2>
                    <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans">
                      {analysis.kinyarwandaSummary}
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-1">
                    <span className="font-mono-radar uppercase text-amber-400 font-semibold">
                      Iby&apos;ingenzi byagaragaye (Key Takeaways):
                    </span>
                    <ul className="list-disc pl-5 space-y-1 text-slate-300">
                      {analysis.bulletPoints.map((bp, i) => (
                        <li key={i}>{bp}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10">
                  <button
                    onClick={handleRunAI}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-radar font-bold cursor-pointer"
                  >
                    Guhindura iyi nkuru mu Kinyarwanda
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-[#040814] px-5 py-3.5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs font-mono-radar text-slate-400">
            Publisher: <span className="text-slate-200 font-semibold">{article.source}</span>
          </div>

          <div className="flex items-center gap-2">
            {article.url && article.url !== '#' && (
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-radar font-bold tracking-wider transition-all shadow-md"
              >
                <span>OPEN ORIGINAL ARTICLE</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
