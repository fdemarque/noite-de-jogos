import React from 'react';
import { motion } from 'framer-motion';
import { Clapperboard, Sparkles, Flame, HelpCircle, HeartHandshake, ChevronRight, Lock } from 'lucide-react';
import { sound } from '../../hooks/useAudio';

interface GamesHubProps {
  onSelectGame: (gameId: string) => void;
}

export const GamesHub: React.FC<GamesHubProps> = ({ onSelectGame }) => {
  const games = [
    {
      id: 'absolute-cinema',
      title: 'Absolute Cinema',
      description: 'Catraca de filmes com desafios de mímica ou desenho!',
      icon: Clapperboard,
      status: 'active' as const,
      badge: 'Disponível',
      gradient: 'from-[#A0C4FF] via-[#BEE1E6] to-[#FFC6FF]',
      borderColor: 'border-blue-200',
    },
    {
      id: 'verdade-ou-desafio',
      title: 'Verdade ou Desafio',
      description: 'Perguntas picantes, românticas e desafios para apimentar a noite.',
      icon: Flame,
      status: 'upcoming' as const,
      badge: 'Em Breve',
      gradient: 'from-rose-100 to-orange-100',
      borderColor: 'border-rose-200/60',
    },
    {
      id: 'quem-sou-eu',
      title: 'Quem Sou Eu?',
      description: 'Adivinhe o personagem ou celebridade na sua testa com perguntas de Sim/Não.',
      icon: HelpCircle,
      status: 'upcoming' as const,
      badge: 'Em Breve',
      gradient: 'from-amber-100 to-yellow-100',
      borderColor: 'border-amber-200/60',
    },
    {
      id: 'stop-namorados',
      title: 'Stop dos Namorados',
      description: 'Categorias divertidas e íntimas para testar a sintonia do casal.',
      icon: HeartHandshake,
      status: 'upcoming' as const,
      badge: 'Em Breve',
      gradient: 'from-purple-100 to-pink-100',
      borderColor: 'border-purple-200/60',
    },
  ];

  return (
    <div className="flex flex-col min-h-[calc(100vh-140px)] max-w-md mx-auto px-4 py-2">
      {/* Hub Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-pink-400" />
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
            Hub de Atividades
          </span>
        </div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">
          Jogos do Casal
        </h2>
        <p className="text-xs font-semibold text-slate-500">
          Escolha uma dinâmica para animar a noite
        </p>
      </div>

      {/* Grid of Large Cards */}
      <div className="grid grid-cols-1 gap-3.5 flex-1">
        {games.map((game, idx) => {
          const Icon = game.icon;
          const isActive = game.status === 'active';

          return (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              whileTap={isActive ? { scale: 0.98 } : {}}
              onClick={() => {
                if (isActive) {
                  sound.playPop();
                  onSelectGame(game.id);
                }
              }}
              className={`relative overflow-hidden rounded-3xl p-5 border transition-all ${
                isActive
                  ? `bg-white ${game.borderColor} shadow-soft hover:shadow-soft-lg cursor-pointer`
                  : 'bg-white/60 border-slate-200/70 opacity-75 cursor-not-allowed'
              }`}
            >
              {/* Subtle top background gradient pill */}
              <div
                className={`absolute top-0 right-0 w-32 h-32 rounded-full -mr-10 -mt-10 blur-2xl opacity-40 bg-gradient-to-br ${game.gradient}`}
              />

              <div className="flex items-start justify-between mb-3 relative z-10">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${
                    isActive
                      ? 'bg-gradient-to-tr from-[#A0C4FF] to-[#FFC6FF] text-slate-900'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  <Icon className="w-6 h-6 stroke-[2.2]" />
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      isActive
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border border-slate-200 flex items-center gap-1'
                    }`}
                  >
                    {!isActive && <Lock className="w-2.5 h-2.5" />}
                    {game.badge}
                  </span>
                </div>
              </div>

              <div className="relative z-10">
                <h3 className="text-base font-extrabold text-slate-800 tracking-tight flex items-center justify-between">
                  <span>{game.title}</span>
                  {isActive && <ChevronRight className="w-5 h-5 text-slate-400" />}
                </h3>
                <p className="text-xs font-semibold text-slate-500 mt-1 line-clamp-2">
                  {game.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
