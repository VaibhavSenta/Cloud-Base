/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './BottomBarMobile.module.css';

export default function BottomBarMobile({
  activeTab,
  setActiveTab,
  profile,
  searchUsername,
  setSearchUsername,
  handleSearchUser,
  isSearching
}) {
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

  if (activeTab === 'search') {
    return (
      <nav className={styles.bottomBar}>
        <form onSubmit={handleSearchUser} className={styles.searchForm}>
          <div className={styles.searchInputWrapper}>
            <img src="/search-icon.svg" alt="Search" className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Exact username (e.g. vaibhav)"
              value={searchUsername || ''}
              onChange={(e) => setSearchUsername(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <button 
            type="button" 
            onClick={() => {
              if (setSearchUsername) setSearchUsername('');
              setActiveTab('chat');
            }} 
            className={styles.backBtn}
          >
            Back
          </button>
        </form>
      </nav>
    );
  }

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
