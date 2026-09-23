import React from 'react';
import { LogOut, Heart, Sparkles, UserCheck } from 'lucide-react';
import { UserProfile } from '../../types';
import { sound } from '../../hooks/useAudio';

interface HeaderProps {
  currentUser: UserProfile | null;
  onLogout: () => void;
  onSwitchUser?: (user: UserProfile) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentUser, onLogout, onSwitchUser }) => {
  const isFilipe = currentUser === 'Filipe';

  const handleToggleUser = () => {
    sound.playPop();
    if (onSwitchUser && currentUser) {
      onSwitchUser(isFilipe ? 'Duda' : 'Filipe');
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full glass-panel px-4 py-3 shadow-sm flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#A0C4FF] to-[#FFC6FF] flex items-center justify-center shadow-sm">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold tracking-tight text-slate-800 leading-tight flex items-center gap-1.5">
            GameNight
            <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400 inline" />
          </h1>
          <p className="text-xs text-slate-500 font-medium">Filipe & Duda</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {currentUser && (
          <button
            onClick={handleToggleUser}
            title="Alternar jogador ativo"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 shadow-sm border ${
              isFilipe
                ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                : 'bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100'
            }`}
          >
            <span className="text-sm">{isFilipe ? '👦' : '👧'}</span>
            <span>{currentUser}</span>
            <UserCheck className="w-3 h-3 opacity-60 ml-0.5" />
          </button>
        )}

        <button
          onClick={() => {
            sound.playPop();
            onLogout();
          }}
          title="Sair da sessão"
          className="p-2 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
          aria-label="Sair"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
