/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';

import React, { useState, useEffect } from 'react';
import ServiceCardDesktop from './ServiceCardDesktop';
import ServiceCardMobile from './ServiceCardMobile';

/**
 * ServiceCard - Responsive Master Switch for Service Hub nodes
 */
const ServiceCard = (props) => {
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
    return <ServiceCardMobile {...props} />;
  }

  return <ServiceCardDesktop {...props} />;
};

export default ServiceCard;
