import React, { useState } from 'react';
import { sound } from '../audio/soundEngine';

interface MickeyFigureProps {
  variant?: 'standing' | 'portrait';
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
}

export const MickeyFigure: React.FC<MickeyFigureProps> = ({
  variant: initialVariant = 'standing',
  size = 'md',
  interactive = true,
}) => {
  const [variant, setVariant] = useState<'standing' | 'portrait'>(initialVariant);
  const [isWaving, setIsWaving] = useState(false);

  const handleClick = () => {
    if (!interactive) return;
    sound.init();
    sound.playCoin();
    setIsWaving(true);
    setTimeout(() => setIsWaving(false), 800);
  };

  const handleToggleVariant = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.init();
    sound.playNitro();
    setVariant(v => (v === 'standing' ? 'portrait' : 'standing'));
  };

  return (
    <div className="flex flex-col items-center select-none group">
      {/* Interactive Toggle Pill on top hover */}
      {interactive && (
        <div className="flex items-center gap-2 mb-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={handleToggleVariant}
            className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-neutral-900/90 border border-yellow-400/40 text-yellow-300 hover:bg-yellow-400 hover:text-neutral-950 transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
            title="點擊切換：經典交叉腿全身 / 經典大頭照"
          >
            <span>✨</span>
            <span>切換造型：{variant === 'standing' ? '經典交叉腿站姿' : '大頭照徽章'}</span>
            <span className="text-[9px] opacity-75">↻</span>
          </button>
        </div>
      )}

      {/* Main SVG Figure Container */}
      <div 
        onClick={handleClick}
        className={`relative cursor-pointer transition-transform duration-200 hover:scale-105 active:scale-95 ${
          isWaving ? 'animate-bounce' : ''
        }`}
        title="點擊米老鼠互動！"
      >
        {variant === 'standing' ? (
          /* ========================================================
             1. 經典交叉腿站立造型 (Classic Crossed-Legs Standing Mickey)
             ======================================================== */
          <svg
            className={`${
              size === 'sm' ? 'w-24 h-32' : size === 'lg' ? 'w-44 h-56' : 'w-32 h-44'
            } drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]`}
            viewBox="0 0 200 260"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <filter id="mickey-glow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#e52521" floodOpacity="0.3" />
              </filter>
              <linearGradient id="shoe-grad-left" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ffde59" />
                <stop offset="100%" stopColor="#e5a910" />
              </linearGradient>
              <linearGradient id="shoe-grad-right" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ffe45e" />
                <stop offset="100%" stopColor="#d49b08" />
              </linearGradient>
              <linearGradient id="shorts-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f84742" />
                <stop offset="100%" stopColor="#c51612" />
              </linearGradient>
            </defs>

            {/* Vintage Tail (Slender curved tail behind) */}
            <path
              d="M 96 172 C 80 185, 60 180, 52 165 C 46 150, 55 138, 48 132"
              stroke="#18181b"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />

            {/* Left Ear */}
            <circle cx="68" cy="46" r="28" fill="#18181b" />
            <circle cx="68" cy="46" r="26" fill="#27272a" />

            {/* Right Ear */}
            <circle cx="132" cy="46" r="28" fill="#18181b" />
            <circle cx="132" cy="46" r="26" fill="#27272a" />

            {/* Head Silhouette Base */}
            <circle cx="100" cy="74" r="33" fill="#18181b" />

            {/* Classic Cream / Peach Face Contour */}
            <ellipse cx="100" cy="80" rx="27" ry="24" fill="#fed7aa" />
            {/* Cheeks / Brow bumps */}
            <ellipse cx="88" cy="70" rx="14" ry="16" fill="#fed7aa" />
            <ellipse cx="112" cy="70" rx="14" ry="16" fill="#fed7aa" />

            {/* Eyes */}
            <ellipse cx="91" cy="68" rx="5.5" ry="10" fill="#ffffff" />
            <ellipse cx="109" cy="68" rx="5.5" ry="10" fill="#ffffff" />
            {/* Pupils */}
            <ellipse cx="92.5" cy="70" rx="3" ry="5.5" fill="#18181b" />
            <ellipse cx="107.5" cy="70" rx="3" ry="5.5" fill="#18181b" />
            {/* Eye glints */}
            <circle cx="94" cy="68" r="1.2" fill="#ffffff" />
            <circle cx="109" cy="68" r="1.2" fill="#ffffff" />

            {/* Snout & Nose */}
            <ellipse cx="100" cy="80" rx="11" ry="6.5" fill="#fed7aa" />
            <ellipse cx="100" cy="77" rx="6.5" ry="4.5" fill="#18181b" />
            <circle cx="98.5" cy="76" r="1.2" fill="#ffffff" />

            {/* Cheerful Mouth & Tongue */}
            <path
              d="M 85 84 Q 100 102 115 84"
              stroke="#18181b"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="#c51612"
            />
            {/* Tongue */}
            <path
              d="M 92 90 Q 100 87 108 90 Q 100 97 92 90"
              fill="#fb7185"
            />
            {/* Smile cheek dimples */}
            <path d="M 82 82 Q 85 86 86 89" stroke="#18181b" strokeWidth="2" strokeLinecap="round" />
            <path d="M 118 82 Q 115 86 114 89" stroke="#18181b" strokeWidth="2" strokeLinecap="round" />

            {/* Slender Black Torso */}
            <ellipse cx="100" cy="120" rx="18" ry="22" fill="#18181b" />

            {/* Left Arm & White Glove (Resting confidently on hip) */}
            <path
              d="M 84 114 Q 64 125 72 142"
              stroke="#18181b"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
            />
            {/* Left Glove */}
            <circle cx="73" cy="144" r="11" fill="#ffffff" stroke="#e4e4e7" strokeWidth="1.5" />
            <circle cx="67" cy="148" r="4" fill="#ffffff" />
            {/* Glove 3 darts (classic 3 lines on back of hand) */}
            <line x1="71" y1="139" x2="71" y2="147" stroke="#18181b" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="74" y1="139" x2="74" y2="147" stroke="#18181b" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="77" y1="140" x2="77" y2="146" stroke="#18181b" strokeWidth="1.2" strokeLinecap="round" />

            {/* Right Arm & White Glove (Playful wave / lean) */}
            <path
              d="M 116 114 Q 138 122 130 142"
              stroke="#18181b"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
            />
            {/* Right Glove */}
            <circle cx="128" cy="144" r="11" fill="#ffffff" stroke="#e4e4e7" strokeWidth="1.5" />
            <circle cx="134" cy="148" r="4" fill="#ffffff" />
            <line x1="125" y1="139" x2="125" y2="147" stroke="#18181b" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="128" y1="139" x2="128" y2="147" stroke="#18181b" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="131" y1="140" x2="131" y2="146" stroke="#18181b" strokeWidth="1.2" strokeLinecap="round" />

            {/* Classic Red Shorts */}
            <path
              d="M 82 136 C 82 132, 118 132, 118 136 L 123 162 C 123 166, 111 169, 104 167 L 102 163 L 99 163 L 96 167 C 89 169, 77 166, 77 162 Z"
              fill="url(#shorts-grad)"
              stroke="#991b1b"
              strokeWidth="1.5"
            />

            {/* Shorts Two Iconic White Oval Buttons */}
            <ellipse cx="91" cy="150" rx="4.2" ry="7" fill="#ffffff" />
            <ellipse cx="109" cy="150" rx="4.2" ry="7" fill="#ffffff" />

            {/* Crossed Legs (經典優雅交叉站立步伐) */}
            {/* Back Leg (Left Leg standing straight/slightly back) */}
            <path
              d="M 90 166 L 86 216"
              stroke="#18181b"
              strokeWidth="7"
              strokeLinecap="round"
            />

            {/* Front Leg (Right Leg crossed over gracefully in front) */}
            <path
              d="M 110 166 Q 104 190 114 216"
              stroke="#18181b"
              strokeWidth="7.5"
              strokeLinecap="round"
            />

            {/* Left Big Yellow Shoe (flat on ground, toe pointing slightly left) */}
            <g transform="translate(62, 206)">
              <ellipse cx="22" cy="20" rx="24" ry="14" fill="url(#shoe-grad-left)" stroke="#ca8a04" strokeWidth="1.5" />
              {/* Shoe collar / cuff opening */}
              <ellipse cx="24" cy="12" rx="9" ry="4.5" fill="#eab308" stroke="#ca8a04" strokeWidth="1" />
              {/* Highlight */}
              <ellipse cx="28" cy="17" rx="10" ry="4" fill="#fef08a" opacity="0.6" />
            </g>

            {/* Right Big Yellow Shoe (crossed over, stylish tilted pose) */}
            <g transform="translate(98, 206)">
              <ellipse cx="26" cy="20" rx="25" ry="14" fill="url(#shoe-grad-right)" stroke="#ca8a04" strokeWidth="1.5" />
              <ellipse cx="18" cy="12" rx="9" ry="4.5" fill="#eab308" stroke="#ca8a04" strokeWidth="1" />
              <ellipse cx="28" cy="17" rx="11" ry="4" fill="#fef08a" opacity="0.6" />
            </g>
          </svg>
        ) : (
          /* ========================================================
             2. 經典大頭照徽章 (Big Cheerful Mickey Portrait Headshot)
             ======================================================== */
          <svg
            className={`${
              size === 'sm' ? 'w-24 h-24' : size === 'lg' ? 'w-44 h-44' : 'w-32 h-32'
            } drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]`}
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="badge-ring" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fde047" />
                <stop offset="50%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#a16207" />
              </linearGradient>
              <linearGradient id="badge-bg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#dc2626" />
                <stop offset="100%" stopColor="#7f1d1d" />
              </linearGradient>
            </defs>

            {/* Outer Golden Arcade Medal Frame */}
            <circle cx="100" cy="100" r="92" fill="url(#badge-bg)" stroke="url(#badge-ring)" strokeWidth="6" />
            {/* Inner dashed ring */}
            <circle cx="100" cy="100" r="82" fill="none" stroke="#fef08a" strokeWidth="2" strokeDasharray="5 3" opacity="0.8" />

            {/* Left Ear */}
            <circle cx="56" cy="56" r="32" fill="#18181b" stroke="#09090b" strokeWidth="1.5" />
            {/* Right Ear */}
            <circle cx="144" cy="56" r="32" fill="#18181b" stroke="#09090b" strokeWidth="1.5" />

            {/* Head Silhouette Base */}
            <circle cx="100" cy="106" r="44" fill="#18181b" />

            {/* Vintage Peach Face Mask */}
            <ellipse cx="100" cy="114" rx="36" ry="32" fill="#fed7aa" />
            <ellipse cx="85" cy="98" rx="19" ry="22" fill="#fed7aa" />
            <ellipse cx="115" cy="98" rx="19" ry="22" fill="#fed7aa" />

            {/* Big Expressive Cartoon Eyes */}
            <ellipse cx="89" cy="95" rx="7.5" ry="14" fill="#ffffff" stroke="#e4e4e7" strokeWidth="0.8" />
            <ellipse cx="111" cy="95" rx="7.5" ry="14" fill="#ffffff" stroke="#e4e4e7" strokeWidth="0.8" />
            {/* Pupils */}
            <ellipse cx="91" cy="98" rx="4" ry="7.5" fill="#18181b" />
            <ellipse cx="109" cy="98" rx="4" ry="7.5" fill="#18181b" />
            {/* Eye glints */}
            <circle cx="92.5" cy="94" r="1.8" fill="#ffffff" />
            <circle cx="110.5" cy="94" r="1.8" fill="#ffffff" />

            {/* Snout & Shiny Button Nose */}
            <ellipse cx="100" cy="113" rx="14" ry="8" fill="#fed7aa" />
            <ellipse cx="100" cy="108" rx="8.5" ry="6" fill="#18181b" />
            <circle cx="98" cy="106" r="1.8" fill="#ffffff" />

            {/* Wide Jovial Smile */}
            <path
              d="M 78 120 Q 100 146 122 120"
              stroke="#18181b"
              strokeWidth="3.2"
              strokeLinecap="round"
              fill="#c51612"
            />
            {/* Tongue */}
            <path
              d="M 88 129 Q 100 124 112 129 Q 100 139 88 129"
              fill="#fb7185"
            />
            {/* Smile dimples */}
            <path d="M 74 116 Q 78 122 80 126" stroke="#18181b" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 126 116 Q 122 122 120 126" stroke="#18181b" strokeWidth="2.5" strokeLinecap="round" />

            {/* Retro Ribbon Marquee Label at Bottom */}
            <g transform="translate(0, 15)">
              <rect x="36" y="146" width="128" height="24" rx="12" fill="#ffde59" stroke="#b45309" strokeWidth="2" />
              <text
                x="100"
                y="162"
                textAnchor="middle"
                fill="#78350f"
                fontSize="11"
                fontWeight="900"
                fontFamily="sans-serif"
                letterSpacing="1"
              >
                ★ MICKEY RACER ★
              </text>
            </g>
          </svg>
        )}
      </div>

      {/* Decorative subtitle under figure */}
      <span className="text-[11px] font-bold text-neutral-400 mt-1 tracking-wider uppercase flex items-center gap-1">
        <span className="text-yellow-400">★</span>
        <span>米奇極速車神</span>
        <span className="text-yellow-400">★</span>
      </span>
    </div>
  );
};
