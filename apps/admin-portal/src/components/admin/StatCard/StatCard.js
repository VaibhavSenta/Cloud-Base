'use client';

import React, { useState, useEffect } from 'react';
import StatCardDesktop from './StatCardDesktop';
import StatCardMobile from './StatCardMobile';

/**
 * StatCard - Responsive Master Switch
 * Intelligently switches between Desktop and Mobile implementations
 */
const StatCard = (props) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check initial width
    const checkWidth = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkWidth();
    window.addEventListener('resize', checkWidth);
    
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  // Standard usage remains same, but implementation changes based on screen
  if (isMobile) {
    return <StatCardMobile {...props} />;
  }

  return <StatCardDesktop {...props} />;
};

export default StatCard;
