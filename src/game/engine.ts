// ============================================================
// STELLAR ASSAULT — Game Engine (Update Loop)
// ============================================================

import type { GameState, Enemy, Bullet, Particle } from './types';
import {
  createPlayerBullet, createEnemyBullet, buildWave, createBoss, createPowerUp,
  POWERUP_COLORS,
} from './entities';
import {
  rectOverlap, makeExplosionParticles, makeShockwave, makeSmokeParticles,
  makeGlowBurst, makeFloatingText, genId, randomBetween, clamp,
  lerp, distance, angle,
} from './utils';
import {
  CANVAS_WIDTH, CANVAS_HEIGHT, COMBO_WINDOW, COMBO_MULTIPLIER_MAX, PLANETS,
  ACHIEVEMENTS, WeaponId,
} from './constants';
import {
  playShoot, playExplosion, playHit, playPlayerHit, playPowerUp,
  playBossAlert, playVictory, playGameOver, playLevelUp, playCombo, playBombExplosion,
} from './audio';
import { saveData } from './storage';

// ── Helpers ─────────────────────────────────────────────────

function addParticles(state: GameState, newPs: Particle[]) {
  state.particles.push(...newPs);
  // Cap particles for performance
  if (state.particles.length > 300) {
    state.particles.splice(0, state.particles.length - 300);
  }
}

function shake(state: GameState, amount: number) {
  state.screenShake = Math.max(state.screenShake, amount);
}

function checkAchievement(state: GameState, id: string) {
  if (!state.achievementsUnlocked.includes(id)) {
    state.achievementsUnlocked.push(id);
    state.floatingTexts.push(
      makeFloatingText(
        CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60,
        `🏆 ${ACHIEVEMENTS.find(a => a.id === id)?.name ?? id}`, '#ffdd44', 1.2
      )
    );
    saveData({
      highScore: state.highScore,
      levelsCompleted: state.levelsCompleted,
      achievementsUnlocked: state.achievementsUnlocked,
      totalKills: state.totalKills,
    });
  }
}

function addScore(state: GameState, base: number, x: number, y: number) {
  const total = Math.round(base * state.multiplier);
  state.score += total;
  if (state.score > state.highScore) {
    state.highScore = state.score;
  }
  state.floatingTexts.push(
    makeFloatingText(x, y, `+${total.toLocaleString()}`, '#ffff88', state.multiplier > 1 ? 1.2 : 1)
  );
  // Score achievements
  if (state.score >= 10000) checkAchievement(state, 'score_10k');
  if (state.score >= 50000) checkAchievement(state, 'score_50k');
}

function hitCombo(state: GameState) {
  state.combo++;
  state.comboTimer = COMBO_WINDOW;
  const newMult = Math.min(1 + Math.floor(state.combo / 3), COMBO_MULTIPLIER_MAX);
  if (newMult > state.multiplier) {
    state.multiplier = newMult;
    playCombo(newMult);
    state.floatingTexts.push(
      makeFloatingText(
        CANVAS_WIDTH / 2, 100,
        `${newMult}x COMBO!`, '#ffaa00', 1.5
      )
    );
  }
  if (state.combo === 5) checkAchievement(state, 'combo_5');
  if (state.multiplier === 8) checkAchievement(state, 'combo_legend');
}

// ── Player update ──────────────────────────────────────────

