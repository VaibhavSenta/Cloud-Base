/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';

import styles from './LibraryBottomBar.module.css';
import { triggerHaptic } from '@/utils/haptics';

export default function LibraryBottomBar({ activeTab, setActiveTab, profile, onSearchClick }) {
  const avatarUrl = profile?.avatarUrl;

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

  return (
    <nav className={styles.bottomBar}>
      {/* Left side capsule segmented control */}
      <div className={styles.capsuleContainer}>
        {/* Chat Tab */}
        <button
          className={`${styles.segmentBtn} ${currentTab === 'chat' ? styles.activeSegment : ''}`}
          onClick={() => handleTabClick('chat')}
        >
          <img src="/chat-icon.svg" alt="Chat" className={styles.segmentIcon} />
          <span className={styles.segmentLabel}>Chat</span>
        </button>

        {/* Groups Tab */}
        <button
          className={`${styles.segmentBtn} ${currentTab === 'groups' ? styles.activeSegment : ''}`}
          onClick={() => handleTabClick('groups')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={styles.segmentIcon}>
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <span className={styles.segmentLabel}>Groups</span>
        </button>

        {/* Friends Tab */}
        <button
          className={`${styles.segmentBtn} ${currentTab === 'friends' ? styles.activeSegment : ''}`}
          onClick={() => handleTabClick('friends')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={styles.segmentIcon}>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span className={styles.segmentLabel}>Friends</span>
        </button>

        {/* Profile/Settings Tab */}
        <button
          className={`${styles.segmentBtn} ${currentTab === 'settings' ? styles.activeSegment : ''}`}
          onClick={() => handleTabClick('settings')}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="Profile" className={styles.profileAvatar} />
          ) : (
            <img src="/profile-icon.svg" alt="Profile" className={styles.segmentIcon} />
          )}
          <span className={styles.segmentLabel}>Profile</span>
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
