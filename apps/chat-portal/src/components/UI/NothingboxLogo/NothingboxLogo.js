/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';

import styles from './NothingboxLogo.module.css';

export default function NothingboxLogo({ size = 36, className = '' }) {
  return (
    <div className={`${styles.logoWrapper} ${className}`} style={{ width: `${size}px`, height: `${size}px` }}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 500 500" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={styles.logoSvg}
      >
        {/* 1. Backmost Triangle 1: Pointing DOWN (Dark Grey Outline) */}
        <polygon 
          points="250,460 70,140 430,140" 
          stroke="#55555e" 
          strokeWidth="18" 
          strokeLinejoin="round" 
          strokeLinecap="round" 
          fill="none" 
        />

        {/* 2. Middle Triangle 2: Rotated / Tilted (Mid Grey Outline) */}
        <polygon 
          points="60,280 390,60 390,440" 
          stroke="#8e8e93" 
          strokeWidth="18" 
          strokeLinejoin="round" 
          strokeLinecap="round" 
          fill="none" 
        />

        {/* 3. Foremost Main Triangle: Pointing UP (White Outer Border & White Fill) */}
        <polygon 
          points="250,60 440,390 60,390" 
          stroke="#ffffff" 
          strokeWidth="24" 
          strokeLinejoin="round" 
          strokeLinecap="round" 
          fill="#ffffff" 
        />

        {/* 4. Inner Stitched Dashed Line inside Main Triangle */}
        <polygon 
          points="250,105 405,365 95,365" 
          stroke="#666666" 
          strokeWidth="8" 
          strokeDasharray="12 10"
          strokeLinejoin="round" 
          strokeLinecap="round" 
          fill="none" 
        />
      </svg>
    </div>
  );
}
