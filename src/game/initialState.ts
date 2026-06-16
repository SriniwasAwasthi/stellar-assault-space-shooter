// ============================================================
// STELLAR ASSAULT — Initial Game State
// ============================================================

import type { GameState } from './types';
import { createPlayer, getUnlockedWeapons } from './entities';
import { buildWave } from './entities';
import { makeStars } from './utils';
import { loadData } from './storage';
import { CANVAS_WIDTH, CANVAS_HEIGHT, PLANETS } from './constants';

export function createInitialState(planetIndex = 0, carryOver?: Partial<GameState>): GameState {
  const saved = loadData();
  const player = carryOver?.player
    ? {
        ...carryOver.player,
        hp: carryOver.player.maxHp,
        shields: carryOver.player.maxShields,
        fireCooldown: 0,
        invincible: false,
        invincibleTimer: 0,
      }
    : createPlayer();

  // ── Weapon progression by planet level ──────────────────
  // Each planet unlocks the next weapon tier. The player starts
  // the new planet with that weapon already equipped.
  if (!carryOver?.player) {
    const unlockedWeapons = getUnlockedWeapons(planetIndex);
    player.weaponsUnlocked = unlockedWeapons;
    // Equip the best weapon available for this planet
    player.weapon = unlockedWeapons[unlockedWeapons.length - 1];
  } else {
    // Carrying over: also ensure the new planet's weapon is unlocked
    const unlockedWeapons = getUnlockedWeapons(planetIndex);
    for (const w of unlockedWeapons) {
      if (!player.weaponsUnlocked.includes(w)) {
        player.weaponsUnlocked.push(w);
      }
    }
    // Auto-equip the newly unlocked weapon for this planet if it wasn't owned before
    const newWeapon = unlockedWeapons[unlockedWeapons.length - 1];
    if (newWeapon && !carryOver.player?.weaponsUnlocked?.includes(newWeapon)) {
      player.weapon = newWeapon;
    }
  }

  return {
    phase: 'playing',
    score: carryOver?.score ?? 0,
    highScore: saved.highScore,
    combo: 0,
    comboTimer: 0,
    multiplier: 1,
    planetIndex,
    wave: 0,
    totalWaves: PLANETS[planetIndex].wavesBeforeBoss,
    kills: 0,
    totalKills: saved.totalKills,
    sessionTime: carryOver?.sessionTime ?? 0,
    currency: carryOver?.currency ?? 0,
    achievementsUnlocked: saved.achievementsUnlocked,
    levelsCompleted: saved.levelsCompleted,
    player,
    bullets: [],
    enemies: buildWave(0, planetIndex, PLANETS[planetIndex].enemySpeedMult),
    boss: null,
    particles: [],
    powerUps: [],
    stars: makeStars(CANVAS_WIDTH, CANVAS_HEIGHT),
    floatingTexts: [],
    waveTimer: 0,
    bossWarningTimer: 0,
    keys: {},
    lastTime: 0,
    frameCount: 0,
    shopClosed: false,
    noDamagWave: true,
    bombActive: false,
    bombTimer: 0,
    screenShake: 0,
    beamActive: false,
    beamTimer: 0,
    bulletsFiredInWave: 0,
    bossSpawnTime: 0,
  };
}

export function createMenuState(): GameState {
  const saved = loadData();
  return {
    phase: 'menu',
    score: 0,
    highScore: saved.highScore,
    combo: 0,
    comboTimer: 0,
    multiplier: 1,
    planetIndex: 0,
    wave: 0,
    totalWaves: 4,
    kills: 0,
    totalKills: saved.totalKills,
    sessionTime: 0,
    currency: 0,
    achievementsUnlocked: saved.achievementsUnlocked,
    levelsCompleted: saved.levelsCompleted,
    player: createPlayer(),
    bullets: [],
    enemies: [],
    boss: null,
    particles: [],
    powerUps: [],
    stars: makeStars(CANVAS_WIDTH, CANVAS_HEIGHT),
    floatingTexts: [],
    waveTimer: 0,
    bossWarningTimer: 0,
    keys: {},
    lastTime: 0,
    frameCount: 0,
    shopClosed: false,
    noDamagWave: true,
    bombActive: false,
    bombTimer: 0,
    screenShake: 0,
    beamActive: false,
    beamTimer: 0,
    bulletsFiredInWave: 0,
    bossSpawnTime: 0,
  };
}
