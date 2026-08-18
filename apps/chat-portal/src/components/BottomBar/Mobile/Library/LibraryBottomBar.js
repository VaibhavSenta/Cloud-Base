/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './LibraryBottomBar.module.css';
import { triggerHaptic } from '@/utils/haptics';

export default function LibraryBottomBar({ 
  activeTab, 
  setActiveTab, 
  profile, 
  onSearchClick,
  hasChatUpdate = false,
  hasGroupsUpdate = false,
  hasFriendsUpdate = false
}) {
  const avatarUrl = profile?.avatarUrl;
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const tabsRef = useRef({});

  const handleTabClick = (tabName) => {
    triggerHaptic.selection();
    if (setActiveTab) setActiveTab(tabName);
  };

  const handleSearchClick = () => {
    triggerHaptic.selection();
    if (onSearchClick) onSearchClick();
  };

  // Map settings or profile tab safety check
  const currentTab = activeTab === 'settings' || activeTab === 'profile' ? 'settings' : activeTab;

  useEffect(() => {
    const updateIndicator = () => {
      const activeEl = tabsRef.current[currentTab];
      
      if (activeEl && (currentTab === 'chat' || currentTab === 'groups' || currentTab === 'friends')) {
        setIndicatorStyle({
          left: activeEl.offsetLeft,
          width: activeEl.offsetWidth,
          opacity: 1
        });
      } else {
        setIndicatorStyle(prev => ({ ...prev, width: 0, opacity: 0 }));
      }
    };

    updateIndicator();
    const timeoutId = setTimeout(updateIndicator, 50);

    window.addEventListener('resize', updateIndicator);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updateIndicator);
    };
  }, [currentTab]);

  return (
    <nav className={styles.bottomBar}>
      {/* Left side capsule segmented control */}
      <div className={styles.capsuleContainer}>
        {/* Sliding active tab indicator */}
        <div 
          className={styles.indicator} 
          style={{
            left: `${indicatorStyle.left}px`,
            width: `${indicatorStyle.width}px`,
            opacity: indicatorStyle.opacity
          }}
        />

        {/* Chat Tab */}
        <button
          ref={el => tabsRef.current['chat'] = el}
          className={`${styles.segmentBtn} ${currentTab === 'chat' ? styles.activeSegment : ''}`}
          onClick={() => handleTabClick('chat')}
        >
          <div className={styles.iconWrapper}>
            <img src="/chat-icon.svg" alt="Chat" className={styles.segmentIcon} />
            {hasChatUpdate && <span className={styles.redDot} />}
          </div>
          <span className={styles.segmentLabel}>Chat</span>
        </button>

        {/* Groups Tab */}
        <button
          ref={el => tabsRef.current['groups'] = el}
          className={`${styles.segmentBtn} ${currentTab === 'groups' ? styles.activeSegment : ''}`}
          onClick={() => handleTabClick('groups')}
        >
          <div className={styles.iconWrapper}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={styles.segmentIcon}>
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            {hasGroupsUpdate && <span className={styles.redDot} />}
          </div>
          <span className={styles.segmentLabel}>Groups</span>
        </button>

        {/* Friends Tab */}
        <button
          ref={el => tabsRef.current['friends'] = el}
          className={`${styles.segmentBtn} ${currentTab === 'friends' ? styles.activeSegment : ''}`}
          onClick={() => handleTabClick('friends')}
        >
          <div className={styles.iconWrapper}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={styles.segmentIcon}>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            {hasFriendsUpdate && <span className={styles.redDot} />}
          </div>
          <span className={styles.segmentLabel}>Friends</span>
        </button>
      </div>

      {/* Right side circular action search button */}
      <button 
        className={styles.searchActionBtn} 
        onClick={handleSearchClick}
        title="Search"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={styles.searchIcon}>
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </button>
    </nav>
  );
}
