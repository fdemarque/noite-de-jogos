import React from 'react';
import { Compass, Gamepad2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { sound } from '../../hooks/useAudio';

export type NavTab = 'recursos' | 'jogos';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    {
      id: 'recursos' as NavTab,
      label: 'Recursos',
      icon: Compass,
      subtitle: 'Roleta & Sorteios',
    },
    {
      id: 'jogos' as NavTab,
      label: 'Jogos',
      icon: Gamepad2,
      subtitle: 'Catraca & Desafios',
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass-nav pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 px-6">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => {
                if (!isActive) {
                  sound.playPop();
                  onTabChange(tab.id);
                }
              }}
              className="relative flex-1 py-1.5 px-3 flex flex-col items-center justify-center transition-colors focus:outline-none"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute inset-0 bg-gradient-to-r from-[#BEE1E6]/40 via-[#E2ECE9]/50 to-[#FFC6FF]/40 rounded-2xl -z-10 border border-white/60 shadow-sm"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}

              <div
                className={`p-1.5 rounded-xl transition-transform ${
                  isActive
                    ? 'text-slate-900 scale-110'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
              </div>

              <span
                className={`text-[11px] font-bold tracking-tight transition-colors ${
                  isActive ? 'text-slate-900 font-extrabold' : 'text-slate-400'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
