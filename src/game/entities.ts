// ============================================================
// STELLAR ASSAULT — Entity Factories (Player, Enemy, Boss, PowerUp, Bullet)
// ============================================================

import type { Player, Enemy, Boss, Bullet, PowerUp, PowerUpType, EnemyType, MovementPattern } from './types';
import { genId, randomBetween, randomInt } from './utils';
import {
  PLAYER_WIDTH, PLAYER_HEIGHT, PLAYER_MAX_HEALTH, PLAYER_MAX_SHIELDS,
  PLAYER_SPEED, PLAYER_SHOOT_COOLDOWN, BULLET_SPEED, CANVAS_WIDTH, CANVAS_HEIGHT, PLANETS,
} from './constants';
import type { WeaponId } from './constants';

// ── Player ─────────────────────────────────────────────────

export function createPlayer(): Player {
  return {
    x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2,
    y: CANVAS_HEIGHT - 100,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    hp: PLAYER_MAX_HEALTH,
    maxHp: PLAYER_MAX_HEALTH,
    shields: PLAYER_MAX_SHIELDS,
    maxShields: PLAYER_MAX_SHIELDS,
    speed: PLAYER_SPEED,
    lives: 3,
    weapon: 'laser',
    weaponsUnlocked: ['laser'],
    damage: 10,
    fireCooldown: 0,
    baseFireCooldown: PLAYER_SHOOT_COOLDOWN,
    invincible: false,
    invincibleTimer: 0,
    thrusterAnim: 0,
    hitFlash: 0,
    shieldRegenTimer: 0,
    weaponLevels: {
      laser: 1,
      spread: 1,
      rapid: 1,
      missile: 1,
      plasma: 1,
      beam: 1,
    },
  };
}

// ── Bullets ────────────────────────────────────────────────

