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
          {/* Vivid Instagram Blue Gradient */}
          <linearGradient id="nbBlueGrad" x1="50" y1="50" x2="450" y2="450" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0095f6" />
            <stop offset="100%" stopColor="#0055b3" />
          </linearGradient>

          {/* Crisp Pure White Silver Gradient */}
          <linearGradient id="nbWhiteGrad" x1="100" y1="50" x2="400" y2="450" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#d1d1d6" />
          </linearGradient>
        </defs>

        {/* 1. Interlocking Sharp Triangle (White Silver) */}
        <polygon 
          points="250,50 440,410 60,410" 
          stroke="url(#nbWhiteGrad)" 
          strokeWidth="32" 
          strokeLinejoin="round" 
          strokeLinecap="round" 
          fill="none" 
        />

        {/* 2. Interlocking Octagon Loop (Instagram Blue Accent) */}
        <polygon
          points="
            170,90 330,90 
            430,190 430,350 
            330,430 170,430 
            70,350 70,190
          "
          stroke="url(#nbBlueGrad)"
          strokeWidth="28"
          strokeLinejoin="round"
          strokeLinecap="round"
          fill="none"
        />

        {/* 3. Center Solid High-Contrast Pill Capsule */}
        <rect 
          x="175" 
          y="225" 
          width="150" 
          height="70" 
          rx="35" 
          fill="#ffffff" 
          stroke="#0095f6"
          strokeWidth="10"
        />
      </svg>
    </div>
  );
}
