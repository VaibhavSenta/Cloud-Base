/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';

import React, { useState, useEffect } from 'react';
import LogFiltersDesktop from './LogFiltersDesktop';
import LogFiltersMobile from './LogFiltersMobile';

/**
 * LogFilters - Master Switch for Audit Logs page
 */
const LogFilters = (props) => {
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
    return <LogFiltersMobile {...props} />;
  }

  return <LogFiltersDesktop {...props} />;
};

export default LogFilters;