export function createPlayerBullet(
  player: Player,
  weaponOverride?: WeaponId,
): Bullet[] {
  const weapon = weaponOverride ?? player.weapon;
  const cx = player.x + player.width / 2;
  const cy = player.y;

  const colorMap: Record<string, string> = {
    laser:   '#00ffff',
    spread:  '#ffaa00',
    rapid:   '#ff44ff',
    missile: '#ff4444',
    plasma:  '#44ff44',
    beam:    '#ffff00',
  };
  const color = colorMap[weapon] ?? '#00ffff';
  const dmg = player.damage;

  const lvl = player.weaponLevels?.[weapon] ?? 1;

  switch (weapon) {
    case 'spread': {
      const angles = lvl === 1 ? [-20, 0, 20] : lvl === 2 ? [-30, -15, 0, 15, 30] : [-40, -20, 0, 20, 40];
      const bulletW = lvl === 3 ? 7 : 5;
      const bulletH = lvl === 3 ? 16 : 12;
      const mult = lvl === 3 ? 1.0 : 0.75;
      return angles.map((angle) => ({
        id: genId(),
        x: cx - bulletW / 2,
        y: cy,
        vx: Math.sin((angle * Math.PI) / 180) * BULLET_SPEED * 0.8,
        vy: -Math.cos((angle * Math.PI) / 180) * BULLET_SPEED * 0.8,
        width: bulletW,
        height: bulletH,
        damage: dmg * mult,
        fromPlayer: true,
        weapon,
        color,
        trail: [],
      }));
    }

    case 'rapid': {
      if (lvl === 1) {
        return [{
          id: genId(),
          x: cx + randomBetween(-3, 3) - 2,
          y: cy,
          vx: randomBetween(-0.5, 0.5),
          vy: -BULLET_SPEED * 1.2,
          width: 4,
          height: 10,
          damage: dmg * 0.6,
          fromPlayer: true,
          weapon,
          color,
          trail: [],
        }];
      } else if (lvl === 2) {
        return [
          { id: genId(), x: cx - 6, y: cy, vx: 0, vy: -BULLET_SPEED * 1.2, width: 4, height: 10, damage: dmg * 0.6, fromPlayer: true, weapon, color, trail: [] },
          { id: genId(), x: cx + 2, y: cy, vx: 0, vy: -BULLET_SPEED * 1.2, width: 4, height: 10, damage: dmg * 0.6, fromPlayer: true, weapon, color, trail: [] }
        ];
      } else {
        return [
          { id: genId(), x: cx - 8, y: cy, vx: -0.5, vy: -BULLET_SPEED * 1.3, width: 4, height: 10, damage: dmg * 0.5, fromPlayer: true, weapon, color, trail: [] },
          { id: genId(), x: cx - 2, y: cy, vx: 0, vy: -BULLET_SPEED * 1.3, width: 4, height: 10, damage: dmg * 0.6, fromPlayer: true, weapon, color, trail: [] },
          { id: genId(), x: cx + 4, y: cy, vx: 0.5, vy: -BULLET_SPEED * 1.3, width: 4, height: 10, damage: dmg * 0.5, fromPlayer: true, weapon, color, trail: [] }
        ];
      }
    }

    case 'missile': {
      if (lvl === 1) {
        return [{
          id: genId(),
          x: cx - 4,
          y: cy,
          vx: 0,
          vy: -BULLET_SPEED * 0.7,
          width: 8,
          height: 16,
          damage: dmg * 2.5,
          fromPlayer: true,
          weapon,
          color,
          trail: [],
          homing: true,
          lifetime: 3000,
          maxLifetime: 3000,
        }];
      } else if (lvl === 2) {
        return [
          { id: genId(), x: cx - 12, y: cy, vx: -2, vy: -BULLET_SPEED * 0.7, width: 8, height: 16, damage: dmg * 2.2, fromPlayer: true, weapon, color, trail: [], homing: true, lifetime: 3000, maxLifetime: 3000 },
          { id: genId(), x: cx + 4, y: cy, vx: 2, vy: -BULLET_SPEED * 0.7, width: 8, height: 16, damage: dmg * 2.2, fromPlayer: true, weapon, color, trail: [], homing: true, lifetime: 3000, maxLifetime: 3000 }
        ];
      } else {
        return [
          { id: genId(), x: cx - 4, y: cy, vx: 0, vy: -BULLET_SPEED * 0.7, width: 10, height: 18, damage: dmg * 2.5, fromPlayer: true, weapon, color, trail: [], homing: true, lifetime: 3000, maxLifetime: 3000 },
          { id: genId(), x: cx - 16, y: cy, vx: -4, vy: -BULLET_SPEED * 0.6, width: 8, height: 16, damage: dmg * 2.0, fromPlayer: true, weapon, color, trail: [], homing: true, lifetime: 3000, maxLifetime: 3000 },
          { id: genId(), x: cx + 8, y: cy, vx: 4, vy: -BULLET_SPEED * 0.6, width: 8, height: 16, damage: dmg * 2.0, fromPlayer: true, weapon, color, trail: [], homing: true, lifetime: 3000, maxLifetime: 3000 }
        ];
      }
    }

    case 'plasma': {
      if (lvl === 1) {
        return [{
          id: genId(),
          x: cx - 8,
          y: cy,
          vx: 0,
          vy: -BULLET_SPEED * 0.6,
          width: 16,
          height: 16,
          damage: dmg * 3,
          fromPlayer: true,
          weapon,
          color,
          trail: [],
        }];
      } else if (lvl === 2) {
        return [
          { id: genId(), x: cx - 16, y: cy, vx: -1, vy: -BULLET_SPEED * 0.6, width: 16, height: 16, damage: dmg * 2.5, fromPlayer: true, weapon, color, trail: [] },
          { id: genId(), x: cx, y: cy, vx: 1, vy: -BULLET_SPEED * 0.6, width: 16, height: 16, damage: dmg * 2.5, fromPlayer: true, weapon, color, trail: [] }
        ];
      } else {
        return [{
          id: genId(),
          x: cx - 14,
          y: cy,
          vx: 0,
          vy: -BULLET_SPEED * 0.5,
          width: 28,
          height: 28,
          damage: dmg * 5.0,
          fromPlayer: true,
          weapon,
          color,
          trail: [],
        }];
      }
    }

    case 'beam': {
      const width = lvl === 1 ? 6 : lvl === 2 ? 12 : 24;
      const damageMult = lvl === 1 ? 1.2 : lvl === 2 ? 2.0 : 3.0;
      return [{
        id: genId(),
        x: cx - width / 2,
        y: 0,
        vx: 0,
        vy: 0,
        width,
        height: cy,
        damage: dmg * damageMult,
        fromPlayer: true,
        weapon,
        color,
        trail: [],
        lifetime: 150,
        maxLifetime: 150,
      }];
    }

    default: { // laser
      if (lvl === 1) {
        return [{
          id: genId(),
          x: cx - 2,
          y: cy,
          vx: 0,
          vy: -BULLET_SPEED,
          width: 4,
          height: 16,
          damage: dmg,
          fromPlayer: true,
          weapon,
          color: '#00ffff',
          trail: [],
        }];
      } else if (lvl === 2) {
        return [
          { id: genId(), x: cx - 8, y: cy, vx: 0, vy: -BULLET_SPEED, width: 4, height: 16, damage: dmg, fromPlayer: true, weapon, color, trail: [] },
          { id: genId(), x: cx + 4, y: cy, vx: 0, vy: -BULLET_SPEED, width: 4, height: 16, damage: dmg, fromPlayer: true, weapon, color, trail: [] }
        ];
      } else {
        return [
          { id: genId(), x: cx - 2, y: cy, vx: 0, vy: -BULLET_SPEED, width: 4, height: 16, damage: dmg, fromPlayer: true, weapon, color, trail: [] },
          { id: genId(), x: cx - 12, y: cy, vx: -BULLET_SPEED * 0.17, vy: -BULLET_SPEED * 0.98, width: 4, height: 16, damage: dmg, fromPlayer: true, weapon, color, trail: [] },
          { id: genId(), x: cx + 8, y: cy, vx: BULLET_SPEED * 0.17, vy: -BULLET_SPEED * 0.98, width: 4, height: 16, damage: dmg, fromPlayer: true, weapon, color, trail: [] }
        ];
      }
    }
  }
}

