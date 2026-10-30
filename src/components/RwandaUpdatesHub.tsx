import React, { useState } from 'react';
import {
  X,
  Bell,
  Smartphone,
  Send,
  Mail,
  MapPin,
  CheckCircle2,
  Radio,
  Flame,
  Languages,
  ArrowRight,
  ShieldCheck,
  Compass,
  Check,
} from 'lucide-react';

interface RwandaUpdatesHubProps {
  isOpen: boolean;
  onClose: () => void;
  onFilterRwandaOnly: () => void;
  onEnableRwandaPush: () => void;
}

export const RwandaUpdatesHub: React.FC<RwandaUpdatesHubProps> = ({
  isOpen,
  onClose,
  onFilterRwandaOnly,
  onEnableRwandaPush,
}) => {
  const [emailInput, setEmailInput] = useState<string>('');
  const [emailSubscribed, setEmailSubscribed] = useState<boolean>(false);
  const [selectedPillars, setSelectedPillars] = useState<string[]>([
    'Kigali & National Policy',
    'Economy & RDB Investments',
    'Regional Security & EAC',
  ]);
  const [pushSubscribed, setPushSubscribed] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleEmailSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;
    setEmailSubscribed(true);
    setTimeout(() => {
      setEmailInput('');
    }, 4000);
  };

  const togglePillar = (pillar: string) => {
    if (selectedPillars.includes(pillar)) {
      setSelectedPillars(selectedPillars.filter((p) => p !== pillar));
    } else {
      setSelectedPillars([...selectedPillars, pillar]);
    }
  };

  const handlePushClick = () => {
    onEnableRwandaPush();
    setPushSubscribed(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#070e20] border border-emerald-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Top Banner */}
        <div className="bg-gradient-to-r from-emerald-950 via-[#06152b] to-[#040814] px-6 py-5 border-b border-emerald-800/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-500 flex items-center justify-center text-emerald-400 font-bold shadow-lg shadow-emerald-900/30">
              🇷🇼
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black font-radar text-white tracking-wider">
                  RWANDA RADAR UPDATES & DISPATCH CHANNELS
                </h2>
                <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded font-radar">
                  OFFICIAL
                </span>
              </div>
              <p className="text-xs text-emerald-300 font-mono-radar">
                Amakuru y&apos;u Rwanda &bull; Stay Connected with Every Breaking Kigali & Regional Wire
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-200">
          {/* Quick Action: Instant Rwanda-Only News Filter */}
          <div className="p-4 rounded-xl bg-[#040916] border border-emerald-600/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <span className="font-bold text-white text-sm font-radar flex items-center justify-center sm:justify-start gap-2">
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                Live Rwanda Stream Mode
              </span>
              <p className="text-xs text-slate-400">
                Filter the main radar feed to display only The New Times Rwanda, IGIHE, and Kigali dispatches.
              </p>
            </div>
            <button
              onClick={() => {
                onFilterRwandaOnly();
                onClose();
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-radar font-bold rounded-xl text-xs tracking-wider shrink-0 transition-all cursor-pointer shadow-lg shadow-emerald-900/40 flex items-center gap-1.5"
            >
              <span>STREAM RWANDA ONLY</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Channels Grid: WhatsApp, Telegram, Push, Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Android & Browser Push Alerts */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-bold font-radar text-sm">
                  <Bell className="w-4 h-4" />
                  <span>Browser & Android Push</span>
                </div>
                <span className="text-[10px] font-mono-radar text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                  INSTANT
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Receive instant priority alerts on your mobile or desktop the moment a major story breaks in Rwanda.
              </p>
              <button
                onClick={handlePushClick}
                className={`w-full py-2 rounded-lg font-radar font-bold text-xs tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  pushSubscribed
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                }`}
              >
                {pushSubscribed ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>RWANDA ALERTS ACTIVATED</span>
                  </>
                ) : (
                  <>
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>ENABLE RWANDA PUSH NOTIFICATIONS</span>
                  </>
                )}
              </button>
            </div>

            {/* 2. Telegram Fast Wire Channel */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sky-400 font-bold font-radar text-sm">
                  <Send className="w-4 h-4" />
                  <span>Telegram News Alert Channel</span>
                </div>
                <span className="text-[10px] font-mono-radar text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800">
                  TELEGRAM BOT
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Join the official IMPAMOPRESS Rwanda Radar channel for 24/7 unedited wire dispatches directly in Telegram.
              </p>
              <a
                href="https://t.me/ImpamoPressRwanda"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white font-radar font-bold rounded-lg text-xs tracking-wider flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <Send className="w-3.5 h-3.5" />
                <span>JOIN TELEGRAM CHANNEL (@ImpamoPressRwanda)</span>
              </a>
            </div>

            {/* 3. WhatsApp Community Broadcast */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-green-400 font-bold font-radar text-sm">
                  <Smartphone className="w-4 h-4" />
                  <span>WhatsApp Rwanda Radar Community</span>
                </div>
                <span className="text-[10px] font-mono-radar text-green-400 bg-green-950/80 px-2 py-0.5 rounded border border-green-800">
                  WHATSAPP CHANNEL
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Follow the verified WhatsApp channel for morning roundups and urgent national bulletins on your phone.
              </p>
              <a
                href="https://whatsapp.com/channel/impamopress"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-radar font-bold rounded-lg text-xs tracking-wider flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>FOLLOW ON WHATSAPP</span>
              </a>
            </div>

            {/* 4. Kinyarwanda Edition & Audio Narration */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-400 font-bold font-radar text-sm">
                  <Languages className="w-4 h-4" />
                  <span>Kinyarwanda First AI News</span>
                </div>
                <span className="text-[10px] font-mono-radar text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800">
                  AI LOCALIZED
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Every dispatch features instant dual translation into fluent Kinyarwanda with 1-click text-to-speech audio reader.
              </p>
              <div className="p-2.5 rounded-lg bg-[#040814] text-[11px] font-mono-radar text-amber-300 border border-amber-800/40">
                &ldquo;Incamake n&apos;amakuru yihutirwa mu Kinyarwanda cy&apos;umwimerere kuri buri nkuru.&rdquo;
              </div>
            </div>
          </div>

          {/* Daily Evening Kigali Digest Email Signup */}
          <div className="p-5 rounded-xl bg-gradient-to-r from-emerald-950/30 via-[#060e22] to-slate-900 border border-emerald-700/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold font-radar text-white uppercase tracking-wider flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-400" />
                  Daily &ldquo;Amakuru y&apos;u Rwanda&rdquo; Evening Intelligence Digest
                </h3>
                <p className="text-xs text-slate-400 font-mono-radar">
                  Delivered daily at 18:00 Kigali Time &bull; Comprehensive policy, economy, tech, and sports roundups.
                </p>
              </div>
            </div>

            <form onSubmit={handleEmailSubscribe} className="flex flex-col sm:flex-row gap-2 pt-1">
              <input
                type="email"
                placeholder="Enter your email address (e.g., journalist@newsroom.rw)..."
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="flex-1 bg-[#040814] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono-radar"
                required
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-radar font-bold rounded-xl text-xs tracking-wider transition-all cursor-pointer shrink-0 shadow-md shadow-emerald-900/40"
              >
                SUBSCRIBE TO BRIEFING
              </button>
            </form>

            {emailSubscribed && (
              <p className="text-xs text-emerald-400 font-mono-radar flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Mwarakoze! You are now subscribed to the daily Rwanda Evening Intelligence Digest.</span>
              </p>
            )}
          </div>

          {/* Selectable Rwanda Sector Watchlists */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-mono-radar text-slate-400 uppercase tracking-wider">
              CUSTOMIZE YOUR RWANDA NEWS PILLARS
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                'Kigali & National Policy',
                'Economy & RDB Investments',
                'Regional Security & EAC',
                'Tech, AI & Kigali Innovation City',
                'Tour du Rwanda & Sports (FERWACY)',
                'Green Economy & Climate Resilience',
              ].map((pillar) => {
                const isSelected = selectedPillars.includes(pillar);
                return (
                  <button
                    key={pillar}
                    onClick={() => togglePillar(pillar)}
                    className={`flex items-center justify-between p-2.5 rounded-lg border text-left text-xs font-mono-radar transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-950/40 border-emerald-600/70 text-emerald-200'
                        : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <span>{pillar}</span>
                    {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#030713] px-6 py-3.5 border-t border-slate-800 flex items-center justify-between text-xs font-mono-radar text-slate-400">
          <span>Sources: The New Times Rwanda, IGIHE, KT Press, AllAfrica</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-radar font-bold cursor-pointer"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
