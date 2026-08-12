/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';
import Header from '../../Header/Header';
import Sidebar from '../../Sidebar/Sidebar';
import styles from './LayoutDesktop.module.css';

const LayoutDesktop = ({ children, user }) => {
  return (
    <div className={styles.container}>
      <Header />

      <div className={styles.layoutBody}>
        <Sidebar user={user} />
        <main className={styles.mainContent}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default LayoutDesktop;
