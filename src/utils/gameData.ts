import { CarSkin, Achievement, TrackTheme } from '../types/game';

export const CAR_SKINS: Record<string, CarSkin> = {
  CLASSIC_RED: {
    id: 'CLASSIC_RED',
    name: '經典紅色敞篷',
    subtitle: 'Classic Roadster',
    bodyColor: '#e52521',
    highlightColor: '#ff5b57',
    stripeColor: '#ffde59',
    cockpitColor: '#4a2511',
    headColor: '#111111',
    earColor: '#111111',
    unlockedAt: 0,
  },
  VINTAGE_1928: {
    id: 'VINTAGE_1928',
    name: '1928 威利汽船風',
    subtitle: 'Steamboat 1928',
    bodyColor: '#e5e5e5',
    highlightColor: '#ffffff',
    stripeColor: '#1c1c1c',
    cockpitColor: '#333333',
    headColor: '#0a0a0a',
    earColor: '#0a0a0a',
    unlockedAt: 200,
  },
  GOLDEN_CHAMPION: {
    id: 'GOLDEN_CHAMPION',
    name: '金牌冠軍號',
    subtitle: 'Golden Trophy',
    bodyColor: '#e5a910',
    highlightColor: '#ffe45e',
    stripeColor: '#ffffff',
    cockpitColor: '#631010',
    headColor: '#111111',
    earColor: '#d49b08',
    unlockedAt: 500,
  },
  NEON_RUNNER: {
    id: 'NEON_RUNNER',
    name: '午夜霓虹極速',
    subtitle: 'Cyber Midnight',
    bodyColor: '#06b6d4',
    highlightColor: '#67e8f9',
    stripeColor: '#ec4899',
    cockpitColor: '#1e1b4b',
    headColor: '#090d16',
    earColor: '#06b6d4',
    unlockedAt: 1000,
  },
};

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_run',
    title: '極速起跑線',
    description: '完成第一次發車出發',
    icon: '🏁',
    unlocked: false,
  },
  {
    id: 'score_200',
    title: '街頭賽車手',
    description: '單場突破 200 分',
    icon: '🥉',
    unlocked: false,
  },
  {
    id: 'score_500',
    title: '金色獎盃',
    description: '單場突破 500 分，解鎖金牌冠軍號賽車',
    icon: '🏆',
    unlocked: false,
  },
  {
    id: 'dodge_10',
    title: '敏捷避讓',
    description: '單局成功閃避 10 輛皮特大卡車',
    icon: '🚚',
    unlocked: false,
  },
  {
    id: 'collect_15_coins',
    title: '米奇存錢筒',
    description: '累積收集 15 枚金色米奇硬幣',
    icon: '🪙',
    unlocked: false,
  },
  {
    id: 'nitro_boost',
    title: '超音速衝刺',
    description: '首次啟動氮氣狂飆 (Nitro Boost)',
    icon: '⚡',
    unlocked: false,
  },
];

export interface ThemeColors {
  grassDark: string;
  grassLight: string;
  road: string;
  roadLines: string;
  curbRed: string;
  curbWhite: string;
  skyTint?: string;
}

export const THEME_PALETTES: Record<TrackTheme, ThemeColors> = {
  DAY: {
    grassDark: '#27681d',
    grassLight: '#2d7a22',
    road: '#34343a',
    roadLines: '#ffffff',
    curbRed: '#e52521',
    curbWhite: '#ffffff',
  },
  SUNSET: {
    grassDark: '#643818',
    grassLight: '#7b4822',
    road: '#30292f',
    roadLines: '#fed7aa',
    curbRed: '#c2410c',
    curbWhite: '#ffedd5',
  },
  NIGHT: {
    grassDark: '#0c1b12',
    grassLight: '#13281c',
    road: '#1a1a22',
    roadLines: '#67e8f9',
    curbRed: '#991b1b',
    curbWhite: '#64748b',
  },
};
