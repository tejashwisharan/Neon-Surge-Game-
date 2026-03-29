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
      <div className="absolute inset-0 pointer-events-none">
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
              <span className="text-4xl font-black tracking-tighter text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
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
                    className={`${i < lives ? 'text-red-500 fill-red-500' : 'text-white/10'} transition-colors duration-300`} 
                  />
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-[0.2em] text-magenta-400/60 font-mono">High Score</span>
            <div className="flex items-center gap-2">
              <Trophy size={14} className="text-yellow-400" />
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
              <button 
                onClick={() => setIsPaused(!isPaused)}
                className="pointer-events-auto p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors backdrop-blur-md"
              >
                {isPaused ? <PlayCircle size={24} /> : <Pause size={24} />}
              </button>
            </div>
            
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full">
                <Zap size={12} className="text-cyan-400 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">System Active</span>
              </div>
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
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-xl"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <h1 className="text-8xl font-black italic tracking-tighter text-white uppercase leading-none mb-2">
                NEON<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-magenta-500">SURGE</span>
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

              <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto opacity-40">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 rounded-full border border-white flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                  <span className="text-[10px] uppercase tracking-widest font-bold">Dodge</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 rounded-full border border-green-400 flex items-center justify-center">
                    <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse" />
                  </div>
                  <span className="text-[10px] uppercase tracking-widest font-bold">Collect</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 rounded-full border border-magenta-500 flex items-center justify-center">
                    <Zap size={16} className="text-magenta-500" />
                  </div>
                  <span className="text-[10px] uppercase tracking-widest font-bold">Surge</span>
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
