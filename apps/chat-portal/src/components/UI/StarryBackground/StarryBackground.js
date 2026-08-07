'use client';

import { useEffect, useState, useMemo } from 'react';
import styles from './StarryBackground.module.css';

export default function StarryBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate coordinates once, mapping to percentage height
  const layers = useMemo(() => {
    const generateStars = (count, r) => {
      const list = [];
      for (let i = 0; i < count; i++) {
        list.push({
          id: i,
          x: Math.random() * 100, // percentage x
          y: Math.random() * 100, // percentage y
          r,
          strokeWidth: r > 4 ? 1.2 : 0.8,
          opacity: Math.random() * 0.4 + 0.3
        });
      }
      return list;
    };

    return [
      { id: 1, duration: 50, stars: generateStars(35, 2.5) }, // Small fast stars
      { id: 2, duration: 90, stars: generateStars(25, 4) },   // Medium speed stars
      { id: 3, duration: 140, stars: generateStars(15, 5.5) }  // Large slow stars
    ];
  }, []);

  if (!mounted) {
    return <div className={styles.container} />;
  }

  return (
    <div className={styles.container}>
      {layers.map((layer) => (
        <div
          key={layer.id}
          className={styles.layer}
          style={{
            animation: `${styles.scrollStars} ${layer.duration}s linear infinite`
          }}
        >
          <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible' }}>
            {layer.stars.map((star) => (
              <circle
                key={star.id}
                cx={`${star.x}%`}
                cy={`${star.y}%`}
                r={star.r}
                fill="none"
                stroke="rgba(255, 255, 255, 0.85)"
                strokeWidth={star.strokeWidth}
                opacity={star.opacity}
              />
            ))}
            {/* Duplicate stars shifted by 100vh to create a seamless looping vertical scroll */}
            {layer.stars.map((star) => (
              <circle
                key={`dup-${star.id}`}
                cx={`${star.x}%`}
                cy={`calc(${star.y}% + 100vh)`}
                r={star.r}
                fill="none"
                stroke="rgba(255, 255, 255, 0.85)"
                strokeWidth={star.strokeWidth}
                opacity={star.opacity}
              />
            ))}
          </svg>
        </div>
      ))}
    </div>
  );
}
