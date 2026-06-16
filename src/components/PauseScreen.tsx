// ============================================================
// STELLAR ASSAULT — Pause Screen
// ============================================================

import { isMuted, toggleMute } from '../game/audio';
import { useState } from 'react';
import type { GameState } from '../game/types';
import { PLANETS } from '../game/constants';

interface PauseScreenProps {
  state: GameState;
  onResume: () => void;
  onMenu: () => void;
}

export function PauseScreen({ state, onResume, onMenu }: PauseScreenProps) {
  const [muted, setMuted] = useState(isMuted());
  const planet = PLANETS[state.planetIndex];

  const handleMute = () => {
    const newMuted = toggleMute();
    setMuted(newMuted);
  };

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.80)', backdropFilter: 'blur(4px)' }}
    >
      <div className="w-full max-w-sm mx-4 rounded-2xl overflow-hidden text-center font-mono"
        style={{
          background: 'rgba(2,5,18,0.98)',
          border: '2px solid rgba(0,150,255,0.3)',
          boxShadow: '0 0 50px rgba(0,100,200,0.2)',
        }}
      >
        <div className="py-6 px-6"
          style={{ background: 'linear-gradient(180deg, rgba(0,30,80,0.5) 0%, transparent 100%)' }}
        >
          <div className="text-xs tracking-[0.4em] text-blue-400 mb-2">MISSION PAUSED</div>
          <h2 className="text-3xl font-black"
            style={{
              background: 'linear-gradient(135deg, #00aaff, #0044ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            ⏸ PAUSED
          </h2>
        </div>

        <div className="px-6 pb-2">
          {/* Stats summary */}
          <div className="grid grid-cols-2 gap-2 my-4">
            <div className="py-2 rounded-lg text-xs" style={{ background: 'rgba(0,20,50,0.7)', border: '1px solid rgba(0,100,200,0.2)' }}>
              <div className="text-gray-500">SCORE</div>
              <div className="text-cyan-300 font-bold">{state.score.toLocaleString()}</div>
            </div>
            <div className="py-2 rounded-lg text-xs" style={{ background: 'rgba(0,20,50,0.7)', border: '1px solid rgba(0,100,200,0.2)' }}>
              <div className="text-gray-500">PLANET</div>
              <div className="font-bold" style={{ color: planet.accentColor }}>{planet.name}</div>
            </div>
            <div className="py-2 rounded-lg text-xs" style={{ background: 'rgba(0,20,50,0.7)', border: '1px solid rgba(0,100,200,0.2)' }}>
              <div className="text-gray-500">WAVE</div>
              <div className="text-blue-300 font-bold">{state.wave + 1} / {planet.wavesBeforeBoss}</div>
            </div>
            <div className="py-2 rounded-lg text-xs" style={{ background: 'rgba(0,20,50,0.7)', border: '1px solid rgba(0,100,200,0.2)' }}>
              <div className="text-gray-500">WEAPON</div>
              <div className="text-purple-300 font-bold uppercase">{state.player.weapon}</div>
            </div>
          </div>

          {/* Buttons */}
          <div className="space-y-3 pb-6">
            <button
              onClick={onResume}
              className="w-full py-4 rounded-xl font-black text-lg uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #002266, #004488, #0066cc)',
                border: '1px solid rgba(0,150,255,0.4)',
                color: '#fff',
                boxShadow: '0 0 20px rgba(0,100,255,0.3)',
              }}
            >
              ▶ RESUME
            </button>
            <button
              onClick={handleMute}
              className="w-full py-3 rounded-xl font-bold uppercase tracking-widest transition-all hover:brightness-110"
              style={{
                background: muted ? 'rgba(40,0,0,0.6)' : 'rgba(0,30,20,0.6)',
                border: `1px solid ${muted ? 'rgba(255,50,50,0.3)' : 'rgba(0,200,100,0.3)'}`,
                color: muted ? '#ff6666' : '#66ff88',
              }}
            >
              {muted ? '🔇 SOUND OFF' : '🔊 SOUND ON'}
            </button>
            <button
              onClick={onMenu}
              className="w-full py-3 rounded-xl font-bold uppercase tracking-widest transition-all hover:brightness-110"
              style={{
                background: 'rgba(20,10,10,0.6)',
                border: '1px solid rgba(100,50,50,0.3)',
                color: '#886666',
              }}
            >
              ✕ QUIT MISSION
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
