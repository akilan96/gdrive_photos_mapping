import React, { useRef } from 'react';
import { Heart, Maximize2 } from 'lucide-react';
import { GalleryPhoto } from '../../types';
import { useCustomerGalleryStore } from '../../stores/useCustomerGalleryStore';

interface CustomerGridViewProps {
  photos: GalleryPhoto[];
}

export const CustomerGridView: React.FC<CustomerGridViewProps> = ({ photos }) => {
  const { favourites, toggleFavourite, setLightboxPhoto } = useCustomerGalleryStore();
  const clickTimeout = useRef<number | null>(null);

  // Web Audio synth pop sound
  const playPopSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.1);
    } catch {
      // Audio not supported
    }
  };

  const handlePhotoClick = (photo: GalleryPhoto) => {
    if (clickTimeout.current !== null) {
      // Double click -> Toggle favourite
      window.clearTimeout(clickTimeout.current);
      clickTimeout.current = null;
      toggleFavourite(photo.id);
      playPopSound();
    } else {
      // Single click -> Lightbox zoom after 280ms
      clickTimeout.current = window.setTimeout(() => {
        setLightboxPhoto(photo);
        clickTimeout.current = null;
      }, 280);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {photos.map((photo) => {
        const isFav = favourites.has(photo.id);

        return (
          <div
            key={photo.id}
            onClick={() => handlePhotoClick(photo)}
            className={`group relative rounded-2xl overflow-hidden bg-[#092328] border cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/70 select-none ${
              isFav
                ? 'border-[#50E2E5] ring-2 ring-[#50E2E5]/40 shadow-[0_0_20px_rgba(80,226,229,0.15)]'
                : 'border-[#27555C]/70 hover:border-white/40'
            }`}
          >
            {/* Image Thumbnail with Referrer Protection */}
            <div className="relative aspect-[4/3] overflow-hidden bg-black/40">
              <img
                src={photo.url}
                alt={photo.filename}
                referrerPolicy="no-referrer"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (!target.dataset.tried) {
                    target.dataset.tried = '1';
                    target.src = `https://lh3.googleusercontent.com/d/${photo.id}`;
                  } else if (target.dataset.tried === '1') {
                    target.dataset.tried = '2';
                    target.src = `https://drive.google.com/uc?export=view&id=${photo.id}`;
                  }
                }}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* Gradient Dark Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 opacity-70 group-hover:opacity-90 transition-opacity" />

              {/* Top Heart Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavourite(photo.id);
                  playPopSound();
                }}
                className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-all duration-200 z-10 ${
                  isFav
                    ? 'bg-[#50E2E5] text-black shadow-lg shadow-[#50E2E5]/40 animate-heart-pop scale-110'
                    : 'bg-black/50 text-white/80 hover:text-white hover:bg-black/80 border border-white/20'
                }`}
                title={isFav ? 'Remove from Favourites' : 'Add to Favourites'}
              >
                <Heart size={18} className={isFav ? 'fill-black' : ''} />
              </button>

              {/* Click to Zoom Pill */}
              <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 backdrop-blur-md px-2 py-1 rounded-md text-[10px] text-white flex items-center gap-1">
                <Maximize2 size={11} /> Zoom
              </div>
            </div>

            {/* Bottom Filename Strip */}
            <div className="p-3 bg-[#092328] flex items-center justify-between text-xs">
              <p className="font-mono text-gray-300 truncate max-w-[170px]" title={photo.filename}>
                {photo.filename}
              </p>
              {isFav && (
                <span className="text-[10px] font-bold text-[#50E2E5] uppercase tracking-wider">
                  Selected
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

