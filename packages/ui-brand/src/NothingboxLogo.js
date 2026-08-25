/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';

import React from 'react';

export default function NothingboxLogo({ 
  size = 36, 
  className = '', 
  accentColor = '#0095f6', 
  style = {} 
}) {
  return (
    <div 
      className={className} 
      style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        flexShrink: 0,
        width: `${size}px`, 
        height: `${size}px`,
        ...style 
      }}
    >
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 500 500" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block', width: '100%', height: '100%', overflow: 'visible' }}
      >
        <defs>
          <linearGradient id="nbWhiteGlowBrand" x1="250" y1="50" x2="250" y2="400" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e5e5ea" />
          </linearGradient>
        </defs>

        {/* 1. Backmost Downward Triangle (Graphite Dark Grey Outline) */}
        <path 
          d="M 230,445 Q 250,470 270,445 L 420,165 Q 435,140 410,140 L 90,140 Q 65,140 80,165 Z" 
          stroke="#48484a" 
          strokeWidth="20" 
          strokeLinejoin="round" 
          strokeLinecap="round" 
          fill="none" 
        />

        {/* 2. Middle Tilted Triangle (Classic Mid Grey Outline) */}
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
          stroke="url(#nbWhiteGlowBrand)" 
          strokeWidth="24" 
          strokeLinejoin="round" 
          strokeLinecap="round" 
          fill="#ffffff" 
        />

        {/* 4. Solid Black Inset Outline Triangle inside White Triangle */}
        <path 
          d="M 233,100 Q 250,80 267,100 L 405,365 Q 415,382 393,382 L 107,382 Q 85,382 95,365 Z" 
          stroke="#000000" 
          strokeWidth="8" 
          strokeLinejoin="round" 
          strokeLinecap="round" 
          fill="none" 
        />

        {/* 5. Innermost Fine Stitched Dotted Contour Line */}
        <path 
          d="M 235,120 Q 250,102 265,120 L 388,355 Q 396,370 378,370 L 122,370 Q 104,370 112,355 Z" 
          stroke="#666666" 
          strokeWidth="4" 
          strokeDasharray="8 10"
          strokeLinejoin="round" 
          strokeLinecap="round" 
          fill="none" 
        />
      </svg>
    </div>
  );
}
