/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';
import styles from './Card3D.module.css';

/**
 * Reusable 3D Flipping Card Component
 * Handles the 3D transforms, card front/back visibility, and responsive perspective container.
 */
export default function Card3D({ isFlipped, frontContent, backContent }) {
  return (
    <div className={styles.card3DWrapper}>
      <div className={`${styles.card3DInner} ${isFlipped ? styles.flipped : ''}`}>
        
        {/* FRONT FACE */}
        <div className={styles.cardFront}>
          {frontContent}
        </div>

        {/* BACK FACE */}
        <div className={styles.cardBack}>
          {backContent}
        </div>

      </div>
    </div>
  );
}
