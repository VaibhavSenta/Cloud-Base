/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';
import useWindowSize from '../../hooks/useWindowSize';
import SidebarTablet from './Tablet/SidebarTablet';
import SidebarDesktop from './Desktop/SidebarDesktop';
import styles from './Sidebar.module.css';

/**
 * Universal Sidebar Wrapper (The Container Controller)
 */
const Sidebar = ({ user, isOpen, forceWidth }) => {
  const { width: windowWidth } = useWindowSize();
  const width = forceWidth || windowWidth;

  const renderVariant = () => {
    if (width < 768) return null;
    if (width >= 768 && width < 1024) return <SidebarTablet user={user} />;
    return <SidebarDesktop user={user} />;
  };

  const getWrapperClass = () => {
    let classes = [styles.sidebarWrapper];
    if (width >= 768 && width < 1024) {
      classes.push(styles.tabletSidebar);
      if (!isOpen) classes.push(styles.closed);
    } else {
      classes.push(styles.desktopSidebar);
    }
    return classes.join(' ');
  };

  if (width < 768) return null;

  return (
    <aside className={getWrapperClass()}>
      {renderVariant()}
    </aside>
  );
};

export default Sidebar;
