/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';

import useWindowSize from '@/hooks/useWindowSize';
import BottomBarMobile from './Mobile/BottomBarMobile';
import styles from './BottomBar.module.css';

/**
 * BottomBar Wrapper
 * 
 * Full-width fixed container on all devices.
 * Inner bar content gets responsive max-width constraints.
 * 
 * Pattern Rule: Every component MUST have a wrapper that handles
 * positioning/layout, and inner component handles content/styling.
 */
export default function BottomBar() {
  const { width } = useWindowSize();

  // Mobile-first priority: Currently rendering mobile bar always.
  // In future, if width > 768, could return Tablet/Desktop variants.
  const renderBar = () => {
    return <BottomBarMobile />;
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.innerContainer}>
        {renderBar()}
      </div>
    </div>
  );
}
