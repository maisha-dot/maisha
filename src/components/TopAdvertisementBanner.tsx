import React, { useEffect, useState, useRef } from 'react';
import { ExternalLink, Phone, Volume2, VolumeX, Sparkles, Play, Pause } from 'lucide-react';
import { AdvertisingCampaign } from '../types/advertising';

interface TopAdvertisementBannerProps {
  onOpenAdvertisePortal: () => void;
}

export const TopAdvertisementBanner: React.FC<TopAdvertisementBannerProps> = ({
  onOpenAdvertisePortal,
}) => {
  const [activeAd, setActiveAd] = useState<AdvertisingCampaign | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const videoRef = useRef<HTMLVideoElement>(null);
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
        if (data.top && data.top.length > 0) {
          const selected = data.top[0];
          setActiveAd(selected);

          // Track impression once per ad id session
          if (impressionRecorded.current !== selected.id) {
            impressionRecorded.current = selected.id;
            fetch(`/api/ads/track/impression/${selected.id}`, { method: 'POST' }).catch(() => {});
          }
        } else {
          setActiveAd(null);
        }
      }
    } catch (err) {
      console.error('Error fetching top ad:', err);
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

  const toggleVideoPlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const toggleVideoMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  if (loading) return null;

  // Fallback: Elegant White & Red Sponsor Spot Invitation
  if (!activeAd) {
    return (
      <div className="bg-black border-y border-neutral-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-2 sm:py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono-radar">
          <div className="flex items-center gap-2">
            <span className="bg-[#E60026] text-white text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wider uppercase font-radar">
              SPONSORED
            </span>
            <span className="text-neutral-300 font-medium">
              PREMIUM TOP HOMEPAGE BILLBOARD SPOT AVAILABLE
            </span>
            <span className="hidden md:inline text-neutral-500">&bull;</span>
            <span className="hidden md:inline text-neutral-400">
              Reach 250,000+ daily international readers with MP4 video or display banner
            </span>
          </div>

          <button
            onClick={onOpenAdvertisePortal}
            className="flex items-center gap-1.5 bg-[#E60026] hover:bg-red-700 text-white px-3 py-1 rounded text-[11px] font-bold font-radar uppercase tracking-wider transition-all cursor-pointer shadow-sm hover:shadow-[#E60026]/40"
          >
            <span>ADVERTISE HERE — $10 / WEEK</span>
            <Sparkles className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  const isVideo = activeAd.creative?.mediaType === 'video';

  return (
    <section className="bg-black border-b-2 border-[#E60026] text-white overflow-hidden shadow-lg shadow-black/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        {/* Header Tag */}
        <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-neutral-800/80">
          <div className="flex items-center gap-2">
            <span className="bg-[#E60026] text-white text-[10px] font-bold px-2 py-0.5 rounded font-radar tracking-widest uppercase">
              ADVERTISEMENT
            </span>
            <span className="text-white text-xs font-semibold font-radar uppercase tracking-wider">
              {activeAd.businessName}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenAdvertisePortal}
              className="text-[10px] font-mono-radar text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              Advertise with us &rarr;
            </button>
          </div>
        </div>

        {/* Ad Body Content */}
        <div
          onClick={handleAdClick}
          className="group cursor-pointer grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-neutral-950/70 p-3 sm:p-4 rounded border border-neutral-800/60 hover:border-[#E60026]/70 transition-all duration-300"
        >
          {/* Media Column (Image or Video) */}
          <div className="md:col-span-5 relative rounded overflow-hidden bg-black aspect-video flex items-center justify-center border border-neutral-800">
            {isVideo ? (
              <>
                <video
                  ref={videoRef}
                  src={activeAd.creative?.mediaUrl}
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 right-2 flex items-center gap-1.5 bg-black/80 backdrop-blur px-2 py-1 rounded text-[11px] font-mono-radar text-white border border-neutral-700">
                  <button
                    onClick={toggleVideoPlay}
                    className="hover:text-[#E60026] transition-colors p-0.5"
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={toggleVideoMute}
                    className="hover:text-[#E60026] transition-colors p-0.5"
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </>
            ) : (
              <img
                src={activeAd.creative?.mediaUrl}
                alt={activeAd.headline}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  // Fallback visual if external image fails
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            )}
          </div>

          {/* Text Details Column */}
          <div className="md:col-span-7 flex flex-col justify-between space-y-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold text-[#E60026] uppercase tracking-wider font-radar">
                  TOP PREMIUM SHOWCASE
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold font-radar text-white group-hover:text-red-100 transition-colors leading-snug">
                {activeAd.headline}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-300 font-sans mt-1.5 leading-relaxed line-clamp-3">
                {activeAd.description}
              </p>
            </div>

            <div className="pt-2 border-t border-neutral-900 flex flex-wrap items-center justify-between gap-3 text-xs font-mono-radar">
              {activeAd.phone && (
                <div className="flex items-center gap-1.5 text-white">
                  <Phone className="w-3.5 h-3.5 text-[#E60026]" />
                  <span>{activeAd.phone}</span>
                </div>
              )}

              <div className="flex items-center gap-1.5 bg-[#E60026] text-white px-3 py-1.5 rounded font-bold font-radar uppercase text-[11px] tracking-wider group-hover:bg-red-700 transition-colors shadow-sm">
                <span>VISIT WEBSITE / OFFICIAL PAGE</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
