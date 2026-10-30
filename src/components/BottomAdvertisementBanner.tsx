import React, { useEffect, useState, useRef } from 'react';
import { ExternalLink, Phone, Sparkles } from 'lucide-react';
import { AdvertisingCampaign } from '../types/advertising';

interface BottomAdvertisementBannerProps {
  onOpenAdvertisePortal: () => void;
}

export const BottomAdvertisementBanner: React.FC<BottomAdvertisementBannerProps> = ({
  onOpenAdvertisePortal,
}) => {
  const [activeAd, setActiveAd] = useState<AdvertisingCampaign | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const impressionRecorded = useRef<string | null>(null);

  useEffect(() => {
    fetchActiveAd();
    const interval = setInterval(fetchActiveAd, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchActiveAd = async () => {
    try {
      const res = await fetch('/api/ads/public/active');
      if (res.ok) {
        const data = await res.json();
        if (data.bottom && data.bottom.length > 0) {
          const selected = data.bottom[0];
          setActiveAd(selected);

          if (impressionRecorded.current !== selected.id) {
            impressionRecorded.current = selected.id;
            fetch(`/api/ads/track/impression/${selected.id}`, { method: 'POST' }).catch(() => {});
          }
        } else {
          setActiveAd(null);
        }
      }
    } catch (err) {
      console.error('Error fetching bottom ad:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdClick = () => {
    if (activeAd) {
      fetch(`/api/ads/track/click/${activeAd.id}`, { method: 'POST' }).catch(() => {});
      if (activeAd.targetUrl) {
        let url = activeAd.targetUrl;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          url = 'https://' + url;
        }
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    }
  };

  if (loading) return null;

  // Fallback: Professional Bottom Sponsor Spot Banner
  if (!activeAd) {
    return (
      <section className="bg-black border-t-2 border-[#E60026] py-5 px-4 sm:px-6 lg:px-8 text-white mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 bg-neutral-950 p-4 sm:p-5 rounded border border-neutral-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-[#E60026] text-white text-[10px] font-bold px-2 py-0.5 rounded font-radar tracking-widest uppercase">
                SPONSORED
              </span>
              <span className="text-white font-radar font-bold text-sm tracking-wider uppercase">
                ADVERTISE YOUR BUSINESS HERE — BOTTOM WEBSITE SPOT
              </span>
            </div>
            <p className="text-xs text-neutral-400 font-sans">
              Display your brand, products or services across all news pages and radar views for just $5 USD per week.
            </p>
          </div>

          <button
            onClick={onOpenAdvertisePortal}
            className="flex items-center gap-2 bg-[#E60026] hover:bg-red-700 text-white px-4 py-2 rounded text-xs font-bold font-radar uppercase tracking-wider transition-all cursor-pointer shadow-md hover:shadow-[#E60026]/40 shrink-0"
          >
            <span>BOOK BOTTOM SPOT — $5 / WEEK</span>
            <Sparkles className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-black border-t-2 border-[#E60026] py-6 px-4 sm:px-6 lg:px-8 text-white mt-12 shadow-2xl">
      <div className="max-w-7xl mx-auto">
        {/* Category Header */}
        <div className="flex items-center justify-between mb-3 pb-1 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <span className="bg-[#E60026] text-white text-[10px] font-bold px-2 py-0.5 rounded font-radar tracking-widest uppercase">
              ADVERTISEMENT
            </span>
            <span className="text-white text-xs font-semibold font-radar uppercase tracking-wider">
              {activeAd.businessName}
            </span>
          </div>

          <button
            onClick={onOpenAdvertisePortal}
            className="text-[10px] font-mono-radar text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            Advertise with us &rarr;
          </button>
        </div>

        {/* Ad Card */}
        <div
          onClick={handleAdClick}
          className="group cursor-pointer grid grid-cols-1 md:grid-cols-12 gap-5 items-center bg-neutral-950 p-4 sm:p-5 rounded border border-neutral-800 hover:border-[#E60026] transition-all duration-300"
        >
          {/* Image */}
          <div className="md:col-span-4 relative rounded overflow-hidden aspect-video bg-neutral-900 border border-neutral-800">
            <img
              src={activeAd.creative?.mediaUrl}
              alt={activeAd.headline}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          {/* Details */}
          <div className="md:col-span-8 flex flex-col justify-between space-y-2">
            <div>
              <span className="text-[10px] font-bold text-[#E60026] font-radar uppercase tracking-wider">
                FEATURED BUSINESS PARTNER
              </span>
              <h3 className="text-base sm:text-lg font-bold font-radar text-white group-hover:text-red-100 transition-colors leading-snug">
                {activeAd.headline}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-300 font-sans mt-1 leading-relaxed line-clamp-3">
                {activeAd.description}
              </p>
            </div>

            <div className="pt-3 border-t border-neutral-900 flex flex-wrap items-center justify-between gap-3 text-xs font-mono-radar">
              {activeAd.phone && (
                <div className="flex items-center gap-1.5 text-white">
                  <Phone className="w-3.5 h-3.5 text-[#E60026]" />
                  <span>{activeAd.phone}</span>
                </div>
              )}

              <div className="flex items-center gap-1.5 bg-[#E60026] text-white px-3.5 py-1.5 rounded font-bold font-radar uppercase text-[11px] tracking-wider group-hover:bg-red-700 transition-colors shadow-sm">
                <span>CONNECT / LEARN MORE</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
