import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Film } from 'lucide-react';
import { CinemaMedia } from '../../types';
import { sound } from '../../hooks/useAudio';

interface SlotReelProps {
  items: CinemaMedia[];
  selectedItem: CinemaMedia | null;
  isSpinning: boolean;
  onSpinEnd: (item: CinemaMedia) => void;
}

export const SlotReel: React.FC<SlotReelProps> = ({
  items,
  selectedItem,
  isSpinning,
  onSpinEnd,
}) => {
  const [displayItem, setDisplayItem] = useState<CinemaMedia>(
    selectedItem || items[0] || { id: '0', title: 'Toque para girar', type: 'Filme', emoji: '🎬', genre: 'Cinema' }
  );
  const [blurIntensity, setBlurIntensity] = useState<number>(0);
  const [isLanded, setIsLanded] = useState<boolean>(false);

  const spinIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isSpinning) {
      setIsLanded(false);
      const startTime = performance.now();
      const spinDuration = 3200; // 3.2s of rolling mechanical drum
      let currentInterval = 45; // Starts very fast (45ms per frame)

      const cycle = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / spinDuration, 1);

        // Pick a random item
        const randIndex = Math.floor(Math.random() * items.length);
        const nextItem = items[randIndex];
        setDisplayItem(nextItem);

        // Blur effect decreases as reel slows down
        const blur = (1 - progress) * 3;
        setBlurIntensity(blur);

        // Play tick sound with pitch drop
        sound.playTick(600 - progress * 200);

        if (progress < 1) {
          // Deceleration curve
          currentInterval = 45 + Math.pow(progress, 2.5) * 350;
          spinIntervalRef.current = window.setTimeout(cycle, currentInterval);
        } else {
          // Locked in on final selection
          const finalIndex = Math.floor(Math.random() * items.length);
          const finalItem = items[finalIndex];
          setDisplayItem(finalItem);
          setBlurIntensity(0);
          setIsLanded(true);
          sound.playWin();
          onSpinEnd(finalItem);
        }
      };

      spinIntervalRef.current = window.setTimeout(cycle, currentInterval);
    }

    return () => {
      if (spinIntervalRef.current) clearTimeout(spinIntervalRef.current);
    };
  }, [isSpinning, items, onSpinEnd]);

  return (
    <div className="w-full relative flex flex-col items-center">
      {/* Outer Reel Frame (Mechanical Slot Machine Aesthetic) */}
      <div className="w-full max-w-sm relative rounded-3xl p-3 bg-gradient-to-b from-slate-800 via-slate-900 to-slate-800 shadow-soft-lg border-2 border-slate-700/80">
        {/* Decorative mechanical screws/rivets */}
        <div className="absolute top-2.5 left-3 w-2 h-2 rounded-full bg-slate-400/80 shadow-inner" />
        <div className="absolute top-2.5 right-3 w-2 h-2 rounded-full bg-slate-400/80 shadow-inner" />
        <div className="absolute bottom-2.5 left-3 w-2 h-2 rounded-full bg-slate-400/80 shadow-inner" />
        <div className="absolute bottom-2.5 right-3 w-2 h-2 rounded-full bg-slate-400/80 shadow-inner" />

        {/* Center Target Pointer Arrows */}
        <div className="absolute left-1 top-1/2 -translate-y-1/2 z-20 text-[#A0C4FF] font-black text-sm">
          ▶
        </div>
        <div className="absolute right-1 top-1/2 -translate-y-1/2 z-20 text-[#FFC6FF] font-black text-sm">
          ◀
        </div>

        {/* Reel Viewing Drum Chamber */}
        <div className="relative h-44 rounded-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-hidden flex flex-col items-center justify-center border border-slate-700">
          {/* Top & Bottom 3D Drum Shadow Overlays */}
          <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none z-10" />
          <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none z-10" />

          {/* Highlight Target Window */}
          <div className="absolute inset-x-2 h-24 top-1/2 -translate-y-1/2 rounded-xl bg-white/[0.04] border-y border-[#A0C4FF]/40 pointer-events-none z-10" />

          {/* Center Card Display with Motion Blur */}
          <div
            className="flex flex-col items-center justify-center p-3 text-center w-full z-0 transition-transform"
            style={{
              filter: blurIntensity > 0.3 ? `blur(${blurIntensity}px)` : 'none',
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={displayItem.id + displayItem.title}
                initial={{ opacity: 0.8, y: isSpinning ? -12 : 0 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: isLanded ? [1.12, 1] : 1,
                }}
                transition={{ duration: 0.25 }}
                className="flex flex-col items-center"
              >
                {/* Emoji & Badge */}
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-3xl drop-shadow-md">{displayItem.emoji}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/10 text-slate-200 border border-white/15">
                    {displayItem.type} {displayItem.year ? `• ${displayItem.year}` : ''}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-md max-w-xs leading-tight line-clamp-2 px-2">
                  {displayItem.title}
                </h3>

                {/* Genre */}
                <p className="text-xs font-semibold text-slate-400 mt-1 flex items-center gap-1">
                  <Film className="w-3 h-3 text-[#A0C4FF]" />
                  <span>{displayItem.genre}</span>
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom Status Indicator */}
        <div className="mt-2 flex items-center justify-between px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          <span className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${isSpinning ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
            {isSpinning ? 'Girando catraca...' : 'Pronto'}
          </span>
          <span>{items.length} Obras Disponíveis</span>
        </div>
      </div>
    </div>
  );
};
