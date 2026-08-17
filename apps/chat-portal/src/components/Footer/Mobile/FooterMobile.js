/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';

import BottomBar from '@/components/BottomBar/BottomBar';
import styles from './FooterMobile.module.css';

export default function FooterMobile({ activeTab, setActiveTab, profile, ...rest }) {
  return (
    <footer className={styles.footer}>
      <BottomBar activeTab={activeTab} setActiveTab={setActiveTab} profile={profile} {...rest} />
    </footer>
  );
}
