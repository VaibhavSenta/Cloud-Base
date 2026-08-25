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
          {/* High Contrast Bright Silver Gradient for Outer Octagon */}
          <linearGradient id="nbOctagonBright" x1="55" y1="55" x2="445" y2="445" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="60%" stopColor="#d1d1d6" />
            <stop offset="100%" stopColor="#8e8e93" />
          </linearGradient>

          {/* Secondary Light Grey Gradient for Square */}
          <linearGradient id="nbSquareBright" x1="85" y1="85" x2="415" y2="415" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#8e8e93" />
            <stop offset="50%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#aeaeb2" />
          </linearGradient>

          {/* Vivid Instagram Blue Gradient for Center Pill */}
          <linearGradient id="nbPillVivid" x1="170" y1="210" x2="330" y2="290" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0095f6" />
            <stop offset="100%" stopColor="#0077e6" />
          </linearGradient>

          {/* Sharp High Contrast Glow Filter */}
          <filter id="pillVividGlow" x="130" y="170" width="240" height="160" filterUnits="userSpaceOnUse">
            <feGaussianBlur stdDeviation="12" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. Bright Inner Square Outline */}
        <rect 
          x="85" 
          y="85" 
          width="330" 
          height="330" 
          rx="14"
          stroke="url(#nbSquareBright)" 
          strokeWidth="22" 
          fill="none" 
        />

        {/* 2. Bright Interlocking Octagon Loop */}
        <polygon
          points="
            165,55 335,55 
            445,165 445,335 
            335,445 165,445 
            55,335 55,165
          "
          stroke="url(#nbOctagonBright)"
          strokeWidth="28"
          strokeLinejoin="round"
          strokeLinecap="round"
          fill="none"
        />

        {/* 3. High-Contrast Vivid Instagram Blue Pill Capsule */}
        <g filter="url(#pillVividGlow)">
          <rect 
            x="170" 
            y="210" 
            width="160" 
            height="80" 
            rx="40" 
            fill="url(#nbPillVivid)" 
            stroke="#ffffff"
            strokeWidth="4"
          />
        </g>
      </svg>
    </div>
  );
}
