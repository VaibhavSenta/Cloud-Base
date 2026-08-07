'use client';

import { useMemo } from 'react';
import Logo from '@/components/Logo/Logo';
import BottomBar from '@/components/BottomBar/BottomBar';
import styles from './page.module.css';

const ALL_EMOJIS = [
  '💬', '☁️', '🔒', '⚡', '🚀', '🌐', '📁',
  '🔗', '💎', '🛡️', '✨', '🎯', '📡', '🎨',
  '🔥', '💡', '🧩',
];

/**
 * Generates circle positions in concentric rings (Apple Watch dome style).
 * Center circle is biggest, outer rings progressively smaller.
 */
function generateClusterPositions() {
  const cx = 140; // center X of 280px container
  const cy = 140; // center Y of 280px container
  const positions = [];

  // Ring 0: Center circle (biggest)
  positions.push({ x: cx, y: cy, size: 62 });

  // Ring 1: 6 circles around center (medium)
  const ring1Radius = 66;
  const ring1Count = 6;
  const ring1Size = 52;
  for (let i = 0; i < ring1Count; i++) {
    const angle = (i * 360 / ring1Count) - 90; // start from top
    const rad = (angle * Math.PI) / 180;
    positions.push({
      x: cx + ring1Radius * Math.cos(rad),
      y: cy + ring1Radius * Math.sin(rad),
      size: ring1Size,
    });
  }

  // Ring 2: 10 circles on outer edge (smallest)
  const ring2Radius = 120;
  const ring2Count = 10;
  const ring2Size = 40;
  for (let i = 0; i < ring2Count; i++) {
    const angle = (i * 360 / ring2Count) - 90 + 18; // offset for stagger
    const rad = (angle * Math.PI) / 180;
    positions.push({
      x: cx + ring2Radius * Math.cos(rad),
      y: cy + ring2Radius * Math.sin(rad),
      size: ring2Size,
    });
  }

  return positions;
}

export default function UserPortalHome() {
  const clusterPositions = useMemo(() => generateClusterPositions(), []);

  return (
    <main className={styles.container}>
      {/* Rotating ribbon text background */}
      <div className={styles.ribbonWrapper}>
        <div className={styles.ribbonTrack}>
          <span className={styles.ribbonText}>
            NOTHING BOX&nbsp;&nbsp;NOTHING BOX&nbsp;&nbsp;NOTHING BOX&nbsp;&nbsp;NOTHING BOX&nbsp;&nbsp;NOTHING BOX&nbsp;&nbsp;NOTHING BOX&nbsp;&nbsp;
          </span>
          <span className={styles.ribbonText} aria-hidden="true">
            NOTHING BOX&nbsp;&nbsp;NOTHING BOX&nbsp;&nbsp;NOTHING BOX&nbsp;&nbsp;NOTHING BOX&nbsp;&nbsp;NOTHING BOX&nbsp;&nbsp;NOTHING BOX&nbsp;&nbsp;
          </span>
        </div>
        <div className={styles.ribbonTrackReverse}>
          <span className={styles.ribbonText}>
            NOTHING BOX&nbsp;&nbsp;NOTHING BOX&nbsp;&nbsp;NOTHING BOX&nbsp;&nbsp;NOTHING BOX&nbsp;&nbsp;NOTHING BOX&nbsp;&nbsp;NOTHING BOX&nbsp;&nbsp;
          </span>
          <span className={styles.ribbonText} aria-hidden="true">
            NOTHING BOX&nbsp;&nbsp;NOTHING BOX&nbsp;&nbsp;NOTHING BOX&nbsp;&nbsp;NOTHING BOX&nbsp;&nbsp;NOTHING BOX&nbsp;&nbsp;NOTHING BOX&nbsp;&nbsp;
          </span>
        </div>
        <div className={styles.ribbonTrack}>
          <span className={styles.ribbonText}>
            NOTHING BOX&nbsp;&nbsp;NOTHING BOX&nbsp;&nbsp;NOTHING BOX&nbsp;&nbsp;NOTHING BOX&nbsp;&nbsp;NOTHING BOX&nbsp;&nbsp;NOTHING BOX&nbsp;&nbsp;
          </span>
          <span className={styles.ribbonText} aria-hidden="true">
            NOTHING BOX&nbsp;&nbsp;NOTHING BOX&nbsp;&nbsp;NOTHING BOX&nbsp;&nbsp;NOTHING BOX&nbsp;&nbsp;NOTHING BOX&nbsp;&nbsp;NOTHING BOX&nbsp;&nbsp;
          </span>
        </div>
      </div>

      {/* Gradient overlay */}
      <div className={styles.ribbonOverlay} />

      {/* Main content */}
      <div className={styles.content}>
        <div className={styles.logoContainer}>
          <Logo forceVersion="full" />
        </div>

        <h2 className={styles.tagline}>
          Your workspace,{'\n'}everywhere
        </h2>

        {/* Apple Watch style emoji globe */}
        <div className={styles.emojiGlobe}>
          {clusterPositions.map((pos, index) => (
            <div
              key={index}
              className={styles.emojiCircle}
              style={{
                width: `${pos.size}px`,
                height: `${pos.size}px`,
                left: `${pos.x - pos.size / 2}px`,
                top: `${pos.y - pos.size / 2}px`,
                fontSize: `${pos.size * 0.5}px`,
                animationDelay: `${index * 0.2}s`,
                animationDuration: `${2.8 + (index % 5) * 0.4}s`,
              }}
            >
              <span className={styles.emoji}>
                {ALL_EMOJIS[index % ALL_EMOJIS.length]}
              </span>
            </div>
          ))}
        </div>

        <p className={styles.subtitle}>
          Chat, store, and collaborate — all in one place.
        </p>
      </div>

      <BottomBar />
    </main>
  );
}
