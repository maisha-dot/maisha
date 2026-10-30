import React from 'react';
import { NewsCategory } from '../types/news';
import {
  Globe2,
  Compass,
  MapPin,
  Landmark,
  TrendingUp,
  Cpu,
  FlaskConical,
  HeartPulse,
  Trophy,
  Film,
  ShieldAlert,
  Leaf,
  Layers,
} from 'lucide-react';

interface CategoryFilterProps {
  selectedCategory: NewsCategory;
  onSelectCategory: (cat: NewsCategory) => void;
  selectedCountry: string;
  onSelectCountry: (country: string) => void;
  breakingOnly: boolean;
  onToggleBreakingOnly: () => void;
}

const CATEGORIES: { name: NewsCategory; icon: React.ElementType; isHighlight?: boolean }[] = [
  { name: 'All', icon: Layers },
  { name: 'Rwanda News', icon: MapPin, isHighlight: true },
  { name: 'Africa News', icon: Compass, isHighlight: true },
  { name: 'World News', icon: Globe2 },
  { name: 'Security and Conflicts', icon: ShieldAlert },
  { name: 'Politics', icon: Landmark },
  { name: 'Business and Economy', icon: TrendingUp },
  { name: 'Technology', icon: Cpu },
  { name: 'Science', icon: FlaskConical },
  { name: 'Health', icon: HeartPulse },
  { name: 'Sports', icon: Trophy },
  { name: 'Entertainment', icon: Film },
  { name: 'Environment', icon: Leaf },
];

const COUNTRIES = [
  'All',
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
  'France',
  'Germany',
];

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
  selectedCountry,
  onSelectCountry,
  breakingOnly,
  onToggleBreakingOnly,
}) => {
  return (
    <div className="space-y-3">
      {/* Category Horizontal Scroll Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none no-scrollbar">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.name;
          return (
            <button
              key={cat.name}
              onClick={() => onSelectCategory(cat.name)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-radar font-semibold tracking-wide whitespace-nowrap transition-all cursor-pointer border shrink-0 ${
                isSelected
                  ? 'bg-red-600 border-red-500 text-white shadow-md shadow-red-900/40'
                  : cat.isHighlight
                  ? 'bg-amber-950/40 border-amber-600/40 text-amber-200 hover:bg-amber-900/50 hover:border-amber-500'
                  : 'bg-[#080f22] border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 hover:bg-slate-850'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : cat.isHighlight ? 'text-amber-400' : 'text-slate-400'}`} />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Sub-bar: Country filter & Breaking toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-800/60 text-xs font-mono-radar">
        <div className="flex items-center gap-2 overflow-x-auto max-w-full">
          <span className="text-slate-400 uppercase tracking-wider text-[11px] shrink-0">
            GEOLOCATION:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {COUNTRIES.map((country) => {
              const isSelected = selectedCountry === country;
              return (
                <button
                  key={country}
                  onClick={() => onSelectCountry(country)}
                  className={`px-2.5 py-1 rounded text-[11px] transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-slate-200 text-slate-900 font-bold'
                      : 'bg-slate-900/90 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  {country}
                </button>
              );
            })}
          </div>
        </div>

        {/* Breaking Only Filter Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onToggleBreakingOnly}
            className={`flex items-center gap-2 px-3 py-1 rounded-md text-xs font-bold transition-all border cursor-pointer ${
              breakingOnly
                ? 'bg-red-600 border-red-500 text-white shadow-sm'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${breakingOnly ? 'bg-white animate-ping' : 'bg-red-500'}`} />
            <span>BREAKING NEWS ONLY</span>
          </button>
        </div>
      </div>
    </div>
  );
};
