/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';

import { useState } from 'react';
import styles from './LibraryBottomBar.module.css';
import { triggerHaptic } from '@/utils/haptics';

export default function LibraryBottomBar({ onSearchClick }) {
  const [selectedSegment, setSelectedSegment] = useState('library');

  const handleSegmentChange = (segment) => {
    triggerHaptic.selection();
    setSelectedSegment(segment);
  };

  const handleSearchClick = () => {
    triggerHaptic.selection();
    if (onSearchClick) onSearchClick();
  };

  return (
    <nav className={styles.bottomBar}>
      {/* Left side capsule segmented control */}
      <div className={styles.capsuleContainer}>
        <button
          className={`${styles.segmentBtn} ${selectedSegment === 'library' ? styles.activeSegment : ''}`}
          onClick={() => handleSegmentChange('library')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={styles.segmentIcon}>
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
          <span className={styles.segmentLabel}>Library</span>
        </button>

        <button
          className={`${styles.segmentBtn} ${selectedSegment === 'collections' ? styles.activeSegment : ''}`}
          onClick={() => handleSegmentChange('collections')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={styles.segmentIcon}>
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
          </svg>
          <span className={styles.segmentLabel}>Collections</span>
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
