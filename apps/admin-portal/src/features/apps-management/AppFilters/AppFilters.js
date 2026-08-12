/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';

import React, { useState, useEffect } from 'react';
import AppFiltersDesktop from './AppFiltersDesktop';
import AppFiltersMobile from './AppFiltersMobile';

/**
 * AppFilters - Responsive Master Switch
 * Swaps between desktop chip-list and mobile dropdown menu
 */
const AppFilters = (props) => {
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
    return <AppFiltersMobile {...props} />;
  }

  return <AppFiltersDesktop {...props} />;
};

export default AppFilters;
