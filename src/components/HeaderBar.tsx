import React from 'react';
import { Volume2, VolumeX, Music, Monitor, Award, HelpCircle } from 'lucide-react';
import { GameMode } from '../types/game';

interface HeaderBarProps {
  gameMode: GameMode;
  setGameMode: (mode: GameMode) => void;
  sfxMuted: boolean;
  onToggleSfx: () => void;
  bgmMuted: boolean;
  onToggleBgm: () => void;
  crtEnabled: boolean;
  onToggleCrt: () => void;
  onOpenAchievements: () => void;
  onOpenHelp: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  gameMode,
  setGameMode,
  sfxMuted,
  onToggleSfx,
  bgmMuted,
  onToggleBgm,
  crtEnabled,
  onToggleCrt,
  onOpenAchievements,
  onOpenHelp,
}) => {
  return (
    <header className="w-full flex items-center justify-between px-4 lg:px-8 py-3 bg-neutral-900/90 border-b border-neutral-800 backdrop-blur-md z-30 shrink-0">
      {/* Zone 1: Single element brand wordmark */}
      <div className="flex items-center gap-2">
        <a 
          href="/" 
          className="text-base sm:text-lg font-black tracking-wider text-red-500 hover:text-red-400 transition-colors uppercase flex items-center gap-2"
        >
          <span className="text-xl">🏁</span>
          <span>Mickey's Retro Racer</span>
        </a>
      </div>

      {/* Zone 2: 3-4 clean nav links / modes */}
      <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-semibold text-neutral-300">
        <button
          onClick={() => setGameMode('CLASSIC')}
          className={`hover:text-yellow-400 transition-colors cursor-pointer py-1 ${
            gameMode === 'CLASSIC' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-neutral-400'
          }`}
        >
          標準賽道
        </button>
        <button
          onClick={() => setGameMode('TURBO')}
          className={`hover:text-yellow-400 transition-colors cursor-pointer py-1 ${
            gameMode === 'TURBO' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-neutral-400'
          }`}
        >
          60s極速衝刺
        </button>
        <button
          onClick={() => setGameMode('CRUISE')}
          className={`hover:text-yellow-400 transition-colors cursor-pointer py-1 ${
            gameMode === 'CRUISE' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-neutral-400'
          }`}
        >
          無傷巡航
        </button>
        <button
          onClick={onOpenAchievements}
          className="hover:text-yellow-400 transition-colors cursor-pointer flex items-center gap-1.5 py-1 text-neutral-400"
        >
          <Award className="w-4 h-4" />
          <span>榮譽獎章</span>
        </button>
      </nav>

      {/* Zone 3: 1-2 primary functional actions */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* BGM Toggle */}
        <button
          type="button"
          onClick={onToggleBgm}
          title={bgmMuted ? '開啟復古背景音樂' : '靜音背景音樂'}
          className={`p-2 rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1 ${
            !bgmMuted ? 'bg-amber-500/20 text-yellow-300 border border-yellow-500/30' : 'bg-neutral-800 text-neutral-400 hover:text-white'
          }`}
          aria-label="背景音樂"
        >
          <Music className="w-4 h-4" />
        </button>

        {/* SFX Toggle */}
        <button
          type="button"
          onClick={onToggleSfx}
          title={sfxMuted ? '開啟遊戲音效' : '靜音遊戲音效'}
          className={`p-2 rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1 ${
            !sfxMuted ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-neutral-800 text-neutral-400 hover:text-white'
          }`}
          aria-label="遊戲音效開關"
        >
          {sfxMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* CRT Scanline Toggle */}
        <button
          type="button"
          onClick={onToggleCrt}
          title="切換復古街機 CRT 掃描線"
          className={`hidden sm:flex p-2 rounded-lg transition-colors cursor-pointer text-xs items-center gap-1 ${
            crtEnabled ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-neutral-800 text-neutral-400 hover:text-white'
          }`}
          aria-label="CRT 濾鏡"
        >
          <Monitor className="w-4 h-4" />
        </button>

        {/* Instructions / Help */}
        <button
          type="button"
          onClick={onOpenHelp}
          title="遊戲操作指南"
          className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
          aria-label="指南"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
