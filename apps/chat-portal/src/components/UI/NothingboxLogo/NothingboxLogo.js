/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';

import styles from './NothingboxLogo.module.css';

export default function NothingboxLogo({ size = 28, className = '' }) {
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
          <linearGradient id="nbOctagonGradient" x1="50" y1="50" x2="450" y2="450" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0d0d0d" />
            <stop offset="45%" stopColor="#3a3a3c" />
            <stop offset="100%" stopColor="#8e8e93" />
          </linearGradient>
        </defs>

        {/* 1. Light Grey Outline Square */}
        <rect 
          x="85" 
          y="85" 
          width="330" 
          height="330" 
          rx="6"
          stroke="#d1d1d6" 
          strokeWidth="18" 
          fill="none" 
        />

        {/* 2. Outer Interlocking Octagon (Dark Gradient) */}
        <polygon
          points="
            165,55 335,55 
            445,165 445,335 
            335,445 165,445 
            55,335 55,165
          "
          stroke="url(#nbOctagonGradient)"
          strokeWidth="24"
          strokeLinejoin="round"
          strokeLinecap="round"
          fill="none"
        />

        {/* 3. Center Pill Capsule */}
        <rect 
          x="175" 
          y="215" 
          width="150" 
          height="70" 
          rx="35" 
          fill="#98989d" 
        />
      </svg>
    </div>
  );
}
