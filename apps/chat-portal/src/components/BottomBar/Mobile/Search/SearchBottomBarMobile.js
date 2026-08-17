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
