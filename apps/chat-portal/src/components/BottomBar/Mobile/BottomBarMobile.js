/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';

import styles from './BottomBarMobile.module.css';

export default function BottomBarMobile({ activeTab, setActiveTab, profile }) {
  const avatarUrl = profile?.avatarUrl;

  return (
    <nav className={styles.bottomBar}>
      <button 
        className={`${styles.tabItem} ${activeTab === 'chat' ? styles.activeTab : ''}`}
        onClick={() => setActiveTab('chat')}
      >
        <img src="/chat-icon.svg" alt="Chat" className={styles.tabIcon} />
        <span className={styles.tabLabel}>Chat</span>
      </button>

      <button 
        className={`${styles.tabItem} ${activeTab === 'search' ? styles.activeTab : ''}`}
        onClick={() => setActiveTab('search')}
      >
        <img src="/search-icon.svg" alt="Search" className={styles.tabIcon} />
        <span className={styles.tabLabel}>Search</span>
      </button>

      <button 
        className={`${styles.tabItem} ${activeTab === 'profile' ? styles.activeTab : ''}`}
        onClick={() => setActiveTab('profile')}
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