export function createEnemyBullet(
  ex: number, ey: number,
  targetX: number, targetY: number,
  speed = 5, damage = 8,
  type: 'enemy' | 'boss' = 'enemy',
): Bullet {
  const angle = Math.atan2(targetY - ey, targetX - ex);
  return {
    id: genId(),
    x: ex,
    y: ey,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    width: type === 'boss' ? 8 : 5,
    height: type === 'boss' ? 8 : 12,
    damage,
    fromPlayer: false,
    weapon: type,
    color: type === 'boss' ? '#ff2200' : '#ff6600',
    trail: [],
  };
}

// ── Enemies ────────────────────────────────────────────────

interface EnemyTemplate {
  type: EnemyType;
  hp: number;
  speed: number;
  color: string;
  accentColor: string;
  pattern: MovementPattern;
  shootInterval: number;
  value: number;
  dropChance: number;
  width: number;
  height: number;
  amplitude: number;
  frequency: number;
}

const ENEMY_TEMPLATES: Record<string, EnemyTemplate> = {
  grunt: {
    type: 'grunt',
    hp: 20, speed: 1.5, color: '#cc3333', accentColor: '#ff6666',
    pattern: 'straight', shootInterval: 2500, value: 100, dropChance: 0.15,
    width: 36, height: 36, amplitude: 0, frequency: 0,
  },
  shooter: {
    type: 'shooter',
    hp: 35, speed: 1.0, color: '#cc6633', accentColor: '#ff9966',
    pattern: 'sine', shootInterval: 1500, value: 150, dropChance: 0.2,
    width: 38, height: 38, amplitude: 30, frequency: 0.03,
  },
  tank: {
    type: 'tank',
    hp: 100, speed: 0.6, color: '#993399', accentColor: '#cc66cc',
    pattern: 'straight', shootInterval: 2000, value: 200, dropChance: 0.35,
    width: 48, height: 48, amplitude: 0, frequency: 0,
  },
  zigzag: {
    type: 'zigzag',
    hp: 25, speed: 2.2, color: '#336699', accentColor: '#6699cc',
    pattern: 'zigzag', shootInterval: 3000, value: 125, dropChance: 0.1,
    width: 34, height: 34, amplitude: 80, frequency: 0.05,
  },
  kamikaze: {
    type: 'kamikaze',
    hp: 15, speed: 4.0, color: '#993300', accentColor: '#ff6600',
    pattern: 'dive', shootInterval: 99999, value: 80, dropChance: 0.05,
    width: 30, height: 30, amplitude: 0, frequency: 0,
  },
  sniper: {
    type: 'sniper',
    hp: 30, speed: 0.5, color: '#339966', accentColor: '#66cc99',
    pattern: 'formation', shootInterval: 1000, value: 175, dropChance: 0.25,
    width: 36, height: 36, amplitude: 0, frequency: 0,
  },
  bomber: {
    type: 'bomber',
    hp: 60, speed: 0.8, color: '#cc9966', accentColor: '#cc9966',
    pattern: 'sine', shootInterval: 1800, value: 225, dropChance: 0.4,
    width: 44, height: 44, amplitude: 20, frequency: 0.02,
  },
  barrier: {
    type: 'barrier',
    hp: 350, speed: 1.0, color: '#ff00cc', accentColor: '#ff00aa',
    pattern: 'straight', shootInterval: 999999, value: 500, dropChance: 0,
    width: 120, height: 20, amplitude: 0, frequency: 0,
  },
};

