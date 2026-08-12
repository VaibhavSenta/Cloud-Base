/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';

import React, { useState, useEffect } from 'react';
import SettingsItemDesktop from './SettingsItemDesktop';
import SettingsItemMobile from './SettingsItemMobile';

/**
 * SettingsItem - Responsive Master Switch for system settings
 */
const SettingsItem = (props) => {
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
    return <SettingsItemMobile {...props} />;
  }

  return <SettingsItemDesktop {...props} />;
};

export default SettingsItem;