function updatePlayer(state: GameState, dt: number) {
  const { player, keys } = state;

  // Manual weapon switching
  const weaponKeys: Record<string, WeaponId> = {
    '1': 'laser',
    '2': 'spread',
    '3': 'rapid',
    '4': 'missile',
    '5': 'plasma',
    '6': 'beam',
  };
  for (const [key, weaponId] of Object.entries(weaponKeys)) {
    if (keys[key]) {
      if (player.weaponsUnlocked.includes(weaponId) && player.weapon !== weaponId) {
        player.weapon = weaponId;
        state.floatingTexts.push(
          makeFloatingText(player.x, player.y - 20, `${weaponId.toUpperCase()} ACTIVE`, '#00ffff', 1.2)
        );
        keys[key] = false;
      }
    }
  }

  // Movement
  let dx = 0, dy = 0;
  if (keys['ArrowLeft'] || keys['a'] || keys['A']) dx -= 1;
  if (keys['ArrowRight'] || keys['d'] || keys['D']) dx += 1;
  if (keys['ArrowUp'] || keys['w'] || keys['W']) dy -= 1;
  if (keys['ArrowDown'] || keys['s'] || keys['S']) dy += 1;

  if (dx !== 0 && dy !== 0) { dx *= 0.707; dy *= 0.707; }
  player.x = clamp(player.x + dx * player.speed, 0, CANVAS_WIDTH - player.width);
  player.y = clamp(player.y + dy * player.speed, 40, CANVAS_HEIGHT - player.height);

  // Planet hazards
  if (state.planetIndex === 4) {
    const windForce = Math.sin(state.sessionTime * 0.001) * 1.5;
    player.x = clamp(player.x + windForce, 0, CANVAS_WIDTH - player.width);
    if (state.frameCount === 10) {
      state.floatingTexts.push(
        makeFloatingText(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, '⚠️ WARNING: EXTREME WIND CONDITIONS', '#88ff00', 1.5)
      );
    }
  } else if (state.planetIndex === 6) {
    const targetX = CANVAS_WIDTH / 2;
    const targetY = 180;
    const px = player.x + player.width / 2;
    const py = player.y + player.height / 2;
    const ang = Math.atan2(targetY - py, targetX - px);
    player.x = clamp(player.x + Math.cos(ang) * 0.8, 0, CANVAS_WIDTH - player.width);
    player.y = clamp(player.y + Math.sin(ang) * 0.8, 40, CANVAS_HEIGHT - player.height);
    if (state.frameCount === 10) {
      state.floatingTexts.push(
        makeFloatingText(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, '⚠️ WARNING: GRAVITY SINGULARITY ACTIVE', '#ffcc00', 1.5)
      );
    }
  }

  // Thruster animation
  player.thrusterAnim = (player.thrusterAnim + dt * 0.01) % (Math.PI * 2);

  // Invincibility timer
  if (player.invincible) {
    player.invincibleTimer -= dt;
    if (player.invincibleTimer <= 0) player.invincible = false;
  }

  // Hit flash
  if (player.hitFlash > 0) player.hitFlash -= dt;

  // Shield regeneration
  if (player.shields < player.maxShields) {
    player.shieldRegenTimer += dt;
    if (player.shieldRegenTimer >= 3000) {
      player.shields = Math.min(player.maxShields, player.shields + 5);
      player.shieldRegenTimer = 0;
    }
  }

  // Fire
  if (player.fireCooldown > 0) {
    player.fireCooldown -= dt;
  }

  const shooting = keys[' '] || keys['z'] || keys['Z'] || keys['Enter'];
  if (shooting && player.fireCooldown <= 0 && (state.phase === 'playing' || state.phase === 'boss')) {
    if (player.weapon === 'beam') {
      // Beam: remove any existing beam bullet first so only ONE line exists at a time
      state.bullets = state.bullets.filter(b => b.weapon !== 'beam');
      state.beamActive = true;
      state.beamTimer = 150;
    }

    const newBullets = createPlayerBullet(player);
    state.bullets.push(...newBullets);
    state.bulletsFiredInWave += newBullets.length;
    playShoot(player.weapon);
    player.fireCooldown = player.baseFireCooldown;

    // Rapid fire has shorter cooldown
    if (player.weapon === 'rapid') player.fireCooldown *= 0.4;
    if (player.weapon === 'beam')  player.fireCooldown *= 0.5; // slow enough for single beam
  } else if (!shooting) {
    if (player.weapon === 'beam') {
      // Remove beam bullet immediately when fire is released
      state.bullets = state.bullets.filter(b => b.weapon !== 'beam');
    }
    state.beamActive = false;
  }
}

// ── Bullet update ──────────────────────────────────────────

