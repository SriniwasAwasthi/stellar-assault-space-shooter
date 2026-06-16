// ============================================================
// STELLAR ASSAULT — Upgrade Shop (between waves/levels)
// ============================================================

import { useState } from 'react';
import { UPGRADES } from '../game/constants';
import type { GameState } from '../game/types';
import { playPowerUp } from '../game/audio';
import { getUnlockedWeapons } from '../game/entities';

// Ordered weapon tiers — matches planet progression
const WEAPON_ORDER = ['laser', 'spread', 'rapid', 'missile', 'plasma', 'beam'] as const;

interface UpgradeShopProps {
  state: GameState;
  onBuy: (upgradeId: string) => void;
  onClose: () => void;
}

export function UpgradeShop({ state, onBuy, onClose }: UpgradeShopProps) {
  const [bought, setBought] = useState<string[]>([]);
  const [message, setMessage] = useState('');

  // Allow purchasing weapons up to one tier beyond current planet (preview next level's weapon)
  const shopUnlockedWeapons = getUnlockedWeapons(Math.min(state.planetIndex + 1, WEAPON_ORDER.length - 1));

  const handleBuy = (upg: typeof UPGRADES[number]) => {
    if (state.currency < upg.cost) {
      setMessage('❌ Not enough credits!');
      setTimeout(() => setMessage(''), 1500);
      return;
    }
    if (bought.includes(upg.id)) {
      setMessage('⚡ Already purchased!');
      setTimeout(() => setMessage(''), 1500);
      return;
    }
    if (upg.type === 'weapon' && state.player.weaponsUnlocked.includes((upg as any).weapon)) {
      setMessage('🔱 Weapon already owned!');
      setTimeout(() => setMessage(''), 1500);
      return;
    }
    onBuy(upg.id);
    setBought(b => [...b, upg.id]);
    playPowerUp('weapon');
    setMessage(`✅ ${upg.name} equipped!`);
    setTimeout(() => setMessage(''), 2000);
  };

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center"
      style={{ background: 'rgba(0,5,20,0.92)' }}
    >
      {/* Scanlines */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.1) 3px, rgba(0,0,0,0.1) 6px)',
        }}
      />

      <div className="relative w-full max-w-xl mx-4 rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(2,8,25,0.98)',
          border: '2px solid rgba(0,200,100,0.4)',
          boxShadow: '0 0 60px rgba(0,180,100,0.2)',
        }}
      >
        {/* Header */}
        <div className="text-center py-5 px-4"
          style={{ background: 'linear-gradient(180deg, rgba(0,60,30,0.6) 0%, transparent 100%)' }}
        >
          <div className="text-xs font-mono tracking-[0.4em] text-green-400 mb-1">⚙️ MISSION DEBRIEF</div>
          <h2 className="text-3xl font-mono font-black"
            style={{
              background: 'linear-gradient(135deg, #00ff88, #00ffff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            UPGRADE STATION
          </h2>
          <div className="flex justify-center gap-6 mt-3 text-xs font-mono">
            <span className="text-yellow-300">💰 CREDITS: <strong>{state.currency}</strong></span>
            <span className="text-cyan-300">⭐ SCORE: <strong>{state.score.toLocaleString()}</strong></span>
            <span className="text-red-300">💀 KILLS: <strong>{state.kills}</strong></span>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className="text-center py-2 text-sm font-mono font-bold"
            style={{ background: 'rgba(0,100,50,0.3)', color: '#88ff88' }}
          >
            {message}
          </div>
        )}

        {/* Grid */}
        <div className="p-4 grid grid-cols-2 gap-2 max-h-80 overflow-y-auto"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#0a4 #000' }}
        >
          {UPGRADES.filter(upg => {
            // Weapon upgrades: only show weapons within current+1 planet tier
            if (upg.type === 'weapon') {
              return shopUnlockedWeapons.includes((upg as any).weapon);
            }
            return true; // stat upgrades always visible
          }).map(upg => {
            const canAfford = state.currency >= upg.cost;
            const isOwned = bought.includes(upg.id) ||
              (upg.type === 'weapon' && state.player.weaponsUnlocked.includes((upg as any).weapon));

            return (
              <button
                key={upg.id}
                onClick={() => handleBuy(upg)}
                disabled={!canAfford || isOwned}
                className={`p-3 rounded-xl text-left font-mono transition-all border ${
                  isOwned
                    ? 'opacity-60 cursor-not-allowed border-green-900'
                    : canAfford
                      ? 'hover:scale-[1.02] hover:brightness-110 cursor-pointer border-green-700'
                      : 'opacity-40 cursor-not-allowed border-gray-800'
                }`}
                style={{
                  background: isOwned
                    ? 'rgba(0,80,20,0.4)'
                    : canAfford
                      ? 'rgba(0,30,15,0.8)'
                      : 'rgba(10,10,20,0.6)',
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xl">{upg.icon}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    isOwned ? 'bg-green-900 text-green-300'
                    : canAfford ? 'bg-yellow-900 text-yellow-300'
                    : 'bg-gray-900 text-gray-500'
                  }`}>
                    {isOwned ? 'OWNED' : `💰 ${upg.cost}`}
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
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t" style={{ borderColor: 'rgba(0,150,100,0.2)' }}>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl font-mono font-black text-lg uppercase tracking-widest transition-all hover:scale-[1.01] active:scale-[0.99]"
            style={{
              background: 'linear-gradient(135deg, #004422, #008844)',
              border: '1px solid rgba(0,200,100,0.5)',
              color: '#00ff88',
              boxShadow: '0 0 20px rgba(0,180,80,0.3)',
            }}
          >
            🚀 CONTINUE MISSION
          </button>
        </div>
      </div>
    </div>
  );
}
