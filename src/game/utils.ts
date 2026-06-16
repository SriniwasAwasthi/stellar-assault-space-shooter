// ============================================================
// STELLAR ASSAULT — Utility Functions
// ============================================================

import type { Vec2, Particle, FloatingText, Star } from './types';
import { STAR_COUNT } from './constants';

let idCounter = 0;
export function genId(): string { return `id_${++idCounter}_${Date.now()}`; }

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function distance(a: Vec2, b: Vec2): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

export function angle(from: Vec2, to: Vec2): number {
  return Math.atan2(to.y - from.y, to.x - from.x);
}

export function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function randomInt(min: number, max: number): number {
  return Math.floor(randomBetween(min, max + 1));
}

export function chance(probability: number): boolean {
  return Math.random() < probability;
}

// Axis-aligned bounding box collision
export function rectOverlap(
  ax: number, ay: number, aw: number, ah: number,
  bx: number, by: number, bw: number, bh: number,
): boolean {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

// ── Particle factory ───────────────────────────────────────

export function makeExplosionParticles(
  x: number, y: number,
  count: number,
  color: string,
  size = 3,
): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const spd = randomBetween(1, 6);
    const dir = Math.random() * Math.PI * 2;
    const life = randomBetween(300, 800);
    particles.push({
      id: genId(),
      x,
      y,
      vx: Math.cos(dir) * spd,
      vy: Math.sin(dir) * spd,
      size: randomBetween(1, size),
      color,
      alpha: 1,
      life,
      maxLife: life,
      type: 'spark',
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: randomBetween(-0.2, 0.2),
    });
  }
  return particles;
}

export function makeShockwave(x: number, y: number, color: string): Particle {
  const life = 400;
  return {
    id: genId(),
    x, y, vx: 0, vy: 0,
    size: 5,
    color,
    alpha: 0.8,
    life, maxLife: life,
    type: 'shockwave',
  };
}

export function makeSmokeParticles(x: number, y: number, count: number): Particle[] {
  return Array.from({ length: count }, () => {
    const life = randomBetween(400, 1000);
    return {
      id: genId(),
      x: x + randomBetween(-10, 10),
      y: y + randomBetween(-10, 10),
      vx: randomBetween(-1, 1),
      vy: randomBetween(-2, -0.5),
      size: randomBetween(4, 12),
      color: '#888',
      alpha: 0.4,
      life, maxLife: life,
      type: 'smoke' as const,
    };
  });
}

export function makeGlowBurst(x: number, y: number, color: string, count = 8): Particle[] {
  return Array.from({ length: count }, () => {
    const spd = randomBetween(0.5, 3);
    const dir = Math.random() * Math.PI * 2;
    const life = randomBetween(200, 500);
    return {
      id: genId(),
      x, y,
      vx: Math.cos(dir) * spd,
      vy: Math.sin(dir) * spd,
      size: randomBetween(4, 10),
      color,
      alpha: 0.9,
      life, maxLife: life,
      type: 'glow' as const,
    };
  });
}

export function makeFloatingText(
  x: number, y: number, text: string, color: string, scale = 1
): FloatingText {
  const life = 1200;
  return {
    id: genId(),
    x, y: y - 10,
    text, color,
    life, maxLife: life,
    vy: -1.2,
    scale,
  };
}

// ── Stars ──────────────────────────────────────────────────

export function makeStars(canvasW: number, canvasH: number): Star[] {
  const starColors = ['#ffffff', '#aaddff', '#ffeedd', '#ddddff', '#ffddaa'];
  return Array.from({ length: STAR_COUNT }, () => ({
    x: Math.random() * canvasW,
    y: Math.random() * canvasH,
    size: randomBetween(0.5, 2.5),
    speed: randomBetween(0.2, 1.5),
    alpha: randomBetween(0.3, 1),
    twinkle: Math.random() * Math.PI * 2,
    color: starColors[randomInt(0, starColors.length - 1)],
  }));
}

// ── Canvas helpers ─────────────────────────────────────────

export function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 255, g: 255, b: 255 };
}

export function hexAlpha(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function formatScore(n: number): string {
  return n.toLocaleString();
}
