import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './hooks/useAuth';
import { Gatekeeper } from './components/auth/Gatekeeper';
import { Header } from './components/common/Header';
import { BottomNav, NavTab } from './components/common/BottomNav';
import { RouletteScreen } from './components/roulette/RouletteScreen';
import { GamesHub } from './components/cinema/GamesHub';
import { AbsoluteCinemaGame } from './components/cinema/AbsoluteCinemaGame';

export const App: React.FC = () => {
  const { user, isAuthenticated, login, logout, switchUser } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>('recursos');
  const [activeGameId, setActiveGameId] = useState<string | null>(null);

  // If not authenticated, render Gatekeeper screen
  if (!isAuthenticated || !user) {
    return <Gatekeeper onLogin={login} />;
  }

  const handleTabChange = (tab: NavTab) => {
    setActiveTab(tab);
    // If switching back to games tab, keep or reset game view
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-between text-slate-800 antialiased pb-20">
      {/* Top Header */}
      <Header
        currentUser={user}
        onLogout={logout}
        onSwitchUser={switchUser}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-md mx-auto pt-2 pb-6 px-1">
        <AnimatePresence mode="wait">
          {activeTab === 'recursos' && (
            <motion.div
              key="tab-recursos"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              <RouletteScreen currentUser={user} />
            </motion.div>
          )}

          {activeTab === 'jogos' && (
            <motion.div
              key="tab-jogos"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeGameId === 'absolute-cinema' ? (
                <AbsoluteCinemaGame
                  currentUser={user}
                  onBackToHub={() => setActiveGameId(null)}
                />
              ) : (
                <GamesHub onSelectGame={(id) => setActiveGameId(id)} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Fixed Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
};

export default App;