function updateBullets(state: GameState, dt: number) {
  const { bullets, enemies, boss, player } = state;
  const toRemove = new Set<string>();
  const toAdd: Bullet[] = [];

  for (const b of bullets) {
    // Homing logic
    if (b.homing && enemies.length > 0) {
      const nearest = enemies.reduce((best, e) => {
        const d = distance({ x: b.x, y: b.y }, { x: e.x + e.width / 2, y: e.y + e.height / 2 });
        return d < distance({ x: b.x, y: b.y }, { x: best.x + best.width / 2, y: best.y + best.height / 2 }) ? e : best;
      });
      const ang = angle({ x: b.x, y: b.y }, { x: nearest.x + nearest.width / 2, y: nearest.y + nearest.height / 2 });
      b.vx = lerp(b.vx, Math.cos(ang) * 8, 0.08);
      b.vy = lerp(b.vy, Math.sin(ang) * 8, 0.08);
    }

    // Lifetime
    if (b.lifetime !== undefined) {
      b.lifetime -= dt;
      if (b.lifetime <= 0) { toRemove.add(b.id); continue; }
    }

    // Trail
    if (b.weapon !== 'beam') {
      b.trail.push({ x: b.x, y: b.y });
      if (b.trail.length > 6) b.trail.shift();
    }

    // Move
    b.x += b.vx;
    b.y += b.vy;

    // Out of bounds
    if (b.y < -40 || b.y > CANVAS_HEIGHT + 40 || b.x < -40 || b.x > CANVAS_WIDTH + 40) {
      toRemove.add(b.id); continue;
    }

    if (b.fromPlayer) {
      // vs enemies
      for (const e of enemies) {
        if (toRemove.has(b.id)) break;
        if (rectOverlap(b.x, b.y, b.width, b.height, e.x, e.y, e.width, e.height)) {
          if (b.weapon !== 'beam') toRemove.add(b.id);
          damageEnemy(state, e, b.damage);
          addParticles(state, makeGlowBurst(b.x, b.y, b.color, 5));
          // Plasma splash
          if (b.weapon === 'plasma') {
            for (const e2 of enemies) {
              if (e2.id !== e.id && distance({ x: b.x, y: b.y }, { x: e2.x + e2.width / 2, y: e2.y + e2.height / 2 }) < 60) {
                damageEnemy(state, e2, b.damage * 0.5);
              }
            }
          }
        }
      }
      // vs boss
      if (boss && boss.alive && !toRemove.has(b.id)) {
        if (rectOverlap(b.x, b.y, b.width, b.height, boss.x, boss.y, boss.width, boss.height)) {
          if (b.weapon !== 'beam') toRemove.add(b.id);
          damageBoss(state, b.damage);
          addParticles(state, makeGlowBurst(b.x, b.y, b.color, 6));
        }
      }
    } else {
      // Enemy bullet vs player
      if (!player.invincible &&
        rectOverlap(b.x, b.y, b.width, b.height, player.x + 6, player.y + 6, player.width - 12, player.height - 12)
      ) {
        toRemove.add(b.id);
        damagePlayer(state, b.damage);
      }
    }
  }

  state.bullets = bullets.filter(b => !toRemove.has(b.id));
  state.bullets.push(...toAdd);
}

// ── Damage ─────────────────────────────────────────────────

function damageEnemy(state: GameState, e: Enemy, dmg: number) {
  e.hp -= dmg;
  e.hitFlash = 150;
  playHit();
  shake(state, 2);

  if (e.hp <= 0) {
    killEnemy(state, e);
  }
}

function killEnemy(state: GameState, e: Enemy) {
  addScore(state, e.value, e.x + e.width / 2, e.y);
  hitCombo(state);
  state.kills++;
  state.totalKills++;

  // Explosion
  addParticles(state, makeExplosionParticles(e.x + e.width / 2, e.y + e.height / 2, 18, e.color, 5));
  addParticles(state, makeSmokeParticles(e.x + e.width / 2, e.y + e.height / 2, 6));
  addParticles(state, [makeShockwave(e.x + e.width / 2, e.y + e.height / 2, e.accentColor)]);
  playExplosion('medium');
  shake(state, 4);

  // Power-up drop
  if (Math.random() < e.dropChance) {
    state.powerUps.push(createPowerUp(e.x + e.width / 2, e.y + e.height / 2, undefined, state.planetIndex));
  }

  // Remove from array (mark for removal)
  state.enemies = state.enemies.filter(en => en.id !== e.id);

  // Achievements
  if (state.totalKills === 1) checkAchievement(state, 'first_kill');
}

function damageBoss(state: GameState, dmg: number) {
  const boss = state.boss!;
  // Shields first
  if (boss.shield > 0) {
    const shieldDmg = Math.min(boss.shield, dmg);
    boss.shield -= shieldDmg;
    dmg -= shieldDmg;
    if (boss.shield <= 0) {
      // Shield break effect
      addParticles(state, makeExplosionParticles(boss.x + boss.width / 2, boss.y + boss.height / 2, 20, '#4488ff', 4));
      shake(state, 8);
    }
  }
  if (dmg <= 0) return;

  boss.hp -= dmg;
  boss.hitFlash = 100;
  playHit();
  shake(state, 3);

  // Phase transition
  const hpPct = boss.hp / boss.maxHp;
  const newPhase = boss.hp <= 0 ? boss.maxPhase
    : Math.floor((1 - hpPct) * boss.maxPhase) + 1;
  if (newPhase > boss.phase) {
    boss.phase = newPhase;
    boss.enraged = boss.phase >= boss.maxPhase - 1;
    boss.shield = boss.maxShield * 0.5; // partial shield reset on phase
    addParticles(state, makeExplosionParticles(boss.x + boss.width / 2, boss.y + boss.height / 2, 30, boss.color, 6));
    addParticles(state, [makeShockwave(boss.x + boss.width / 2, boss.y + boss.height / 2, boss.color)]);
    playBossAlert();
    shake(state, 12);
    state.floatingTexts.push(
      makeFloatingText(CANVAS_WIDTH / 2, 150, `⚠️ PHASE ${newPhase}!`, '#ff4400', 1.8)
    );
  }

  if (boss.hp <= 0) killBoss(state);
}

