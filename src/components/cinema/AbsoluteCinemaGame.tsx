import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Dices, FastForward, Clapperboard, Sparkles } from 'lucide-react';
import { SlotReel } from './SlotReel';
import { Timer60 } from './Timer60';
import { CinemaMedia, ChallengeModifier, UserProfile } from '../../types';
import { CINEMA_DATABASE, CHALLENGE_MODIFIERS } from '../../data/cinemaDatabase';
import { sound } from '../../hooks/useAudio';

interface AbsoluteCinemaGameProps {
  currentUser: UserProfile | null;
  onBackToHub: () => void;
}

export const AbsoluteCinemaGame: React.FC<AbsoluteCinemaGameProps> = ({
  currentUser,
  onBackToHub,
}) => {
  const [selectedMedia, setSelectedMedia] = useState<CinemaMedia | null>(null);
  const [activeModifier, setActiveModifier] = useState<ChallengeModifier | null>(null);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);

  // Determine partner name
  const partnerUser = currentUser === 'Filipe' ? 'Duda' : 'Filipe';

  const handleStartSpin = () => {
    if (isSpinning) return;
    sound.playPop();
    setIsSpinning(true);

    // Randomize modifier concurrently
    const randMod =
      CHALLENGE_MODIFIERS[Math.floor(Math.random() * CHALLENGE_MODIFIERS.length)];
    setActiveModifier(randMod);
  };

  const handleSpinEnd = (media: CinemaMedia) => {
    setSelectedMedia(media);
    setIsSpinning(false);
  };

  // Skip to another movie without re-rolling modifier
  const handleSkipTitle = () => {
    sound.playPop();
    const remaining = CINEMA_DATABASE.filter(
      (m) => m.id !== selectedMedia?.id
    );
    const nextMedia = remaining[Math.floor(Math.random() * remaining.length)];
    setSelectedMedia(nextMedia);
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-140px)] max-w-md mx-auto px-4 py-2">
      {/* Top Bar with Back Button */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => {
            sound.playPop();
            onBackToHub();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-100 shadow-sm text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Hub de Jogos</span>
        </button>

        {/* Turn info */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-100 shadow-sm text-xs font-semibold text-slate-600">
          <span>Quem encena:</span>
          <span className="font-extrabold text-slate-900">
            {currentUser === 'Filipe' ? '👦 Filipe' : '👧 Duda'}
          </span>
        </div>
      </div>

      {/* Game Title Header */}
      <div className="text-center mb-3">
        <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center justify-center gap-2">
          <Clapperboard className="w-5 h-5 text-indigo-500" />
          <span>Absolute Cinema</span>
        </h2>
        <p className="text-xs font-semibold text-slate-500">
          Encene para {partnerUser} adivinhar antes do tempo acabar!
        </p>
      </div>

      {/* Slot Machine Vertical Reel */}
      <div className="mb-3">
        <SlotReel
          items={CINEMA_DATABASE}
          selectedItem={selectedMedia}
          isSpinning={isSpinning}
          onSpinEnd={handleSpinEnd}
        />
      </div>

      {/* Challenge Modifier Display */}
      <div className="mb-3">
        <AnimatePresence mode="wait">
          {activeModifier ? (
            <motion.div
              key={activeModifier.type}
              initial={{ opacity: 0, scale: 0.9, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className={`p-3.5 rounded-3xl border-2 ${activeModifier.borderColor} bg-white shadow-soft flex items-center gap-3`}
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${activeModifier.badgeBg}`}
              >
                {activeModifier.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Modo Obrigatório
                  </span>
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${activeModifier.badgeBg}`}
                  >
                    {activeModifier.title}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-800 mt-0.5">
                  {activeModifier.description}
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="p-3.5 rounded-3xl border-2 border-dashed border-slate-200 bg-white/50 text-center flex items-center justify-center gap-2 text-slate-400">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-semibold">
                Gire a catraca para sortear a obra e o modo de desafio!
              </span>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* 60s Countdown Timer */}
      <div className="mb-3">
        <Timer60 />
      </div>

      {/* Action Buttons: Big Spin and Skip */}
      <div className="mt-auto space-y-2 mb-2">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleStartSpin}
          disabled={isSpinning}
          className={`w-full py-4 px-6 rounded-3xl font-black text-base flex items-center justify-center gap-2 shadow-soft-lg transition-all ${
            isSpinning
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-[#A0C4FF] via-[#BEE1E6] to-[#FFC6FF] text-slate-900 hover:opacity-95 shadow-glow-blue'
          }`}
        >
          <Dices className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
          <span>{isSpinning ? 'CATRACA EM MOVIMENTO...' : 'GIRAR CATRACA!'}</span>
        </motion.button>

        {selectedMedia && (
          <button
            onClick={handleSkipTitle}
            disabled={isSpinning}
            className="w-full py-2.5 px-4 rounded-2xl bg-white/80 hover:bg-white text-xs font-bold text-slate-600 border border-slate-200 shadow-sm flex items-center justify-center gap-1.5 transition-colors"
          >
            <FastForward className="w-3.5 h-3.5 text-slate-400" />
            <span>Não conhecem esta obra? Pular Título</span>
          </button>
        )}
      </div>
    </div>
  );
};
