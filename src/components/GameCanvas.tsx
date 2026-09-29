import React, { useEffect, useRef, useCallback } from 'react';
import { 
  GameState, 
  GameMode, 
  TrackTheme, 
  CarSkinId, 
  Obstacle, 
  Collectible, 
  Particle, 
  FloatingText, 
  RoadSceneryItem 
} from '../types/game';
import { CAR_SKINS, THEME_PALETTES } from '../utils/gameData';
import { sound } from '../audio/soundEngine';

interface GameCanvasProps {
  gameState: GameState;
  setGameState: (state: GameState) => void;
  gameMode: GameMode;
  trackTheme: TrackTheme;
  carSkinId: CarSkinId;
  score: number;
  setScore: React.Dispatch<React.SetStateAction<number>>;
  highScore: number;
  setHighScore: (score: number) => void;
  lives: number;
  setLives: React.Dispatch<React.SetStateAction<number>>;
  coins: number;
  setCoins: React.Dispatch<React.SetStateAction<number>>;
  nitroCount: number;
  setNitroCount: React.Dispatch<React.SetStateAction<number>>;
  currentSpeed: number;
  setCurrentSpeed: (speed: number) => void;
  timeLeft: number;
  setTimeLeft: React.Dispatch<React.SetStateAction<number>>;
  onDodgedTruck: () => void;
  onUsedNitro: () => void;
  onGameOver: (finalScore: number, finalCoins: number) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  gameState,
  setGameState,
  gameMode,
  trackTheme,
  carSkinId,
  score,
  setScore,
  highScore,
  setHighScore,
  lives,
  setLives,
  coins,
  setCoins,
  nitroCount,
  setNitroCount,
  setCurrentSpeed,
  timeLeft,
  setTimeLeft,
  onDodgedTruck,
  onUsedNitro,
  onGameOver,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Virtual game dimensions
  const CW = 480;
  const CH = 800;

  // Road geometry parameters
  const roadWidth = 320;
  const roadLeft = (CW - roadWidth) / 2;
  const roadRight = roadLeft + roadWidth;
  const curbWidth = 16;

  // Mutable game physics & objects inside ref to prevent re-creation jitter
  const gRef = useRef({
    player: {
      x: CW / 2,
      y: CH - 140,
      width: 46,
      height: 78,
      speedX: 0,
      maxSpeedX: 6.8,
      invulnerable: 0,
      slipAngle: 0,
      isNitro: false,
      nitroTimer: 0,
    },
    obstacles: [] as Obstacle[],
    collectibles: [] as Collectible[],
    particles: [] as Particle[],
    floatingTexts: [] as FloatingText[],
    scenery: [] as RoadSceneryItem[],
    keys: { left: false, right: false },
    touchDragging: false,
    dragStartX: 0,
    dragPlayerStartX: 0,
    speed: 7,
    baseSpeed: 7,
    roadOffset: 0,
    screenShake: 0,
    spawnTimer: 0,
    collectibleTimer: 0,
    sceneryTimer: 0,
    lastTime: 0,
    scoreAcc: 0,
    nextId: 1,
  });

  const skin = CAR_SKINS[carSkinId] || CAR_SKINS.CLASSIC_RED;
  const palette = THEME_PALETTES[trackTheme] || THEME_PALETTES.DAY;

  // Trigger Nitro Boost
  const activateNitro = useCallback(() => {
    const g = gRef.current;
    if (gameState !== 'PLAYING' || nitroCount <= 0 || g.player.isNitro) return;

    sound.playNitro();
    setNitroCount(prev => Math.max(0, prev - 1));
    g.player.isNitro = true;
    g.player.nitroTimer = 4.0; // 4 seconds of nitro
    g.player.invulnerable = Math.max(g.player.invulnerable, 240);
    onUsedNitro();

    // Floating text
    g.floatingTexts.push({
      id: g.nextId++,
      text: '⚡ NITRO BOOST!',
      x: g.player.x,
      y: g.player.y - 30,
      color: '#38bdf8',
      alpha: 1,
      vy: -1.8,
    });
  }, [gameState, nitroCount, setNitroCount, onUsedNitro]);

