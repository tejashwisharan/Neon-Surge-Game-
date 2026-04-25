import React, { useEffect, useRef, useState } from 'react';
import { Player, Enemy, Collectible, Particle, GameState } from '../types';

interface GameCanvasProps {
  onGameOver: (score: number) => void;
  onScoreUpdate: (score: number) => void;
  onLivesUpdate: (lives: number) => void;
  isPaused: boolean;
}

const NeonSurge: React.FC<GameCanvasProps> = ({ onGameOver, onScoreUpdate, onLivesUpdate, isPaused }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(null);
  const gameStateRef = useRef<GameState>({
    score: 0,
    highScore: 0,
    isGameOver: false,
    isPaused: false,
    level: 1,
    multiplier: 1,
    lives: 3,
    maxLives: 3,
    isInvincible: false,
    invincibilityTimer: 0,
  });

  const playerRef = useRef<Player>({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    radius: 12,
    color: '#00ffff',
    speed: 0.15,
    surgeMode: false,
    surgeTimer: 0,
  });

  const enemiesRef = useRef<Enemy[]>([]);
  const collectiblesRef = useRef<Collectible[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const lastSpawnTime = useRef<number>(0);
  const lastCollectibleTime = useRef<number>(0);
  const frameCount = useRef<number>(0);

  const audioCtx = useRef<AudioContext | null>(null);

  const playSound = (type: 'collect' | 'hit') => {
    if (!audioCtx.current) {
      audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    const ctx = audioCtx.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    const now = ctx.currentTime;
    
    if (type === 'collect') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'hit') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.2);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    }
  };

  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current?.parentElement) {
        const { clientWidth, clientHeight } = canvasRef.current.parentElement;
        setDimensions({ width: clientWidth, height: clientHeight });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    // Initialize player position
    playerRef.current.x = window.innerWidth / 2;
    playerRef.current.y = window.innerHeight / 2;
    playerRef.current.targetX = playerRef.current.x;
    playerRef.current.targetY = playerRef.current.y;

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const spawnEnemy = (width: number, height: number) => {
    const side = Math.floor(Math.random() * 4);
    let x = 0, y = 0;
    const level = gameStateRef.current.level;

    if (side === 0) { x = Math.random() * width; y = -50; }
    else if (side === 1) { x = width + 50; y = Math.random() * height; }
    else if (side === 2) { x = Math.random() * width; y = height + 50; }
    else { x = -50; y = Math.random() * height; }

    const angle = Math.atan2(playerRef.current.y - y, playerRef.current.x - x);
    const speed = (2 + Math.random() * 2) * (1 + level * 0.1);
    
    const types: Enemy['type'][] = ['bouncer', 'chaser', 'dasher'];
    const type = types[Math.floor(Math.random() * types.length)];

    enemiesRef.current.push({
      x, y,
      radius: 10 + Math.random() * 10,
      color: type === 'chaser' ? '#ff00ff' : type === 'dasher' ? '#ffff00' : '#ff4444',
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      speed,
      type
    });
  };

  const spawnCollectible = (width: number, height: number) => {
    collectiblesRef.current.push({
      x: 50 + Math.random() * (width - 100),
      y: 50 + Math.random() * (height - 100),
      radius: 8,
      color: '#00ff00',
      type: 'energy',
      pulse: 0
    });
  };

  const createExplosion = (x: number, y: number, color: string, count = 15) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 2;
      particlesRef.current.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 30 + Math.random() * 20,
        color,
        size: Math.random() * 3 + 1
      });
    }
  };

  const update = (time: number) => {
    if (isPaused || gameStateRef.current.isGameOver) return;

    const { width, height } = dimensions;
    const player = playerRef.current;

    // Player movement (smooth follow)
    player.x += (player.targetX - player.x) * player.speed;
    player.y += (player.targetY - player.y) * player.speed;

    // Surge mode
    if (player.surgeMode) {
      player.surgeTimer--;
      if (player.surgeTimer <= 0) player.surgeMode = false;
    }

    // Spawning
    const spawnRate = Math.max(200, 1000 - gameStateRef.current.level * 50);
    if (time - lastSpawnTime.current > spawnRate) {
      spawnEnemy(width, height);
      lastSpawnTime.current = time;
    }

    if (time - lastCollectibleTime.current > 3000) {
      spawnCollectible(width, height);
      lastCollectibleTime.current = time;
    }

    // Update invincibility
    if (gameStateRef.current.isInvincible) {
      gameStateRef.current.invincibilityTimer--;
      if (gameStateRef.current.invincibilityTimer <= 0) {
        gameStateRef.current.isInvincible = false;
      }
    }

    // Update enemies
    enemiesRef.current.forEach((enemy, index) => {
      if (enemy.type === 'chaser') {
        const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
        enemy.vx += Math.cos(angle) * 0.1;
        enemy.vy += Math.sin(angle) * 0.1;
        const mag = Math.sqrt(enemy.vx * enemy.vx + enemy.vy * enemy.vy);
        enemy.vx = (enemy.vx / mag) * enemy.speed;
        enemy.vy = (enemy.vy / mag) * enemy.speed;
      }

      enemy.x += enemy.vx;
      enemy.y += enemy.vy;

      // Collision with player
      const dx = enemy.x - player.x;
      const dy = enemy.y - player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < enemy.radius + player.radius) {
        if (player.surgeMode) {
          // Destroy enemy in surge mode
          createExplosion(enemy.x, enemy.y, enemy.color);
          enemiesRef.current.splice(index, 1);
          gameStateRef.current.score += 50 * gameStateRef.current.multiplier;
          onScoreUpdate(gameStateRef.current.score);
        } else if (!gameStateRef.current.isInvincible) {
          // Hit logic
          playSound('hit');
          gameStateRef.current.lives--;
          onLivesUpdate(gameStateRef.current.lives);
          createExplosion(player.x, player.y, '#ff0000', 20);
          
          if (gameStateRef.current.lives <= 0) {
            // Game Over
            gameStateRef.current.isGameOver = true;
            createExplosion(player.x, player.y, player.color, 40);
            onGameOver(gameStateRef.current.score);
          } else {
            // Temporary invincibility
            gameStateRef.current.isInvincible = true;
            gameStateRef.current.invincibilityTimer = 120; // 2 seconds
            // Push enemies away
            enemiesRef.current.forEach(e => {
              const ex = e.x - player.x;
              const ey = e.y - player.y;
              const edist = Math.sqrt(ex * ex + ey * ey);
              if (edist < 200) {
                e.vx = (ex / edist) * 10;
                e.vy = (ey / edist) * 10;
              }
            });
          }
        }
      }

      // Remove off-screen
      if (enemy.x < -100 || enemy.x > width + 100 || enemy.y < -100 || enemy.y > height + 100) {
        enemiesRef.current.splice(index, 1);
      }
    });

    // Update collectibles
    collectiblesRef.current.forEach((c, index) => {
      c.pulse += 0.1;
      const dx = c.x - player.x;
      const dy = c.y - player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < c.radius + player.radius) {
        playSound('collect');
        createExplosion(c.x, c.y, c.color, 20);
        collectiblesRef.current.splice(index, 1);
        
        player.surgeMode = true;
        player.surgeTimer = 300; // ~5 seconds at 60fps
        
        gameStateRef.current.score += 100 * gameStateRef.current.multiplier;
        gameStateRef.current.multiplier += 0.1;
        gameStateRef.current.level = Math.floor(gameStateRef.current.score / 1000) + 1;
        onScoreUpdate(gameStateRef.current.score);
      }
    });

    // Update particles
    particlesRef.current.forEach((p, index) => {
      p.x += p.vx;
      p.y += p.vy;
      p.life++;
      if (p.life > p.maxLife) particlesRef.current.splice(index, 1);
    });

    frameCount.current++;
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = dimensions;
    ctx.clearRect(0, 0, width, height);

    // Background glow
    const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width);
    gradient.addColorStop(0, '#0a0a12');
    gradient.addColorStop(1, '#000000');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Draw particles
    particlesRef.current.forEach(p => {
      const opacity = 1 - (p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = opacity;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Draw collectibles
    collectiblesRef.current.forEach(c => {
      const s = 1 + Math.sin(c.pulse) * 0.2;
      ctx.shadowBlur = 15;
      ctx.shadowColor = c.color;
      ctx.fillStyle = c.color;
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.radius * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Draw enemies
    enemiesRef.current.forEach(e => {
      ctx.save();
      ctx.translate(e.x, e.y);
      const angle = Math.atan2(e.vy, e.vx);
      ctx.rotate(angle);

      ctx.shadowBlur = 10;
      ctx.shadowColor = e.color;
      ctx.fillStyle = e.color;
      
      ctx.beginPath();
      // Arrow/Triangle shape pointing right (translated and rotated)
      ctx.moveTo(e.radius, 0);
      ctx.lineTo(-e.radius, -e.radius * 0.8);
      ctx.lineTo(-e.radius * 0.5, 0);
      ctx.lineTo(-e.radius, e.radius * 0.8);
      ctx.closePath();
      ctx.fill();
      
      ctx.restore();
      ctx.shadowBlur = 0;
    });

    // Draw player
    const player = playerRef.current;
    if (!gameStateRef.current.isGameOver) {
      // Blink if invincible
      if (gameStateRef.current.isInvincible && Math.floor(frameCount.current / 5) % 2 === 0) {
        ctx.globalAlpha = 0.3;
      }

      ctx.shadowBlur = player.surgeMode ? 30 : 20;
      ctx.shadowColor = player.surgeMode ? '#ffffff' : player.color;
      ctx.fillStyle = player.surgeMode ? '#ffffff' : player.color;
      
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
      ctx.fill();

      // Inner core
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.radius * 0.4, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.shadowBlur = 0;

      // Surge ring
      if (player.surgeMode) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.radius * 1.5 + Math.sin(frameCount.current * 0.2) * 5, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  };

  const loop = (time: number) => {
    update(time);
    draw();
    requestRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(loop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [dimensions, isPaused]);

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (isPaused || gameStateRef.current.isGameOver) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    playerRef.current.targetX = clientX - rect.left;
    playerRef.current.targetY = clientY - rect.top;
  };

  return (
    <canvas
      ref={canvasRef}
      width={dimensions.width}
      height={dimensions.height}
      onMouseMove={handleMouseMove}
      onTouchMove={handleMouseMove}
      className="w-full h-full cursor-none block bg-black"
    />
  );
};

export default NeonSurge;
