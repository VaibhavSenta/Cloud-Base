/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';
import useWindowSize from '../../hooks/useWindowSize';
import LayoutMobile from './Mobile/LayoutMobile';
import LayoutDesktop from './Desktop/LayoutDesktop';
import LayoutTablet from './Tablet/LayoutTablet';
import styles from './DashboardLayout.module.css';

/**
 * Universal Dashboard Layout Wrapper
 * @param {Object} user - The logged in user data
 */
const DashboardLayout = ({ children, user }) => {
  const { width } = useWindowSize();

  // Determine which layout to show based on width
  const renderLayout = () => {
    if (width < 768) {
      return <LayoutMobile user={user}>{children}</LayoutMobile>;
    }
    if (width >= 768 && width < 1024) {
      return <LayoutTablet user={user}>{children}</LayoutTablet>;
    }
    return <LayoutDesktop user={user}>{children}</LayoutDesktop>;
  };

  return (
    <div className={styles.container}>
      {renderLayout()}
    </div>
  );
};

export default DashboardLayout;
