// ============================================================
// STELLAR ASSAULT — Main Menu Screen
// ============================================================

import { useState, useEffect } from 'react';
import { PLANETS, ACHIEVEMENTS, UPGRADES } from '../game/constants';
import { loadData } from '../game/storage';
import type { SaveData } from '../game/types';

interface MenuScreenProps {
  onStart: (planetIndex: number) => void;
  highScore: number;
}

export function MenuScreen({ onStart, highScore }: MenuScreenProps) {
  const [tab, setTab] = useState<'play' | 'planets' | 'achievements' | 'shop'>('play');
  const [selectedPlanet, setSelectedPlanet] = useState(0);
  const [save, setSave] = useState<SaveData | null>(null);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    setSave(loadData());
    const t = setInterval(() => setPulse(p => p + 1), 50);
    return () => clearInterval(t);
  }, []);

  const glowValue = 0.5 + 0.5 * Math.sin(pulse * 0.12);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-20"
      style={{ overflowY: 'auto', padding: '8px 0' }}
    >
      {/* Scanline overlay */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)',
        }}
      />

      {/* Main card */}
      <div className="relative w-full max-w-lg mx-4 rounded-2xl"
        style={{
          background: 'rgba(4,8,20,0.97)',
          border: `2px solid rgba(0,200,255,${0.3 + glowValue * 0.4})`,
          boxShadow: `0 0 ${40 + glowValue * 30}px rgba(0,180,255,${0.15 + glowValue * 0.1}), inset 0 0 60px rgba(0,0,80,0.5)`,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div className="text-center py-8 px-6"
          style={{
            background: 'linear-gradient(180deg, rgba(0,40,80,0.8) 0%, transparent 100%)',
          }}
        >
          <div className="text-xs tracking-[0.5em] text-cyan-400 mb-2 uppercase font-mono">
            ◈ GALACTIC DEFENSE FORCE ◈
          </div>
          <h1 className="font-mono font-black text-5xl md:text-6xl tracking-wider mb-1"
            style={{
              background: 'linear-gradient(135deg, #00ffff, #0088ff, #8844ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: 'none',
              filter: `drop-shadow(0 0 ${8 + glowValue * 8}px rgba(0,200,255,0.8))`,
            }}
          >
            STELLAR
          </h1>
          <h1 className="font-mono font-black text-5xl md:text-6xl tracking-wider"
            style={{
              background: 'linear-gradient(135deg, #ff4444, #ff8800, #ffff00)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: `drop-shadow(0 0 ${6 + glowValue * 6}px rgba(255,100,0,0.7))`,
            }}
          >
            ASSAULT
          </h1>
          <div className="text-xs text-gray-500 font-mono mt-2 tracking-widest">
            v2.4.1 — TACTICAL SPACE COMBAT
          </div>

          {/* High score */}
          <div className="mt-4 inline-block px-6 py-2 rounded-full font-mono text-sm"
            style={{
              background: 'rgba(255,220,0,0.1)',
              border: '1px solid rgba(255,220,0,0.4)',
            }}
          >
            <span className="text-yellow-400">⭐ BEST: </span>
            <span className="text-yellow-200 font-bold">{highScore.toLocaleString()}</span>
            {save && <span className="text-gray-500 ml-4">KILLS: {save.totalKills}</span>}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b" style={{ borderColor: 'rgba(0,150,255,0.2)' }}>
          {(['play', 'planets', 'achievements', 'shop'] as const).map(t => (
            <button key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3 text-xs font-mono tracking-widest uppercase transition-all ${
                tab === t
                  ? 'text-cyan-300 bg-cyan-900/20 border-b-2 border-cyan-400'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {t === 'play' ? '🚀 PLAY' : t === 'planets' ? '🌍 PLANETS' : t === 'achievements' ? '🏆 MEDALS' : '🛒 SHOP'}
            </button>
          ))}
        </div>

        <div className="p-6 overflow-y-auto flex-1"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#0af #001' }}
        >
          {/* PLAY TAB */}
          {tab === 'play' && (
            <div className="space-y-4">
              {/* Big start button */}
              <button
                onClick={() => onStart(0)}
                className="w-full py-5 rounded-xl font-mono font-black text-xl tracking-widest uppercase transition-all hover:scale-[1.02] active:scale-[0.98] group"
                style={{
                  background: 'linear-gradient(135deg, #0044ff, #0088ff, #00ccff)',
                  boxShadow: `0 0 ${20 + glowValue * 20}px rgba(0,150,255,0.5), inset 0 1px 0 rgba(255,255,255,0.2)`,
                  border: '1px solid rgba(0,200,255,0.5)',
                }}
              >
                <span className="group-hover:tracking-[0.2em] transition-all">
                  🚀 LAUNCH MISSION
                </span>
              </button>

              {/* Controls info */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'WASD / ↑↓←→', action: 'Move Ship' },
                  { key: 'SPACE / Z', action: 'Fire Weapons' },
                  { key: 'P / ESC', action: 'Pause Game' },
                  { key: 'M', action: 'Toggle Music' },
                ].map(({ key, action }) => (
                  <div key={key} className="flex items-center gap-2 text-xs font-mono"
                    style={{ color: 'rgba(150,200,255,0.7)' }}
                  >
                    <span className="px-2 py-1 rounded text-xs font-bold"
                      style={{
                        background: 'rgba(0,100,200,0.2)',
                        border: '1px solid rgba(0,150,255,0.3)',
                        color: '#88ccff',
                        minWidth: '80px',
                        textAlign: 'center',
                      }}
                    >
                      {key}
                    </span>
                    <span className="text-gray-500">{action}</span>
                  </div>
                ))}
              </div>

              {/* Feature bullets */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                {[
                  '7 Planets', '7 Boss Fights', '6 Weapons', 'High Score',
                  'Power-ups', 'Combo System', 'Upgrades', 'Achievements',
                ].map(f => (
                  <div key={f} className="flex items-center gap-1.5 text-xs font-mono text-gray-400">
                    <span className="text-cyan-500">◈</span> {f}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PLANETS TAB */}
          {tab === 'planets' && (
          <div className="space-y-3">
              {PLANETS.map((planet, i) => {
                const unlocked = i === 0 || (save?.levelsCompleted ?? []).includes(i - 1);
                const completed = (save?.levelsCompleted ?? []).includes(i);
                return (
                  <button
                    key={planet.id}
                    onClick={() => unlocked && setSelectedPlanet(i)}
                    disabled={!unlocked}
                    className={`w-full text-left p-4 rounded-xl font-mono transition-all border ${
                      selectedPlanet === i ? 'scale-[1.02]' : 'hover:scale-[1.01]'
                    } ${!unlocked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:brightness-110'}`}
                    style={{
                      background: selectedPlanet === i
                        ? `${planet.accentColor}22`
                        : 'rgba(0,20,40,0.8)',
                      borderColor: selectedPlanet === i ? planet.accentColor : 'rgba(0,100,200,0.2)',
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold" style={{ color: planet.accentColor }}>
                        {completed ? '✅ ' : unlocked ? '🔓 ' : '🔒 '}
                        {planet.name}
                      </span>
                      <span className="text-xs text-gray-500">PLANET {i + 1}</span>
                    </div>
                    <div className="text-xs text-gray-400">{planet.subtitle}</div>
                    <div className="text-xs text-gray-500 mt-1">{planet.description}</div>
                    {selectedPlanet === i && unlocked && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onStart(i); }}
                        className="mt-3 w-full py-2 rounded-lg text-sm font-bold uppercase tracking-widest transition-all hover:brightness-110"
                        style={{
                          background: planet.accentColor,
                          color: '#000',
                        }}
                      >
                        Launch → {planet.name}
                      </button>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* ACHIEVEMENTS TAB */}
          {tab === 'achievements' && (
            <div className="grid grid-cols-2 gap-2">
              {ACHIEVEMENTS.map(ach => {
                const unlocked = (save?.achievementsUnlocked ?? []).includes(ach.id);
                return (
                  <div key={ach.id}
                    className="p-3 rounded-lg font-mono text-xs border transition-all"
                    style={{
                      background: unlocked ? 'rgba(50,80,0,0.4)' : 'rgba(10,15,30,0.6)',
                      borderColor: unlocked ? 'rgba(100,200,0,0.4)' : 'rgba(50,70,100,0.3)',
                      opacity: unlocked ? 1 : 0.5,
                    }}
                  >
                    <div className="text-lg mb-1">{ach.icon}</div>
                    <div className="font-bold text-xs" style={{ color: unlocked ? '#88ff44' : '#667' }}>
                      {ach.name}
                    </div>
                    <div className="text-gray-500" style={{ fontSize: '10px' }}>{ach.desc}</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* SHOP TAB */}
          {tab === 'shop' && (
            <div className="grid grid-cols-2 gap-2 pb-4">
              {UPGRADES.map(upg => (
                <div key={upg.id}
                  className="p-3 rounded-xl text-left font-mono border"
                  style={{
                    background: 'rgba(0,20,40,0.5)',
                    borderColor: 'rgba(0,100,200,0.3)',
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xl">{upg.icon}</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-900/30 text-yellow-300 border border-yellow-500/30">
                      💰 {upg.cost}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-white">{upg.name}</div>
                  <div className="text-xs mt-0.5"
                    style={{
                      color: upg.type === 'weapon' ? '#ffaa44' : '#66aaff',
                      fontSize: '10px',
                    }}
                  >
                    {upg.type === 'weapon' ? '⚡ WEAPON' : '📊 STAT'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="text-center mt-4 text-xs font-mono text-gray-600 tracking-wider">
        STELLAR ASSAULT • BROWSER SPACE COMBAT • 2025
      </div>
    </div>
  );
}