function killBoss(state: GameState) {
  const boss = state.boss!;
  boss.alive = false;
  boss.deathAnim = 1;
  shake(state, 20);
  playExplosion('large');
  playVictory();
  addScore(state, 5000 + state.planetIndex * 2000, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);

  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      if (!boss) return;
      addParticles(state, makeExplosionParticles(
        boss.x + randomBetween(0, boss.width),
        boss.y + randomBetween(0, boss.height),
        20, boss.color, 6
      ));
      addParticles(state, makeSmokeParticles(boss.x + boss.width / 2, boss.y + boss.height / 2, 10));
      shake(state, 10);
    }, i * 200);
  }

  // Boss kill drops
  for (let i = 0; i < 5; i++) {
    state.powerUps.push(createPowerUp(
      boss.x + randomBetween(0, boss.width),
      boss.y + boss.height,
      undefined,
      state.planetIndex,
    ));
  }

  // Achievement
  checkAchievement(state, `boss_${state.planetIndex + 1}`);
  if (state.sessionTime - state.bossSpawnTime < 45000) {
    checkAchievement(state, 'speedrun');
  }
  if (state.player.weapon === 'laser' && state.player.weaponLevels.laser === 1) {
    checkAchievement(state, 'gunslinger');
  }

  // Currency reward
  state.currency += 1000 + state.planetIndex * 500;

  setTimeout(() => {
    if (state.planetIndex >= PLANETS.length - 1) {
      state.phase = 'victory';
    } else {
      state.levelsCompleted.push(state.planetIndex);
      state.phase = 'levelComplete';
    }
    saveData({
      highScore: state.highScore,
      levelsCompleted: [...new Set(state.levelsCompleted)],
      achievementsUnlocked: state.achievementsUnlocked,
      totalKills: state.totalKills,
    });
  }, 2500);
}

function damagePlayer(state: GameState, dmg: number) {
  const { player } = state;
  if (player.invincible) return;

  let remaining = dmg;
  state.noDamagWave = false;

  // Shields absorb first
  if (player.shields > 0) {
    const absorbed = Math.min(player.shields, remaining);
    player.shields -= absorbed;
    remaining -= absorbed;
    player.shieldRegenTimer = 0;
  }

  if (remaining > 0) {
    player.hp -= remaining;
    player.hitFlash = 300;
    player.invincible = true;
    player.invincibleTimer = 1500;
    playPlayerHit();
    shake(state, 8);

    addParticles(state, makeExplosionParticles(
      player.x + player.width / 2, player.y + player.height / 2, 10, '#ff4444', 3
    ));

    // Combo reset on damage
    state.combo = 0;
    state.multiplier = 1;
    state.comboTimer = 0;
  } else {
    shake(state, 4);
  }

  if (player.hp <= 0) {
    player.hp = 0;
    player.lives--;
    if (player.lives <= 0) {
      triggerGameOver(state);
    } else {
      // Respawn
      player.hp = player.maxHp * 0.5;
      player.shields = player.maxShields;
      player.invincible = true;
      player.invincibleTimer = 3000;
      playExplosion('medium');
    }
  }
}

function triggerGameOver(state: GameState) {
  playGameOver();
  shake(state, 15);
  addParticles(state, makeExplosionParticles(
    state.player.x + state.player.width / 2,
    state.player.y + state.player.height / 2,
    40, '#ff4444', 7
  ));
  addParticles(state, [makeShockwave(
    state.player.x + state.player.width / 2,
    state.player.y + state.player.height / 2, '#ff0000'
  )]);
  saveData({
    highScore: state.highScore,
    levelsCompleted: [...new Set(state.levelsCompleted)],
    achievementsUnlocked: state.achievementsUnlocked,
    totalKills: state.totalKills,
  });
  setTimeout(() => { state.phase = 'gameOver'; }, 1500);
}

