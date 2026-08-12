/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';

import React, { useState, useEffect } from 'react';
import InfraAlertDesktop from './InfraAlertDesktop';
import InfraAlertMobile from './InfraAlertMobile';

/**
 * InfraAlert - Responsive Master Switch
 * Swaps between desktop horizontal alert and mobile vertical card alert
 */
const InfraAlert = (props) => {
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
    return <InfraAlertMobile {...props} />;
  }

  return <InfraAlertDesktop {...props} />;
};

export default InfraAlert;
