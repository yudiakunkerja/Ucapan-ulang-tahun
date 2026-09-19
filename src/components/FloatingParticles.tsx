import React, { useMemo } from 'react';
import { motion } from 'motion/react';

interface FloatingParticlesProps {
  type: 'hearts' | 'confetti' | 'stars' | 'sparkles';
  count?: number;
}

export const FloatingParticles: React.FC<FloatingParticlesProps> = ({ type, count = 22 }) => {
  const particles = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: Math.random() * 16 + 12,
      duration: Math.random() * 7 + 8,
      delay: Math.random() * 5,
      sway: Math.random() * 40 - 20,
      rotate: Math.random() * 360,
    }));
  }, [count]);

  const renderIcon = (index: number) => {
    switch (type) {
      case 'hearts': {
        const hearts = ['❤️', '💖', '💕', '💗', '✨', '🌹'];
        return hearts[index % hearts.length];
      }
      case 'confetti': {
        const confettis = ['🎉', '🎊', '🎈', '⭐', '✨', '🎂'];
        return confettis[index % confettis.length];
      }
      case 'stars': {
        const stars = ['✨', '⭐', '🌟', '💫', '💛', '🌸'];
        return stars[index % stars.length];
      }
      case 'sparkles':
      default: {
        const sparkles = ['✨', '🥂', '💎', '⭐', '🌟', '🔷'];
        return sparkles[index % sparkles.length];
      }
    }
  };

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute select-none opacity-40 will-change-transform"
          style={{
            left: `${p.x}%`,
            bottom: '-10%',
            fontSize: `${p.size}px`,
          }}
          animate={{
            y: ['0vh', '-120vh'],
            x: [`0px`, `${p.sway}px`, `0px`],
            rotate: [0, p.rotate, p.rotate * 2],
            opacity: [0, 0.7, 0.7, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          {renderIcon(p.id)}
        </motion.div>
      ))}
    </div>
  );
};
