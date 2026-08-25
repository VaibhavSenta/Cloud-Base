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
          {/* Metallic Glass Gradient for Light Square */}
          <linearGradient id="nbSquareGradient" x1="85" y1="85" x2="415" y2="415" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#8e8e93" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.2" />
          </linearGradient>

          {/* Dark Glass Gradient for Interlocking Octagon */}
          <linearGradient id="nbOctagonGradient" x1="55" y1="55" x2="445" y2="445" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#3a3a3c" />
            <stop offset="50%" stopColor="#1c1c1e" />
            <stop offset="100%" stopColor="#000000" />
          </linearGradient>

          {/* Instagram Blue Glowing Center Pill Gradient */}
          <linearGradient id="nbPillGradient" x1="175" y1="215" x2="325" y2="285" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0095f6" />
            <stop offset="100%" stopColor="#0066cc" />
          </linearGradient>

          {/* Soft Glow Filter for Center Pill */}
          <filter id="bluePillGlow" x="145" y="185" width="210" height="130" filterUnits="userSpaceOnUse">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. Light Metallic Glass Square Outline */}
        <rect 
          x="85" 
          y="85" 
          width="330" 
          height="330" 
          rx="12"
          stroke="url(#nbSquareGradient)" 
          strokeWidth="16" 
          fill="none" 
        />

        {/* 2. Dark Interlocking Octagon Loop */}
        <polygon
          points="
            165,55 335,55 
            445,165 445,335 
            335,445 165,445 
            55,335 55,165
          "
          stroke="url(#nbOctagonGradient)"
          strokeWidth="22"
          strokeLinejoin="round"
          strokeLinecap="round"
          fill="none"
        />

        {/* 3. Glowing Instagram Blue Center Capsule Pill */}
        <g filter="url(#bluePillGlow)">
          <rect 
            x="175" 
            y="215" 
            width="150" 
            height="70" 
            rx="35" 
            fill="url(#nbPillGradient)" 
          />
        </g>
      </svg>
    </div>
  );
}
