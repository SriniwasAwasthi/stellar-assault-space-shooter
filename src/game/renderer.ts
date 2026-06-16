// ============================================================
// STELLAR ASSAULT — Canvas Renderer
// ============================================================

import type { GameState, Enemy, Boss, PowerUp } from './types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, PLANETS } from './constants';
import { POWERUP_COLORS, POWERUP_ICONS } from './entities';
import { drawRoundRect, hexAlpha, hexToRgb } from './utils';

// ── Background ─────────────────────────────────────────────

export function renderBackground(ctx: CanvasRenderingContext2D, state: GameState) {
  const planet = PLANETS[state.planetIndex];

  // Sky fill
  ctx.fillStyle = planet.bgColor;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Nebula glow
  const ng = ctx.createRadialGradient(
    CANVAS_WIDTH * 0.4, CANVAS_HEIGHT * 0.35, 0,
    CANVAS_WIDTH * 0.4, CANVAS_HEIGHT * 0.35, 320,
  );
  ng.addColorStop(0, hexAlpha(planet.nebula, 0.4));
  ng.addColorStop(1, hexAlpha(planet.nebula, 0));
  ctx.fillStyle = ng;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  const ng2 = ctx.createRadialGradient(
    CANVAS_WIDTH * 0.75, CANVAS_HEIGHT * 0.6, 0,
    CANVAS_WIDTH * 0.75, CANVAS_HEIGHT * 0.6, 200,
  );
  ng2.addColorStop(0, hexAlpha(planet.accentColor, 0.06));
  ng2.addColorStop(1, hexAlpha(planet.accentColor, 0));
  ctx.fillStyle = ng2;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Background planet (decorative)
  const planetIdx = state.planetIndex;
  const planetConfigs = [
    { x: CANVAS_WIDTH * 0.85, y: CANVAS_HEIGHT * 0.15, r: 70, color: '#5c2400', glow: '#ff6600' },
    { x: CANVAS_WIDTH * 0.12, y: CANVAS_HEIGHT * 0.18, r: 55, color: '#0a2e10', glow: '#00ff66' },
    { x: CANVAS_WIDTH * 0.80, y: CANVAS_HEIGHT * 0.12, r: 65, color: '#001a2e', glow: '#00aaff' },
    { x: CANVAS_WIDTH * 0.15, y: CANVAS_HEIGHT * 0.15, r: 80, color: '#2e0a00', glow: '#ff4400' },
  ];
  const pc = planetConfigs[planetIdx];
  if (pc) {
    ctx.save();
    ctx.globalAlpha = 0.35;
    const pg = ctx.createRadialGradient(pc.x - pc.r * 0.3, pc.y - pc.r * 0.3, 0, pc.x, pc.y, pc.r);
    pg.addColorStop(0, hexAlpha(pc.glow, 0.6));
    pg.addColorStop(0.4, pc.color);
    pg.addColorStop(1, '#000008');
    ctx.fillStyle = pg;
    ctx.beginPath();
    ctx.arc(pc.x, pc.y, pc.r, 0, Math.PI * 2);
    ctx.fill();
    // Ring
    ctx.globalAlpha = 0.12;
    ctx.strokeStyle = pc.glow;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.ellipse(pc.x, pc.y, pc.r * 1.6, pc.r * 0.35, -0.3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // Subtle grid lines
  ctx.save();
  ctx.globalAlpha = 0.025;
  ctx.strokeStyle = planet.accentColor;
  ctx.lineWidth = 1;
  for (let x = 0; x < CANVAS_WIDTH; x += 40) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_HEIGHT); ctx.stroke();
  }
  for (let y = 0; y < CANVAS_HEIGHT; y += 40) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS_WIDTH, y); ctx.stroke();
  }
  ctx.restore();
}

// ── Stars ──────────────────────────────────────────────────