  // Start new run
  const startNewRun = useCallback(() => {
    sound.init();
    sound.startEngine();
    const g = gRef.current;
    g.player.x = CW / 2;
    g.player.y = CH - 140;
    g.player.speedX = 0;
    g.player.slipAngle = 0;
    g.player.invulnerable = 60;
    g.player.isNitro = false;
    g.player.nitroTimer = 0;
    g.obstacles = [];
    g.collectibles = [];
    g.particles = [];
    g.floatingTexts = [];
    g.speed = 7;
    g.baseSpeed = 7;
    g.roadOffset = 0;
    g.screenShake = 0;
    g.spawnTimer = 0;
    g.collectibleTimer = 0;
    g.scoreAcc = 0;

    // Reset scenery
    g.scenery = [
      { id: 1, side: 'left', type: 'tree', y: 150, distanceFromRoad: 40 },
      { id: 2, side: 'right', type: 'tree', y: 320, distanceFromRoad: 45 },
      { id: 3, side: 'left', type: 'sign', y: 550, distanceFromRoad: 35 },
    ];

    setScore(0);
    setLives(gameMode === 'CRUISE' ? 99 : 3);
    setNitroCount(1);
    if (gameMode === 'TURBO') {
      setTimeLeft(60);
    }
    setGameState('PLAYING');
  }, [gameMode, setScore, setLives, setNitroCount, setTimeLeft, setGameState]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      sound.init();
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        gRef.current.keys.left = true;
      }
      if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        gRef.current.keys.right = true;
      }
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'Space') {
        if (gameState === 'PLAYING') {
          activateNitro();
        } else if (gameState === 'START' || gameState === 'GAMEOVER') {
          startNewRun();
        }
      }
      if (e.code === 'KeyP' || e.code === 'Escape') {
        if (gameState === 'PLAYING') {
          setGameState('PAUSED');
          sound.stopEngine();
        } else if (gameState === 'PAUSED') {
          setGameState('PLAYING');
          sound.startEngine();
        }
      }
      if (e.code === 'Enter') {
        if (gameState !== 'PLAYING') {
          startNewRun();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        gRef.current.keys.left = false;
      }
      if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        gRef.current.keys.right = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, activateNitro, startNewRun, setGameState]);

  // Touch and pointer dragging
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handlePointerDown = (e: PointerEvent) => {
      sound.init();
      const rect = canvas.getBoundingClientRect();
      const clickX = ((e.clientX - rect.left) / rect.width) * CW;
      const clickY = ((e.clientY - rect.top) / rect.height) * CH;

      if (gameState !== 'PLAYING') {
        // If clicking start button or anywhere on screen
        startNewRun();
        return;
      }

      gRef.current.touchDragging = true;
      gRef.current.dragStartX = clickX;
      gRef.current.dragPlayerStartX = gRef.current.player.x;

      // Also support simple tap left / tap right
      if (clickY > 100) {
        if (clickX < CW / 2) {
          gRef.current.keys.left = true;
        } else {
          gRef.current.keys.right = true;
        }
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!gRef.current.touchDragging || gameState !== 'PLAYING') return;
      const rect = canvas.getBoundingClientRect();
      const currentX = ((e.clientX - rect.left) / rect.width) * CW;
      const deltaX = currentX - gRef.current.dragStartX;

      // Smooth direct drag steering
      gRef.current.player.x = gRef.current.dragPlayerStartX + deltaX;
      gRef.current.player.slipAngle = Math.max(-0.25, Math.min(0.25, deltaX * 0.005));
    };

    const handlePointerUp = () => {
      gRef.current.touchDragging = false;
      gRef.current.keys.left = false;
      gRef.current.keys.right = false;
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [gameState, startNewRun]);

  // Main Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const gameLoop = (timestamp: number) => {
      const g = gRef.current;
      if (!g.lastTime) g.lastTime = timestamp;
      const dt = Math.min((timestamp - g.lastTime) / 1000, 0.1);
      g.lastTime = timestamp;

      // 1. UPDATE PHYSICS (only if playing)
      if (gameState === 'PLAYING') {
        // Nitro timing
        if (g.player.isNitro) {
          g.player.nitroTimer -= dt;
          if (g.player.nitroTimer <= 0) {
            g.player.isNitro = false;
          }
        }

        // Speed progression
        const speedBonus = g.player.isNitro ? 5.5 : 0;
        g.baseSpeed = 7 + Math.min(7, score * 0.007);
        g.speed = g.baseSpeed + speedBonus;
        setCurrentSpeed(Math.round(g.speed * 14)); // display in km/h

        // Sound engine pitch update
        sound.updateEnginePitch(g.speed / 14);

        // Road offset scroll
        g.roadOffset = (g.roadOffset + g.speed) % 80;

        // Score accumulation (accelerated with nitro)
        const scoreMultiplier = g.player.isNitro ? 2.5 : 1.0;
        g.scoreAcc += dt * (10 + g.speed * 0.5) * scoreMultiplier;
        if (g.scoreAcc >= 1) {
          const add = Math.floor(g.scoreAcc);
          g.scoreAcc -= add;
          setScore(s => {
            const nextScore = s + add;
            if (nextScore > highScore) {
              setHighScore(nextScore);
            }
            return nextScore;
          });
        }

        // Turbo mode countdown
        if (gameMode === 'TURBO') {
          setTimeLeft(t => {
            const nextT = t - dt;
            if (nextT <= 0) {
              // Time's up!
              sound.playGameOver();
              setGameState('GAMEOVER');
              onGameOver(score, coins);
              return 0;
            }
            return nextT;
          });
        }

        // Steer keyboard
        if (g.keys.left) {
          g.player.speedX -= 1.0;
          g.player.slipAngle = Math.max(-0.25, g.player.slipAngle - 0.04);
        } else if (g.keys.right) {
          g.player.speedX += 1.0;
          g.player.slipAngle = Math.min(0.25, g.player.slipAngle + 0.04);
        } else if (!g.touchDragging) {
          g.player.speedX *= 0.82; // damping
          g.player.slipAngle *= 0.85;
        }

        const maxSpd = g.player.isNitro ? g.player.maxSpeedX * 1.25 : g.player.maxSpeedX;
        g.player.speedX = Math.max(-maxSpd, Math.min(maxSpd, g.player.speedX));
        g.player.x += g.player.speedX;

        // Curbs collision bounds
        const leftBound = roadLeft + curbWidth + 14;
        const rightBound = roadRight - curbWidth - 14;
        if (g.player.x < leftBound) {
          g.player.x = leftBound;
          g.player.speedX = 1.2;
          g.screenShake = 3;
        } else if (g.player.x > rightBound) {
          g.player.x = rightBound;
          g.player.speedX = -1.2;
          g.screenShake = 3;
        }

        // Decrement invulnerability
        if (g.player.invulnerable > 0) {
          g.player.invulnerable--;
        }

        // Screen shake decay
        if (g.screenShake > 0) {
          g.screenShake *= 0.85;
          if (g.screenShake < 0.4) g.screenShake = 0;
        }

        // Exhaust smoke or nitro fire particles
        if (g.player.isNitro) {
          // Blazing cyan / flame jets
          for (let k = 0; k < 2; k++) {
            g.particles.push({
              x: g.player.x + (k === 0 ? -12 : 12),
              y: g.player.y + 36,
              vx: (Math.random() - 0.5) * 1.5,
              vy: 5 + Math.random() * 6,
              size: 4 + Math.random() * 5,
              color: Math.random() > 0.5 ? '#38bdf8' : '#67e8f9',
              alpha: 0.9,
              decay: 0.06,
            });
          }
        } else if (Math.random() < 0.28) {
          g.particles.push({
            x: g.player.x + (Math.random() * 10 - 5),
            y: g.player.y + 36,
            vx: (Math.random() - 0.5) * 0.8,
            vy: 2 + Math.random() * 2,
            size: 3 + Math.random() * 3,
            color: '#cfcfcf',
            alpha: 0.6,
            decay: 0.04,
          });
        }

        // Spawn obstacles
        g.spawnTimer += dt;
        const nextSpawnInterval = Math.max(0.75, 1.9 - (score * 0.0016));
        if (g.spawnTimer >= nextSpawnInterval) {
          g.spawnTimer = 0;
          const isTruck = Math.random() > 0.38;
          const obsWidth = isTruck ? 52 : 46;
          const obsHeight = isTruck ? 84 : 40;
          const laneX = roadLeft + curbWidth + 24 + Math.random() * (roadWidth - curbWidth * 2 - 48);

          g.obstacles.push({
            id: g.nextId++,
            type: isTruck ? 'truck' : 'oil',
            x: laneX,
            y: -90,
            width: obsWidth,
            height: obsHeight,
            speed: isTruck ? g.speed * 0.42 : g.speed * 0.08,
          });
        }

        // Spawn collectibles (Coins, Nitro, Hearts)
        g.collectibleTimer += dt;
        if (g.collectibleTimer >= 2.2) {
          g.collectibleTimer = 0;
          const rand = Math.random();
          let cType: 'coin' | 'nitro' | 'heart' = 'coin';
          if (rand > 0.88 && lives < 3 && gameMode !== 'CRUISE') {
            cType = 'heart';
          } else if (rand > 0.72) {
            cType = 'nitro';
          }

          const laneX = roadLeft + curbWidth + 24 + Math.random() * (roadWidth - curbWidth * 2 - 48);
          g.collectibles.push({
            id: g.nextId++,
            type: cType,
            x: laneX,
            y: -50,
            width: 32,
            height: 32,
            bobOffset: Math.random() * Math.PI * 2,
          });
        }

        // Scenery roadside items
        g.sceneryTimer += dt;
        if (g.sceneryTimer >= 1.2) {
          g.sceneryTimer = 0;
          const side = Math.random() > 0.5 ? 'left' : 'right';
          const types: ('tree' | 'cactus' | 'sign')[] = ['tree', 'tree', 'sign'];
          g.scenery.push({
            id: g.nextId++,
            side,
            type: types[Math.floor(Math.random() * types.length)],
            y: -60,
            distanceFromRoad: 30 + Math.random() * 35,
          });
        }

        // Update scenery items
        for (let i = g.scenery.length - 1; i >= 0; i--) {
          const sc = g.scenery[i];
          sc.y += g.speed;
          if (sc.y > CH + 100) {
            g.scenery.splice(i, 1);
          }
        }

        // Update obstacles & collisions
        for (let i = g.obstacles.length - 1; i >= 0; i--) {
          const obs = g.obstacles[i];
          obs.y += (g.speed - obs.speed);

          // Dodged truck bonus!
          if (obs.y > g.player.y + 70 && !(obs as unknown as { dodged?: boolean }).dodged) {
            (obs as unknown as { dodged?: boolean }).dodged = true;
            if (obs.type === 'truck') {
              onDodgedTruck();
              setScore(s => s + 20);
              g.floatingTexts.push({
                id: g.nextId++,
                text: '+20 避開大卡車',
                x: obs.x,
                y: obs.y - 30,
                color: '#4ade80',
                alpha: 1,
                vy: -1.2,
              });
            }
          }

          if (obs.y > CH + 120) {
            g.obstacles.splice(i, 1);
            continue;
          }

          // AABB Collision check
          const hitX = Math.abs(g.player.x - obs.x) < (g.player.width / 2 + obs.width / 2 - 8);
          const hitY = Math.abs(g.player.y - obs.y) < (g.player.height / 2 + obs.height / 2 - 8);

          if (hitX && hitY) {
            // If in nitro mode, smash through obstacles!
            if (g.player.isNitro) {
              sound.playCrash();
              createSparks(obs.x, obs.y, 20, '#38bdf8');
              g.screenShake = 6;
              g.floatingTexts.push({
                id: g.nextId++,
                text: '💥 衝撞碾壓 +50',
                x: obs.x,
                y: obs.y,
                color: '#38bdf8',
                alpha: 1,
                vy: -1.5,
              });
              setScore(s => s + 50);
              g.obstacles.splice(i, 1);
              continue;
            }

            // Normal collision when not invulnerable
            if (g.player.invulnerable === 0 && gameMode !== 'CRUISE') {
              if (obs.type === 'truck') {
                sound.playCrash();
                createSparks(g.player.x, g.player.y, 24, '#ff3333');
                g.screenShake = 15;
                setLives(l => {
                  const nl = l - 1;
                  if (nl <= 0) {
                    sound.playGameOver();
                    sound.stopEngine();
                    setGameState('GAMEOVER');
                    onGameOver(score, coins);
                  }
                  return Math.max(0, nl);
                });
                g.player.invulnerable = 90;
                obs.y -= 25; // bounce truck back
              } else {
                // Oil spill
                sound.playSlip();
                createSparks(g.player.x, g.player.y, 16, '#c084fc');
                g.screenShake = 8;
                g.player.slipAngle = (Math.random() > 0.5 ? 1 : -1) * 0.7;
                g.player.speedX = (Math.random() > 0.5 ? 1 : -1) * g.player.maxSpeedX;
                setLives(l => {
                  const nl = l - 1;
                  if (nl <= 0) {
                    sound.playGameOver();
                    sound.stopEngine();
                    setGameState('GAMEOVER');
                    onGameOver(score, coins);
                  }
                  return Math.max(0, nl);
                });
                g.player.invulnerable = 90;
                g.obstacles.splice(i, 1);
              }
            }
          }
        }

        // Update collectibles & pickups
        for (let i = g.collectibles.length - 1; i >= 0; i--) {
          const col = g.collectibles[i];
          col.y += g.speed;
          col.bobOffset += dt * 4;

          if (col.y > CH + 60) {
            g.collectibles.splice(i, 1);
            continue;
          }

          // Pickup check
          const dist = Math.hypot(g.player.x - col.x, g.player.y - col.y);
          if (dist < 42) {
            if (col.type === 'coin') {
              sound.playCoin();
              setCoins(c => c + 1);
              setScore(s => s + 50);
              createSparks(col.x, col.y, 12, '#fde047');
              g.floatingTexts.push({
                id: g.nextId++,
                text: '+50 🪙',
                x: col.x,
                y: col.y,
                color: '#facc15',
                alpha: 1,
                vy: -1.6,
              });
            } else if (col.type === 'nitro') {
              sound.playNitro();
              setNitroCount(n => Math.min(3, n + 1));
              createSparks(col.x, col.y, 16, '#38bdf8');
              g.floatingTexts.push({
                id: g.nextId++,
                text: '+1 ⚡ 氮氣貯存',
                x: col.x,
                y: col.y,
                color: '#38bdf8',
                alpha: 1,
                vy: -1.6,
              });
            } else if (col.type === 'heart') {
              sound.playHeal();
              setLives(l => Math.min(3, l + 1));
              createSparks(col.x, col.y, 16, '#f43f5e');
              g.floatingTexts.push({
                id: g.nextId++,
                text: '+1 ❤️ 修理修復',
                x: col.x,
                y: col.y,
                color: '#fb7185',
                alpha: 1,
                vy: -1.6,
              });
            }
            g.collectibles.splice(i, 1);
          }
        }

        // Update floating texts
        for (let i = g.floatingTexts.length - 1; i >= 0; i--) {
          const ft = g.floatingTexts[i];
          ft.y += ft.vy;
          ft.alpha -= dt * 1.2;
          if (ft.alpha <= 0) {
            g.floatingTexts.splice(i, 1);
          }
        }
      }

      // 2. RENDER CANVAS
      renderCanvas(ctx);

      animId = requestAnimationFrame(gameLoop);
    };

    function createSparks(x: number, y: number, count = 20, color = '#ffdf33') {
      const g = gRef.current;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = 2 + Math.random() * 5;
        g.particles.push({
          x,
          y,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          size: 3 + Math.random() * 4,
          color: Math.random() > 0.4 ? color : '#ffffff',
          alpha: 1,
          decay: 0.03 + Math.random() * 0.02,
        });
      }
    }

    function renderCanvas(c: CanvasRenderingContext2D) {
      const g = gRef.current;
      c.save();

      // Screen shake
      if (g.screenShake > 0) {
        const sx = (Math.random() - 0.5) * g.screenShake;
        const sy = (Math.random() - 0.5) * g.screenShake;
        c.translate(sx, sy);
      }

      // Background grass
      const grassBlock = 40;
      for (let y = -grassBlock; y < CH + grassBlock; y += grassBlock) {
        const shiftedY = y + (g.roadOffset % grassBlock);
        const isEven = Math.floor((shiftedY - g.roadOffset) / grassBlock) % 2 === 0;

        c.fillStyle = isEven ? palette.grassLight : palette.grassDark;
        c.fillRect(0, shiftedY, roadLeft, grassBlock);
        c.fillRect(roadRight, shiftedY, CW - roadRight, grassBlock);
      }

      // Roadway asphalt
      c.fillStyle = palette.road;
      c.fillRect(roadLeft, 0, roadWidth, CH);

      // Curbs (red/white)
      const curbSegment = 40;
      for (let y = -curbSegment; y < CH + curbSegment; y += curbSegment) {
        const shiftedY = y + (g.roadOffset % curbSegment);
        const isRed = Math.floor((shiftedY - g.roadOffset) / curbSegment) % 2 === 0;
        c.fillStyle = isRed ? palette.curbRed : palette.curbWhite;

        c.fillRect(roadLeft, shiftedY, curbWidth, curbSegment);
        c.fillRect(roadRight - curbWidth, shiftedY, curbWidth, curbSegment);
      }

      // Lane dividers
      c.strokeStyle = palette.roadLines;
      c.lineWidth = 4;
      c.setLineDash([32, 24]);
      c.lineDashOffset = -g.roadOffset * 1.5;

      const laneW = (roadWidth - curbWidth * 2) / 3;
      for (let l = 1; l <= 2; l++) {
        const lx = roadLeft + curbWidth + laneW * l;
        c.beginPath();
        c.moveTo(lx, 0);
        c.lineTo(lx, CH);
        c.stroke();
      }
      c.setLineDash([]);

      // Roadside scenery items
      drawScenery(c);

      // Night headlight glow effect onto asphalt
      if (trackTheme === 'NIGHT' || trackTheme === 'SUNSET') {
        c.save();
        const beamGrad = c.createRadialGradient(
          g.player.x, g.player.y - 120, 10,
          g.player.x, g.player.y - 80, 180
        );
        beamGrad.addColorStop(0, 'rgba(255, 255, 200, 0.25)');
        beamGrad.addColorStop(0.5, 'rgba(255, 240, 180, 0.12)');
        beamGrad.addColorStop(1, 'rgba(255, 240, 180, 0)');
        c.fillStyle = beamGrad;
        c.beginPath();
        c.moveTo(g.player.x - 16, g.player.y - 20);
        c.lineTo(g.player.x - 90, g.player.y - 260);
        c.lineTo(g.player.x + 90, g.player.y - 260);
        c.lineTo(g.player.x + 16, g.player.y - 20);
        c.closePath();
        c.fill();
        c.restore();
      }

      // Collectibles
      drawCollectibles(c);

      // Obstacles
      drawObstacles(c);

      // Particles
      drawParticles(c);

      // Player car
      drawPlayerCar(c);

      // Floating text alerts
      drawFloatingTexts(c);

      // In-canvas HUD
      drawInCanvasHUD(c);

      // Overlay if paused or gameover or start
      if (gameState === 'START') {
        drawStartMenu(c);
      } else if (gameState === 'PAUSED') {
        drawPauseMenu(c);
      } else if (gameState === 'GAMEOVER') {
        drawGameOverMenu(c);
      }

      c.restore();
    }

    function drawScenery(c: CanvasRenderingContext2D) {
      const g = gRef.current;
      for (const item of g.scenery) {
        c.save();
        const sx = item.side === 'left' 
          ? roadLeft - item.distanceFromRoad 
          : roadRight + item.distanceFromRoad;
        
        if (item.type === 'tree') {
          // Retro round cartoon tree
          c.fillStyle = '#654321';
          c.fillRect(sx - 4, item.y, 8, 22);

          c.fillStyle = '#1e7b2a';
          c.beginPath();
          c.arc(sx, item.y - 12, 18, 0, Math.PI * 2);
          c.fill();

          c.fillStyle = '#34a843';
          c.beginPath();
          c.arc(sx - 4, item.y - 16, 12, 0, Math.PI * 2);
          c.fill();
        } else if (item.type === 'sign') {
          // Retro route sign
          c.fillStyle = '#777';
          c.fillRect(sx - 2, item.y, 4, 20);

          c.fillStyle = '#e52521';
          c.fillRect(sx - 14, item.y - 16, 28, 16);
          c.strokeStyle = '#fff';
          c.lineWidth = 1.5;
          c.strokeRect(sx - 14, item.y - 16, 28, 16);

          c.fillStyle = '#fff';
          c.font = 'bold 9px monospace';
          c.textAlign = 'center';
          c.fillText('ROUTE 9', sx, item.y - 5);
        }
        c.restore();
      }
    }

    function drawCollectibles(c: CanvasRenderingContext2D) {
      const g = gRef.current;
      for (const col of g.collectibles) {
        c.save();
        const bob = Math.sin(col.bobOffset) * 4;
        c.translate(col.x, col.y + bob);

        if (col.type === 'coin') {
          // Golden Mickey Coin
          c.fillStyle = 'rgba(0, 0, 0, 0.25)';
          c.beginPath();
          c.ellipse(0, 16, 14, 5, 0, 0, Math.PI * 2);
          c.fill();

          // Outer gold rim
          const goldGrad = c.createRadialGradient(-3, -3, 2, 0, 0, 16);
          goldGrad.addColorStop(0, '#fef08a');
          goldGrad.addColorStop(0.5, '#eab308');
          goldGrad.addColorStop(1, '#a16207');
          c.fillStyle = goldGrad;
          c.beginPath();
          c.arc(0, 0, 15, 0, Math.PI * 2);
          c.fill();

          c.strokeStyle = '#fef9c3';
          c.lineWidth = 1.5;
          c.stroke();

          // Mickey Silhouette cutout inside coin
          drawMickeySilhouette(c, 0, 0, 6, '#713f12', '#713f12');
        } else if (col.type === 'nitro') {
          // Glowing Nitro canister
          c.fillStyle = 'rgba(56, 189, 248, 0.3)';
          c.beginPath();
          c.arc(0, 0, 20, 0, Math.PI * 2);
          c.fill();

          c.fillStyle = '#0284c7';
          c.beginPath();
          c.roundRect(-10, -14, 20, 28, 6);
          c.fill();

          c.fillStyle = '#38bdf8';
          c.fillRect(-8, -12, 16, 24);

          // Lightning icon
          c.fillStyle = '#fef08a';
          c.beginPath();
          c.moveTo(2, -9);
          c.lineTo(-5, 0);
          c.lineTo(0, 0);
          c.lineTo(-2, 9);
          c.lineTo(5, -1);
          c.lineTo(0, -1);
          c.closePath();
          c.fill();
        } else if (col.type === 'heart') {
          // Heart repair kit
          c.fillStyle = '#e11d48';
          c.beginPath();
          c.arc(-6, -4, 7, Math.PI, 0, false);
          c.arc(6, -4, 7, Math.PI, 0, false);
          c.lineTo(0, 12);
          c.closePath();
          c.fill();

          c.fillStyle = '#ffffff';
          c.beginPath();
          c.arc(-4, -6, 2, 0, Math.PI * 2);
          c.fill();
        }

        c.restore();
      }
    }

    function drawObstacles(c: CanvasRenderingContext2D) {
      const g = gRef.current;
      for (const obs of g.obstacles) {
        if (obs.type === 'truck') {
          drawPeteTruck(c, obs);
        } else {
          drawOilSpill(c, obs);
        }
      }
    }

    function drawPeteTruck(c: CanvasRenderingContext2D, obs: Obstacle) {
      c.save();
      c.translate(obs.x, obs.y);

      // Ground shadow
      c.fillStyle = 'rgba(0,0,0,0.45)';
      c.fillRect(-27, -38, 54, 84);

      // Heavy truck tires
      c.fillStyle = '#111827';
      [-29, 23].forEach(tx => {
        [-32, -10, 16, 32].forEach(ty => {
          c.fillRect(tx, ty, 6, 14);
          c.fillStyle = '#4b5563';
          c.fillRect(tx + 1, ty + 2, 4, 10);
          c.fillStyle = '#111827';
        });
      });

      // Dark Pete Truck Body
      c.fillStyle = '#1f242d';
      c.beginPath();
      c.roundRect(-24, -40, 48, 80, 6);
      c.fill();

      // Truck bed with hazard stripes / purple hood
      c.fillStyle = '#581c87'; // Pete's iconic dark purple
      c.fillRect(-22, -38, 44, 24);

      c.fillStyle = '#111827';
      c.fillRect(-22, -12, 44, 48);

      c.strokeStyle = '#f97316';
      c.lineWidth = 2;
      c.strokeRect(-20, -10, 40, 44);

      // Dark cab windshield
      c.fillStyle = '#374151';
      c.fillRect(-17, -22, 34, 7);

      // Vertical exhaust pipes
      c.fillStyle = '#9ca3af';
      c.fillRect(-26, -32, 4, 12);
      c.fillRect(22, -32, 4, 12);

      // Exhaust smoke puffs
      if (Math.random() < 0.3) {
        gRef.current.particles.push({
          x: obs.x - 24,
          y: obs.y - 34,
          vx: -0.4,
          vy: -1.2,
          size: 3,
          color: '#4b5563',
          alpha: 0.5,
          decay: 0.05,
        });
      }

      // Aggressive yellow front headlights
      c.fillStyle = '#fbbf24';
      c.shadowColor = '#fbbf24';
      c.shadowBlur = 10;
      c.fillRect(-21, -40, 8, 4);
      c.fillRect(13, -40, 8, 4);
      c.shadowBlur = 0;

      c.restore();
    }

    function drawOilSpill(c: CanvasRenderingContext2D, obs: Obstacle) {
      c.save();
      c.translate(obs.x, obs.y);

      const grad = c.createRadialGradient(0, 0, 4, 0, 0, obs.width / 2);
      grad.addColorStop(0, '#09090b');
      grad.addColorStop(0.4, '#3b0764');
      grad.addColorStop(0.8, '#064e3b');
      grad.addColorStop(1, 'rgba(10, 10, 15, 0)');

      c.fillStyle = grad;
      c.beginPath();
      c.ellipse(0, 0, obs.width / 2, obs.height / 2, 0.2, 0, Math.PI * 2);
      c.fill();

      // Iridescent sheen contour
      c.strokeStyle = 'rgba(234, 179, 8, 0.45)';
      c.lineWidth = 2;
      c.beginPath();
      c.arc(2, -2, obs.width / 3.4, 0, Math.PI * 1.3);
      c.stroke();

      c.restore();
    }

    function drawPlayerCar(c: CanvasRenderingContext2D) {
      const g = gRef.current;
      const p = g.player;

      c.save();
      c.translate(p.x, p.y);
      c.rotate(p.slipAngle);

      // Invulnerable flashing
      if (p.invulnerable > 0 && Math.floor(p.invulnerable / 5) % 2 === 0) {
        c.globalAlpha = 0.4;
      }

      // Ground shadow
      c.fillStyle = 'rgba(0,0,0,0.38)';
      c.beginPath();
      c.ellipse(0, 5, 24, 42, 0, 0, Math.PI * 2);
      c.fill();

      // Vintage white-wall wheels (4 wheels)
      const wheels = [
        { x: -24, y: -22 }, { x: 24, y: -22 },
        { x: -24, y: 22 },  { x: 24, y: 22 },
      ];
      wheels.forEach(w => {
        c.fillStyle = '#1c1c1c';
        c.fillRect(w.x - 4, w.y - 10, 8, 20);
        c.fillStyle = '#f4f4f5';
        c.fillRect(w.x - 2, w.y - 6, 4, 12);
      });

      // Car body
      c.fillStyle = skin.bodyColor;
      c.beginPath();
      c.roundRect(-20, -36, 40, 72, 16);
      c.fill();

      // Side highlight
      c.fillStyle = skin.highlightColor;
      c.fillRect(-17, -26, 4, 52);

      // Center racing stripe
      c.fillStyle = skin.stripeColor;
      c.fillRect(-4, -36, 8, 30);

      // Curved windshield
      c.fillStyle = 'rgba(186, 230, 253, 0.85)';
      c.beginPath();
      c.ellipse(0, -6, 14, 5, 0, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = '#ffffff';
      c.lineWidth = 1.5;
      c.stroke();

      // Open cockpit interior
      c.fillStyle = skin.cockpitColor;
      c.beginPath();
      c.ellipse(0, 10, 13, 15, 0, 0, Math.PI * 2);
      c.fill();

      // Mickey silhouette driver (head & big round ears!)
      drawMickeySilhouette(c, 0, 10, 8, skin.headColor, skin.earColor);

      // Front headlights
      c.fillStyle = '#fef08a';
      c.beginPath();
      c.arc(-13, -34, 4, 0, Math.PI * 2);
      c.arc(13, -34, 4, 0, Math.PI * 2);
      c.fill();

      // Tail lights
      c.fillStyle = '#dc2626';
      c.beginPath();
      c.arc(-14, 34, 3, 0, Math.PI * 2);
      c.arc(14, 34, 3, 0, Math.PI * 2);
      c.fill();

      // Nitro flame glow halo
      if (p.isNitro) {
        c.strokeStyle = '#38bdf8';
        c.lineWidth = 3;
        c.beginPath();
        c.roundRect(-22, -38, 44, 76, 18);
        c.stroke();
      }

      c.restore();
    }

    function drawMickeySilhouette(
      c: CanvasRenderingContext2D, 
      x: number, 
      y: number, 
      radius: number, 
      headColor = '#111', 
      earColor = '#111'
    ) {
      c.save();
      c.fillStyle = headColor;
      c.beginPath();
      c.arc(x, y, radius, 0, Math.PI * 2);
      c.fill();

      c.fillStyle = earColor;
      const earRadius = radius * 0.58;
      const earOffset = radius * 0.85;

      // Left ear
      c.beginPath();
      c.arc(x - earOffset, y - earOffset * 0.75, earRadius, 0, Math.PI * 2);
      c.fill();

      // Right ear
      c.beginPath();
      c.arc(x + earOffset, y - earOffset * 0.75, earRadius, 0, Math.PI * 2);
      c.fill();
      c.restore();
    }

    function drawParticles(c: CanvasRenderingContext2D) {
      const g = gRef.current;
      for (let i = g.particles.length - 1; i >= 0; i--) {
        const p = g.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;
        p.size *= 0.96;

        if (p.alpha <= 0) {
          g.particles.splice(i, 1);
          continue;
        }

        c.save();
        c.globalAlpha = p.alpha;
        c.fillStyle = p.color;
        c.beginPath();
        c.arc(p.x, p.y, Math.max(1, p.size), 0, Math.PI * 2);
        c.fill();
        c.restore();
      }
    }

    function drawFloatingTexts(c: CanvasRenderingContext2D) {
      const g = gRef.current;
      for (const ft of g.floatingTexts) {
        c.save();
        c.globalAlpha = Math.max(0, ft.alpha);
        c.fillStyle = ft.color;
        c.font = 'bold 15px sans-serif';
        c.textAlign = 'center';
        c.shadowColor = '#000';
        c.shadowBlur = 4;
        c.fillText(ft.text, ft.x, ft.y);
        c.restore();
      }
    }

    function drawInCanvasHUD(c: CanvasRenderingContext2D) {
      // Top bar gradient
      c.fillStyle = 'rgba(0, 0, 0, 0.65)';
      c.fillRect(0, 0, CW, 68);

      c.fillStyle = '#ffde59';
      c.fillRect(0, 66, CW, 2);

      // Score
      c.textAlign = 'left';
      c.fillStyle = '#facc15';
      c.font = 'bold 11px sans-serif';
      c.fillText('SCORE', 18, 24);
      c.fillStyle = '#ffffff';
      c.font = '800 24px monospace';
      c.fillText(Math.floor(score).toString().padStart(5, '0'), 18, 52);

      // Coins or Turbo Time Left
      c.textAlign = 'center';
      if (gameMode === 'TURBO') {
        c.fillStyle = '#38bdf8';
        c.font = 'bold 11px sans-serif';
        c.fillText('TIME LEFT', CW / 2, 24);
        c.fillStyle = timeLeft < 10 ? '#ef4444' : '#ffffff';
        c.font = '800 22px monospace';
        c.fillText(`${Math.ceil(timeLeft)}s`, CW / 2, 50);
      } else {
        c.fillStyle = '#fde047';
        c.font = 'bold 11px sans-serif';
        c.fillText('COINS', CW / 2, 24);
        c.fillStyle = '#ffffff';
        c.font = '800 20px monospace';
        c.fillText(`🪙 ${coins}`, CW / 2, 50);
      }

      // Chances (Mickey Head silhouettes)
      c.textAlign = 'right';
      c.fillStyle = '#facc15';
      c.font = 'bold 11px sans-serif';
      c.fillText('LIVES', CW - 18, 24);

      if (gameMode === 'CRUISE') {
        c.fillStyle = '#4ade80';
        c.font = 'bold 16px sans-serif';
        c.fillText('∞ 無限', CW - 18, 50);
      } else {
        const startX = CW - 74;
        for (let i = 0; i < 3; i++) {
          const hx = startX + i * 24;
          const hy = 44;
          const hasLife = i < lives;
          drawMickeySilhouette(
            c, 
            hx, 
            hy, 
            6, 
            hasLife ? '#ef4444' : 'rgba(255,255,255,0.2)', 
            hasLife ? '#facc15' : 'rgba(255,255,255,0.2)'
          );
        }
      }
    }

    function drawStartMenu(c: CanvasRenderingContext2D) {
      c.fillStyle = 'rgba(0, 0, 0, 0.78)';
      c.fillRect(0, 0, CW, CH);

      // Large Emblem
      drawMickeySilhouette(c, CW / 2, CH * 0.28, 46, '#e52521', '#ffde59');

      c.textAlign = 'center';
      c.shadowColor = '#e52521';
      c.shadowBlur = 16;
      c.fillStyle = '#ffde59';
      c.font = '900 32px sans-serif';
      c.fillText("MICKEY'S", CW / 2, CH * 0.42);

      c.fillStyle = '#ffffff';
      c.font = '900 26px sans-serif';
      c.fillText('RETRO RACER', CW / 2, CH * 0.47);
      c.shadowBlur = 0;

      c.fillStyle = '#cbd5e1';
      c.font = '14px sans-serif';
      c.fillText('閃避皮特的黑色大卡車與路面油漬！', CW / 2, CH * 0.54);

      // Action Start Button
      c.fillStyle = '#e52521';
      c.beginPath();
      c.roundRect(CW / 2 - 110, CH * 0.63, 220, 52, 26);
      c.fill();
      c.strokeStyle = '#ffde59';
      c.lineWidth = 3;
      c.stroke();

      c.fillStyle = '#ffffff';
      c.font = 'bold 18px sans-serif';
      c.fillText('點擊或按空白鍵發車 🏁', CW / 2, CH * 0.63 + 33);

      c.fillStyle = '#94a3b8';
      c.font = '13px sans-serif';
      c.fillText('鍵盤：◀ / ▶ 或 A / D 換道 · 空白鍵氮氣', CW / 2, CH * 0.76);
      c.fillText('手機：左右滑動或點擊兩側虛擬按鍵', CW / 2, CH * 0.80);
    }

    function drawPauseMenu(c: CanvasRenderingContext2D) {
      c.fillStyle = 'rgba(0, 0, 0, 0.75)';
      c.fillRect(0, 0, CW, CH);

      c.textAlign = 'center';
      c.fillStyle = '#ffde59';
      c.font = '900 32px sans-serif';
      c.fillText('GAME PAUSED', CW / 2, CH * 0.42);

      c.fillStyle = '#ffffff';
      c.font = '16px sans-serif';
      c.fillText('按 P 鍵或點擊下方繼續遊戲', CW / 2, CH * 0.48);

      c.fillStyle = '#e52521';
      c.beginPath();
      c.roundRect(CW / 2 - 90, CH * 0.56, 180, 48, 24);
      c.fill();
      c.strokeStyle = '#ffde59';
      c.lineWidth = 2.5;
      c.stroke();

      c.fillStyle = '#ffffff';
      c.font = 'bold 17px sans-serif';
      c.fillText('繼續賽事 ▶', CW / 2, CH * 0.56 + 30);
    }

    function drawGameOverMenu(c: CanvasRenderingContext2D) {
      c.fillStyle = 'rgba(0, 0, 0, 0.85)';
      c.fillRect(0, 0, CW, CH);

      drawMickeySilhouette(c, CW / 2, CH * 0.28, 38, '#475569', '#64748b');

      c.textAlign = 'center';
      c.fillStyle = '#ef4444';
      c.font = '900 36px sans-serif';
      c.fillText('GAME OVER', CW / 2, CH * 0.42);

      c.fillStyle = '#94a3b8';
      c.font = 'bold 15px sans-serif';
      c.fillText('最終得分', CW / 2, CH * 0.48);

      c.fillStyle = '#ffde59';
      c.font = '900 44px monospace';
      c.fillText(Math.floor(score).toString(), CW / 2, CH * 0.55);

      // Best score tag
      c.fillStyle = '#cbd5e1';
      c.font = '13px sans-serif';
      c.fillText(`歷史最佳最高紀錄：${Math.floor(highScore)}`, CW / 2, CH * 0.61);

      // Restart Button
      c.fillStyle = '#e52521';
      c.beginPath();
      c.roundRect(CW / 2 - 100, CH * 0.67, 200, 52, 26);
      c.fill();
      c.strokeStyle = '#ffde59';
      c.lineWidth = 3;
      c.stroke();

      c.fillStyle = '#ffffff';
      c.font = 'bold 18px sans-serif';
      c.fillText('再次挑戰 ↺', CW / 2, CH * 0.67 + 33);
    }

    animId = requestAnimationFrame(gameLoop);
    return () => {
      cancelAnimationFrame(animId);
      sound.stopEngine();
    };
  }, [
    gameState, 
    gameMode, 
    trackTheme, 
    carSkinId, 
    score, 
    highScore, 
    lives, 
    coins, 
    timeLeft, 
    palette, 
    skin, 
    setScore, 
    setHighScore, 
    setLives, 
    setCoins, 
    setNitroCount, 
    setCurrentSpeed, 
    setTimeLeft, 
    onDodgedTruck, 
    onGameOver, 
    setGameState
  ]);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={CW}
        height={CH}
        className="block max-w-full max-h-full aspect-[480/800] object-contain shadow-2xl rounded-xl cursor-pointer touch-none"
        style={{ touchAction: 'none' }}
      />
    </div>
  );
};
