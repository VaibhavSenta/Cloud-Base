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
        <defs>
          <linearGradient id="nbWhiteGlow" x1="250" y1="50" x2="250" y2="400" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e5e5ea" />
          </linearGradient>
        </defs>

        {/* 1. Backmost Downward Triangle (Soft Smooth Rounded Dark Grey Outline) */}
        <path 
          d="M 230,445 Q 250,470 270,445 L 420,165 Q 435,140 410,140 L 90,140 Q 65,140 80,165 Z" 
          stroke="#48484a" 
          strokeWidth="20" 
          strokeLinejoin="round" 
          strokeLinecap="round" 
          fill="none" 
        />

        {/* 2. Middle Tilted Triangle (Soft Smooth Rounded Mid Grey Outline) */}
        <path 
          d="M 75,265 Q 55,280 75,295 L 375,435 Q 395,445 395,420 L 395,80 Q 395,55 375,65 Z" 
          stroke="#8e8e93" 
          strokeWidth="20" 
          strokeLinejoin="round" 
          strokeLinecap="round" 
          fill="none" 
        />

        {/* 3. Foremost Upward Triangle (Smooth Rounded Outer White Border & Fill) */}
        <path 
          d="M 230,75 Q 250,50 270,75 L 425,370 Q 440,395 415,395 L 85,395 Q 60,395 75,370 Z" 
          stroke="url(#nbWhiteGlow)" 
          strokeWidth="24" 
          strokeLinejoin="round" 
          strokeLinecap="round" 
          fill="#ffffff" 
        />

        {/* 4. Inner Fine Stitched Dotted Line (Sleek Thinner Stroke + Wider Gap) */}
        <path 
          d="M 235,115 Q 250,95 265,115 L 395,360 Q 405,378 385,378 L 115,378 Q 95,378 105,360 Z" 
          stroke="#55555e" 
          strokeWidth="5" 
          strokeDasharray="10 14"
          strokeLinejoin="round" 
          strokeLinecap="round" 
          fill="none" 
        />
      </svg>
    </div>
  );
}
