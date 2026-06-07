'use client';

import React, { useState, useEffect } from 'react';
import AppCardDesktop from './AppCardDesktop';
import AppCardMobile from './AppCardMobile';

/**
 * AppCard - Master Switch for /apps grid
 */
const AppCard = (props) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkWidth = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  if (isMobile) {
    return <AppCardMobile {...props} />;
  }

  return <AppCardDesktop {...props} />;
};

export default AppCard;
