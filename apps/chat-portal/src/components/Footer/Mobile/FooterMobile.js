/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';

import BottomBar from '@/components/BottomBar/BottomBar';
import SearchBottomBar from '@/components/SearchBottomBar/SearchBottomBar';
import styles from './FooterMobile.module.css';

export default function FooterMobile({ activeTab, setActiveTab, profile, ...rest }) {
  return (
    <footer className={styles.footer}>
      {activeTab === 'search' ? (
        <SearchBottomBar setActiveTab={setActiveTab} {...rest} />
      ) : (
        <BottomBar activeTab={activeTab} setActiveTab={setActiveTab} profile={profile} />
      )}
    </footer>
  );
}