// ── Enemy update ───────────────────────────────────────────

function updateEnemies(state: GameState, dt: number) {
  const { enemies, player } = state;
  const toRemove = new Set<string>();

  for (const e of enemies) {
    if (e.hitFlash > 0) e.hitFlash -= dt;
    e.patternTimer += dt;
    e.phase += e.speed * (dt / 16);

    // Entry: slide in from top
    if (!e.entryDone) {
      e.y += e.speed * 1.5;
      if (e.y >= 60 + (e.startY < -100 ? 0 : 30)) {
        e.entryDone = true;
        e.y = Math.max(60, e.y);
      }
      continue;
    }

    // Movement patterns
    switch (e.pattern) {
      case 'straight':
        e.y += e.speed * 0.4;
        break;
      case 'sine':
        e.x = e.startX + Math.sin(e.phase * e.frequency) * e.amplitude;
        e.y += e.speed * 0.3;
        break;
      case 'zigzag':
        e.angle += e.speed * 0.05;
        e.x = e.startX + Math.sin(e.angle) * e.amplitude;
        e.y += e.speed * 0.25;
        break;
      case 'dive':
        // Kamikaze — dive toward player
        {
          const ang = angle({ x: e.x, y: e.y }, { x: player.x + player.width / 2, y: player.y });
          e.x += Math.cos(ang) * e.speed;
          e.y += Math.sin(ang) * e.speed;
        }
        break;
      case 'formation':
        // Hold position, small drift
        e.x = e.startX + Math.sin(e.phase * 0.02) * 10;
        e.y += e.speed * 0.15;
        break;
      case 'circle':
        e.angle += 0.02;
        e.x = e.startX + Math.cos(e.angle) * e.amplitude;
        e.y = 120 + Math.sin(e.angle) * 40;
        break;
      default:
        e.y += e.speed * 0.3;
    }

    // Shoot
    e.shootTimer += dt;
    if (e.shootTimer >= e.shootInterval) {
      e.shootTimer = 0;
      if (e.type !== 'kamikaze') {
        const bullet = createEnemyBullet(
          e.x + e.width / 2,
          e.y + e.height,
          player.x + player.width / 2,
          player.y,
          4 + state.planetIndex * 0.5,
          8 + state.planetIndex * 2,
          'enemy',
        );
        state.bullets.push(bullet);
      }
    }

    // Off screen — lose a life (except for barriers)
    if (e.y > CANVAS_HEIGHT + 20) {
      toRemove.add(e.id);
      if (e.type !== 'barrier') {
        damagePlayer(state, 15);
      }
    }

    // Collision with player
    if (!player.invincible &&
      rectOverlap(e.x + 4, e.y + 4, e.width - 8, e.height - 8,
        player.x + 6, player.y + 6, player.width - 12, player.height - 12)
    ) {
      toRemove.add(e.id);
      let dmg = 20;
      if (e.type === 'kamikaze') dmg = 30;
      else if (e.type === 'barrier') dmg = 25;
      damagePlayer(state, dmg);
      addParticles(state, makeExplosionParticles(e.x + e.width / 2, e.y + e.height / 2, 12, e.color, 4));
      playExplosion('medium');
    }
  }

  state.enemies = enemies.filter(e => !toRemove.has(e.id));
}

// ── Boss update ────────────────────────────────────────────