export function createEnemy(
  type: EnemyType,
  index: number,
  totalInRow: number,
  row: number,
  speedMult: number,
): Enemy {
  const tpl = ENEMY_TEMPLATES[type];
  const spacing = CANVAS_WIDTH / (totalInRow + 1);
  const startX = spacing * (index + 1) - tpl.width / 2;
  const startY = -60 - row * 70;

  return {
    id: genId(),
    x: startX,
    y: startY,
    startX,
    startY,
    width: tpl.width,
    height: tpl.height,
    hp: tpl.hp,
    maxHp: tpl.hp,
    speed: tpl.speed * speedMult,
    type: tpl.type,
    color: tpl.color,
    accentColor: tpl.accentColor,
    pattern: tpl.pattern,
    patternTimer: 0,
    shootTimer: randomBetween(0, tpl.shootInterval),
    shootInterval: tpl.shootInterval,
    value: tpl.value,
    dropChance: tpl.dropChance,
    phase: 0,
    entryDone: false,
    amplitude: tpl.amplitude,
    frequency: tpl.frequency,
    hitFlash: 0,
    angle: 0,
  };
}

export function buildWave(
  waveNumber: number,
  planetIndex: number,
  speedMult: number,
): Enemy[] {
  const enemies: Enemy[] = [];
  const difficulty = waveNumber + planetIndex * 4;
  const types: EnemyType[] = [];

  // Scale enemy variety with difficulty
  if (difficulty < 2) {
    types.push('grunt', 'grunt', 'grunt');
  } else if (difficulty < 4) {
    types.push('grunt', 'shooter', 'grunt', 'zigzag');
  } else if (difficulty < 6) {
    types.push('shooter', 'tank', 'zigzag', 'grunt', 'kamikaze');
  } else if (difficulty < 9) {
    types.push('sniper', 'bomber', 'shooter', 'zigzag', 'tank', 'kamikaze');
  } else {
    types.push('bomber', 'sniper', 'tank', 'kamikaze', 'zigzag', 'shooter', 'grunt');
  }

  // Build formation
  const perRow = Math.min(4 + Math.floor(difficulty / 2), 7);
  const rowCount = Math.ceil((difficulty + 3) / 2);

  for (let row = 0; row < Math.min(rowCount, 3); row++) {
    const type = types[row % types.length];
    for (let i = 0; i < perRow; i++) {
      enemies.push(createEnemy(type, i, perRow, row, speedMult));
    }
  }

  // Inject cyber barriers for Planet 5 (Cybertron Core)
  if (planetIndex === 5) {
    enemies.push(createEnemy('barrier', 0, 3, 3, speedMult));
    enemies.push(createEnemy('barrier', 2, 3, 3, speedMult));
  }

  return enemies;
}

// ── Boss ───────────────────────────────────────────────────

