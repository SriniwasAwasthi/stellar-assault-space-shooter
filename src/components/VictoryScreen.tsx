// ============================================================
// STELLAR ASSAULT — Victory / Level Complete Screen
// ============================================================

import { useEffect, useState } from 'react';
import type { GameState } from '../game/types';
import { PLANETS } from '../game/constants';

interface VictoryScreenProps {
  state: GameState;
  onNext: () => void;
  onMenu: () => void;
  isLevelComplete: boolean; // false = full game victory
}

export function VictoryScreen({ state, onNext, onMenu, isLevelComplete }: VictoryScreenProps) {
  const [visible, setVisible] = useState(false);
  const [starCount, setStarCount] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 300);
    const t2 = setInterval(() => setStarCount(c => Math.min(c + 1, 20)), 100);
    return () => { clearTimeout(t1); clearInterval(t2); };
  }, []);

  const planet = PLANETS[state.planetIndex];
  const nextPlanet = PLANETS[state.planetIndex + 1];
  const isNewRecord = state.score >= state.highScore && state.score > 0;

  return (
    <div
      className={`absolute inset-0 z-30 flex items-center justify-center transition-opacity duration-600 ${visible ? 'opacity-100' : 'opacity-0'}`}
      style={{ background: 'rgba(0,5,15,0.92)' }}
    >
      {/* Star burst effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: starCount }).map((_, i) => (
          <div key={i} className="absolute animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${2 + Math.random() * 4}px`,
              height: `${2 + Math.random() * 4}px`,
              borderRadius: '50%',
              background: ['#ffff00', '#00ffff', '#ff88ff', '#88ff88'][i % 4],
              animationDuration: `${0.5 + Math.random() * 1.5}s`,
              animationDelay: `${Math.random() * 0.5}s`,
            }}
          />
        ))}
      </div>

      <div className="relative w-full max-w-md mx-4 rounded-2xl overflow-hidden text-center"
        style={{
          background: 'rgba(2,8,20,0.98)',
          border: `2px solid rgba(${isLevelComplete ? '0,200,100' : '255,200,0'},0.5)`,
          boxShadow: `0 0 80px rgba(${isLevelComplete ? '0,180,80' : '255,180,0'},0.3)`,
        }}
      >
        {/* Top bar */}
        <div className="h-1.5 w-full"
          style={{
            background: isLevelComplete
              ? 'linear-gradient(90deg, #00ff88, #00ffff, #00ff88)'
              : 'linear-gradient(90deg, #ffdd00, #ff8800, #ffdd00)',
          }}
        />

        <div className="p-8">
          {/* Trophy */}
          <div className="text-6xl mb-3">{isLevelComplete ? '🏆' : '🌟'}</div>

          <div className="text-xs font-mono tracking-[0.4em] mb-2"
            style={{ color: isLevelComplete ? '#00ff88' : '#ffdd44' }}
          >
            {isLevelComplete ? 'PLANET CLEARED' : 'GALAXY CONQUERED'}
          </div>

          <h2 className="text-4xl font-mono font-black mb-1"
            style={{
              background: isLevelComplete
                ? 'linear-gradient(135deg, #00ff88, #00ffff)'
                : 'linear-gradient(135deg, #ffdd00, #ff8800)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {isLevelComplete ? 'VICTORY!' : 'YOU WIN!'}
          </h2>

          <div className="text-xs font-mono text-gray-400 mb-6">
            {isLevelComplete
              ? `${planet.name} has been liberated!`
              : 'The galaxy is safe. For now...'
            }
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {[
              { label: 'SCORE', value: state.score.toLocaleString(), color: '#ffdd44' },
              { label: 'KILLS', value: state.kills.toString(), color: '#ff8888' },
              { label: 'CURRENCY', value: `+${state.currency}`, color: '#ffdd44' },
            ].map(({ label, value, color }) => (
              <div key={label} className="py-3 rounded-xl font-mono"
                style={{
                  background: 'rgba(0,20,10,0.8)',
                  border: '1px solid rgba(0,150,80,0.2)',
                }}
              >
                <div className="text-xs text-gray-500 mb-1">{label}</div>
                <div className="text-sm font-bold" style={{ color }}>{value}</div>
              </div>
            ))}
          </div>

          {isNewRecord && (
            <div className="mb-4 py-2 px-4 rounded-full text-sm font-mono font-bold animate-bounce"
              style={{
                background: 'rgba(255,200,0,0.15)',
                border: '1px solid rgba(255,200,0,0.5)',
                color: '#ffdd44',
              }}
            >
              🌟 NEW HIGH SCORE! 🌟
            </div>
          )}

          {/* Next planet teaser */}
          {isLevelComplete && nextPlanet && (
            <div className="mb-4 p-3 rounded-xl font-mono text-xs"
              style={{
                background: 'rgba(0,10,30,0.8)',
                border: `1px solid ${nextPlanet.accentColor}44`,
              }}
            >
              <span className="text-gray-400">NEXT: </span>
              <span style={{ color: nextPlanet.accentColor }} className="font-bold">{nextPlanet.name}</span>
              <span className="text-gray-500"> — {nextPlanet.subtitle}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="space-y-3">
            <button
              onClick={onNext}
              className="w-full py-4 rounded-xl font-mono font-black text-lg uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: isLevelComplete
                  ? 'linear-gradient(135deg, #004422, #008844, #00cc66)'
                  : 'linear-gradient(135deg, #6600aa, #aa00ff)',
                border: `1px solid rgba(${isLevelComplete ? '0,200,100' : '180,0,255'},0.5)`,
                color: '#fff',
                boxShadow: `0 0 24px rgba(${isLevelComplete ? '0,180,80' : '150,0,255'},0.4)`,
              }}
            >
              {isLevelComplete ? (nextPlanet ? `🚀 → ${nextPlanet.name}` : '🏆 COMPLETE') : '🎮 PLAY AGAIN'}
            </button>
            <button
              onClick={onMenu}
              className="w-full py-3 rounded-xl font-mono font-bold uppercase tracking-widest transition-all hover:brightness-110"
              style={{
                background: 'rgba(10,15,30,0.8)',
                border: '1px solid rgba(50,80,120,0.4)',
                color: '#5588aa',
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
