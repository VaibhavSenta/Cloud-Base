'use client';

import React, { useState, useEffect } from 'react';
import UserFiltersDesktop from './UserFiltersDesktop';
import UserFiltersMobile from './UserFiltersMobile';

/**
 * UserFilters - Responsive Master Switch for User Management page
 */
const UserFilters = (props) => {
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
    return <UserFiltersMobile {...props} />;
  }

  return <UserFiltersDesktop {...props} />;
};

export default UserFilters;
