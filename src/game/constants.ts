// ============================================================
// STELLAR ASSAULT — Game Constants
// ============================================================

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

export const PLAYER_SPEED = 5;
export const PLAYER_WIDTH = 48;
export const PLAYER_HEIGHT = 48;
export const PLAYER_MAX_HEALTH = 100;
export const PLAYER_MAX_SHIELDS = 50;
export const PLAYER_SHOOT_COOLDOWN = 200; // ms

export const BULLET_SPEED = 14;
export const ENEMY_BULLET_SPEED = 5;

export const STAR_COUNT = 120;
export const PARTICLE_LIFETIME = 800; // ms

// Score multipliers
export const COMBO_WINDOW = 2500; // ms before combo resets
export const COMBO_MULTIPLIER_MAX = 8;

// Planet definitions
export const PLANETS = [
  {
    id: 0,
    name: 'Mercury Prime',
    subtitle: 'The Scorched Frontier',
    bgColor: '#0a0612',
    accentColor: '#ff6b35',
    nebula: '#3d1a00',
    bossName: 'INFERNO TITAN',
    bossColor: '#ff4500',
    wavesBeforeBoss: 4,
    enemySpeedMult: 1.0,
    spawnRateMult: 1.0,
    description: 'Battle through the asteroid fields of Mercury Prime.',
  },
  {
    id: 1,
    name: 'Venomaris',
    subtitle: 'The Toxic Nebula',
    bgColor: '#060a12',
    accentColor: '#00ff88',
    nebula: '#003320',
    bossName: 'VENOM HYDRA',
    bossColor: '#00ff44',
    wavesBeforeBoss: 5,
    enemySpeedMult: 1.3,
    spawnRateMult: 1.2,
    description: 'Navigate poisonous clouds and lethal enemy swarms.',
  },
  {
    id: 2,
    name: 'Glacius IV',
    subtitle: 'The Frozen Void',
    bgColor: '#050a14',
    accentColor: '#00d4ff',
    nebula: '#001a3d',
    bossName: 'CRYO LEVIATHAN',
    bossColor: '#00aaff',
    wavesBeforeBoss: 6,
    enemySpeedMult: 1.6,
    spawnRateMult: 1.4,
    description: 'Survive ice-shard barrages in the frozen sectors.',
  },
  {
    id: 3,
    name: 'Pyrovex',
    subtitle: 'The Burning Hell',
    bgColor: '#0f0500',
    accentColor: '#ff2200',
    nebula: '#3d0000',
    bossName: 'SOLAR DESTROYER',
    bossColor: '#ff6600',
    wavesBeforeBoss: 7,
    enemySpeedMult: 2.0,
    spawnRateMult: 1.7,
    description: 'The final frontier. Only legends survive Pyrovex.',
  },
  {
    id: 4,
    name: 'Aetherius',
    subtitle: 'The Tempest Giant',
    bgColor: '#091206',
    accentColor: '#88ff00',
    nebula: '#203300',
    bossName: 'TEMPEST CYCLONE',
    bossColor: '#aaff00',
    wavesBeforeBoss: 6,
    enemySpeedMult: 2.2,
    spawnRateMult: 1.8,
    description: 'Battle through strong atmospheric winds on Aetherius.',
  },
  {
    id: 5,
    name: 'Cybertron Core',
    subtitle: 'The Neon Grid',
    bgColor: '#0c0612',
    accentColor: '#ff00cc',
    nebula: '#3d0033',
    bossName: 'MATRIX ARCHITECT',
    bossColor: '#ff00aa',
    wavesBeforeBoss: 7,
    enemySpeedMult: 2.5,
    spawnRateMult: 2.0,
    description: 'Hack through neon security defenses inside Cybertron Core.',
  },
  {
    id: 6,
    name: 'Void Terminus',
    subtitle: 'The Gravity Well',
    bgColor: '#020205',
    accentColor: '#ffcc00',
    nebula: '#1a1a2e',
    bossName: 'GRAVITY SINGULARITY',
    bossColor: '#ffff00',
    wavesBeforeBoss: 8,
    enemySpeedMult: 3.0,
    spawnRateMult: 2.2,
    description: 'Fight gravity pulls in the final sector of Void Terminus.',
  },
];

