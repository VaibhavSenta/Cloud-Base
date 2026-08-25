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
            <stop offset="100%" stopColor="#0055b3" />
          </linearGradient>

          <linearGradient id="nbWhiteGrad" x1="100" y1="50" x2="400" y2="450" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#d1d1d6" />
          </linearGradient>

          {/* Clip path for right triangle leg to create 3D interlock weave */}
          <clipPath id="rightTriangleWeave">
            <rect x="230" y="40" width="270" height="260" />
          </clipPath>
        </defs>

        {/* 1. Base Silver Triangle */}
        <polygon 
          points="250,45 440,415 60,415" 
          stroke="url(#nbWhiteGrad)" 
          strokeWidth="24" 
          strokeLinejoin="round" 
          strokeLinecap="round" 
          fill="none" 
        />

        {/* 2. Main Blue Octagon Loop (passes UNDER triangle's right leg, OVER triangle's bottom-left leg) */}
        <polygon
          points="
            170,85 330,85 
            430,185 430,345 
            330,425 170,425 
            70,345 70,185
          "
          stroke="url(#nbBlueGrad)"
          strokeWidth="24"
          strokeLinejoin="round"
          strokeLinecap="round"
          fill="none"
        />

        {/* 3. Woven Right Triangle Leg (passes OVER the Octagon to complete 3D interlock weave!) */}
        <polygon 
          points="250,45 440,415 60,415" 
          stroke="url(#nbWhiteGrad)" 
          strokeWidth="24" 
          strokeLinejoin="round" 
          strokeLinecap="round" 
          fill="none" 
          clipPath="url(#rightTriangleWeave)"
        />

        {/* 4. Center High-Contrast Capsule Pill */}
        <rect 
          x="175" 
          y="225" 
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
