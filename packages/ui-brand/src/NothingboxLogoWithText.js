/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';

import React from 'react';
import NothingboxLogo from './NothingboxLogo';

export default function NothingboxLogoWithText({ 
  size = 32, 
  title = 'Nothingbox', 
  subtitle = '', 
  layout = 'horizontal', // 'horizontal' | 'vertical'
  textColor = '#ffffff', 
  className = '',
  style = {} 
}) {
  const isHorizontal = layout === 'horizontal';

  return (
    <div 
      className={className} 
      style={{ 
        display: 'inline-flex', 
        flexDirection: isHorizontal ? 'row' : 'column',
        alignItems: 'center', 
        gap: isHorizontal ? '10px' : '6px',
        ...style 
      }}
    >
      <NothingboxLogo size={size} />
      
      <div style={{ display: 'flex', flexDirection: 'column', textAlign: isHorizontal ? 'left' : 'center' }}>
        <span 
          style={{ 
            color: textColor, 
            fontSize: `${size * 0.55}px`, 
            fontWeight: 700, 
            letterSpacing: '-0.02em',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}
        >
          {title}
        </span>
        {subtitle && (
          <span 
            style={{ 
              color: '#8e8e93', 
              fontSize: `${size * 0.35}px`, 
              fontWeight: 500,
              letterSpacing: '0.02em' 
            }}
          >
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}
