/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { TouchControls } from './components/TouchControls';
import { HeaderBar } from './components/HeaderBar';
import { ArcadeDashboard } from './components/ArcadeDashboard';
import { MickeyFigure } from './components/MickeyFigure';
import { AchievementsModal } from './components/AchievementsModal';
import { HelpModal } from './components/HelpModal';
import { 
  GameState, 
  GameMode, 
  TrackTheme, 
  CarSkinId, 
  Achievement, 
  GameStats 
} from './types/game';
import { INITIAL_ACHIEVEMENTS } from './utils/gameData';
import { sound } from './audio/soundEngine';

export default function App() {
  // Game States
  const [gameState, setGameState] = useState<GameState>('START');
  const [gameMode, setGameMode] = useState<GameMode>('CLASSIC');
  const [trackTheme, setTrackTheme] = useState<TrackTheme>('DAY');
  const [carSkinId, setCarSkinId] = useState<CarSkinId>('CLASSIC_RED');

  // Stats & Progress
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    const saved = localStorage.getItem('mickey_racer_hiscore');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [lives, setLives] = useState<number>(3);
  const [coins, setCoins] = useState<number>(0);
  const [nitroCount, setNitroCount] = useState<number>(1);
  const [currentSpeed, setCurrentSpeed] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(60);

  // Overall lifetime stats
  const [stats, setStats] = useState<GameStats>(() => {
    const saved = localStorage.getItem('mickey_racer_stats');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback
      }
    }
    return {
      highScore: 0,
      totalCoins: 0,
      gamesPlayed: 0,
      trucksDodged: 0,
      nitroUsedCount: 0,
    };
  });

  // Achievements
  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    const saved = localStorage.getItem('mickey_racer_achievements');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Achievement[];
        return INITIAL_ACHIEVEMENTS.map(initial => {
          const found = parsed.find(p => p.id === initial.id);
          return found ? { ...initial, unlocked: found.unlocked } : initial;
        });
      } catch {
        // Fallback
      }
    }
    return INITIAL_ACHIEVEMENTS;
  });

  // Audio & Display Preferences
  const [sfxMuted, setSfxMuted] = useState<boolean>(false);
  const [bgmMuted, setBgmMuted] = useState<boolean>(true); // start BGM muted by default to respect autoplay policies
  const [crtEnabled, setCrtEnabled] = useState<boolean>(true);

  // Modals
  const [isAchievementsOpen, setIsAchievementsOpen] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [showMobileDashboard, setShowMobileDashboard] = useState<boolean>(false);

  // Ref to steer from touch buttons
  const touchSteerRef = useRef<{ left: boolean; right: boolean }>({ left: false, right: false });

  // Update achievements helper
  const unlockAchievement = useCallback((id: string) => {
    setAchievements(prev => {
      const next = prev.map(a => {
        if (a.id === id && !a.unlocked) {
          sound.playHighScoreFanfare();
          return { ...a, unlocked: true, unlockedAtDate: new Date().toISOString() };
        }
        return a;
      });
      localStorage.setItem('mickey_racer_achievements', JSON.stringify(next));
      return next;
    });
  }, []);

  // Save HighScore & Stats
  useEffect(() => {
    localStorage.setItem('mickey_racer_hiscore', highScore.toString());
  }, [highScore]);

  useEffect(() => {
    localStorage.setItem('mickey_racer_stats', JSON.stringify(stats));
  }, [stats]);

  // Check achievements on score/coins change
  useEffect(() => {
    if (score >= 200) unlockAchievement('score_200');
    if (score >= 500) unlockAchievement('score_500');
    if (stats.trucksDodged >= 10) unlockAchievement('dodge_10');
    if (stats.totalCoins >= 15) unlockAchievement('collect_15_coins');
    if (stats.nitroUsedCount >= 1) unlockAchievement('nitro_boost');
  }, [score, stats, unlockAchievement]);

  // Audio toggles
  const handleToggleSfx = () => {
    const muted = sound.toggleSfx();
    setSfxMuted(muted);
  };

  const handleToggleBgm = () => {
    const muted = sound.toggleBgm();
    setBgmMuted(muted);
    if (!muted) {
      sound.startBGM();
    } else {
      sound.stopBGM();
    }
  };

  const handleDodgedTruck = useCallback(() => {
    setStats(prev => ({ ...prev, trucksDodged: prev.trucksDodged + 1 }));
  }, []);

  const handleUsedNitro = useCallback(() => {
    setStats(prev => ({ ...prev, nitroUsedCount: prev.nitroUsedCount + 1 }));
  }, []);

  const handleGameOver = useCallback((finalScore: number, finalCoins: number) => {
    setStats(prev => ({
      ...prev,
      highScore: Math.max(prev.highScore, finalScore),
      totalCoins: prev.totalCoins + finalCoins,
      gamesPlayed: prev.gamesPlayed + 1,
    }));
  }, []);

  // Handle steering through window keyboard emulation or touch
  const handleSteerLeftStart = () => {
    touchSteerRef.current.left = true;
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowLeft' }));
  };

  const handleSteerLeftEnd = () => {
    touchSteerRef.current.left = false;
    window.dispatchEvent(new KeyboardEvent('keyup', { code: 'ArrowLeft' }));
  };

  const handleSteerRightStart = () => {
    touchSteerRef.current.right = true;
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight' }));
  };

  const handleSteerRightEnd = () => {
    touchSteerRef.current.right = false;
    window.dispatchEvent(new KeyboardEvent('keyup', { code: 'ArrowRight' }));
  };

  const handleNitro = () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }));
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-between select-none relative overflow-x-hidden font-sans">
      {/* 1. Header Bar */}
      <HeaderBar
        gameMode={gameMode}
        setGameMode={setGameMode}
        sfxMuted={sfxMuted}
        onToggleSfx={handleToggleSfx}
        bgmMuted={bgmMuted}
        onToggleBgm={handleToggleBgm}
        crtEnabled={crtEnabled}
        onToggleCrt={() => setCrtEnabled(prev => !prev)}
        onOpenAchievements={() => setIsAchievementsOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* 2. Main Game Arena Layout */}
      <main className="flex-1 w-full max-w-6xl flex flex-col lg:flex-row items-center lg:items-start justify-center gap-6 p-2 sm:p-4 lg:p-6 relative">
        {/* Arcade Cabinet Column with Top Mickey Marquee */}
        <div className="flex flex-col items-center w-full max-w-[480px]">
          {/* Top Mickey Mascot Figure */}
          <div className="mb-1 w-full flex flex-col items-center">
            <MickeyFigure variant="standing" size="md" interactive={true} />
          </div>

          {/* Arcade Cabinet Frame / Screen */}
          <div className="relative w-full h-[75vh] min-h-[520px] max-h-[780px] bg-black rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.9)] border-4 border-red-600/80 ring-1 ring-yellow-400/40 arcade-bezel flex items-center justify-center">
            {/* Game Canvas */}
            <GameCanvas
              gameState={gameState}
              setGameState={setGameState}
              gameMode={gameMode}
              trackTheme={trackTheme}
              carSkinId={carSkinId}
              score={score}
              setScore={setScore}
              highScore={highScore}
              setHighScore={setHighScore}
              lives={lives}
              setLives={setLives}
              coins={coins}
              setCoins={setCoins}
              nitroCount={nitroCount}
              setNitroCount={setNitroCount}
              currentSpeed={currentSpeed}
              setCurrentSpeed={setCurrentSpeed}
              timeLeft={timeLeft}
              setTimeLeft={setTimeLeft}
              onDodgedTruck={handleDodgedTruck}
              onUsedNitro={handleUsedNitro}
              onGameOver={handleGameOver}
            />

            {/* CRT Scanline Overlay */}
            {crtEnabled && (
              <div className="absolute inset-0 crt-overlay pointer-events-none rounded-xl z-10" />
            )}

            {/* On-Screen Mobile Touch Controls */}
            {gameState === 'PLAYING' && (
              <TouchControls
                onSteerLeftStart={handleSteerLeftStart}
                onSteerLeftEnd={handleSteerLeftEnd}
                onSteerRightStart={handleSteerRightStart}
                onSteerRightEnd={handleSteerRightEnd}
                onNitro={handleNitro}
                nitroCount={nitroCount}
              />
            )}

            {/* Pause overlay trigger button in corner */}
            {gameState === 'PLAYING' && (
              <button
                type="button"
                onClick={() => {
                  setGameState('PAUSED');
                  sound.stopEngine();
                }}
                className="absolute top-2.5 right-2.5 z-20 px-2.5 py-1 rounded-md bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 border border-neutral-700/60 text-xs font-mono backdrop-blur-xs transition-colors cursor-pointer"
              >
                PAUSE [P]
              </button>
            )}
          </div>
        </div>

        {/* Desktop Side Arcade Dashboard */}
        <div className="hidden lg:block">
          <ArcadeDashboard
            score={score}
            highScore={highScore}
            currentSpeed={currentSpeed}
            coins={coins}
            nitroCount={nitroCount}
            gameMode={gameMode}
            setGameMode={setGameMode}
            trackTheme={trackTheme}
            setTrackTheme={setTrackTheme}
            carSkinId={carSkinId}
            setCarSkinId={setCarSkinId}
            stats={stats}
          />
        </div>

        {/* Mobile Dashboard Accordion / Bottom Toggle Button */}
        <div className="lg:hidden w-full max-w-[480px]">
          <button
            type="button"
            onClick={() => setShowMobileDashboard(prev => !prev)}
            className="w-full py-2.5 px-4 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-bold text-neutral-300 flex items-center justify-between shadow-md"
          >
            <span>儀表板與車庫換裝 (Dashboard & Garage)</span>
            <span className="text-yellow-400">{showMobileDashboard ? '▲ 收起' : '▼ 展開'}</span>
          </button>

          {showMobileDashboard && (
            <div className="mt-3">
              <ArcadeDashboard
                score={score}
                highScore={highScore}
                currentSpeed={currentSpeed}
                coins={coins}
                nitroCount={nitroCount}
                gameMode={gameMode}
                setGameMode={setGameMode}
                trackTheme={trackTheme}
                setTrackTheme={setTrackTheme}
                carSkinId={carSkinId}
                setCarSkinId={setCarSkinId}
                stats={stats}
              />
            </div>
          )}
        </div>
      </main>

      {/* 3. Footer Bar */}
      <footer className="w-full py-3 px-6 text-center text-xs text-neutral-500 border-t border-neutral-900 shrink-0">
        <span>© 2026 Mickey's Retro Racer · 經典復古極速賽車 · Pure Web Audio & Canvas</span>
      </footer>

      {/* Modals */}
      <AchievementsModal
        isOpen={isAchievementsOpen}
        onClose={() => setIsAchievementsOpen(false)}
        achievements={achievements}
      />

      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
}
