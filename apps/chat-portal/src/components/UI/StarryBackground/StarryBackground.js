'use client';

import { useEffect, useState, useMemo } from 'react';
import styles from './StarryBackground.module.css';

export default function StarryBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate random stars once on the client side
  const stars = useMemo(() => {
    const list = [];
    for (let i = 0; i < 120; i++) {
      // Vary sizes to create depth: small, medium, and slightly larger unfilled circles
      const r = Math.random() < 0.6 ? 2.5 : Math.random() < 0.85 ? 4 : 5.5;
      list.push({
        id: i,
        x: Math.random() * 100, // percentage x
        y: Math.random() * 100, // percentage y
        r,
        strokeWidth: r > 4 ? 1.2 : 0.8,
        opacity: Math.random() * 0.4 + 0.3,
        duration: Math.random() * 4 + 3 // pulse duration in seconds
      });
    }
    return list;
  }, []);

  if (!mounted) {
    return <div className={styles.container} />;
  }

  return (
    <div className={styles.container}>
      <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
        <style>{`
          @keyframes twinkle {
            0%, 100% { opacity: 0.25; transform: scale(0.96); }
            50% { opacity: 0.75; transform: scale(1.04); }
          }
        `}</style>
        {stars.map((star) => (
          <circle
            key={star.id}
            cx={`${star.x}%`}
            cy={`${star.y}%`}
            r={star.r}
            fill="none"
            stroke="rgba(255, 255, 255, 0.85)"
            strokeWidth={star.strokeWidth}
            opacity={star.opacity}
            style={{
              transformOrigin: `${star.x}% ${star.y}%`,
              animation: `twinkle ${star.duration}s ease-in-out infinite`
            }}
          />
        ))}
      </svg>
    </div>
  );
}
