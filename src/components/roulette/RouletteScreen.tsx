import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings2, RotateCw, PartyPopper, X, Trophy } from 'lucide-react';
import { RouletteWheel } from './RouletteWheel';
import { PrendasManagerModal } from './PrendasManagerModal';
import { PrendaItem, UserProfile } from '../../types';
import { DEFAULT_PRENDAS } from '../../data/defaultPrendas';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { sound } from '../../hooks/useAudio';

interface RouletteScreenProps {
  currentUser: UserProfile | null;
}

const PRENDAS_STORAGE_KEY = 'gamenight_filipe_duda_prendas';

export const RouletteScreen: React.FC<RouletteScreenProps> = ({ currentUser }) => {
  const [storedPrendas, setStoredPrendas] = useLocalStorage<PrendaItem[]>(
    PRENDAS_STORAGE_KEY,
    DEFAULT_PRENDAS
  );

  // Garantir compatibilidade com itens salvos anteriormente sem weight
  const prendas = storedPrendas.map((item) => ({
    ...item,
    weight: typeof item.weight === 'number' && item.weight > 0
      ? item.weight
      : (item.text.includes('Passe a vez') ? 8 : 20),
  }));

  const setPrendas = (newItems: PrendaItem[] | ((prev: PrendaItem[]) => PrendaItem[])) => {
    if (typeof newItems === 'function') {
      setStoredPrendas((prev) => {
        const evaluated = newItems(prev);
        return evaluated.map((item) => ({
          ...item,
          weight: typeof item.weight === 'number' && item.weight > 0 ? item.weight : 20,
        }));
      });
    } else {
      setStoredPrendas(
        newItems.map((item) => ({
          ...item,
          weight: typeof item.weight === 'number' && item.weight > 0 ? item.weight : 20,
        }))
      );
    }
  };
  const [isSpinning, setIsSpinning] = useState(false);
  const [isManagerOpen, setIsManagerOpen] = useState(false);
  const [winningItem, setWinningItem] = useState<PrendaItem | null>(null);

  const activeCount = prendas.filter((p) => p.active).length;

  const handleWinner = (item: PrendaItem) => {
    setWinningItem(item);
  };

  const handleDismissWinner = () => {
    sound.playPop();
    setWinningItem(null);
  };

  return (
    <div className="flex flex-col items-center justify-between min-h-[calc(100vh-140px)] px-4 py-2 max-w-md mx-auto">
      {/* Header Turn Banner */}
      <div className="w-full flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Rodada de:</span>
          <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1">
            {currentUser === 'Filipe' ? '👦 Filipe' : '👧 Duda'}
          </span>
        </div>

        <button
          onClick={() => {
            sound.playPop();
            setIsManagerOpen(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-100 shadow-sm text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <Settings2 className="w-3.5 h-3.5 text-slate-500" />
          <span>Prendas ({activeCount})</span>
        </button>
      </div>

      {/* Roulette Wheel Area */}
      <div className="flex-1 flex flex-col items-center justify-center w-full relative">
        <RouletteWheel
          items={prendas}
          onWinner={handleWinner}
          isSpinning={isSpinning}
          setIsSpinning={setIsSpinning}
        />
        <p className="text-[11px] font-semibold text-slate-400 mt-2">
          Toque no centro ou no botão abaixo para girar
        </p>
      </div>

      {/* Big Thumb Button */}
      <div className="w-full mt-4 mb-2">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => {
            // Trigger center tap on canvas
            const canvas = document.querySelector('canvas');
            if (canvas && !isSpinning) {
              canvas.parentElement?.click();
            }
          }}
          disabled={isSpinning || activeCount === 0}
          className={`w-full py-4 px-6 rounded-3xl font-extrabold text-base flex items-center justify-center gap-2.5 shadow-soft-lg transition-all ${
            isSpinning || activeCount === 0
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-[#A0C4FF] via-[#BEE1E6] to-[#FFC6FF] text-slate-900 hover:opacity-95 shadow-glow-blue'
          }`}
        >
          <RotateCw className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
          <span>{isSpinning ? 'GIRANDO...' : 'GIRAR ROLETA!'}</span>
        </motion.button>
      </div>

      {/* Prendas Manager Modal */}
      <PrendasManagerModal
        isOpen={isManagerOpen}
        onClose={() => setIsManagerOpen(false)}
        items={prendas}
        onUpdateItems={setPrendas}
      />

      {/* Winner Celebration Modal */}
      <AnimatePresence>
        {winningItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border-4 border-[#FFC6FF] flex flex-col items-center text-center relative overflow-hidden"
            >
              {/* Confetti badge */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#A0C4FF] to-[#FFC6FF] flex items-center justify-center shadow-md mb-3 text-white">
                <Trophy className="w-7 h-7 text-amber-300 fill-amber-300 drop-shadow-sm" />
              </div>

              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                <PartyPopper className="w-3.5 h-3.5 text-rose-500" />
                Prenda Sorteada!
              </span>

              <h2 className="text-xl font-extrabold text-slate-800 mb-3 px-2 leading-snug">
                {winningItem.text}
              </h2>

              <div className="px-4 py-2 rounded-2xl bg-slate-50 border border-slate-100 mb-5 w-full">
                <p className="text-xs font-semibold text-slate-500">
                  Quem deve cumprir:{' '}
                  <span className="text-slate-800 font-bold">
                    {currentUser === 'Filipe' ? 'Filipe 👦' : 'Duda 👧'}
                  </span>
                </p>
              </div>

              <button
                onClick={handleDismissWinner}
                className="w-full py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-colors"
              >
                Desafio Aceito! 👍
              </button>

              <button
                onClick={handleDismissWinner}
                className="absolute top-3 right-3 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