function updateBoss(state: GameState, dt: number) {
  const boss = state.boss;
  if (!boss || !boss.alive) return;

  if (boss.hitFlash > 0) boss.hitFlash -= dt;

  // Entry animation
  if (boss.entryAnim > 0) {
    boss.y = lerp(boss.y, boss.targetY, Math.min(1, dt * 0.002));
    if (Math.abs(boss.y - boss.targetY) < 2) {
      boss.y = boss.targetY;
      boss.entryAnim = 0;
    }
    return;
  }

  boss.orbitAngle += 0.008 * (boss.enraged ? 1.8 : 1);
  boss.moveTimer += dt;
  boss.shootTimer += dt;
  boss.attackTimer += dt;
  boss.weakPointTimer += dt;

  // Boss movement — orbit + drift
  const centerX = CANVAS_WIDTH / 2 - boss.width / 2;
  const orbitRadius = 150 + Math.sin(boss.orbitAngle * 0.5) * 80;
  boss.targetX = centerX + Math.cos(boss.orbitAngle) * orbitRadius;
  boss.targetY = 60 + Math.sin(boss.orbitAngle * 0.7) * 50;
  boss.targetX = clamp(boss.targetX, 20, CANVAS_WIDTH - boss.width - 20);
  boss.targetY = clamp(boss.targetY, 20, 220);

  boss.x = lerp(boss.x, boss.targetX, Math.min(1, dt * 0.0012 * (boss.enraged ? 1.5 : 1)));
  boss.y = lerp(boss.y, boss.targetY, Math.min(1, dt * 0.0012 * (boss.enraged ? 1.5 : 1)));

  // Weak point cycle
  if (boss.weakPointTimer >= 4000) {
    boss.weakPointActive = !boss.weakPointActive;
    boss.weakPointTimer = 0;
  }

  // Shield regeneration during boss
  if (boss.shield < boss.maxShield * 0.3 && boss.weakPointTimer < 500) {
    boss.shield = Math.min(boss.maxShield, boss.shield + 0.5);
  }

  // Attack patterns
  const interval = Math.max(400, 1200 - boss.phase * 150) * (boss.enraged ? 0.6 : 1);
  if (boss.shootTimer >= interval) {
    boss.shootTimer = 0;
    boss.attackPattern = (boss.attackPattern + 1) % 4;

    const { player } = state;
    const bx = boss.x + boss.width / 2;
    const by = boss.y + boss.height;
    const px = player.x + player.width / 2;
    const py = player.y;

    switch (boss.attackPattern % (boss.phase + 1)) {
      case 0: // Aimed shot
        state.bullets.push(createEnemyBullet(bx, by, px, py, 6 + boss.phase, 15 + boss.phase * 5, 'boss'));
        break;
      case 1: // Fan spread
        for (let i = -2; i <= 2; i++) {
          const a = angle({ x: bx, y: by }, { x: px, y: py }) + (i * 0.25);
          state.bullets.push({
            id: genId(), x: bx, y: by,
            vx: Math.cos(a) * 5, vy: Math.sin(a) * 5,
            width: 7, height: 7, damage: 12,
            fromPlayer: false, weapon: 'boss', color: '#ff2200', trail: [],
          });
        }
        break;
      case 2: // Ring burst
        if (boss.phase >= 2) {
          for (let i = 0; i < 8; i++) {
            const a = (i / 8) * Math.PI * 2;
            state.bullets.push({
              id: genId(), x: bx, y: by,
              vx: Math.cos(a) * 4, vy: Math.sin(a) * 4,
              width: 6, height: 6, damage: 10,
              fromPlayer: false, weapon: 'boss', color: '#ff6600', trail: [],
            });
          }
        }
        break;
      case 3: // Targeted barrage
        if (boss.phase >= 3) {
          for (let i = 0; i < 3; i++) {
            setTimeout(() => {
              if (!state.boss?.alive) return;
              const b = createEnemyBullet(bx, by, px + randomBetween(-30, 30), py + randomBetween(-20, 20), 7, 18, 'boss');
              state.bullets.push(b);
            }, i * 200);
          }
        }
        break;
    }

    // Enraged bonus attack
    if (boss.enraged && Math.random() < 0.4) {
      state.bullets.push(createEnemyBullet(bx, by, px, py, 9, 20, 'boss'));
    }
  }

  // Boss smoke when low HP
  if (boss.hp / boss.maxHp < 0.3 && Math.random() < 0.1) {
    addParticles(state, makeSmokeParticles(
      boss.x + randomBetween(0, boss.width),
      boss.y + randomBetween(0, boss.height), 2
    ));
  }
}

// ── Power-up update ────────────────────────────────────────

function updatePowerUps(state: GameState, dt: number) {
  const { powerUps, player } = state;
  const toRemove = new Set<string>();

  for (const p of powerUps) {
    p.y += p.vy;
    p.anim += dt * 0.003;
    p.lifetime -= dt;

    if (p.lifetime <= 0 || p.y > CANVAS_HEIGHT + 20) {
      toRemove.add(p.id); continue;
    }

    // Collect
    if (rectOverlap(p.x, p.y, 24, 24, player.x + 4, player.y + 4, player.width - 8, player.height - 8)) {
      toRemove.add(p.id);
      applyPowerUp(state, p.type);
      playPowerUp(p.type.startsWith('weapon') ? 'weapon' : p.type);
      addParticles(state, makeGlowBurst(p.x + 12, p.y + 12, POWERUP_COLORS[p.type], 12));
      state.floatingTexts.push(
        makeFloatingText(p.x, p.y, p.type.toUpperCase().replace('_', ' '), POWERUP_COLORS[p.type], 1.3)
      );
    }
  }

  state.powerUps = powerUps.filter(p => !toRemove.has(p.id));
}

