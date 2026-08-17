/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';

import styles from './SearchBottomBarMobile.module.css';

export default function SearchBottomBarMobile({
  setActiveTab,
  searchUsername,
  setSearchUsername,
  handleSearchUser
}) {
  return (
    <nav className={styles.bottomBar}>
      <form onSubmit={handleSearchUser} className={styles.searchForm}>
        <div className={styles.searchInputWrapper}>
          <img src="/search-icon.svg" alt="Search" className={styles.searchIcon} />
          
          <input
            type="text"
            placeholder="Search"
            value={searchUsername || ''}
            onChange={(e) => setSearchUsername(e.target.value)}
            className={styles.searchInput}
          />

          <div className={styles.micIcon} title="Voice Search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              <line x1="12" y1="19" x2="12" y2="23"></line>
              <line x1="8" y1="23" x2="16" y2="23"></line>
            </svg>
          </div>
        </div>

        <button 
          type="button" 
          onClick={() => {
            if (setSearchUsername) setSearchUsername('');
            setActiveTab('chat');
          }} 
          className={styles.backBtn}
          title="Back"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
      </form>
    </nav>
  );
}
