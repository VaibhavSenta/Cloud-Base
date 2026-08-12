/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';
import useWindowSize from '../../hooks/useWindowSize';
import PasswordOptionsMobile from './Mobile/PasswordOptionsMobile';
import PasswordOptionsTablet from './Tablet/PasswordOptionsTablet';
import PasswordOptionsDesktop from './Desktop/PasswordOptionsDesktop';

/**
 * Password Options Component Wrapper
 */
const PasswordOptions = () => {
  const { width } = useWindowSize();

  // If width is undefined (during server SSR/hydration), render Mobile view as fallback
  if (width === undefined) {
    return <PasswordOptionsMobile />;
  }

  if (width >= 1024) {
    return <PasswordOptionsDesktop />;
  }

  if (width >= 768) {
    return <PasswordOptionsTablet />;
  }

  return <PasswordOptionsMobile />;
};

export default PasswordOptions;
