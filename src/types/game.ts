export type GameState = 'START' | 'PLAYING' | 'PAUSED' | 'GAMEOVER';

export type GameMode = 'CLASSIC' | 'TURBO' | 'CRUISE';

export type TrackTheme = 'DAY' | 'SUNSET' | 'NIGHT';

export type CarSkinId = 'CLASSIC_RED' | 'VINTAGE_1928' | 'GOLDEN_CHAMPION' | 'NEON_RUNNER';

export interface CarSkin {
  id: CarSkinId;
  name: string;
  subtitle: string;
  bodyColor: string;
  highlightColor: string;
  stripeColor: string;
  cockpitColor: string;
  headColor: string;
  earColor: string;
  unlockedAt: number; // Score needed to unlock
}

export interface Obstacle {
  id: number;
  type: 'truck' | 'oil' | 'cone';
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
}

export interface Collectible {
  id: number;
  type: 'coin' | 'nitro' | 'heart';
  x: number;
  y: number;
  width: number;
  height: number;
  bobOffset: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
}

export interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
  alpha: number;
  vy: number;
}

export interface RoadSceneryItem {
  id: number;
  side: 'left' | 'right';
  type: 'tree' | 'cactus' | 'sign' | 'cheerleader';
  y: number;
  distanceFromRoad: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAtDate?: string;
}

export interface GameStats {
  highScore: number;
  totalCoins: number;
  gamesPlayed: number;
  trucksDodged: number;
  nitroUsedCount: number;
}