export const WEAPON_TYPES = [
  { id: 'laser',    name: 'Laser',      color: '#00ffff', description: 'Standard laser. Fast and accurate.' },
  { id: 'spread',   name: 'Spread',     color: '#ffaa00', description: 'Triple spread shot.' },
  { id: 'rapid',    name: 'Rapid',      color: '#ff00ff', description: 'High fire rate barrage.' },
  { id: 'missile',  name: 'Missile',    color: '#ff4444', description: 'Heavy damage homing missile.' },
  { id: 'plasma',   name: 'Plasma',     color: '#44ff44', description: 'Explosive plasma ball.' },
  { id: 'beam',     name: 'Beam',       color: '#ffff00', description: 'Continuous laser beam.' },
] as const;

export type WeaponId = typeof WEAPON_TYPES[number]['id'];

export const UPGRADES = [
  { id: 'weapon_spread',  name: 'Spread Shot',    cost: 500,  type: 'weapon',   weapon: 'spread',  icon: '🔱' },
  { id: 'weapon_rapid',   name: 'Rapid Fire',     cost: 800,  type: 'weapon',   weapon: 'rapid',   icon: '⚡' },
  { id: 'weapon_missile', name: 'Homing Missile', cost: 1200, type: 'weapon',   weapon: 'missile', icon: '🚀' },
  { id: 'weapon_plasma',  name: 'Plasma Cannon',  cost: 1500, type: 'weapon',   weapon: 'plasma',  icon: '💚' },
  { id: 'weapon_beam',    name: 'Laser Beam',     cost: 2000, type: 'weapon',   weapon: 'beam',    icon: '☀️' },
  { id: 'shield_boost',   name: 'Shield Boost',   cost: 600,  type: 'stat',     stat: 'shield',    icon: '🛡️' },
  { id: 'speed_boost',    name: 'Speed Boost',    cost: 400,  type: 'stat',     stat: 'speed',     icon: '💨' },
  { id: 'hp_boost',       name: 'HP Boost',       cost: 700,  type: 'stat',     stat: 'hp',        icon: '❤️' },
  { id: 'damage_boost',   name: 'Damage Boost',   cost: 900,  type: 'stat',     stat: 'damage',    icon: '💥' },
  { id: 'fire_rate',      name: 'Fire Rate+',     cost: 750,  type: 'stat',     stat: 'firerate',  icon: '🔥' },
] as const;

export const ACHIEVEMENTS = [
  { id: 'first_kill',    name: 'First Blood',       desc: 'Destroy your first enemy',       icon: '🎯' },
  { id: 'combo_5',       name: 'Combo King',         desc: 'Reach a 5x combo',               icon: '⚡' },
  { id: 'boss_1',        name: 'Titan Slayer',       desc: 'Defeat the Inferno Titan',       icon: '🏆' },
  { id: 'boss_2',        name: 'Hydra Hunter',       desc: 'Defeat the Venom Hydra',         icon: '🌟' },
  { id: 'boss_3',        name: 'Cryo Crusher',       desc: 'Defeat the Cryo Leviathan',      icon: '❄️' },
  { id: 'boss_4',        name: 'Solar Conqueror',    desc: 'Defeat the Solar Destroyer',     icon: '☀️' },
  { id: 'boss_5',        name: 'Tempest Cyclone',    desc: 'Defeat the Tempest Cyclone',     icon: '🌪️' },
  { id: 'boss_6',        name: 'Matrix Architect',   desc: 'Defeat the Matrix Architect',    icon: '💾' },
  { id: 'boss_7',        name: 'Singularity',        desc: 'Defeat the Gravity Singularity',  icon: '🕳️' },
  { id: 'score_10k',     name: 'Sharpshooter',       desc: 'Score 10,000 points',            icon: '💫' },
  { id: 'score_50k',     name: 'Space Legend',       desc: 'Score 50,000 points',            icon: '🌌' },
  { id: 'no_damage',     name: 'Untouchable',        desc: 'Complete a wave without damage', icon: '🛡️' },
  { id: 'survivor',      name: 'Survivor',           desc: 'Survive 5 minutes',              icon: '⏱️' },
  { id: 'combo_legend',  name: 'Combo Legend',       desc: 'Reach and hold an 8x combo',     icon: '⚡' },
  { id: 'pacifist',      name: 'Pacifist',           desc: 'Clear a wave without firing',    icon: '☮️' },
  { id: 'speedrun',      name: 'Speedrunner',        desc: 'Defeat a boss in under 45s',     icon: '⏱️' },
  { id: 'gunslinger',    name: 'Gunslinger',         desc: 'Defeat a boss with starter laser',icon: '🤠' },
  { id: 'survivor_10m',  name: 'Elite Survivor',     desc: 'Survive 10 minutes',              icon: '⏳' },
];
