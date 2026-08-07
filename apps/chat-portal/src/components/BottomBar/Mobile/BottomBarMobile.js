'use client';

import styles from './BottomBarMobile.module.css';

export default function BottomBarMobile({ activeTab, setActiveTab }) {
  return (
    <nav className={styles.bottomBar}>
      <button 
        className={`${styles.tabItem} ${activeTab === 'chat' ? styles.activeTab : ''}`}
        onClick={() => setActiveTab('chat')}
      >
        Chat
      </button>
      <button 
        className={`${styles.tabItem} ${activeTab === 'search' ? styles.activeTab : ''}`}
        onClick={() => setActiveTab('search')}
      >
        Search
      </button>
      <button 
        className={`${styles.tabItem} ${activeTab === 'settings' ? styles.activeTab : ''}`}
        onClick={() => setActiveTab('settings')}
      >
        Settings
      </button>
    </nav>
  );
}
