import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Lock, Delete, ArrowRight, Sparkles } from 'lucide-react';
import { UserProfile } from '../../types';
import { sound } from '../../hooks/useAudio';

interface GatekeeperProps {
  onLogin: (user: UserProfile, pin: string) => { success: boolean; error?: string };
}

export const Gatekeeper: React.FC<GatekeeperProps> = ({ onLogin }) => {
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [pin, setPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  const handleUserSelect = (user: UserProfile) => {
    sound.playPop();
    setSelectedUser(user);
    setErrorMsg(null);
  };

  const handleKeyPress = (digit: string) => {
    sound.playTick(500);
    setErrorMsg(null);
    if (pin.length < 8) {
      const nextPin = pin + digit;
      setPin(nextPin);
      if (nextPin.length === 8 && selectedUser) {
        verifyPin(nextPin);
      }
    }
  };

  const handleDelete = () => {
    sound.playTick(400);
    setErrorMsg(null);
    setPin((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    sound.playTick(350);
    setErrorMsg(null);
    setPin('');
  };

  const verifyPin = (pinToTest = pin) => {
    if (!selectedUser) {
      setErrorMsg('Escolha primeiro quem está acessando!');
      return;
    }

    const result = onLogin(selectedUser, pinToTest);
    if (!result.success) {
      sound.playAlarm();
      setErrorMsg(result.error || 'Senha incorreta!');
      setIsShaking(true);
      setTimeout(() => {
        setIsShaking(false);
        setPin('');
      }, 600);
    } else {
      sound.playWin();
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-[#BEE1E6]/40 via-[#FAFAFA] to-[#FDE2E4]/40">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm bg-white/90 backdrop-blur-xl rounded-4xl p-6 sm:p-8 shadow-soft-lg border border-white/80 flex flex-col items-center"
      >
        {/* App Branding */}
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#A0C4FF] via-[#BEE1E6] to-[#FFC6FF] flex items-center justify-center shadow-md mb-3">
          <Sparkles className="w-8 h-8 text-white" />
        </div>

        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight text-center">
          GameNight
        </h1>
        <p className="text-xs font-semibold text-slate-500 mb-6 flex items-center gap-1.5">
          <span>Filipe</span>
          <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400 inline" />
          <span>Duda</span>
        </p>

        {/* User Selection Chips */}
        <div className="w-full mb-6">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wider text-center mb-3">
            Quem está jogando?
          </p>

          <div className="grid grid-cols-2 gap-3">
            {/* Filipe */}
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => handleUserSelect('Filipe')}
              className={`p-3.5 rounded-3xl border-2 flex flex-col items-center justify-center transition-all ${
                selectedUser === 'Filipe'
                  ? 'border-[#6EA8FE] bg-gradient-to-b from-blue-50 to-blue-100/60 shadow-glow-blue'
                  : 'border-slate-100 bg-slate-50 hover:bg-slate-100/70 text-slate-600'
              }`}
            >
              <span className="text-3xl mb-1 drop-shadow-sm">👦</span>
              <span className="text-sm font-bold text-slate-800">Filipe</span>
              <span className="text-[10px] font-medium text-blue-600">Azul Bebê</span>
            </motion.button>

            {/* Duda */}
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => handleUserSelect('Duda')}
              className={`p-3.5 rounded-3xl border-2 flex flex-col items-center justify-center transition-all ${
                selectedUser === 'Duda'
                  ? 'border-[#FF85A1] bg-gradient-to-b from-pink-50 to-pink-100/60 shadow-glow-pink'
                  : 'border-slate-100 bg-slate-50 hover:bg-slate-100/70 text-slate-600'
              }`}
            >
              <span className="text-3xl mb-1 drop-shadow-sm">👧</span>
              <span className="text-sm font-bold text-slate-800">Duda</span>
              <span className="text-[10px] font-medium text-pink-600">Rosa Bebê</span>
            </motion.button>
          </div>
        </div>

        {/* 8-Digit PIN Display */}
        <div className="w-full mb-5 flex flex-col items-center">
          <div className="flex items-center gap-1.5 mb-2 text-slate-500">
            <Lock className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">Senha do Casal (8 dígitos)</span>
          </div>

          <motion.div
            animate={isShaking ? { x: [-12, 12, -8, 8, -4, 4, 0] } : {}}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center gap-2 py-2"
          >
            {Array.from({ length: 8 }).map((_, index) => {
              const isFilled = index < pin.length;
              return (
                <div
                  key={index}
                  className={`w-7 h-9 rounded-xl flex items-center justify-center font-bold text-base transition-all duration-150 border ${
                    isFilled
                      ? 'border-slate-700 bg-slate-800 text-white shadow-sm'
                      : 'border-slate-200 bg-slate-50/80 text-transparent'
                  }`}
                >
                  {isFilled ? '•' : ''}
                </div>
              );
            })}
          </motion.div>

          <AnimatePresence>
            {errorMsg && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs font-semibold text-rose-500 mt-1.5 text-center"
              >
                {errorMsg}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Touch Numeric Keypad */}
        <div className="w-full grid grid-cols-3 gap-2 mb-3">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <motion.button
              key={digit}
              whileTap={{ scale: 0.92 }}
              onClick={() => handleKeyPress(digit)}
              className="h-12 rounded-2xl bg-slate-50 hover:bg-slate-100 text-lg font-bold text-slate-800 border border-slate-100 shadow-sm active:bg-slate-200 transition-colors"
            >
              {digit}
            </motion.button>
          ))}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={handleClear}
            className="h-12 rounded-2xl bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-500 border border-slate-100 shadow-sm active:bg-slate-200 transition-colors"
          >
            Limpar
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => handleKeyPress('0')}
            className="h-12 rounded-2xl bg-slate-50 hover:bg-slate-100 text-lg font-bold text-slate-800 border border-slate-100 shadow-sm active:bg-slate-200 transition-colors"
          >
            0
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={handleDelete}
            className="h-12 rounded-2xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-100 shadow-sm active:bg-slate-200 transition-colors"
          >
            <Delete className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Submit Button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => verifyPin()}
          disabled={!selectedUser || pin.length < 8}
          className={`w-full py-3.5 px-4 rounded-3xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all ${
            selectedUser && pin.length === 8
              ? 'bg-gradient-to-r from-[#A0C4FF] to-[#FFC6FF] text-slate-900 hover:opacity-95 shadow-soft'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          <span>Entrar na Noite de Jogos</span>
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </motion.div>
    </div>
  );
};
