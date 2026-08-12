/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';

import BottomBar from '@/components/BottomBar/BottomBar';
import styles from './FooterMobile.module.css';

export default function FooterMobile({ activeTab, setActiveTab, profile }) {
  return (
    <footer className={styles.footer}>
      {/* Renders BottomBar as default inside the Footer container, with capability to render other items conditionally in future */}
      <BottomBar activeTab={activeTab} setActiveTab={setActiveTab} profile={profile} />
    </footer>
  );
}
