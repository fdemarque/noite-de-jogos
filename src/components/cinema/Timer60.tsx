import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';
import { sound } from '../../hooks/useAudio';

interface Timer60Props {
  onTimeEnd?: () => void;
}

export const Timer60: React.FC<Timer60Props> = ({ onTimeEnd }) => {
  const TOTAL_SECONDS = 60;
  const [timeLeft, setTimeLeft] = useState<number>(TOTAL_SECONDS);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            sound.playAlarm();
            if (onTimeEnd) onTimeEnd();
            return 0;
          }
          // Sound warning on last 5 seconds
          if (prev <= 6) {
            sound.playTimerTick(true);
          } else if (prev % 10 === 0) {
            sound.playTimerTick(false);
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, onTimeEnd]);

  const toggleTimer = () => {
    sound.playPop();
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    sound.playPop();
    setIsRunning(false);
    setTimeLeft(TOTAL_SECONDS);
  };

  // Circular progress calculation
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (timeLeft / TOTAL_SECONDS) * circumference;
  const isUrgent = timeLeft <= 10 && timeLeft > 0;

  return (
    <div className="w-full bg-white/90 backdrop-blur-md rounded-3xl p-3 border border-slate-100 shadow-sm flex items-center justify-between gap-3">
      {/* Time Display with Circular SVG */}
      <div className="flex items-center gap-3">
        <div className="relative w-14 h-14 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 64 64">
            <circle
              cx="32"
              cy="32"
              r={radius}
              stroke="#E2E8F0"
              strokeWidth="5"
              fill="transparent"
            />
            <circle
              cx="32"
              cy="32"
              r={radius}
              stroke={isUrgent ? '#FF5964' : '#A0C4FF'}
              strokeWidth="5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-300"
            />
          </svg>
          <span
            className={`absolute font-extrabold text-sm tracking-tighter ${
              isUrgent ? 'text-rose-600 animate-pulse' : 'text-slate-800'
            }`}
          >
            {timeLeft}s
          </span>
        </div>

        <div>
          <div className="flex items-center gap-1 text-slate-500">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Cronômetro</span>
          </div>
          <p className="text-xs font-semibold text-slate-700">
            {isRunning ? 'Em andamento...' : timeLeft === 0 ? 'Tempo esgotado!' : 'Adivinhe em 60s!'}
          </p>
        </div>
      </div>

      {/* Timer Controls */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={toggleTimer}
          className={`flex items-center gap-1 px-3.5 py-2 rounded-2xl font-bold text-xs shadow-sm transition-all ${
            isRunning
              ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
              : 'bg-slate-900 text-white hover:bg-slate-800'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>Pausar</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{timeLeft === TOTAL_SECONDS ? 'Iniciar' : 'Continuar'}</span>
            </>
          )}
        </button>

        <button
          onClick={resetTimer}
          title="Reiniciar tempo"
          className="p-2 rounded-2xl bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
