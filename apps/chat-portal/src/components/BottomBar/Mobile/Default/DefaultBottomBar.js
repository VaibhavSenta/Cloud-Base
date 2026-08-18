/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './DefaultBottomBar.module.css';

export default function DefaultBottomBar({ activeTab, setActiveTab, profile }) {
  const avatarUrl = profile?.avatarUrl;
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const tabsRef = useRef({});

  useEffect(() => {
    const updateIndicator = () => {
      // Map either 'settings' or 'profile' to 'settings' ref key for safety
      const currentTab = activeTab === 'settings' ? 'settings' : activeTab === 'profile' ? 'settings' : activeTab;
      const activeEl = tabsRef.current[currentTab];
      if (activeEl) {
        setIndicatorStyle({
          left: activeEl.offsetLeft,
          width: activeEl.offsetWidth
        });
      }
    };

    updateIndicator();
    // Use a small timeout to make sure DOM rendering layout has completed
    const timeoutId = setTimeout(updateIndicator, 50);

    window.addEventListener('resize', updateIndicator);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updateIndicator);
    };
  }, [activeTab]);

  return (
    <nav className={styles.bottomBar}>
      <div 
        className={styles.indicator} 
        style={{
          left: `${indicatorStyle.left}px`,
          width: `${indicatorStyle.width}px`
        }}
      />

      <button 
        ref={el => tabsRef.current['chat'] = el}
        className={`${styles.tabItem} ${activeTab === 'chat' ? styles.activeTab : ''}`}
        onClick={() => setActiveTab('chat')}
      >
        <img src="/chat-icon.svg" alt="Chat" className={styles.tabIcon} />
        <span className={styles.tabLabel}>Chat</span>
      </button>

      <button 
        ref={el => tabsRef.current['friends'] = el}
        className={`${styles.tabItem} ${activeTab === 'friends' ? styles.activeTab : ''}`}
        onClick={() => setActiveTab('friends')}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={styles.tabIcon} style={{ stroke: 'currentColor' }}>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
        <span className={styles.tabLabel}>Friends</span>
      </button>

      <button 
        ref={el => tabsRef.current['search'] = el}
        className={`${styles.tabItem} ${activeTab === 'search' ? styles.activeTab : ''}`}
        onClick={() => setActiveTab('search')}
      >
        <img src="/search-icon.svg" alt="Search" className={styles.tabIcon} />
        <span className={styles.tabLabel}>Search</span>
      </button>

      <button 
        ref={el => tabsRef.current['settings'] = el}
        className={`${styles.tabItem} ${activeTab === 'settings' || activeTab === 'profile' ? styles.activeTab : ''}`}
        onClick={() => setActiveTab('settings')}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt="Profile" className={styles.profileAvatar} />
        ) : (
          <img src="/profile-icon.svg" alt="Profile" className={styles.tabIcon} />
        )}
        <span className={styles.tabLabel}>Profile</span>
      </button>
    </nav>
  );
}
