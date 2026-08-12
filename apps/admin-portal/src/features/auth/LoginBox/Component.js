/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';

import React, { useState, useEffect } from 'react';
import LoginBoxDesktop from './Desktop/LoginBoxDesktop';
import LoginBoxMobile from './Mobile/LoginBoxMobile';

/**
 * LoginBox - Master Switch for Login Screen
 * Automatically toggles between Desktop and Mobile optimized cards
 */
const LoginBox = (props) => {
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
    return <LoginBoxMobile {...props} />;
  }

  return <LoginBoxDesktop {...props} />;
};

export default LoginBox;
