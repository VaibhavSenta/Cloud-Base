/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';

import styles from './HeaderMobile.module.css';

export default function HeaderMobile({
  activeConv,
  setActiveConv,
  activeTab,
  chatSearchText,
  setChatSearchText
}) {
  const isChatTab = activeTab === 'chat';

  return (
    <header 
      className={styles.header} 
      style={(!activeConv && isChatTab) ? { flexDirection: 'column', alignItems: 'stretch', gap: '10px' } : {}}
    >
      {activeConv ? (
        <>
          <div className={styles.headerLeft}>
            <button className={styles.backBtn} onClick={() => setActiveConv(null)}>
              Back
            </button>
          </div>

          <h1 className={styles.headerTitle}>
            @{activeConv.partner?.chatUsername || 'User'}
          </h1>

          <div className={styles.headerRight}>
            <button className={styles.moreBtn} onClick={() => console.log('More options clicked')}>
              ...
            </button>
          </div>
        </>
      ) : isChatTab ? (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 className={styles.largeTitle}>Nothingbox Chat</h1>
          </div>

          <div className={styles.searchBarContainer}>
            <img src="/search-icon.svg" alt="Search" style={{ width: '16px', height: '16px', opacity: 0.5, filter: 'brightness(0) invert(1)' }} />
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