export function renderStars(ctx: CanvasRenderingContext2D, state: GameState) {
  for (const s of state.stars) {
    const tw = 0.6 + 0.4 * Math.sin(s.twinkle);
    ctx.globalAlpha = s.alpha * tw;
    ctx.fillStyle = s.color;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// ── Player ─────────────────────────────────────────────────

export function renderPlayer(ctx: CanvasRenderingContext2D, state: GameState) {
  const { player } = state;
  const cx = player.x + player.width / 2;
  const cy = player.y + player.height / 2;

  if (player.invincible && Math.floor(Date.now() / 80) % 2 === 0) return;

  ctx.save();
  ctx.translate(cx, cy);

  // Shield visual
  if (player.shields > 0) {
    const shieldAlpha = 0.15 + (player.shields / player.maxShields) * 0.3;
    ctx.beginPath();
    ctx.arc(0, 0, player.width * 0.85, 0, Math.PI * 2);
    ctx.strokeStyle = hexAlpha('#4488ff', shieldAlpha * 2);
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = hexAlpha('#4488ff', shieldAlpha);
    ctx.fill();
  }

  // Thruster glow
  const thrusterFlicker = 0.6 + 0.4 * Math.sin(player.thrusterAnim * 8);
  const tg = ctx.createRadialGradient(0, player.height * 0.5, 0, 0, player.height * 0.5, 20 * thrusterFlicker);
  tg.addColorStop(0, 'rgba(0,200,255,0.9)');
  tg.addColorStop(0.5, 'rgba(100,50,255,0.5)');
  tg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = tg;
  ctx.beginPath();
  ctx.ellipse(0, player.height * 0.5, 10, 20 * thrusterFlicker, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hit flash overlay
  if (player.hitFlash > 0) {
    ctx.globalAlpha = Math.min(1, player.hitFlash / 150);
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.ellipse(0, 0, player.width / 2 + 4, player.height / 2 + 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // ─ Draw ship body ─────────────────────
  // Main hull
  ctx.beginPath();
  ctx.moveTo(0, -player.height / 2);         // nose
  ctx.lineTo(-player.width * 0.18, 0);        // left mid
  ctx.lineTo(-player.width * 0.45, player.height * 0.35); // left wing tip
  ctx.lineTo(-player.width * 0.28, player.height * 0.45); // left engine
  ctx.lineTo(0, player.height * 0.3);          // center back
  ctx.lineTo(player.width * 0.28, player.height * 0.45);  // right engine
  ctx.lineTo(player.width * 0.45, player.height * 0.35);  // right wing tip
  ctx.lineTo(player.width * 0.18, 0);          // right mid
  ctx.closePath();

  const shipGrad = ctx.createLinearGradient(0, -player.height / 2, 0, player.height / 2);
  shipGrad.addColorStop(0, '#4488ff');
  shipGrad.addColorStop(0.4, '#2244aa');
  shipGrad.addColorStop(1, '#112266');
  ctx.fillStyle = shipGrad;
  ctx.fill();
  ctx.strokeStyle = '#66aaff';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Cockpit
  ctx.beginPath();
  ctx.ellipse(0, -player.height * 0.1, 6, 10, 0, 0, Math.PI * 2);
  const cg = ctx.createRadialGradient(0, -player.height * 0.1, 0, 0, -player.height * 0.1, 10);
  cg.addColorStop(0, '#aaffff');
  cg.addColorStop(1, '#224488');
  ctx.fillStyle = cg;
  ctx.fill();

  // Engine glow dots
  [[-player.width * 0.28, player.height * 0.42], [player.width * 0.28, player.height * 0.42]].forEach(([ex, ey]) => {
    const eg = ctx.createRadialGradient(ex, ey, 0, ex, ey, 8 * thrusterFlicker);
    eg.addColorStop(0, 'rgba(100,200,255,1)');
    eg.addColorStop(1, 'rgba(50,100,255,0)');
    ctx.fillStyle = eg;
    ctx.beginPath();
    ctx.arc(ex, ey, 8 * thrusterFlicker, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}

// ── Bullets ────────────────────────────────────────────────

export function renderBullets(ctx: CanvasRenderingContext2D, state: GameState) {
  for (const b of state.bullets) {
    ctx.save();

    if (b.weapon === 'beam') {
      const beamX = b.x;
      const beamY = 0;
      const beamW = b.width;
      const beamH = b.height; // b.height = player.y (distance from top to ship)

      // Outer soft glow (wide, transparent)
      const outerGlow = ctx.createLinearGradient(beamX - beamW * 2, 0, beamX + beamW * 3, 0);
      outerGlow.addColorStop(0,   'rgba(255,220,0,0)');
      outerGlow.addColorStop(0.3, 'rgba(255,220,0,0.12)');
      outerGlow.addColorStop(0.5, 'rgba(255,255,80,0.25)');
      outerGlow.addColorStop(0.7, 'rgba(255,220,0,0.12)');
      outerGlow.addColorStop(1,   'rgba(255,220,0,0)');
      ctx.fillStyle = outerGlow;
      ctx.fillRect(beamX - beamW * 2, beamY, beamW * 5, beamH);

      // Core beam — vertical gradient: bright at ship end, fades at top
      const coreFade = ctx.createLinearGradient(0, beamY, 0, beamY + beamH);
      coreFade.addColorStop(0,   'rgba(255,255,255,0.05)');
      coreFade.addColorStop(0.6, 'rgba(255,255,100,0.7)');
      coreFade.addColorStop(1,   'rgba(255,255,0,0.95)');

      // Horizontal gradient to taper the beam horizontally
      const coreHoriz = ctx.createLinearGradient(beamX, 0, beamX + beamW, 0);
      coreHoriz.addColorStop(0,   'rgba(255,255,0,0)');
      coreHoriz.addColorStop(0.3, 'rgba(255,255,120,0.95)');
      coreHoriz.addColorStop(0.5, 'rgba(255,255,255,1)');
      coreHoriz.addColorStop(0.7, 'rgba(255,255,120,0.95)');
      coreHoriz.addColorStop(1,   'rgba(255,255,0,0)');
      ctx.fillStyle = coreHoriz;
      ctx.shadowColor = '#ffff00';
      ctx.shadowBlur = 18;
      ctx.fillRect(beamX, beamY, beamW, beamH);
      ctx.shadowBlur = 0;

      // Bright center spine
      ctx.fillStyle = coreFade;
      ctx.fillRect(beamX + beamW * 0.3, beamY, beamW * 0.4, beamH);

      ctx.restore();
      continue;
    }

    // Trail
    if (b.trail.length > 1) {
      for (let i = 0; i < b.trail.length - 1; i++) {
        const a = i / b.trail.length;
        ctx.globalAlpha = a * 0.5;
        ctx.strokeStyle = b.color;
        ctx.lineWidth = Math.max(1, (b.width / 2) * a);
        ctx.beginPath();
        ctx.moveTo(b.trail[i].x + b.width / 2, b.trail[i].y + b.height / 2);
        ctx.lineTo(b.trail[i + 1].x + b.width / 2, b.trail[i + 1].y + b.height / 2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    // Bullet body
    if (b.weapon === 'plasma') {
      // Plasma orb
      const pg = ctx.createRadialGradient(b.x + b.width / 2, b.y + b.height / 2, 0, b.x + b.width / 2, b.y + b.height / 2, b.width);
      pg.addColorStop(0, '#ffffff');
      pg.addColorStop(0.3, b.color);
      pg.addColorStop(1, hexAlpha(b.color, 0));
      ctx.fillStyle = pg;
      ctx.beginPath();
      ctx.arc(b.x + b.width / 2, b.y + b.height / 2, b.width, 0, Math.PI * 2);
      ctx.fill();
    } else if (b.weapon === 'missile') {
      // Missile body
      ctx.fillStyle = '#ff4444';
      drawRoundRect(ctx, b.x, b.y, b.width, b.height, 3);
      ctx.fill();
      ctx.fillStyle = '#ffaaaa';
      ctx.fillRect(b.x + 2, b.y, b.width - 4, 6);
    } else {
      // Standard bullet
      const grd = ctx.createLinearGradient(b.x, b.y, b.x, b.y + b.height);
      grd.addColorStop(0, '#ffffff');
      grd.addColorStop(0.2, b.color);
      grd.addColorStop(1, hexAlpha(b.color, 0.2));
      ctx.fillStyle = grd;
      drawRoundRect(ctx, b.x, b.y, b.width, b.height, b.width / 2);
      ctx.fill();

      // Glow
      ctx.shadowColor = b.color;
      ctx.shadowBlur = 8;
      ctx.fillStyle = b.color;
      drawRoundRect(ctx, b.x + 1, b.y + 2, b.width - 2, b.height * 0.5, b.width / 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    ctx.restore();
  }
}

// ── Enemies ────────────────────────────────────────────────

export function renderEnemies(ctx: CanvasRenderingContext2D, state: GameState) {
  for (const e of state.enemies) {
    renderEnemy(ctx, e);
  }
}

function renderEnemy(ctx: CanvasRenderingContext2D, e: Enemy) {
  ctx.save();
  const cx = e.x + e.width / 2;
  const cy = e.y + e.height / 2;
  ctx.translate(cx, cy);

  // Hit flash
  if (e.hitFlash > 0) {
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 15;
  }

  const hw = e.width / 2;
  const hh = e.height / 2;

  switch (e.type) {
    case 'grunt':
      drawGrunt(ctx, hw, hh, e.color, e.accentColor);
      break;
    case 'shooter':
      drawShooter(ctx, hw, hh, e.color, e.accentColor);
      break;
    case 'tank':
      drawTank(ctx, hw, hh, e.color, e.accentColor);
      break;
    case 'zigzag':
      drawZigzag(ctx, hw, hh, e.color, e.accentColor);
      break;
    case 'kamikaze':
      drawKamikaze(ctx, hw, hh, e.color, e.accentColor);
      break;
    case 'sniper':
      drawSniper(ctx, hw, hh, e.color, e.accentColor);
      break;
    case 'bomber':
      drawBomber(ctx, hw, hh, e.color, e.accentColor);
      break;
    case 'barrier':
      drawBarrier(ctx, hw, hh, e.color, e.accentColor);
      break;
    default:
      drawGrunt(ctx, hw, hh, e.color, e.accentColor);
  }

  ctx.shadowBlur = 0;

  // Health bar
  if (e.hp < e.maxHp) {
    const bw = e.width;
    const bh = 4;
    const pct = e.hp / e.maxHp;
    ctx.fillStyle = '#222';
    drawRoundRect(ctx, -hw, hh + 4, bw, bh, 2);
    ctx.fill();
    ctx.fillStyle = pct > 0.5 ? '#44ff44' : pct > 0.25 ? '#ffaa00' : '#ff4444';
    drawRoundRect(ctx, -hw, hh + 4, bw * pct, bh, 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawGrunt(ctx: CanvasRenderingContext2D, hw: number, hh: number, color: string, accent: string) {
  // Body
  ctx.beginPath();
  ctx.moveTo(0, -hh);
  ctx.lineTo(-hw * 0.8, hh * 0.3);
  ctx.lineTo(-hw * 0.4, hh);
  ctx.lineTo(hw * 0.4, hh);
  ctx.lineTo(hw * 0.8, hh * 0.3);
  ctx.closePath();
  const g = ctx.createLinearGradient(0, -hh, 0, hh);
  g.addColorStop(0, accent);
  g.addColorStop(1, color);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 1;
  ctx.stroke();
  // Eye
  ctx.fillStyle = '#ffeecc';
  ctx.beginPath();
  ctx.arc(0, 0, 5, 0, Math.PI * 2);
  ctx.fill();
}

function drawShooter(ctx: CanvasRenderingContext2D, hw: number, hh: number, color: string, accent: string) {
  ctx.beginPath();
  ctx.moveTo(0, -hh);
  ctx.lineTo(-hw, hh * 0.2);
  ctx.lineTo(-hw * 0.5, hh);
  ctx.lineTo(hw * 0.5, hh);
  ctx.lineTo(hw, hh * 0.2);
  ctx.closePath();
  const g = ctx.createLinearGradient(-hw, 0, hw, 0);
  g.addColorStop(0, color);
  g.addColorStop(0.5, accent);
  g.addColorStop(1, color);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // Cannons
  ctx.fillStyle = accent;
  [[-hw * 0.6, hh * 0.4], [hw * 0.6, hh * 0.4]].forEach(([x, y]) => {
    ctx.fillRect(x - 3, y, 6, 12);
  });
}

function drawTank(ctx: CanvasRenderingContext2D, hw: number, hh: number, color: string, accent: string) {
  // Hexagonal tank
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 - Math.PI / 6;
    i === 0 ? ctx.moveTo(Math.cos(a) * hw, Math.sin(a) * hh) : ctx.lineTo(Math.cos(a) * hw, Math.sin(a) * hh);
  }
  ctx.closePath();
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, hw);
  g.addColorStop(0, accent);
  g.addColorStop(1, color);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  ctx.stroke();
  // Armor plates
  ctx.fillStyle = hexAlpha(accent, 0.3);
  ctx.beginPath();
  ctx.arc(0, 0, hw * 0.5, 0, Math.PI * 2);
  ctx.fill();
}

function drawZigzag(ctx: CanvasRenderingContext2D, hw: number, hh: number, color: string, accent: string) {
  ctx.beginPath();
  ctx.moveTo(0, -hh);
  ctx.lineTo(hw * 0.6, -hh * 0.2);
  ctx.lineTo(hw, hh * 0.5);
  ctx.lineTo(0, hh * 0.2);
  ctx.lineTo(-hw, hh * 0.5);
  ctx.lineTo(-hw * 0.6, -hh * 0.2);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // Speed stripes
  ctx.strokeStyle = hexAlpha(accent, 0.6);
  ctx.lineWidth = 1;
  [[-hw * 0.3, -hh * 0.4, -hw * 0.1, hh * 0.2],
   [hw * 0.1, -hh * 0.4, hw * 0.3, hh * 0.2]].forEach(([x1, y1, x2, y2]) => {
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  });
}

function drawKamikaze(ctx: CanvasRenderingContext2D, hw: number, hh: number, color: string, _accent: string) {
  ctx.beginPath();
  ctx.moveTo(0, -hh);
  ctx.lineTo(-hw, hh);
  ctx.lineTo(0, hh * 0.4);
  ctx.lineTo(hw, hh);
  ctx.closePath();
  const g = ctx.createLinearGradient(0, -hh, 0, hh);
  g.addColorStop(0, '#ff8800');
  g.addColorStop(1, color);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = '#ff4400';
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawSniper(ctx: CanvasRenderingContext2D, hw: number, hh: number, color: string, accent: string) {
  // Long thin ship
  ctx.beginPath();
  ctx.moveTo(0, -hh);
  ctx.lineTo(-hw * 0.3, hh * 0.5);
  ctx.lineTo(-hw, hh);
  ctx.lineTo(-hw * 0.5, hh * 0.7);
  ctx.lineTo(0, hh);
  ctx.lineTo(hw * 0.5, hh * 0.7);
  ctx.lineTo(hw, hh);
  ctx.lineTo(hw * 0.3, hh * 0.5);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 1;
  ctx.stroke();
  // Sniper barrel
  ctx.fillStyle = accent;
  ctx.fillRect(-2, -hh - 8, 4, 12);
}

function drawBomber(ctx: CanvasRenderingContext2D, hw: number, hh: number, color: string, accent: string) {
  // Wide bomber
  ctx.beginPath();
  ctx.moveTo(0, -hh * 0.6);
  ctx.lineTo(-hw, hh * 0.2);
  ctx.lineTo(-hw * 0.8, hh);
  ctx.lineTo(0, hh * 0.7);
  ctx.lineTo(hw * 0.8, hh);
  ctx.lineTo(hw, hh * 0.2);
  ctx.closePath();
  const g = ctx.createLinearGradient(0, -hh, 0, hh);
  g.addColorStop(0, accent);
  g.addColorStop(1, color);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // Bomb pods
  [[-hw * 0.55, hh * 0.3], [hw * 0.55, hh * 0.3]].forEach(([bx, by]) => {
    ctx.beginPath();
    ctx.arc(bx, by, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#ff8800';
    ctx.fill();
  });
}

function drawBarrier(ctx: CanvasRenderingContext2D, hw: number, hh: number, color: string, accent: string) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.fillRect(-hw, -hh, hw * 2, hh * 2);

  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.shadowColor = accent;
  ctx.shadowBlur = 10;
  ctx.strokeRect(-hw, -hh, hw * 2, hh * 2);
  ctx.shadowBlur = 0;

  ctx.strokeStyle = 'rgba(255, 0, 200, 0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = -hw + 15; x < hw; x += 15) {
    ctx.moveTo(x, -hh);
    ctx.lineTo(x, hh);
  }
  for (let y = -hh + 10; y < hh; y += 10) {
    ctx.moveTo(-hw, y);
    ctx.lineTo(hw, y);
  }
  ctx.stroke();
}

// ── Boss ───────────────────────────────────────────────────

export function renderBoss(ctx: CanvasRenderingContext2D, state: GameState) {
  const boss = state.boss;
  if (!boss) return;

  ctx.save();
  const cx = boss.x + boss.width / 2;
  const cy = boss.y + boss.height / 2;
  ctx.translate(cx, cy);

  if (boss.hitFlash > 0) {
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 20;
  }

  const hw = boss.width / 2;
  const hh = boss.height / 2;
  const t = Date.now() / 1000;

  switch (state.planetIndex) {
    case 0: drawBossInferno(ctx, hw, hh, boss, t); break;
    case 1: drawBossHydra(ctx, hw, hh, boss, t); break;
    case 2: drawBossCryo(ctx, hw, hh, boss, t); break;
    case 3: drawBossSolar(ctx, hw, hh, boss, t); break;
    case 4: drawBossHydra(ctx, hw, hh, boss, t); break; // Aetherius
    case 5: drawBossCryo(ctx, hw, hh, boss, t); break;  // Cybertron Core
    case 6: drawBossSolar(ctx, hw, hh, boss, t); break; // Void Terminus
    default: drawBossInferno(ctx, hw, hh, boss, t);
  }

  // Weak point
  if (boss.weakPointActive) {
    ctx.fillStyle = `rgba(255,255,0,${0.5 + 0.5 * Math.sin(t * 8)})`;
    ctx.beginPath();
    ctx.arc(0, 0, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = '#ffff00';
    ctx.shadowBlur = 20;
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  ctx.shadowBlur = 0;
  ctx.restore();
}

function drawBossInferno(ctx: CanvasRenderingContext2D, hw: number, hh: number, _boss: Boss, t: number) {
  // Pulsing fire-body
  const pulse = 1 + 0.05 * Math.sin(t * 4);
  ctx.scale(pulse, pulse);

  // Main body
  ctx.beginPath();
  ctx.moveTo(0, -hh);
  ctx.lineTo(-hw * 0.6, -hh * 0.3);
  ctx.lineTo(-hw, hh * 0.2);
  ctx.lineTo(-hw * 0.7, hh);
  ctx.lineTo(0, hh * 0.7);
  ctx.lineTo(hw * 0.7, hh);
  ctx.lineTo(hw, hh * 0.2);
  ctx.lineTo(hw * 0.6, -hh * 0.3);
  ctx.closePath();
  const fg = ctx.createRadialGradient(0, 0, 0, 0, 0, hw);
  fg.addColorStop(0, '#ff8800');
  fg.addColorStop(0.5, '#ff3300');
  fg.addColorStop(1, '#990000');
  ctx.fillStyle = fg;
  ctx.fill();
  ctx.strokeStyle = '#ff6600';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Eye
  ctx.beginPath();
  ctx.arc(0, -hh * 0.1, 18, 0, Math.PI * 2);
  ctx.fillStyle = '#ff0000';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, -hh * 0.1, 10, 0, Math.PI * 2);
  ctx.fillStyle = '#ffff00';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, -hh * 0.1, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#000';
  ctx.fill();
}

function drawBossHydra(ctx: CanvasRenderingContext2D, hw: number, hh: number, _boss: Boss, t: number) {
  // Central body
  ctx.beginPath();
  ctx.ellipse(0, 0, hw * 0.7, hh * 0.8, 0, 0, Math.PI * 2);
  const gg = ctx.createRadialGradient(0, 0, 0, 0, 0, hw);
  gg.addColorStop(0, '#22ff88');
  gg.addColorStop(0.5, '#00aa44');
  gg.addColorStop(1, '#003322');
  ctx.fillStyle = gg;
  ctx.fill();
  ctx.strokeStyle = '#00ff88';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Tentacles
  for (let i = 0; i < 4; i++) {
    const baseA = (i / 4) * Math.PI * 2;
    const wave = Math.sin(t * 3 + i * 1.5) * 20;
    ctx.beginPath();
    ctx.moveTo(Math.cos(baseA) * hw * 0.6, Math.sin(baseA) * hh * 0.6);
    ctx.quadraticCurveTo(
      Math.cos(baseA + 0.5) * hw * 1.2 + wave,
      Math.sin(baseA + 0.5) * hh * 1.2 + wave,
      Math.cos(baseA + 1) * hw * 0.8,
      Math.sin(baseA + 1) * hh * 0.8
    );
    ctx.strokeStyle = '#00ff66';
    ctx.lineWidth = 6;
    ctx.stroke();
  }
  // Eyes
  ctx.fillStyle = '#ff0000';
  ctx.beginPath(); ctx.arc(-10, -5, 6, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(10, -5, 6, 0, Math.PI * 2); ctx.fill();
}

function drawBossCryo(ctx: CanvasRenderingContext2D, hw: number, hh: number, _boss: Boss, t: number) {
  // Crystal-like hexagonal boss
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + t * 0.5;
    i === 0
      ? ctx.moveTo(Math.cos(a) * hw, Math.sin(a) * hh)
      : ctx.lineTo(Math.cos(a) * hw, Math.sin(a) * hh);
  }
  ctx.closePath();
  const cg = ctx.createRadialGradient(0, 0, 0, 0, 0, hw);
  cg.addColorStop(0, '#aaddff');
  cg.addColorStop(0.4, '#0088cc');
  cg.addColorStop(1, '#002244');
  ctx.fillStyle = cg;
  ctx.fill();
  ctx.strokeStyle = '#00ccff';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Inner crystal
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 - t * 0.8;
    i === 0
      ? ctx.moveTo(Math.cos(a) * hw * 0.5, Math.sin(a) * hh * 0.5)
      : ctx.lineTo(Math.cos(a) * hw * 0.5, Math.sin(a) * hh * 0.5);
  }
  ctx.closePath();
  ctx.fillStyle = hexAlpha('#aaeeff', 0.5);
  ctx.fill();
}

function drawBossSolar(ctx: CanvasRenderingContext2D, hw: number, hh: number, _boss: Boss, t: number) {
  // Sun-like final boss
  const rays = 8;
  for (let i = 0; i < rays; i++) {
    const a = (i / rays) * Math.PI * 2 + t * 0.8;
    const rLen = hw * 1.5 + Math.sin(t * 3 + i) * 15;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * hw * 0.8, Math.sin(a) * hh * 0.8);
    ctx.lineTo(Math.cos(a) * rLen, Math.sin(a) * rLen * 0.8);
    ctx.strokeStyle = `rgba(255,${100 + i * 20},0,0.6)`;
    ctx.lineWidth = 8;
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.arc(0, 0, hw * 0.9, 0, Math.PI * 2);
  const sg = ctx.createRadialGradient(0, 0, 0, 0, 0, hw);
  sg.addColorStop(0, '#ffffff');
  sg.addColorStop(0.3, '#ffee00');
  sg.addColorStop(0.7, '#ff6600');
  sg.addColorStop(1, '#cc2200');
  ctx.fillStyle = sg;
  ctx.fill();
  ctx.strokeStyle = '#ffaa00';
  ctx.lineWidth = 3;
  ctx.stroke();
  // Sunspot eyes
  ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.arc(-hw * 0.25, -hh * 0.1, 8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(hw * 0.25, -hh * 0.1, 8, 0, Math.PI * 2); ctx.fill();
}

// ── Particles ──────────────────────────────────────────────

export function renderParticles(ctx: CanvasRenderingContext2D, state: GameState) {
  for (const p of state.particles) {
    if (p.alpha <= 0) continue;
    ctx.save();
    ctx.globalAlpha = p.alpha;

    if (p.type === 'shockwave') {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 3 * p.alpha;
      ctx.stroke();
    } else if (p.type === 'smoke') {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    } else if (p.type === 'glow') {
      const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
      grd.addColorStop(0, p.color);
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Spark
      ctx.translate(p.x, p.y);
      if (p.rotation !== undefined) ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
    }

    ctx.restore();
  }
}

// ── Power-ups ──────────────────────────────────────────────

export function renderPowerUps(ctx: CanvasRenderingContext2D, state: GameState) {
  for (const p of state.powerUps) {
    renderPowerUp(ctx, p);
  }
}

function renderPowerUp(ctx: CanvasRenderingContext2D, p: PowerUp) {
  const color = POWERUP_COLORS[p.type];
  const icon = POWERUP_ICONS[p.type];
  const bob = Math.sin(p.anim) * 4;

  ctx.save();
  ctx.translate(p.x + 12, p.y + 12 + bob);

  // Glow ring
  const pulse = 0.6 + 0.4 * Math.sin(p.anim * 2);
  const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, 20);
  grd.addColorStop(0, hexAlpha(color, 0.4 * pulse));
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.arc(0, 0, 20, 0, Math.PI * 2);
  ctx.fill();

  // Hexagon background
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    i === 0 ? ctx.moveTo(Math.cos(a) * 12, Math.sin(a) * 12) : ctx.lineTo(Math.cos(a) * 12, Math.sin(a) * 12);
  }
  ctx.closePath();
  ctx.fillStyle = hexAlpha(color, 0.3);
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Icon
  ctx.font = '12px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(icon, 0, 0);

  // Lifetime warning pulse
  if (p.lifetime < 3000) {
    ctx.globalAlpha = 0.5 + 0.5 * Math.sin(Date.now() / 100);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

// ── Floating texts ─────────────────────────────────────────

export function renderFloatingTexts(ctx: CanvasRenderingContext2D, state: GameState) {
  for (const f of state.floatingTexts) {
    const t = f.life / f.maxLife;
    ctx.save();
    ctx.globalAlpha = Math.min(1, t * 2);
    ctx.font = `bold ${Math.round(16 * f.scale)}px 'Courier New', monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = f.color;
    ctx.shadowColor = f.color;
    ctx.shadowBlur = 8;
    ctx.fillText(f.text, f.x, f.y);
    ctx.restore();
  }
}

// ── Bomb flash ─────────────────────────────────────────────

export function renderBombFlash(ctx: CanvasRenderingContext2D, state: GameState) {
  if (!state.bombActive) return;
  const alpha = (state.bombTimer / 600) * 0.6;
  ctx.fillStyle = `rgba(255,0,255,${alpha})`;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

// ── Boss health bar UI ─────────────────────────────────────

export function renderBossBar(ctx: CanvasRenderingContext2D, state: GameState) {
  const boss = state.boss;
  if (!boss || !boss.alive || boss.entryAnim > 0) return;

  const bx = 20;
  const by = CANVAS_HEIGHT - 30;
  const bw = CANVAS_WIDTH - 40;
  const bh = 16;
  const pct = Math.max(0, boss.hp / boss.maxHp);
  const shieldPct = boss.shield / boss.maxShield;

  // Background
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  drawRoundRect(ctx, bx - 4, by - 22, bw + 8, bh + 28, 6);
  ctx.fill();

  // Boss name
  ctx.font = 'bold 11px Courier New';
  ctx.fillStyle = '#ff4444';
  ctx.textAlign = 'left';
  ctx.fillText(`⚠️ ${boss.name}  [PHASE ${boss.phase}/${boss.maxPhase}]${boss.enraged ? '  🔴 ENRAGED' : ''}`, bx, by - 8);

  // HP bar track
  ctx.fillStyle = '#1a0000';
  drawRoundRect(ctx, bx, by, bw, bh, 4);
  ctx.fill();

  // HP bar
  const barColor = pct > 0.5 ? '#ff4444' : pct > 0.25 ? '#ff8800' : '#ff0000';
  const g = ctx.createLinearGradient(bx, by, bx + bw, by);
  g.addColorStop(0, barColor);
  g.addColorStop(1, '#ffaaaa');
  ctx.fillStyle = g;
  drawRoundRect(ctx, bx, by, bw * pct, bh, 4);
  ctx.fill();

  // Shield overlay
  if (boss.shield > 0) {
    ctx.fillStyle = hexAlpha('#4488ff', 0.5);
    drawRoundRect(ctx, bx, by, bw * shieldPct, bh, 4);
    ctx.fill();
  }

  // Phase markers
  for (let i = 1; i < boss.maxPhase; i++) {
    const mx = bx + bw * (i / boss.maxPhase);
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(mx, by);
    ctx.lineTo(mx, by + bh);
    ctx.stroke();
  }
}

// ── HUD ────────────────────────────────────────────────────

export function renderHUD(ctx: CanvasRenderingContext2D, state: GameState) {
  const { player, score, combo, multiplier, planetIndex, wave, phase } = state;
  const planet = PLANETS[planetIndex];

  // Top panel
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, 42);

  // Score
  ctx.font = 'bold 18px Courier New';
  ctx.fillStyle = '#00ffff';
  ctx.textAlign = 'left';
  ctx.shadowColor = '#00ffff';
  ctx.shadowBlur = 6;
  ctx.fillText(`⭐ ${score.toLocaleString()}`, 10, 26);
  ctx.shadowBlur = 0;

  // High score
  ctx.font = '11px Courier New';
  ctx.fillStyle = '#668888';
  ctx.fillText(`BEST: ${state.highScore.toLocaleString()}`, 10, 40);

  // Planet / wave
  ctx.textAlign = 'center';
  ctx.font = 'bold 13px Courier New';
  ctx.fillStyle = planet.accentColor;
  ctx.shadowColor = planet.accentColor;
  ctx.shadowBlur = 4;
  ctx.fillText(planet.name.toUpperCase(), CANVAS_WIDTH / 2, 16);
  ctx.shadowBlur = 0;
  ctx.font = '11px Courier New';
  ctx.fillStyle = '#888';
  ctx.fillText(
    phase === 'boss' ? `⚠️ BOSS FIGHT` : `WAVE ${wave + 1} / ${planet.wavesBeforeBoss}`,
    CANVAS_WIDTH / 2, 32
  );

  // Multiplier
  if (multiplier > 1) {
    ctx.font = 'bold 16px Courier New';
    ctx.fillStyle = '#ffaa00';
    ctx.shadowColor = '#ffaa00';
    ctx.shadowBlur = 8;
    ctx.textAlign = 'right';
    ctx.fillText(`${multiplier}× COMBO`, CANVAS_WIDTH - 10, 20);
    ctx.shadowBlur = 0;
    // Combo timer bar
    const comboW = 120;
    ctx.fillStyle = '#222';
    ctx.fillRect(CANVAS_WIDTH - comboW - 10, 24, comboW, 4);
    ctx.fillStyle = '#ffaa00';
    ctx.fillRect(CANVAS_WIDTH - comboW - 10, 24, comboW * (state.comboTimer / 2500), 4);
  } else {
    ctx.textAlign = 'right';
    ctx.font = '11px Courier New';
    ctx.fillStyle = '#448';
    ctx.fillText(`COMBO: ${combo}`, CANVAS_WIDTH - 10, 20);
  }

  // Bottom HUD
  const hudY = CANVAS_HEIGHT - 44;
  ctx.fillStyle = 'rgba(0,0,0,0.65)';
  ctx.fillRect(0, hudY, CANVAS_WIDTH, 44);

  // HP bar
  const hpW = 180;
  ctx.font = '10px Courier New';
  ctx.fillStyle = '#aaa';
  ctx.textAlign = 'left';
  ctx.fillText('HP', 10, hudY + 13);
  ctx.fillStyle = '#111';
  drawRoundRect(ctx, 28, hudY + 4, hpW, 10, 3);
  ctx.fill();
  const hpPct = player.hp / player.maxHp;
  ctx.fillStyle = hpPct > 0.5 ? '#44ff44' : hpPct > 0.25 ? '#ffaa00' : '#ff4444';
  drawRoundRect(ctx, 28, hudY + 4, hpW * hpPct, 10, 3);
  ctx.fill();
  ctx.font = '9px Courier New';
  ctx.fillStyle = '#ccc';
  ctx.fillText(`${Math.ceil(player.hp)}/${player.maxHp}`, 28 + hpW + 4, hudY + 13);

  // Shield bar
  ctx.font = '10px Courier New';
  ctx.fillStyle = '#aaa';
  ctx.fillText('SH', 10, hudY + 31);
  ctx.fillStyle = '#111';
  drawRoundRect(ctx, 28, hudY + 21, hpW, 10, 3);
  ctx.fill();
  const shPct = player.shields / player.maxShields;
  ctx.fillStyle = '#4488ff';
  drawRoundRect(ctx, 28, hudY + 21, hpW * shPct, 10, 3);
  ctx.fill();
  ctx.font = '9px Courier New';
  ctx.fillStyle = '#ccc';
  ctx.fillText(`${Math.ceil(player.shields)}/${player.maxShields}`, 28 + hpW + 4, hudY + 31);

  // Lives
  ctx.textAlign = 'center';
  ctx.font = '18px serif';
  for (let i = 0; i < player.lives; i++) {
    ctx.fillText('♥', 240 + i * 24, hudY + 22);
  }

  // ── Weapon progression bar ─────────────────────────────
  const ALL_WEAPONS = ['laser', 'spread', 'rapid', 'missile', 'plasma', 'beam'];
  const PLANET_LABELS = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6'];
  const weaponColors: Record<string, string> = {
    laser: '#00ffff', spread: '#ffaa00', rapid: '#ff44ff',
    missile: '#ff4444', plasma: '#44ff44', beam: '#ffff00',
  };
  const weaponShortNames: Record<string, string> = {
    laser: 'LAZ', spread: 'SPR', rapid: 'RAP', missile: 'MIS', plasma: 'PLA', beam: 'BEA',
  };

  const slotW = 52;
  const slotH = 32;
  const totalW = ALL_WEAPONS.length * slotW;
  const startX = (CANVAS_WIDTH - totalW) / 2;
  const sy = hudY + 5;

  ALL_WEAPONS.forEach((w, i) => {
    const isActive = player.weapon === w;
    const isOwned = player.weaponsUnlocked.includes(w as any);
    const sx = startX + i * slotW;
    const wColor = weaponColors[w] ?? '#888';
    const wLvl = (player.weaponLevels as any)?.[w] ?? 1;

    // Slot background
    ctx.fillStyle = isActive
      ? hexAlpha(wColor, 0.25)
      : isOwned
        ? 'rgba(0,20,40,0.7)'
        : 'rgba(0,0,0,0.5)';
    drawRoundRect(ctx, sx + 1, sy, slotW - 2, slotH, 4);
    ctx.fill();

    // Border
    ctx.strokeStyle = isActive ? wColor : isOwned ? 'rgba(80,120,160,0.5)' : 'rgba(40,40,60,0.5)';
    ctx.lineWidth = isActive ? 1.5 : 1;
    drawRoundRect(ctx, sx + 1, sy, slotW - 2, slotH, 4);
    ctx.stroke();

    if (isOwned) {
      // Weapon name
      ctx.textAlign = 'center';
      ctx.font = `bold 9px Courier New`;
      ctx.fillStyle = isActive ? wColor : '#778899';
      if (isActive) { ctx.shadowColor = wColor; ctx.shadowBlur = 6; }
      ctx.fillText(weaponShortNames[w] ?? w, sx + slotW / 2, sy + 12);
      ctx.shadowBlur = 0;

      // Level dots
      for (let d = 0; d < 3; d++) {
        ctx.beginPath();
        ctx.arc(sx + slotW / 2 - 8 + d * 8, sy + 24, 3, 0, Math.PI * 2);
        ctx.fillStyle = d < wLvl ? wColor : 'rgba(60,60,80,0.8)';
        ctx.fill();
      }

      // Active glow underline
      if (isActive) {
        ctx.fillStyle = wColor;
        ctx.fillRect(sx + 4, sy + slotH - 3, slotW - 10, 2);
      }
    } else {
      // Locked slot — show required level
      ctx.textAlign = 'center';
      ctx.font = '9px Courier New';
      ctx.fillStyle = 'rgba(60,80,100,0.8)';
      ctx.fillText('🔒', sx + slotW / 2, sy + 12);
      ctx.font = '8px Courier New';
      ctx.fillStyle = 'rgba(60,80,100,0.6)';
      ctx.fillText(PLANET_LABELS[i], sx + slotW / 2, sy + 25);
    }
  });

  // Currency
  ctx.textAlign = 'right';
  ctx.font = 'bold 12px Courier New';
  ctx.fillStyle = '#ffdd44';
  ctx.fillText(`💰 ${state.currency}`, CANVAS_WIDTH - 8, hudY + 22);

  // Controls hint
  ctx.font = '9px Courier New';
  ctx.fillStyle = '#334';
  ctx.fillText('WASD/↑↓←→ MOVE  SPACE SHOOT', CANVAS_WIDTH - 8, hudY + 36);
}

// ── Boss warning ────────────────────────────────────────────

export function renderBossWarning(ctx: CanvasRenderingContext2D, state: GameState) {
  if (state.phase !== 'bossWarning') return;
  const t = Date.now() / 300;
  const alpha = 0.5 + 0.5 * Math.sin(t);
  const planet = PLANETS[state.planetIndex];

  ctx.fillStyle = `rgba(0,0,0,${alpha * 0.5})`;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.save();
  ctx.font = 'bold 48px Courier New';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = `rgba(255,50,0,${alpha})`;
  ctx.shadowColor = '#ff2200';
  ctx.shadowBlur = 30 * alpha;
  ctx.fillText('⚠️ BOSS INCOMING ⚠️', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
  ctx.font = 'bold 28px Courier New';
  ctx.fillStyle = `rgba(255,200,0,${alpha})`;
  ctx.shadowColor = planet.accentColor;
  ctx.fillText(planet.bossName, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 32);
  ctx.restore();
}

// ── Main render ────────────────────────────────────────────

export function renderFrame(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  shakeX: number,
  shakeY: number,
) {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.save();
  ctx.translate(shakeX, shakeY);

  renderBackground(ctx, state);
  renderStars(ctx, state);
  renderParticles(ctx, state);
  renderPowerUps(ctx, state);
  renderBullets(ctx, state);
  renderEnemies(ctx, state);
  if (state.boss?.alive) renderBoss(ctx, state);
  if (state.phase !== 'gameOver') renderPlayer(ctx, state);
  renderFloatingTexts(ctx, state);
  renderBombFlash(ctx, state);
  renderBossWarning(ctx, state);

  ctx.restore();

  // HUD is drawn without shake
  renderHUD(ctx, state);
  renderBossBar(ctx, state);
}
