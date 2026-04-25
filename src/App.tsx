/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, RotateCcw, Trophy, Pause, PlayCircle, Zap, ShieldAlert, Heart } from 'lucide-react';
import GameCanvas from './components/GameCanvas';

export default function App() {
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'GAMEOVER'>('START');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('neon-surge-highscore');
    if (saved) setHighScore(parseInt(saved, 10));
  }, []);

  const handleGameOver = useCallback((finalScore: number) => {
    setGameState('GAMEOVER');
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem('neon-surge-highscore', finalScore.toString());
    }
  }, [highScore]);

  const startGame = () => {
    setScore(0);
    setLives(3);
    setGameState('PLAYING');
    setIsPaused(false);
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-sans text-white select-none">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="nebula opacity-30" />
        <div className="galactic-dust" />
        <div className="distant-galaxies" />
        <div className="starfield">
          <div className="star-layer stars-1" />
          <div className="star-layer stars-2" />
          <div className="star-layer stars-3" />
        </div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.05)_0%,transparent_70%)]" />
      </div>

      {/* Game Canvas */}
      {gameState === 'PLAYING' && (
        <GameCanvas 
          onGameOver={handleGameOver} 
          onScoreUpdate={setScore}
          onLivesUpdate={setLives}
          isPaused={isPaused}
        />
      )}

      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none flex flex-col">
        {/* Header */}
        <div className="p-6 flex justify-between items-start">
          <div className="flex gap-8">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-[0.2em] text-cyan-400/60 font-mono">Score</span>
              <span className="text-4xl font-black tracking-tighter text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                {score.toLocaleString()}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-[0.2em] text-red-400/60 font-mono">Integrity</span>
              <div className="flex gap-1 mt-1">
                {[...Array(3)].map((_, i) => (
                  <Heart 
                    key={i} 
                    size={20} 
                    className={`${i < lives ? 'text-red-500 fill-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'text-white/10'} transition-colors duration-300`} 
                  />
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-[0.2em] text-magenta-400/60 font-mono">High Score</span>
            <div className="flex items-center gap-2">
              <Trophy size={14} className="text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]" />
              <span className="text-xl font-bold tracking-tight text-white/80">
                {highScore.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* HUD Elements */}
        {gameState === 'PLAYING' && (
          <div className="mt-auto p-6 flex justify-between items-end">
            <div className="flex gap-4">
              {/* Removed Pause Button as requested */}
            </div>
          </div>
        )}
      </div>

      {/* Screens */}
      <AnimatePresence>
        {gameState === 'START' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <h1 className="text-8xl font-black italic tracking-tighter text-white uppercase leading-[0.8] mb-6">
                <span className="block drop-shadow-[0_0_30px_rgba(34,211,238,0.3)]">NEON</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-magenta-500 drop-shadow-[0_0_20px_rgba(217,70,239,0.4)] pb-2 pr-2">SURGE</span>
              </h1>
              <p className="text-cyan-400/60 font-mono text-sm tracking-[0.3em] uppercase mb-12">
                Survival Protocol Initiated
              </p>
              
              <div className="flex flex-col items-center gap-4">
                <button 
                  onClick={startGame}
                  className="group relative px-12 py-4 bg-white text-black font-black uppercase tracking-widest text-xl hover:scale-105 transition-transform active:scale-95"
                >
                  <div className="absolute -inset-1 bg-cyan-400 blur opacity-30 group-hover:opacity-60 transition-opacity" />
                  <span className="relative flex items-center gap-3">
                    <Play size={24} fill="currentColor" />
                    Start Mission
                  </span>
                </button>
              </div>

              <div className="mt-16 grid grid-cols-2 gap-12 max-w-lg mx-auto">
                <div className="flex flex-col items-center gap-3">
                  <div className="relative w-12 h-12 flex items-center justify-center">
                    <div className="absolute inset-0 bg-red-500/20 rounded-full blur-md animate-pulse" />
                    <div 
                      className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[16px] border-b-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)] transform rotate-45" 
                    />
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs uppercase tracking-[0.2em] font-black text-red-500">AVOID</span>
                    <span className="text-[8px] uppercase tracking-widest text-white/40">Hostile Fragments</span>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <div className="relative w-12 h-12 flex items-center justify-center">
                    <div className="absolute inset-0 bg-green-500/20 rounded-full blur-md animate-pulse" />
                    <div className="w-6 h-6 bg-green-400 rounded-full border-2 border-white/50 shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs uppercase tracking-[0.2em] font-black text-green-400">COLLECT</span>
                    <span className="text-[8px] uppercase tracking-widest text-white/40">Energy Cores</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {gameState === 'GAMEOVER' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-red-950/40 backdrop-blur-2xl"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center p-12 border border-white/10 bg-black/60 rounded-3xl"
            >
              <ShieldAlert size={64} className="text-red-500 mx-auto mb-6 animate-bounce" />
              <h2 className="text-6xl font-black italic tracking-tighter text-white uppercase mb-2">
                CRITICAL<br />FAILURE
              </h2>
              <p className="text-red-400/60 font-mono text-sm tracking-[0.3em] uppercase mb-8">
                Core Integrity Compromised
              </p>

              <div className="flex flex-col gap-2 mb-12">
                <span className="text-white/40 uppercase text-[10px] tracking-widest font-bold">Final Score</span>
                <span className="text-7xl font-black text-white">{score.toLocaleString()}</span>
              </div>
              
              <div className="flex gap-4 justify-center">
                <button 
                  onClick={startGame}
                  className="px-8 py-4 bg-white text-black font-black uppercase tracking-widest flex items-center gap-2 hover:bg-cyan-400 transition-colors"
                >
                  <RotateCcw size={20} />
                  Retry
                </button>
                <button 
                  onClick={() => setGameState('START')}
                  className="px-8 py-4 bg-transparent border border-white/20 text-white font-black uppercase tracking-widest hover:bg-white/10 transition-colors"
                >
                  Menu
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {isPaused && gameState === 'PLAYING' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <div className="text-center">
              <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase mb-8">
                PAUSED
              </h2>
              <button 
                onClick={() => setIsPaused(false)}
                className="p-6 rounded-full bg-cyan-500 text-black hover:scale-110 transition-transform"
              >
                <Play size={48} fill="currentColor" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
