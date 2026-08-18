/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';

import styles from './ChatHeader.module.css';

export default function ChatHeader({
  activeTab,
  chatSearchText,
  setChatSearchText
}) {
  const isChatTab = activeTab === 'chat';

  return (
    <header className={`${styles.header} ${isChatTab ? styles.chatHeader : ''}`}>
      {isChatTab ? (
        <div className={styles.chatHeaderContainer}>
          <div className={styles.largeTitleRow}>
            <h1 className={styles.largeTitle}>Nothingbox Chat</h1>
          </div>

          <div className={styles.searchBarContainer}>
            <img src="/search-icon.svg" alt="Search" className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search"
              className={styles.searchBarInput}
              value={chatSearchText}
              onChange={(e) => setChatSearchText(e.target.value)}
            />
          </div>
        </div>
      ) : (
        <>
          <div className={styles.headerLeft} />
          <h1 className={styles.headerTitle}>
            {activeTab === 'search' ? 'Search' : 'Settings'}
          </h1>
          <div className={styles.headerRight} />
        </>
      )}
    </header>
  );
}
