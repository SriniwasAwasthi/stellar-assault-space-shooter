// ============================================================
// STELLAR ASSAULT — React Game Loop Hook
// ============================================================

import { useRef, useEffect, useCallback } from 'react';
import type { GameState, GamePhase } from './types';
import { updateGame } from './engine';
import { renderFrame } from './renderer';

import { resumeAudioContext } from './audio';

export function useGameLoop(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  stateRef: React.MutableRefObject<GameState>,
  onPhaseChange: (phase: GamePhase) => void,
) {
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const prevPhaseRef = useRef<GamePhase>('menu');

  const loop = useCallback((timestamp: number) => {
    const dt = lastTimeRef.current ? Math.min(timestamp - lastTimeRef.current, 50) : 16;
    lastTimeRef.current = timestamp;

    const state = stateRef.current;

    // Detect phase changes
    if (state.phase !== prevPhaseRef.current) {
      prevPhaseRef.current = state.phase;
      onPhaseChange(state.phase);
    }

    // Update game logic
    if (
      state.phase === 'playing' ||
      state.phase === 'boss' ||
      state.phase === 'waveComplete' ||
      state.phase === 'bossWarning'
    ) {
      updateGame(state, dt);
    } else {
      // Still update stars and particles in other phases
      updateGame(state, dt);
    }

    // Render
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Screen shake
        const shakeAmt = state.screenShake;
        const sx = shakeAmt > 0 ? (Math.random() - 0.5) * shakeAmt : 0;
        const sy = shakeAmt > 0 ? (Math.random() - 0.5) * shakeAmt : 0;
        renderFrame(ctx, state, sx, sy);
      }
    }

    rafRef.current = requestAnimationFrame(loop);
  }, [canvasRef, stateRef, onPhaseChange]);

  const start = useCallback(() => {
    resumeAudioContext();
    lastTimeRef.current = 0;
    rafRef.current = requestAnimationFrame(loop);
  }, [loop]);

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return { start, stop };
}

// ── Key handler hook ──────────────────────────────────────

export function useKeyboard(stateRef: React.MutableRefObject<GameState>) {
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      stateRef.current.keys[e.key] = true;
      // Prevent scrolling on space/arrows
      if ([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }
    };
    const onUp = (e: KeyboardEvent) => {
      stateRef.current.keys[e.key] = false;
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, [stateRef]);
}
