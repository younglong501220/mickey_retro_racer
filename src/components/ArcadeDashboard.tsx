import React from 'react';
import { Gauge, Coins, Trophy, Zap, Sparkles, Sun, Sunset, Moon, Shield } from 'lucide-react';
import { GameMode, TrackTheme, CarSkinId, GameStats } from '../types/game';
import { CAR_SKINS } from '../utils/gameData';

interface ArcadeDashboardProps {
  score: number;
  highScore: number;
  currentSpeed: number;
  coins: number;
  nitroCount: number;
  gameMode: GameMode;
  setGameMode: (mode: GameMode) => void;
  trackTheme: TrackTheme;
  setTrackTheme: (theme: TrackTheme) => void;
  carSkinId: CarSkinId;
  setCarSkinId: (skin: CarSkinId) => void;
  stats: GameStats;
}

export const ArcadeDashboard: React.FC<ArcadeDashboardProps> = ({
  score,
  highScore,
  currentSpeed,
  coins,
  nitroCount,
  gameMode,
  setGameMode,
  trackTheme,
  setTrackTheme,
  carSkinId,
  setCarSkinId,
  stats,
}) => {
  // Speed percentage for speedometer needle (0 to 180 km/h)
  const speedRatio = Math.min(1, Math.max(0, currentSpeed / 180));
  const needleAngle = -90 + speedRatio * 180; // -90deg to +90deg

  return (
    <aside className="w-full lg:w-80 flex flex-col gap-4 p-4 bg-neutral-900/80 border border-neutral-800 rounded-2xl backdrop-blur-md shrink-0 text-neutral-200">
      {/* 1. Speedometer & RPM Gauges */}
      <div className="bg-neutral-950/70 border border-neutral-800/80 rounded-xl p-4 flex flex-col items-center relative overflow-hidden">
        <div className="w-full flex items-center justify-between text-xs text-neutral-400 font-mono tracking-wider mb-2">
          <span className="flex items-center gap-1.5 text-red-400 font-semibold">
            <Gauge className="w-3.5 h-3.5" />
            <span>SPEEDOMETER</span>
          </span>
          <span className="text-yellow-400 font-bold tabular-nums">
            {currentSpeed} KM/H
          </span>
        </div>

        {/* Semi-circle Gauge Meter */}
        <div className="relative w-44 h-24 flex items-end justify-center overflow-hidden">
          {/* Gauge Background Arc */}
          <div className="absolute top-0 w-44 h-44 rounded-full border-8 border-neutral-800 border-t-red-600 border-r-amber-500 border-l-emerald-500" />

          {/* Needle */}
          <div 
            className="absolute bottom-0 w-1.5 h-18 bg-red-500 origin-bottom rounded-full shadow-lg transition-transform duration-100 ease-out"
            style={{ transform: `rotate(${needleAngle}deg)` }}
          >
            <div className="w-3 h-3 rounded-full bg-yellow-400 absolute -top-1 -left-0.75" />
          </div>

          {/* Center cap */}
          <div className="w-6 h-6 rounded-full bg-neutral-900 border-2 border-neutral-700 z-10" />
        </div>

        <div className="w-full flex justify-between text-[10px] text-neutral-500 font-mono mt-1 px-2">
          <span>0</span>
          <span>60</span>
          <span>120</span>
          <span>180+</span>
        </div>
      </div>

      {/* 2. Key Metrics Cluster */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-neutral-950/60 border border-neutral-800 rounded-xl p-3">
          <div className="flex items-center gap-1 text-[11px] text-neutral-400 font-medium">
            <Trophy className="w-3.5 h-3.5 text-yellow-500" />
            <span>BEST SCORE</span>
          </div>
          <div className="text-xl font-black font-mono text-yellow-400 mt-1 tabular-nums">
            {Math.floor(highScore)}
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5">
            現得分：<span className="font-mono text-neutral-300 tabular-nums">{Math.floor(score)}</span>
          </div>
        </div>

        <div className="bg-neutral-950/60 border border-neutral-800 rounded-xl p-3">
          <div className="flex items-center gap-1 text-[11px] text-neutral-400 font-medium">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>米奇硬幣</span>
          </div>
          <div className="text-xl font-black font-mono text-amber-300 mt-1 tabular-nums">
            {coins}
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5">
            累計：<span className="font-mono text-neutral-300 tabular-nums">{stats.totalCoins} 枚</span>
          </div>
        </div>
      </div>

      {/* 3. Nitro Stash */}
      <div className="bg-sky-950/30 border border-sky-800/40 rounded-xl p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-sky-300">氮氣衝刺貯存</div>
            <div className="text-[10px] text-sky-400/80">按空白鍵 / 螢幕按鈕釋放</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((idx) => (
            <div
              key={idx}
              className={`w-3.5 h-6 rounded-xs transition-all ${
                idx < nitroCount
                  ? 'bg-sky-400 shadow-sm shadow-sky-400/50'
                  : 'bg-neutral-800 border border-neutral-700'
              }`}
            />
          ))}
        </div>
      </div>

      {/* 4. Car Garage Skin Selector */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-semibold text-neutral-400">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span>車庫塗裝</span>
          </span>
          <span className="text-[11px] text-neutral-500">
            解鎖進度
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {Object.values(CAR_SKINS).map((s) => {
            const isUnlocked = highScore >= s.unlockedAt;
            const isSelected = carSkinId === s.id;

            return (
              <button
                key={s.id}
                type="button"
                disabled={!isUnlocked}
                onClick={() => isUnlocked && setCarSkinId(s.id)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? 'border-yellow-400 bg-yellow-400/10 shadow-sm shadow-yellow-400/20'
                    : isUnlocked
                    ? 'border-neutral-800 bg-neutral-950/40 hover:border-neutral-700'
                    : 'border-neutral-800/50 bg-neutral-950/20 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div 
                    className="w-4 h-4 rounded-full border border-neutral-700 shrink-0"
                    style={{ backgroundColor: s.bodyColor }}
                  />
                  <div className="text-xs font-bold truncate text-neutral-200">
                    {s.name}
                  </div>
                </div>

                <div className="text-[10px] text-neutral-400 truncate">
                  {isUnlocked ? s.subtitle : `🔒 ${s.unlockedAt}分解鎖`}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Track Atmosphere / Theme Preset */}
      <div className="flex flex-col gap-2">
        <div className="text-xs font-semibold text-neutral-400 flex items-center gap-1.5">
          <Sun className="w-3.5 h-3.5 text-amber-400" />
          <span>賽道時段場景</span>
        </div>

        <div className="grid grid-cols-3 gap-1.5 p-1 bg-neutral-950/60 border border-neutral-800 rounded-xl">
          <button
            type="button"
            onClick={() => setTrackTheme('DAY')}
            className={`py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer ${
              trackTheme === 'DAY'
                ? 'bg-neutral-800 text-yellow-300 shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-yellow-400" />
            <span>白晝</span>
          </button>
          <button
            type="button"
            onClick={() => setTrackTheme('SUNSET')}
            className={`py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer ${
              trackTheme === 'SUNSET'
                ? 'bg-neutral-800 text-amber-300 shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Sunset className="w-3.5 h-3.5 text-amber-400" />
            <span>夕陽</span>
          </button>
          <button
            type="button"
            onClick={() => setTrackTheme('NIGHT')}
            className={`py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer ${
              trackTheme === 'NIGHT'
                ? 'bg-neutral-800 text-cyan-300 shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Moon className="w-3.5 h-3.5 text-cyan-400" />
            <span>夜間</span>
          </button>
        </div>
      </div>

      {/* 6. Mode Switcher (on mobile/desktop) */}
      <div className="flex flex-col gap-2 pt-1 border-t border-neutral-800/80">
        <div className="text-xs font-semibold text-neutral-400 flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-red-400" />
          <span>遊戲規則模式</span>
        </div>

        <div className="grid grid-cols-3 gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => setGameMode('CLASSIC')}
            className={`py-1.5 px-2 rounded-lg border text-center transition-all cursor-pointer ${
              gameMode === 'CLASSIC'
                ? 'border-red-500 bg-red-500/20 text-white font-bold'
                : 'border-neutral-800 bg-neutral-950/40 text-neutral-400 hover:text-white'
            }`}
          >
            標準模式
          </button>
          <button
            type="button"
            onClick={() => setGameMode('TURBO')}
            className={`py-1.5 px-2 rounded-lg border text-center transition-all cursor-pointer ${
              gameMode === 'TURBO'
                ? 'border-sky-500 bg-sky-500/20 text-white font-bold'
                : 'border-neutral-800 bg-neutral-950/40 text-neutral-400 hover:text-white'
            }`}
          >
            60s 極速
          </button>
          <button
            type="button"
            onClick={() => setGameMode('CRUISE')}
            className={`py-1.5 px-2 rounded-lg border text-center transition-all cursor-pointer ${
              gameMode === 'CRUISE'
                ? 'border-emerald-500 bg-emerald-500/20 text-white font-bold'
                : 'border-neutral-800 bg-neutral-950/40 text-neutral-400 hover:text-white'
            }`}
          >
            無限巡航
          </button>
        </div>
      </div>
    </aside>
  );
};
