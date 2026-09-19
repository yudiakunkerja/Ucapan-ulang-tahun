import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles } from 'lucide-react';

interface FireworkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
  size: number;
  decay: number;
  gravity: number;
  friction: number;
  sparkle: boolean;
}

interface Rocket {
  x: number;
  y: number;
  targetY: number;
  vy: number;
  color: string;
  trail: { x: number; y: number; alpha: number }[];
}

interface FireworksCelebrationProps {
  active?: boolean;
  intensity?: 'medium' | 'high';
  onExplode?: () => void;
}

const FIREWORK_COLORS = [
  '#f43f5e', // Rose
  '#fbbf24', // Amber / Gold
  '#a855f7', // Purple
  '#38bdf8', // Sky Blue
  '#ec4899', // Pink
  '#34d399', // Emerald
  '#f97316', // Orange
  '#ffffff', // White Sparkle
];

export const FireworksCelebration: React.FC<FireworksCelebrationProps> = ({
  active = true,
  intensity = 'high',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const particlesRef = useRef<FireworkParticle[]>([]);
  const rocketsRef = useRef<Rocket[]>([]);
  const lastLaunchRef = useRef<number>(0);
  const [isFiringActive, setIsFiringActive] = useState(active);

  // Trigger grand canvas-confetti fireworks burst
  const triggerConfettiFireworks = () => {
    const duration = 4 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 120 };

    const interval: any = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }
      const particleCount = 50 * (timeLeft / duration);

      // Launch from both sides
      confetti({
        ...defaults,
        particleCount,
        origin: { x: 0.1 + Math.random() * 0.2, y: Math.random() - 0.2 },
        colors: ['#f43f5e', '#fbbf24', '#a855f7', '#38bdf8', '#34d399'],
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: 0.7 + Math.random() * 0.2, y: Math.random() - 0.2 },
        colors: ['#ec4899', '#f97316', '#38bdf8', '#fbbf24', '#ffffff'],
      });
    }, 280);
  };

  useEffect(() => {
    if (active) {
      setIsFiringActive(true);
      triggerConfettiFireworks();
    }
  }, [active]);

  // Launch a new rocket
  const launchRocket = (targetX?: number, targetY?: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const startX = targetX !== undefined ? targetX : Math.random() * (canvas.width * 0.8) + canvas.width * 0.1;
    const endY = targetY !== undefined ? targetY : Math.random() * (canvas.height * 0.45) + canvas.height * 0.1;
    const color = FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)];

    rocketsRef.current.push({
      x: startX,
      y: canvas.height,
      targetY: endY,
      vy: -1 * (Math.random() * 3 + 9),
      color,
      trail: [],
    });
  };

  // Explode rocket into a cluster of particles
  const explodeRocket = (x: number, y: number, color: string) => {
    const particleCount = intensity === 'high' ? 85 : 50;
    const baseColor = color;
    const secondaryColor = FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)];

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.2;
      const speed = Math.random() * 5 + 2;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        color: Math.random() > 0.4 ? baseColor : secondaryColor,
        size: Math.random() * 2.8 + 1.2,
        decay: Math.random() * 0.018 + 0.012,
        gravity: 0.14,
        friction: 0.95,
        sparkle: Math.random() > 0.5,
      });
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    // Main animation loop
    const render = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Auto-launch rockets periodically if firing active
      if (isFiringActive && time - lastLaunchRef.current > (intensity === 'high' ? 700 : 1200)) {
        launchRocket();
        lastLaunchRef.current = time;
      }

      // 1. Update & Render Rockets
      for (let i = rocketsRef.current.length - 1; i >= 0; i--) {
        const rocket = rocketsRef.current[i];
        rocket.y += rocket.vy;
        rocket.trail.push({ x: rocket.x, y: rocket.y, alpha: 1 });

        if (rocket.trail.length > 8) {
          rocket.trail.shift();
        }

        // Draw rocket trail
        ctx.beginPath();
        for (let t = 0; t < rocket.trail.length; t++) {
          const pt = rocket.trail[t];
          ctx.strokeStyle = rocket.color;
          ctx.globalAlpha = (t / rocket.trail.length) * 0.7;
          ctx.lineWidth = 2.5;
          if (t === 0) {
            ctx.moveTo(pt.x, pt.y);
          } else {
            ctx.lineTo(pt.x, pt.y);
          }
        }
        ctx.stroke();

        // Draw rocket head
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(rocket.x, rocket.y, 2, 0, Math.PI * 2);
        ctx.fill();

        // Check if reached target height
        if (rocket.y <= rocket.targetY || rocket.vy >= -1) {
          explodeRocket(rocket.x, rocket.y, rocket.color);
          rocketsRef.current.splice(i, 1);
        }
      }

      // 2. Update & Render Particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.vx *= p.friction;
        p.vy *= p.friction;
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.sparkle && Math.random() > 0.4 ? p.alpha * 0.4 : p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 6;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isFiringActive, intensity]);

  // Click on screen to launch firework at that location
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    launchRocket(e.clientX, e.clientY);
  };

  return (
    <div
      onClick={handleCanvasClick}
      className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />
    </div>
  );
};
