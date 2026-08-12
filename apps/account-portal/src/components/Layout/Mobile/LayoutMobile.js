/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';
import styles from './LayoutMobile.module.css';
import Header from '../../Header/Header';

const LayoutMobile = ({ children, user }) => {
  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
};

export default LayoutMobile;
