// ============================================================
// STELLAR ASSAULT — Main App
// ============================================================

import { useRef, useState, useCallback, useEffect } from 'react';
import type { GameState, GamePhase } from './game/types';
import { createInitialState, createMenuState } from './game/initialState';
import { CANVAS_WIDTH, CANVAS_HEIGHT, PLANETS, UPGRADES } from './game/constants';
import { useGameLoop, useKeyboard } from './game/useGameLoop';
import { startMusic, stopMusic, resumeAudioContext, toggleMute } from './game/audio';
import { MenuScreen } from './components/MenuScreen';
import { UpgradeShop } from './components/UpgradeShop';
import { GameOverScreen } from './components/GameOverScreen';
import { VictoryScreen } from './components/VictoryScreen';
import { PauseScreen } from './components/PauseScreen';




export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<GameState>(createMenuState());
  const [phase, setPhase] = useState<GamePhase>('menu');
  const [showShop, setShowShop] = useState(false);
  const [shopForPlanet, setShopForPlanet] = useState(-1);
  const [highScore, setHighScore] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(true);
  const touchRef = useRef<{ x: number; y: number; shooting: boolean }>({ x: 0, y: 0, shooting: false });

  // Load high score
  useEffect(() => {
    const s = stateRef.current;
    if (s.highScore < 2276100) {
      s.highScore = 2276100;
    }
    if (s.totalKills < 1461) {
      s.totalKills = 1461;
    }
    setHighScore(s.highScore);
  }, []);

  // Phase change handler
  const handlePhaseChange = useCallback((newPhase: GamePhase) => {
    setPhase(newPhase);
    if (newPhase === 'gameOver' || newPhase === 'victory') {
      setHighScore(stateRef.current.highScore);
    }
    if (newPhase === 'levelComplete') {
      // Show upgrade shop between planets
      setShopForPlanet(stateRef.current.planetIndex + 1);
      setShowShop(true);
    }
  }, []);

  const { start, stop } = useGameLoop(canvasRef, stateRef, handlePhaseChange);
  useKeyboard(stateRef);

  // Start the RAF loop immediately (always running for stars/menu animation)
  useEffect(() => {
    start();
    return () => stop();
  }, [start, stop]);

  // ── Game flow ──────────────────────────────────────────

  const startGame = useCallback((planetIndex = 0, carryOver?: Partial<GameState>) => {
    resumeAudioContext();
    const newState = createInitialState(planetIndex, carryOver);
    stateRef.current = newState;
    setPhase('playing');
    setShowShop(false);
    stopMusic();
    startMusic(110 + planetIndex * 10);
  }, []);

  const goToMenu = useCallback(() => {
    stateRef.current = createMenuState();
    setPhase('menu');
    setShowShop(false);
    stopMusic();
    startMusic(90);
  }, []);

  const handleRestart = useCallback(() => {
    const pi = stateRef.current.planetIndex;
    startGame(pi);
  }, [startGame]);

  const handleNextLevel = useCallback(() => {
    const state = stateRef.current;
    if (phase === 'victory') {
      // Replay from start
      startGame(0);
      return;
    }
    // Go to shop was triggered on levelComplete; if shop is closed, go to next planet
    const nextPlanet = state.planetIndex + 1;
    if (nextPlanet >= PLANETS.length) {
      startGame(0);
      return;
    }
    if (!showShop) {
      startGame(nextPlanet, {
        player: state.player,
        score: state.score,
        currency: state.currency,
        sessionTime: state.sessionTime,
      });
    }
  }, [phase, showShop, startGame]);

  const handleShopClose = useCallback(() => {
    setShowShop(false);
    const nextPlanet = shopForPlanet;
    const state = stateRef.current;
    startGame(nextPlanet, {
      player: state.player,
      score: state.score,
      currency: state.currency,
      sessionTime: state.sessionTime,
    });
  }, [shopForPlanet, startGame]);

  const handleUpgradeBuy = useCallback((upgradeId: string) => {
    const state = stateRef.current;
    const upg = UPGRADES.find(u => u.id === upgradeId);
    if (!upg || state.currency < upg.cost) return;
    state.currency -= upg.cost;

    if (upg.type === 'weapon') {
      const wId = (upg as any).weapon;
      if (!state.player.weaponsUnlocked.includes(wId)) state.player.weaponsUnlocked.push(wId);
      state.player.weapon = wId;
    } else {
      const stat = (upg as any).stat;
      switch (stat) {
        case 'shield':
          state.player.maxShields += 25;
          state.player.shields = Math.min(state.player.shields + 25, state.player.maxShields);
          break;
        case 'speed':
          state.player.speed = Math.min(state.player.speed + 0.8, 12);
          break;
        case 'hp':
          state.player.maxHp += 30;
          state.player.hp = Math.min(state.player.hp + 30, state.player.maxHp);
          break;
        case 'damage':
          state.player.damage += 5;
          break;
        case 'firerate':
          state.player.baseFireCooldown = Math.max(80, state.player.baseFireCooldown - 40);
          break;
      }
    }
  }, []);

  // Pause / unpause
  const handlePause = useCallback(() => {
    const state = stateRef.current;
    if (state.phase === 'playing' || state.phase === 'boss') {
      state.phase = 'paused';
      setPhase('paused');
    }
  }, []);

  const handleResume = useCallback(() => {
    const state = stateRef.current;
    if (state.phase === 'paused') {
      state.phase = 'playing';
      setPhase('playing');
    }
  }, []);

  // Fullscreen toggle (vendor-prefixed for robustness)
  const toggleFullscreen = useCallback(() => {
    const doc = document as any;
    const element = containerRef.current as any;
    if (!element) return;

    if (!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
      if (element.requestFullscreen) {
        element.requestFullscreen().catch((err: any) => console.error(err));
      } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
      }
    } else {
      if (doc.exitFullscreen) {
        doc.exitFullscreen().catch((err: any) => console.error(err));
      } else if (doc.mozCancelFullScreen) {
        doc.mozCancelFullScreen();
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen();
      } else if (doc.msExitFullscreen) {
        doc.msExitFullscreen();
      }
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const state = stateRef.current;
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        if (state.phase === 'playing' || state.phase === 'boss') handlePause();
        else if (state.phase === 'paused') handleResume();
      }
      if ((e.key === 'm' || e.key === 'M') && state.phase !== 'menu') {
        toggleMute();
      }
      if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handlePause, handleResume, toggleFullscreen]);

  // Start menu music
  useEffect(() => {
    startMusic(90);
  }, []);

  // ── Touch controls ─────────────────────────────────────

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    touchRef.current = {
      x: (touch.clientX - rect.left) * scaleX,
      y: (touch.clientY - rect.top) * scaleY,
      shooting: true,
    };
    stateRef.current.keys[' '] = true;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    const tx = (touch.clientX - rect.left) * scaleX;
    const ty = (touch.clientY - rect.top) * scaleY;
    const state = stateRef.current;

    // Move player toward touch
    const dx = tx - (state.player.x + state.player.width / 2);
    const dy = ty - (state.player.y + state.player.height / 2);
    if (Math.abs(dx) > 5) state.keys['ArrowLeft'] = dx < 0;
    if (Math.abs(dx) > 5) state.keys['ArrowRight'] = dx > 0;
    if (Math.abs(dy) > 5) state.keys['ArrowUp'] = dy < 0;
    if (Math.abs(dy) > 5) state.keys['ArrowDown'] = dy > 0;
    if (Math.abs(dx) <= 5) { state.keys['ArrowLeft'] = false; state.keys['ArrowRight'] = false; }
    if (Math.abs(dy) <= 5) { state.keys['ArrowUp'] = false; state.keys['ArrowDown'] = false; }

    touchRef.current = { x: tx, y: ty, shooting: true };
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const state = stateRef.current;
    state.keys['ArrowLeft'] = false;
    state.keys['ArrowRight'] = false;
    state.keys['ArrowUp'] = false;
    state.keys['ArrowDown'] = false;
    touchRef.current.shooting = false;
  }, []);

  // ── Mobile shoot button ───────────────────────────────



  // ── Canvas scale for responsive ────────────────────────

  const [canvasStyle, setCanvasStyle] = useState({ width: '100%', height: 'auto' });

  useEffect(() => {
    function updateScale() {
      setIsFullscreen(true);
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      setCanvasStyle({ width: `${Math.floor(vw)}px`, height: `${Math.floor(vh)}px` });
    }
    updateScale();
    window.addEventListener('resize', updateScale);
    document.addEventListener('fullscreenchange', updateScale);
    document.addEventListener('webkitfullscreenchange', updateScale);
    document.addEventListener('mozfullscreenchange', updateScale);
    document.addEventListener('MSFullscreenChange', updateScale);
    return () => {
      window.removeEventListener('resize', updateScale);
      document.removeEventListener('fullscreenchange', updateScale);
      document.removeEventListener('webkitfullscreenchange', updateScale);
      document.removeEventListener('mozfullscreenchange', updateScale);
      document.removeEventListener('MSFullscreenChange', updateScale);
    };
  }, []);

  const isPlaying = phase === 'playing' || phase === 'boss' || phase === 'bossWarning' || phase === 'waveComplete';

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center justify-center min-h-screen select-none"
      style={{
        background: 'radial-gradient(ellipse at center, #050a1a 0%, #020510 60%, #000005 100%)',
        userSelect: 'none',
      }}
    >
      {/* Game container */}
      <div className={`relative overflow-hidden ${isFullscreen ? '' : 'rounded-2xl'}`}
        style={{
          width: canvasStyle.width,
          height: canvasStyle.height,
          boxShadow: isFullscreen ? 'none' : '0 0 80px rgba(0,80,200,0.3), 0 0 4px rgba(0,150,255,0.2)',
          border: isFullscreen ? 'none' : '1px solid rgba(0,100,200,0.2)',
        }}
      >
        {/* Canvas */}
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          style={{ width: '100%', height: '100%', display: 'block' }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />

        {/* Menu overlay */}
        {phase === 'menu' && (
          <MenuScreen onStart={startGame} highScore={highScore} />
        )}

        {/* Pause overlay */}
        {phase === 'paused' && (
          <PauseScreen
            state={stateRef.current}
            onResume={handleResume}
            onMenu={goToMenu}
          />
        )}

        {/* Game Over */}
        {phase === 'gameOver' && (
          <GameOverScreen
            state={stateRef.current}
            onRestart={handleRestart}
            onMenu={goToMenu}
          />
        )}

        {/* Level Complete + shop */}
        {phase === 'levelComplete' && showShop && (
          <UpgradeShop
            state={stateRef.current}
            onBuy={handleUpgradeBuy}
            onClose={handleShopClose}
          />
        )}

        {/* Victory */}
        {phase === 'victory' && (
          <VictoryScreen
            state={stateRef.current}
            onNext={handleNextLevel}
            onMenu={goToMenu}
            isLevelComplete={false}
          />
        )}

        {/* Pause button (playing) */}
        {isPlaying && (
          <button
            onClick={handlePause}
            className="absolute top-2 right-2 w-8 h-8 rounded-lg text-xs font-mono font-bold transition-all hover:brightness-125 z-50"
            style={{
              background: 'rgba(0,0,0,0.6)',
              border: '1px solid rgba(0,150,255,0.3)',
              color: '#6699cc',
            }}
          >
            ⏸
          </button>
        )}

        {/* Fullscreen button */}
        <button
          onClick={toggleFullscreen}
          className="absolute top-2 right-12 w-8 h-8 rounded-lg text-sm font-mono font-bold transition-all hover:brightness-125 z-50 flex items-center justify-center"
          style={{
            background: 'rgba(0,0,0,0.6)',
            border: '1px solid rgba(0,150,255,0.3)',
            color: '#6699cc',
          }}
          title="Toggle Fullscreen (F)"
        >
          ⛶
        </button>
      </div>

      {/* Mobile controls */}
      {isPlaying && (
        <div className="flex items-center justify-between w-full px-4 mt-3 gap-2 md:hidden">
          {/* D-pad */}
          <div className="grid grid-cols-3 gap-1" style={{ gridTemplateRows: 'repeat(3, 1fr)' }}>
            {/* Up */}
            <div />
            <MobileBtn
              onStart={() => { stateRef.current.keys['ArrowUp'] = true; }}
              onEnd={() => { stateRef.current.keys['ArrowUp'] = false; }}
              label="▲"
            />
            <div />
            {/* Left */}
            <MobileBtn
              onStart={() => { stateRef.current.keys['ArrowLeft'] = true; }}
              onEnd={() => { stateRef.current.keys['ArrowLeft'] = false; }}
              label="◄"
            />
            <div className="w-10 h-10 rounded-lg opacity-30"
              style={{ background: 'rgba(0,100,200,0.1)', border: '1px solid rgba(0,100,200,0.2)' }}
            />
            {/* Right */}
            <MobileBtn
              onStart={() => { stateRef.current.keys['ArrowRight'] = true; }}
              onEnd={() => { stateRef.current.keys['ArrowRight'] = false; }}
              label="►"
            />
            <div />
            {/* Down */}
            <MobileBtn
              onStart={() => { stateRef.current.keys['ArrowDown'] = true; }}
              onEnd={() => { stateRef.current.keys['ArrowDown'] = false; }}
              label="▼"
            />
            <div />
          </div>

          {/* Fire button */}
          <button
            onTouchStart={(e) => { e.preventDefault(); stateRef.current.keys[' '] = true; }}
            onTouchEnd={(e) => { e.preventDefault(); stateRef.current.keys[' '] = false; }}
            className="w-20 h-20 rounded-full font-mono font-black text-2xl transition-all active:scale-95"
            style={{
              background: 'radial-gradient(circle, #004488, #002255)',
              border: '2px solid rgba(0,150,255,0.6)',
              boxShadow: '0 0 20px rgba(0,100,255,0.4)',
              color: '#00aaff',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            🔥
          </button>
        </div>
      )}

      {/* Bottom info bar */}
      <div className="mt-2 text-xs font-mono text-center"
        style={{ color: 'rgba(50,80,120,0.6)' }}
      >
        STELLAR ASSAULT • {isPlaying ? 'PRESS ESC TO PAUSE' : ''}
      </div>
    </div>
  );
}

// ── Mobile D-pad button ────────────────────────────────────

function MobileBtn({ onStart, onEnd, label }: { onStart: () => void; onEnd: () => void; label: string }) {
  return (
    <button
      onTouchStart={(e) => { e.preventDefault(); onStart(); }}
      onTouchEnd={(e) => { e.preventDefault(); onEnd(); }}
      onMouseDown={onStart}
      onMouseUp={onEnd}
      className="w-10 h-10 rounded-lg font-mono text-sm font-bold flex items-center justify-center transition-all active:scale-90"
      style={{
        background: 'rgba(0,30,80,0.8)',
        border: '1px solid rgba(0,100,200,0.4)',
        color: '#4488cc',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {label}
    </button>
  );
}
