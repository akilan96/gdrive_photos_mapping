import React, { useState, useEffect, useRef } from 'react';
import { Heart, ChevronLeft, ChevronRight, Maximize2, Sparkles } from 'lucide-react';
import { GalleryPhoto } from '../../types';
import { useCustomerGalleryStore } from '../../stores/useCustomerGalleryStore';

interface CustomerFocusViewProps {
  photos: GalleryPhoto[];
}

export const CustomerFocusView: React.FC<CustomerFocusViewProps> = ({ photos }) => {
  const {
    favourites,
    toggleFavourite,
    focusedIndex,
    setFocusedIndex,
    setLightboxPhoto,
  } = useCustomerGalleryStore();

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const clickTimeout = useRef<number | null>(null);

  const minSwipeDistance = 50;

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

  const currentPhoto = photos[focusedIndex] || photos[0];
  const total = photos.length;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && focusedIndex > 0) {
        setFocusedIndex(focusedIndex - 1);
      } else if (e.key === 'ArrowRight' && focusedIndex < total - 1) {
        setFocusedIndex(focusedIndex + 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex, total, setFocusedIndex]);

  // Touch Swipe Handlers
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && focusedIndex < total - 1) {
      setFocusedIndex(focusedIndex + 1);
    } else if (isRightSwipe && focusedIndex > 0) {
      setFocusedIndex(focusedIndex - 1);
    }
  };

  const handleImageTap = () => {
    if (!currentPhoto) return;

    if (clickTimeout.current !== null) {
      // Double tap -> Toggle favourite
      window.clearTimeout(clickTimeout.current);
      clickTimeout.current = null;
      toggleFavourite(currentPhoto.id);
      playPopSound();
    } else {
      // Single tap -> Open zoom lightbox
      clickTimeout.current = window.setTimeout(() => {
        setLightboxPhoto(currentPhoto);
        clickTimeout.current = null;
      }, 280);
    }
  };

  if (!currentPhoto) {
    return <p className="text-center text-gray-400 py-12">No photos available to focus.</p>;
  }

  const isFav = favourites.has(currentPhoto.id);

  return (
    <div className="flex flex-col items-center justify-center max-w-4xl mx-auto py-4 select-none">
      {/* Top Photo Counter & Filename */}
      <div className="flex items-center justify-between w-full max-w-2xl px-2 mb-3 text-xs">
        <span className="font-mono text-[#50E2E5] font-bold">
          Photo {focusedIndex + 1} of {total}
        </span>
        <span className="font-mono text-gray-400 truncate max-w-[200px]">
          {currentPhoto.filename}
        </span>
      </div>

      {/* Main Single Photo Card */}
      <div
        className="relative w-full max-w-2xl rounded-3xl overflow-hidden bg-[#092328] border border-[#27555C] shadow-2xl flex items-center justify-center cursor-pointer group"
        onClick={handleImageTap}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{ maxHeight: '68vh' }}
      >
        <img
          src={currentPhoto.url}
          alt={currentPhoto.filename}
          referrerPolicy="no-referrer"
          className="w-full h-auto max-h-[68vh] object-contain transition-transform duration-300 group-hover:scale-[1.01]"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (!target.dataset.tried) {
              target.dataset.tried = '1';
              target.src = `https://lh3.googleusercontent.com/d/${currentPhoto.id}`;
            } else if (target.dataset.tried === '1') {
              target.dataset.tried = '2';
              target.src = `https://drive.google.com/uc?export=view&id=${currentPhoto.id}`;
            }
          }}
        />

        {/* Floating Heart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavourite(currentPhoto.id);
            playPopSound();
          }}
          className={`absolute bottom-6 right-6 p-4 rounded-full backdrop-blur-xl transition-all duration-300 shadow-2xl z-20 ${
            isFav
              ? 'bg-[#50E2E5] text-black scale-110 shadow-[0_0_30px_rgba(80,226,229,0.5)] animate-heart-pop'
              : 'bg-black/60 text-white/90 hover:text-white hover:scale-105 border border-white/20'
          }`}
          title={isFav ? 'Remove from Favourites' : 'Add to Favourites'}
        >
          <Heart size={28} className={isFav ? 'fill-black' : ''} />
        </button>

        {/* Instructions Hint */}
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-[11px] text-gray-300 flex items-center gap-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
          <Sparkles size={12} className="text-[#50E2E5]" />
          <span>Double-tap to like • Tap to zoom</span>
        </div>
      </div>

      {/* Prev & Next Navigation Buttons */}
      <div className="flex items-center justify-center gap-4 mt-6 w-full max-w-md">
        <button
          disabled={focusedIndex === 0}
          onClick={() => setFocusedIndex(Math.max(0, focusedIndex - 1))}
          className="flex-1 py-3 px-6 rounded-2xl font-black text-xs uppercase tracking-wider bg-[#3498db] hover:bg-[#2980b9] disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white shadow-xl transition-all flex items-center justify-center gap-2"
        >
          <ChevronLeft size={18} />
          <span>Previous</span>
        </button>

        <button
          disabled={focusedIndex === total - 1}
          onClick={() => setFocusedIndex(Math.min(total - 1, focusedIndex + 1))}
          className="flex-1 py-3 px-6 rounded-2xl font-black text-xs uppercase tracking-wider bg-[#e74c3c] hover:bg-[#c0392b] disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white shadow-xl transition-all flex items-center justify-center gap-2"
        >
          <span>Next</span>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