export function createBoss(planetIndex: number): Boss {
  const planet = PLANETS[planetIndex];
  const bossConfigs = [
    { w: 90, h: 80, hp: 800,  maxShield: 200, maxPhase: 3, speed: 1.5 },
    { w: 100, h: 90, hp: 1200, maxShield: 300, maxPhase: 3, speed: 1.8 },
    { w: 110, h: 100, hp: 1600, maxShield: 400, maxPhase: 4, speed: 2.0 },
    { w: 130, h: 120, hp: 2200, maxShield: 600, maxPhase: 4, speed: 2.2 },
    { w: 140, h: 130, hp: 2800, maxShield: 800, maxPhase: 4, speed: 2.4 },
    { w: 150, h: 140, hp: 3500, maxShield: 1000, maxPhase: 5, speed: 2.6 },
    { w: 160, h: 150, hp: 4500, maxShield: 1200, maxPhase: 5, speed: 3.0 },
  ];
  const cfg = bossConfigs[planetIndex] ?? bossConfigs[0];

  return {
    id: genId(),
    x: CANVAS_WIDTH / 2 - cfg.w / 2,
    y: -cfg.h,
    width: cfg.w,
    height: cfg.h,
    hp: cfg.hp,
    maxHp: cfg.hp,
    phase: 1,
    maxPhase: cfg.maxPhase,
    name: planet.bossName,
    color: planet.bossColor,
    accentColor: planet.accentColor,
    patternTimer: 0,
    shootTimer: 0,
    moveTimer: 0,
    targetX: CANVAS_WIDTH / 2 - cfg.w / 2,
    targetY: 80,
    alive: true,
    enraged: false,
    hitFlash: 0,
    shield: cfg.maxShield,
    maxShield: cfg.maxShield,
    weakPointActive: false,
    weakPointTimer: 0,
    entryAnim: 1,
    deathAnim: 0,
    angleOffset: 0,
    orbitAngle: 0,
    attackPattern: 0,
    attackTimer: 0,
  };
}

// ── Power-ups ──────────────────────────────────────────────

// Which weapons are unlocked by completing each planet (0-indexed planet → weapon unlocked)
// Planet 0 start: laser only
// Planet 1 start: spread unlocked
// Planet 2 start: rapid unlocked
// Planet 3 start: missile unlocked
// Planet 4 start: plasma unlocked
// Planet 5+ start: beam unlocked
export const WEAPON_UNLOCK_BY_PLANET: Record<number, import('./constants').WeaponId> = {
  1: 'spread',
  2: 'rapid',
  3: 'missile',
  4: 'plasma',
  5: 'beam',
};

// Returns list of weapons unlocked at a given planet index
export function getUnlockedWeapons(planetIndex: number): import('./constants').WeaponId[] {
  const all: import('./constants').WeaponId[] = ['laser', 'spread', 'rapid', 'missile', 'plasma', 'beam'];
  // planetIndex 0 → only laser; planetIndex 1 → laser+spread; etc.
  return all.slice(0, Math.min(planetIndex + 1, all.length));
}

// Non-weapon utility drops always in the pool
const BASE_POWERUP_POOL: PowerUpType[] = [
  'health', 'health', 'shield', 'shield',
  'speed', 'damage', 'score', 'bomb',
];

export function createPowerUp(x: number, y: number, forced?: PowerUpType, planetIndex = 0): PowerUp {
  let pool: PowerUpType[] = [...BASE_POWERUP_POOL];

  // Add weapon drops only for weapons the player has unlocked at this planet level
  // weapon_spread available from planet 1, weapon_rapid from planet 2, etc.
  if (planetIndex >= 1) pool.push('weapon_spread', 'weapon_spread');
  if (planetIndex >= 2) pool.push('weapon_rapid', 'weapon_rapid');
  if (planetIndex >= 3) pool.push('weapon_missile', 'weapon_missile');
  if (planetIndex >= 4) pool.push('weapon_plasma', 'weapon_plasma');
  if (planetIndex >= 5) pool.push('weapon_beam', 'weapon_beam');

  const type = forced ?? pool[randomInt(0, pool.length - 1)];
  return {
    id: genId(),
    x: x - 12,
    y,
    type,
    vy: 2,
    anim: Math.random() * Math.PI * 2,
    lifetime: 8000,
  };
}

export const POWERUP_COLORS: Record<PowerUpType, string> = {
  health:         '#ff4444',
  shield:         '#4488ff',
  speed:          '#ffff00',
  weapon_spread:  '#ffaa00',
  weapon_rapid:   '#ff44ff',
  weapon_plasma:  '#44ff44',
  weapon_missile: '#ff6644',
  weapon_beam:    '#ffff44',
  damage:         '#ff8800',
  score:          '#aaffaa',
  bomb:           '#ff00ff',
};

export const POWERUP_ICONS: Record<PowerUpType, string> = {
  health:         '❤️',
  shield:         '🛡',
  speed:          '⚡',
  weapon_spread:  '🔱',
  weapon_rapid:   '🌀',
  weapon_plasma:  '💚',
  weapon_missile: '🚀',
  weapon_beam:    '☀️',
  damage:         '💥',
  score:          '⭐',
  bomb:           '💣',
};
