// ============================================================
// STELLAR ASSAULT — Game Over Screen
// ============================================================

import { useEffect, useState } from 'react';
import type { GameState } from '../game/types';
import { PLANETS } from '../game/constants';

interface GameOverScreenProps {
  state: GameState;
  onRestart: () => void;
  onMenu: () => void;
}

export function GameOverScreen({ state, onRestart, onMenu }: GameOverScreenProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 400);
    return () => clearTimeout(t);
  }, []);

  const isNewRecord = state.score >= state.highScore && state.score > 0;
  const planet = PLANETS[state.planetIndex];

  return (
    <div
      className={`absolute inset-0 z-30 flex items-center justify-center transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}
      style={{ background: 'rgba(0,0,0,0.88)' }}
    >
      {/* Scanlines */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,0,0,0.03) 2px, rgba(255,0,0,0.03) 4px)',
        }}
      />

      <div className="relative w-full max-w-md mx-4 rounded-2xl overflow-hidden text-center"
        style={{
          background: 'rgba(8,2,2,0.98)',
          border: '2px solid rgba(200,0,0,0.4)',
          boxShadow: '0 0 80px rgba(200,0,0,0.2)',
        }}
      >
        {/* Top accent bar */}
        <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #ff0000, #ff4400, #ff0000)' }} />

        <div className="p-8">
          {/* Title */}
          <div className="text-xs font-mono tracking-[0.4em] text-red-500 mb-2">MISSION FAILED</div>
          <h2 className="text-5xl font-mono font-black mb-1"
            style={{
              background: 'linear-gradient(135deg, #ff2200, #ff6600)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 12px rgba(255,50,0,0.8))',
            }}
          >
            GAME OVER
          </h2>
          <div className="text-xs font-mono text-gray-500 mb-6">
            Defeated at {planet.name} — {planet.subtitle}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { label: 'SCORE', value: state.score.toLocaleString(), color: '#ffdd44', icon: '⭐' },
              { label: 'BEST', value: state.highScore.toLocaleString(), color: '#ffaa00', icon: '🏆' },
              { label: 'KILLS', value: state.kills.toString(), color: '#ff6666', icon: '💀' },
              { label: 'WAVE', value: `${state.wave + 1}`, color: '#66aaff', icon: '🌊' },
              { label: 'PLANET', value: `${state.planetIndex + 1} / ${PLANETS.length}`, color: '#88ff88', icon: '🌍' },
              { label: 'COMBO', value: `×${state.multiplier}`, color: '#ff88ff', icon: '⚡' },
            ].map(({ label, value, color, icon }) => (
              <div key={label} className="py-3 px-4 rounded-xl font-mono"
                style={{
                  background: 'rgba(20,5,5,0.8)',
                  border: `1px solid rgba(${color === '#ffdd44' ? '255,200,0' : '100,50,50'},0.2)`,
                }}
              >
                <div className="text-xs text-gray-500 mb-1">{icon} {label}</div>
                <div className="text-lg font-bold" style={{ color }}>{value}</div>
              </div>
            ))}
          </div>

          {/* New record banner */}
          {isNewRecord && (
            <div className="mb-4 py-2 px-4 rounded-full text-sm font-mono font-bold animate-pulse"
              style={{
                background: 'rgba(255,200,0,0.15)',
                border: '1px solid rgba(255,200,0,0.5)',
                color: '#ffdd44',
              }}
            >
              🌟 NEW HIGH SCORE! 🌟
            </div>
          )}

          {/* Buttons */}
          <div className="space-y-3">
            <button
              onClick={onRestart}
              className="w-full py-4 rounded-xl font-mono font-black text-lg uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #880000, #cc2200, #ff4400)',
                border: '1px solid rgba(255,100,0,0.4)',
                color: '#fff',
                boxShadow: '0 0 20px rgba(200,50,0,0.4)',
              }}
            >
              🔄 TRY AGAIN
            </button>
            <button
              onClick={onMenu}
              className="w-full py-3 rounded-xl font-mono font-bold uppercase tracking-widest transition-all hover:brightness-110"
              style={{
                background: 'rgba(20,30,50,0.8)',
                border: '1px solid rgba(0,100,200,0.3)',
                color: '#6688aa',
              }}
            >
              ← MAIN MENU
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
