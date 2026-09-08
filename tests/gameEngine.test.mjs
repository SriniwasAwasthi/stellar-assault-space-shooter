import test from 'node:test';
import assert from 'node:assert/strict';

// Game Engine 2D Math & Logic tests for Stellar Assault
function checkAABBCollision(rectA, rectB) {
  return (
    rectA.x < rectB.x + rectB.width &&
    rectA.x + rectA.width > rectB.x &&
    rectA.y < rectB.y + rectB.height &&
    rectA.y + rectA.height > rectB.y
  );
}

function computeScore(basePoints, multiplier, streak) {
  const streakBonus = Math.min(streak * 0.1, 2.0);
  return Math.floor(basePoints * (multiplier + streakBonus));
}

test('Collision Detection: detects overlapping bounding boxes', () => {
  const laser = { x: 100, y: 150, width: 4, height: 16 };
  const enemy = { x: 95, y: 140, width: 32, height: 32 };
  assert.equal(checkAABBCollision(laser, enemy), true);
});

test('Collision Detection: rejects non-overlapping bounding boxes', () => {
  const laser = { x: 50, y: 50, width: 4, height: 16 };
  const enemy = { x: 200, y: 200, width: 32, height: 32 };
  assert.equal(checkAABBCollision(laser, enemy), false);
});

test('Score Mechanics: applies multiplier and streak bonus', () => {
  const score = computeScore(100, 1.5, 5); // 100 * (1.5 + 0.5) = 200
  assert.equal(score, 200);
});
