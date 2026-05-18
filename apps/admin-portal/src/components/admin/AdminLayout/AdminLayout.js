'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './AdminLayout.module.css';

export default function AdminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className={styles.layoutContainer}>
      {/* Top Mobile Header */}
      <header className={styles.topHeader}>
        <button className={styles.menuBtn} onClick={toggleSidebar} aria-label="Toggle Menu">
          {isSidebarOpen ? '✕' : '☰'}
        </button>
        <div className={styles.logoText}>
          Cloud<span>Base</span> Admin
        </div>
        <div style={{ width: '40px' }}></div> {/* Centering balance spacer */}
      </header>

      {/* Responsive Slide-out Sidebar */}
      <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarActive : ''}`}>
        <nav style={{ width: '100%' }}>
          <ul className={styles.navLinks}>
            <li className={styles.navItem} onClick={closeSidebar}>
              <Link href="/dashboard">📊 Dashboard</Link>
            </li>
            <li className={styles.navItem} onClick={closeSidebar}>
              <Link href="/dashboard/items">🎬 Items Manager</Link>
            </li>
            <li className={styles.navItem} onClick={closeSidebar}>
              <Link href="/dashboard/storage">💾 Storage Config</Link>
            </li>
            <li className={styles.navItem} onClick={closeSidebar}>
              <Link href="/dashboard/categories">📁 Categories</Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Screen Page Viewer */}
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}