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
          <linearGradient id="nbBlueGrad" x1="50" y1="50" x2="450" y2="450" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0095f6" />
            <stop offset="100%" stopColor="#0066cc" />
          </linearGradient>

          <linearGradient id="nbWhiteGrad" x1="100" y1="50" x2="400" y2="450" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#d1d1d6" />
          </linearGradient>

          {/* Clip path for top-right weaving segment */}
          <clipPath id="topRightWeave">
            <rect x="220" y="0" width="280" height="280" />
          </clipPath>
        </defs>

        {/* 1. Underlying Base: Light Silver Square */}
        <rect 
          x="85" 
          y="85" 
          width="330" 
          height="330" 
          rx="12"
          stroke="url(#nbWhiteGrad)" 
          strokeWidth="20" 
          fill="none" 
        />

        {/* 2. Main Blue Octagon Loop (passes under at bottom-left) */}
        <polygon
          points="
            165,55 335,55 
            445,165 445,335 
            335,445 165,445 
            55,335 55,165
          "
          stroke="url(#nbBlueGrad)"
          strokeWidth="24"
          strokeLinejoin="round"
          strokeLinecap="round"
          fill="none"
        />

        {/* 3. Woven Top-Right Square Segment (passes OVER the Octagon to create authentic 3D interlock!) */}
        <rect 
          x="85" 
          y="85" 
          width="330" 
          height="330" 
          rx="12"
          stroke="url(#nbWhiteGrad)" 
          strokeWidth="20" 
          fill="none" 
          clipPath="url(#topRightWeave)"
        />

        {/* 4. Center High-Contrast Capsule Pill */}
        <rect 
          x="175" 
          y="215" 
          width="150" 
          height="70" 
          rx="35" 
          fill="#ffffff" 
          stroke="#0095f6"
          strokeWidth="8"
        />
      </svg>
    </div>
  );
}