function applyPowerUp(state: GameState, type: string) {
  const { player } = state;
  switch (type) {
    case 'health':
      player.hp = Math.min(player.maxHp, player.hp + 30);
      break;
    case 'shield':
      player.shields = Math.min(player.maxShields, player.shields + player.maxShields);
      break;
    case 'speed':
      // Temp speed boost
      player.speed = Math.min(player.speed + 1, 10);
      setTimeout(() => { player.speed = Math.max(player.speed - 1, 4); }, 6000);
      break;
    case 'weapon_spread':
    case 'weapon_rapid':
    case 'weapon_missile':
    case 'weapon_plasma':
    case 'weapon_beam': {
      const wId = type.replace('weapon_', '') as WeaponId;
      // Only apply if the player has already unlocked this weapon via level progression
      if (!player.weaponsUnlocked.includes(wId)) {
        // Upgrade current weapon instead
        const cur = player.weapon;
        player.weaponLevels[cur] = Math.min(3, (player.weaponLevels[cur] ?? 1) + 1);
        state.floatingTexts.push(
          makeFloatingText(player.x, player.y - 30, `${cur.toUpperCase()} LEVEL ${player.weaponLevels[cur]}!`, '#ffff00', 1.4)
        );
        break;
      }
      // Weapon already unlocked — upgrade its level
      player.weaponLevels[wId] = Math.min(3, (player.weaponLevels[wId] ?? 1) + 1);
      // Auto-equip if it's the same weapon currently active
      if (player.weapon === wId) {
        state.floatingTexts.push(
          makeFloatingText(player.x, player.y - 30, `${wId.toUpperCase()} LEVEL ${player.weaponLevels[wId]}!`, '#ffff00', 1.4)
        );
      } else {
        state.floatingTexts.push(
          makeFloatingText(player.x, player.y - 30, `${wId.toUpperCase()} LVL ${player.weaponLevels[wId]} UPGRADED`, '#00ffaa', 1.2)
        );
      }
      break;
    }
    case 'damage':
      player.damage = Math.min(player.damage + 5, 50);
      break;
    case 'score':
      addScore(state, 2000, player.x + player.width / 2, player.y);
      state.multiplier = Math.min(state.multiplier + 1, COMBO_MULTIPLIER_MAX);
      break;
    case 'bomb':
      // Screen-clear bomb
      triggerBomb(state);
      break;
  }
  state.currency += 50;
}

function triggerBomb(state: GameState) {
  state.bombActive = true;
  state.bombTimer = 600;
  playBombExplosion();
  shake(state, 20);

  // Kill all enemies
  for (const e of state.enemies) {
    addScore(state, e.value, e.x + e.width / 2, e.y);
    addParticles(state, makeExplosionParticles(e.x + e.width / 2, e.y + e.height / 2, 12, e.color, 4));
  }
  state.enemies = [];

  // Damage boss
  if (state.boss?.alive) {
    damageBoss(state, 200);
  }

  addParticles(state, [makeShockwave(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, '#ff00ff')]);
  state.floatingTexts.push(makeFloatingText(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, '💣 BOMB!', '#ff00ff', 2));
}

// ── Particles & UI update ──────────────────────────────────

function updateParticles(state: GameState, dt: number) {
  state.particles = state.particles.filter(p => p.life > 0);
  for (const p of state.particles) {
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.96;
    p.vy *= 0.96;
    p.life -= dt;
    p.alpha = (p.life / p.maxLife);
    if (p.rotSpeed && p.rotation !== undefined) p.rotation += p.rotSpeed;
    if (p.type === 'shockwave') p.size += 3;
  }
}

function updateFloatingTexts(state: GameState, dt: number) {
  state.floatingTexts = state.floatingTexts.filter(f => f.life > 0);
  for (const f of state.floatingTexts) {
    f.y += f.vy;
    f.life -= dt;
    f.vy *= 0.98;
  }
}

function updateStars(state: GameState, dt: number) {
  for (const s of state.stars) {
    s.y += s.speed;
    s.twinkle += dt * 0.003;
    if (s.y > CANVAS_HEIGHT + 2) {
      s.y = -2;
      s.x = Math.random() * CANVAS_WIDTH;
    }
  }
}

// ── Wave management ────────────────────────────────────────

