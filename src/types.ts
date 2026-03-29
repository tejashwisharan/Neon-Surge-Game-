export interface Point {
  x: number;
  y: number;
}

export interface Entity extends Point {
  radius: number;
  color: string;
}

export interface Player extends Entity {
  targetX: number;
  targetY: number;
  speed: number;
  surgeMode: boolean;
  surgeTimer: number;
}

export interface Enemy extends Entity {
  vx: number;
  vy: number;
  speed: number;
  type: 'chaser' | 'bouncer' | 'dasher';
}

export interface Particle extends Point {
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface Collectible extends Entity {
  type: 'energy' | 'shield' | 'slowmo';
  pulse: number;
}

export interface GameState {
  score: number;
  highScore: number;
  isGameOver: boolean;
  isPaused: boolean;
  level: number;
  multiplier: number;
  lives: number;
  maxLives: number;
  isInvincible: boolean;
  invincibilityTimer: number;
}
