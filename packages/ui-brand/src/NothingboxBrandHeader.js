/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';

import React from 'react';
import NothingboxLogoWithText from './NothingboxLogoWithText';

export default function NothingboxBrandHeader({ 
  appName = 'Chat', 
  logoSize = 28, 
  onClick = null,
  className = '',
  style = {} 
}) {
  return (
    <div 
      className={className} 
      onClick={onClick}
      style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        padding: '6px 14px 6px 10px', 
        background: 'rgba(255, 255, 255, 0.05)', 
        border: '1px solid rgba(255, 255, 255, 0.1)', 
        borderRadius: '2rem', 
        backdropFilter: 'blur(20px)',
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
        ...style 
      }}
    >
      <NothingboxLogoWithText 
        size={logoSize} 
        title="Nothingbox" 
        subtitle={appName} 
        layout="horizontal" 
      />
    </div>
  );
}
