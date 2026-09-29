import React from 'react';
import { sound } from '../audio/soundEngine';

interface TouchControlsProps {
  onSteerLeftStart: () => void;
  onSteerLeftEnd: () => void;
  onSteerRightStart: () => void;
  onSteerRightEnd: () => void;
  onNitro: () => void;
  nitroCount: number;
  isNitroActive?: boolean;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onSteerLeftStart,
  onSteerLeftEnd,
  onSteerRightStart,
  onSteerRightEnd,
  onNitro,
  nitroCount,
}) => {
  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(15);
      } catch {
        // Ignore
      }
    }
  };

  return (
    <div className="absolute bottom-6 left-0 right-0 px-6 flex items-center justify-between pointer-events-none z-20 select-none">
      {/* Left Steer Button */}
      <button
        type="button"
        aria-label="往左轉向"
        onPointerDown={(e) => {
          e.preventDefault();
          sound.init();
          triggerHaptic();
          onSteerLeftStart();
        }}
        onPointerUp={(e) => {
          e.preventDefault();
          onSteerLeftEnd();
        }}
        onPointerCancel={onSteerLeftEnd}
        className="pointer-events-auto w-16 h-16 rounded-full bg-red-600/85 hover:bg-red-500 active:scale-90 active:bg-yellow-400 active:text-red-700 text-white font-extrabold text-2xl flex items-center justify-center border-4 border-yellow-400 shadow-xl backdrop-blur-xs transition-transform duration-75 select-none touch-none"
      >
        ◀
      </button>

      {/* Middle Nitro button if user has nitro */}
      {nitroCount > 0 && (
        <button
          type="button"
          aria-label="啟動氮氣加速"
          onClick={(e) => {
            e.preventDefault();
            sound.init();
            triggerHaptic();
            onNitro();
          }}
          className="pointer-events-auto px-4 py-3 rounded-full bg-sky-500/90 hover:bg-sky-400 active:scale-95 text-white font-bold text-sm flex items-center gap-1.5 border-2 border-sky-200 shadow-lg shadow-sky-500/30 backdrop-blur-xs animate-pulse transition-all select-none touch-none"
        >
          <span>⚡ 氮氣</span>
          <span className="w-5 h-5 rounded-full bg-white/20 text-xs flex items-center justify-center font-mono">
            {nitroCount}
          </span>
        </button>
      )}

      {/* Right Steer Button */}
      <button
        type="button"
        aria-label="往右轉向"
        onPointerDown={(e) => {
          e.preventDefault();
          sound.init();
          triggerHaptic();
          onSteerRightStart();
        }}
        onPointerUp={(e) => {
          e.preventDefault();
          onSteerRightEnd();
        }}
        onPointerCancel={onSteerRightEnd}
        className="pointer-events-auto w-16 h-16 rounded-full bg-red-600/85 hover:bg-red-500 active:scale-90 active:bg-yellow-400 active:text-red-700 text-white font-extrabold text-2xl flex items-center justify-center border-4 border-yellow-400 shadow-xl backdrop-blur-xs transition-transform duration-75 select-none touch-none"
      >
        ▶
      </button>
    </div>
  );
};