function checkWaveComplete(state: GameState) {
  if (state.enemies.length > 0 || state.phase !== 'playing') return;

  const planet = PLANETS[state.planetIndex];

  if (state.wave >= planet.wavesBeforeBoss) {
    // Trigger boss
    if (!state.boss) {
      state.phase = 'bossWarning';
      state.bossWarningTimer = 3000;
      state.bullets = state.bullets.filter(b => b.fromPlayer);
      playBossAlert();
    }
  } else {
    // Wave complete
    if (state.noDamagWave) checkAchievement(state, 'no_damage');
    if (state.bulletsFiredInWave === 0) checkAchievement(state, 'pacifist');
    state.noDamagWave = true;

    const waveBonus = 200 * (state.wave + 1) * state.multiplier;
    addScore(state, waveBonus, CANVAS_WIDTH / 2, 200);
    state.currency += 100 + state.wave * 25;
    state.floatingTexts.push(
      makeFloatingText(CANVAS_WIDTH / 2, 180, `WAVE ${state.wave + 1} CLEAR!`, '#00ffaa', 1.5)
    );
    playLevelUp();

    state.phase = 'waveComplete';
    state.waveTimer = 2000;
  }
}

// ── Master update ──────────────────────────────────────────

export function updateGame(state: GameState, dt: number) {
  // Safety cap dt (tab switch, etc.)
  dt = Math.min(dt, 50);

  // Cheat codes for gameplay demonstration recording
  if (state.keys['k'] || state.keys['K']) {
    state.enemies = [];
    if (state.boss && state.boss.alive) {
      damageBoss(state, 150);
    }
    state.keys['k'] = false;
    state.keys['K'] = false;
  }
  if (state.keys['i'] || state.keys['I']) {
    state.player.hp = state.player.maxHp = 100;
    state.player.shields = state.player.maxShields = 50;
    state.player.invincible = true;
    state.player.invincibleTimer = 99999999;
    state.floatingTexts.push(makeFloatingText(state.player.x, state.player.y - 20, "GOD MODE", "#ff00ff", 1.5));
    state.keys['i'] = false;
    state.keys['I'] = false;
  }
  if (state.keys['u'] || state.keys['U']) {
    state.player.weaponLevels[state.player.weapon] = 3;
    state.player.damage = 100;
    state.player.baseFireCooldown = 50;
    state.floatingTexts.push(makeFloatingText(state.player.x, state.player.y - 20, "MAX WEAPONS", "#ffff00", 1.5));
    state.keys['u'] = false;
    state.keys['U'] = false;
  }

  state.sessionTime += dt;
  state.frameCount++;

  // Screen shake decay
  if (state.screenShake > 0) state.screenShake = Math.max(0, state.screenShake - dt * 0.1);

  // Combo timer
  if (state.comboTimer > 0) {
    state.comboTimer -= dt;
    if (state.comboTimer <= 0) {
      state.combo = 0;
      state.multiplier = 1;
    }
  }

  // Bomb timer
  if (state.bombActive) {
    state.bombTimer -= dt;
    if (state.bombTimer <= 0) state.bombActive = false;
  }

  if (state.beamTimer > 0) state.beamTimer -= dt;

  // Survival achievement
  if (state.sessionTime >= 300000) checkAchievement(state, 'survivor');
  if (state.sessionTime >= 600000) checkAchievement(state, 'survivor_10m');

  updateStars(state, dt);
  updateParticles(state, dt);
  updateFloatingTexts(state, dt);

  if (state.phase === 'playing') {
    updatePlayer(state, dt);
    updateBullets(state, dt);
    updateEnemies(state, dt);
    checkWaveComplete(state);
  }

  if (state.phase === 'boss') {
    updatePlayer(state, dt);
    updateBullets(state, dt);
    updateBoss(state, dt);
    updatePowerUps(state, dt);
  }

  if (state.phase === 'playing') {
    updatePowerUps(state, dt);
  }

  // Wave transitions
  if (state.phase === 'waveComplete') {
    state.waveTimer -= dt;
    if (state.waveTimer <= 0) {
      state.wave++;
      state.bulletsFiredInWave = 0;
      const planet = PLANETS[state.planetIndex];
      state.enemies = buildWave(state.wave, state.planetIndex, planet.enemySpeedMult);
      state.phase = 'playing';
      state.noDamagWave = true;
    }
  }

  if (state.phase === 'bossWarning') {
    state.bossWarningTimer -= dt;
    if (state.bossWarningTimer <= 0) {
      state.boss = createBoss(state.planetIndex);
      state.bossSpawnTime = state.sessionTime;
      state.phase = 'boss';
    }
  }
}
