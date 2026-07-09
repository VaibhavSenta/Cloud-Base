'use client';

import React, { useState, useEffect } from 'react';
import ProfileIdentityDesktop from './Desktop/ProfileIdentityDesktop';
import ProfileIdentityMobile from './Mobile/ProfileIdentityMobile';

/**
 * ProfileIdentity - Master Switch for Admin Profile identity card
 */
const ProfileIdentity = (props) => {
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
    return <ProfileIdentityMobile {...props} />;
  }

  return <ProfileIdentityDesktop {...props} />;
};

export default ProfileIdentity;
