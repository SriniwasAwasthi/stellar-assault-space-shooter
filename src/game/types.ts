// ============================================================
// STELLAR ASSAULT — Game Types
// ============================================================

import type { WeaponId } from './constants';

export type GamePhase =
  | 'menu'
  | 'playing'
  | 'paused'
  | 'upgradeShop'
  | 'bossWarning'
  | 'boss'
  | 'waveComplete'
  | 'levelComplete'
  | 'gameOver'
  | 'victory';

export interface Vec2 {
  x: number;
  y: number;
}

export interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  shields: number;
  maxShields: number;
  speed: number;
  lives: number;
  weapon: WeaponId;
  weaponsUnlocked: WeaponId[];
  damage: number;
  fireCooldown: number;
  baseFireCooldown: number;
  invincible: boolean;
  invincibleTimer: number;
  thrusterAnim: number;
  hitFlash: number;
  shieldRegenTimer: number;
  weaponLevels: Record<WeaponId, number>;
}

export interface Bullet {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  damage: number;
  fromPlayer: boolean;
  weapon: WeaponId | 'enemy' | 'boss';
  color: string;
  trail: Vec2[];
  homing?: boolean;
  targetId?: string;
  lifetime?: number;
  maxLifetime?: number;
}

export interface Enemy {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  speed: number;
  type: EnemyType;
  color: string;
  accentColor: string;
  pattern: MovementPattern;
  patternTimer: number;
  shootTimer: number;
  shootInterval: number;
  value: number;
  dropChance: number;
  phase: number;
  entryDone: boolean;
  startX: number;
  startY: number;
  amplitude: number;
  frequency: number;
  hitFlash: number;
  angle: number;
}

export type EnemyType = 'grunt' | 'shooter' | 'tank' | 'zigzag' | 'kamikaze' | 'sniper' | 'bomber' | 'barrier';

export type MovementPattern =
  | 'straight'
  | 'sine'
  | 'zigzag'
  | 'circle'
  | 'dive'
  | 'formation'
  | 'random';

export interface Boss {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  phase: number;
  maxPhase: number;
  name: string;
  color: string;
  accentColor: string;
  patternTimer: number;
  shootTimer: number;
  moveTimer: number;
  targetX: number;
  targetY: number;
  alive: boolean;
  enraged: boolean;
  hitFlash: number;
  shield: number;
  maxShield: number;
  weakPointActive: boolean;
  weakPointTimer: number;
  entryAnim: number;
  deathAnim: number;
  angleOffset: number;
  orbitAngle: number;
  attackPattern: number;
  attackTimer: number;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  type: 'spark' | 'smoke' | 'shockwave' | 'star' | 'debris' | 'glow';
  rotation?: number;
  rotSpeed?: number;
}

export interface PowerUp {
  id: string;
  x: number;
  y: number;
  type: PowerUpType;
  vy: number;
  anim: number;
  lifetime: number;
}

export type PowerUpType =
  | 'health'
  | 'shield'
  | 'speed'
  | 'weapon_spread'
  | 'weapon_rapid'
  | 'weapon_plasma'
  | 'weapon_missile'
  | 'weapon_beam'
  | 'damage'
  | 'score'
  | 'bomb';

export interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  alpha: number;
  twinkle: number;
  color: string;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
  vy: number;
  scale: number;
}

export interface GameState {
  phase: GamePhase;
  score: number;
  highScore: number;
  combo: number;
  comboTimer: number;
  multiplier: number;
  planetIndex: number;
  wave: number;
  totalWaves: number;
  kills: number;
  totalKills: number;
  sessionTime: number;
  currency: number;
  achievementsUnlocked: string[];
  levelsCompleted: number[];
  player: Player;
  bullets: Bullet[];
  enemies: Enemy[];
  boss: Boss | null;
  particles: Particle[];
  powerUps: PowerUp[];
  stars: Star[];
  floatingTexts: FloatingText[];
  waveTimer: number;
  bossWarningTimer: number;
  keys: Record<string, boolean>;
  lastTime: number;
  frameCount: number;
  shopClosed: boolean;
  noDamagWave: boolean;
  bombActive: boolean;
  bombTimer: number;
  screenShake: number;
  beamActive: boolean;
  beamTimer: number;
  bulletsFiredInWave: number;
  bossSpawnTime: number;
}

export interface SaveData {
  highScore: number;
  levelsCompleted: number[];
  achievementsUnlocked: string[];
  totalKills: number;
}
