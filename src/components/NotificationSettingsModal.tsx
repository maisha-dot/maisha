import React, { useState } from 'react';
import {
  X,
  Bell,
  Volume2,
  VolumeX,
  ShieldCheck,
  Check,
  Smartphone,
  Radio,
  Sliders,
} from 'lucide-react';
import { UserPreferences, NewsCategory } from '../types/news';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: UserPreferences;
  onUpdatePreferences: (updated: Partial<UserPreferences>) => void;
  onTestNotification: () => void;
}

const ALL_CATEGORIES: NewsCategory[] = [
  'World News',
  'Africa News',
  'Rwanda News',
  'Security and Conflicts',
  'Politics',
  'Business and Economy',
  'Technology',
  'Science',
  'Health',
  'Sports',
  'Entertainment',
  'Environment',
];

const ALL_COUNTRIES = [
  'Rwanda',
  'DR Congo',
  'Kenya',
  'Nigeria',
  'South Africa',
  'United States',
  'United Kingdom',
  'Ukraine',
  'Middle East',
  'China',
];

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  isOpen,
  onClose,
  preferences,
  onUpdatePreferences,
  onTestNotification,
}) => {
  const [permissionStatus, setPermissionStatus] = useState<string>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  if (!isOpen) return null;

  const requestBrowserPermission = async () => {
    if (typeof Notification === 'undefined') {
      alert('This browser does not support web notifications.');
      return;
    }
    try {
      const res = await Notification.requestPermission();
      setPermissionStatus(res);
      if (res === 'granted') {
        onUpdatePreferences({ notificationsEnabled: true });
        new Notification('IMPAMOPRESS RADAR HOT NEWS', {
          body: 'Radar Breaking News Alert System successfully enabled.',
          icon: '/favicon.ico',
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleCategory = (cat: NewsCategory) => {
    const exists = preferences.selectedCategories.includes(cat);
    const updated = exists
      ? preferences.selectedCategories.filter((c) => c !== cat)
      : [...preferences.selectedCategories, cat];
    onUpdatePreferences({ selectedCategories: updated });
  };

  const toggleCountry = (country: string) => {
    const exists = preferences.selectedCountries.includes(country);
    const updated = exists
      ? preferences.selectedCountries.filter((c) => c !== country)
      : [...preferences.selectedCountries, country];
    onUpdatePreferences({ selectedCountries: updated });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-xl bg-[#090f22] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#040814] px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-bold font-radar text-white tracking-wide">
              BREAKING NEWS ALERT SYSTEM
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs font-mono-radar text-slate-300">
          {/* Web Push & Browser permission */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className="font-bold text-white text-sm font-radar block">
                  Browser & Android Push Notifications
                </span>
                <p className="text-slate-400 text-xs font-sans">
                  Receive instant headline dispatches even when the tab is backgrounded.
                </p>
              </div>
              <button
                onClick={requestBrowserPermission}
                className={`px-3 py-1.5 rounded-lg font-bold font-radar tracking-wider text-xs cursor-pointer ${
                  permissionStatus === 'granted'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-red-600 hover:bg-red-500 text-white'
                }`}
              >
                {permissionStatus === 'granted' ? 'GRANTED' : 'ENABLE ALERTS'}
              </button>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-red-400" />
                <span>Android Chrome & Desktop Web Compatible</span>
              </span>
              <button
                onClick={onTestNotification}
                className="text-red-400 hover:text-white underline cursor-pointer"
              >
                Test Siren / Alert
              </button>
            </div>
          </div>

          {/* Sound alert switch */}
          <div className="flex items-center justify-between p-3.5 bg-slate-900/60 rounded-xl border border-slate-800">
            <div className="space-y-0.5">
              <span className="font-bold text-white text-sm font-radar flex items-center gap-2">
                {preferences.soundAlerts ? <Volume2 className="w-4 h-4 text-red-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
                Newsroom Radar Audio Siren
              </span>
              <span className="text-slate-400 text-xs font-sans block">
                Play subtle high-frequency radar tone when breaking bulletins arrive.
              </span>
            </div>
            <button
              onClick={() => onUpdatePreferences({ soundAlerts: !preferences.soundAlerts })}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                preferences.soundAlerts ? 'bg-red-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                  preferences.soundAlerts ? 'left-6.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* Severity Threshold */}
          <div className="space-y-2">
            <label className="text-slate-400 uppercase tracking-wider block">
              MINIMUM URGENCY LEVEL
            </label>
            <div className="grid grid-cols-3 gap-2 font-radar text-xs font-bold">
              {(['ALL', 'HIGH', 'CRITICAL'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => onUpdatePreferences({ minUrgency: lvl })}
                  className={`py-2 px-3 rounded-lg border text-center transition-all cursor-pointer ${
                    preferences.minUrgency === lvl
                      ? 'bg-red-600 border-red-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {lvl === 'ALL' ? 'ALL HEADLINES' : lvl === 'HIGH' ? 'HIGH & CRITICAL' : 'CRITICAL ONLY'}
                </button>
              ))}
            </div>
          </div>

          {/* Subscribed Categories */}
          <div className="space-y-2">
            <label className="text-slate-400 uppercase tracking-wider block">
              FILTER BY CATEGORIES
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ALL_CATEGORIES.map((cat) => {
                const isSelected = preferences.selectedCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`flex items-center justify-between p-2 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-red-950/40 border-red-700 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <span className="truncate">{cat}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-red-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subscribed Countries */}
          <div className="space-y-2">
            <label className="text-slate-400 uppercase tracking-wider block">
              FILTER BY REGIONS / COUNTRIES
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ALL_COUNTRIES.map((country) => {
                const isSelected = preferences.selectedCountries.includes(country);
                return (
                  <button
                    key={country}
                    onClick={() => toggleCountry(country)}
                    className={`flex items-center justify-between p-2 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-950/40 border-amber-700 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <span className="truncate">{country}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#040814] px-6 py-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-radar font-bold rounded-xl text-xs tracking-wider cursor-pointer"
          >
            SAVE PREFERENCES
          </button>
        </div>
      </div>
    </div>
  );
};
