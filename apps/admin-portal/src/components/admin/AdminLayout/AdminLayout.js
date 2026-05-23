'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './AdminLayout.module.css';

export default function AdminLayout({ children }) {

 

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [globalMaint, setGlobalMaint] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className={styles.layoutRoot}>
      
      {/* 1. PREMIUM HEADER */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={`material-symbols-outlined ${styles.mobileMenuBtn}`} onClick={toggleSidebar}>
            {isSidebarOpen ? 'close' : 'menu'}
          </span>
          <h1 className={styles.logoText}>Cloud Base</h1>
          
          {/* Global Network Status */}
          <div className={styles.networkStatus}>
            <div style={{ display: 'flex', alignPositions: 'center', alignItems: 'center', gap: '8px' }}>
              <div className={styles.statusDot}></div>
              <span className={styles.statusText}>Global Network: Optimal</span>
            </div>
            <div className={styles.statusDivider}></div>
            <span className={styles.latencyText}>Latency: 12ms</span>
          </div>
        </div>

        <div className={styles.headerRight}>
          {/* Global Maintenance Switch */}
          <div className={styles.maintModeHeader}>
            <span className={styles.maintLabel}>Global Maint. Mode</span>
            <label className={styles.switch}>
              <input 
                type="checkbox" 
                checked={globalMaint} 
                onChange={() => setGlobalMaint(!globalMaint)} 
              />
              <span className={styles.slider}></span>
            </label>
          </div>

          {/* User Profile Action Section */}
          <div className={styles.userSection}>
            <button className={styles.notifBtn}>
              <span className="material-symbols-outlined">notifications</span>
              <span className={styles.notifDot}></span>
            </button>
            <span className={styles.userName}>Vaibhav</span>
            <div className={styles.userAvatar}>
              <img alt="Admin Profile" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC8SwnjQFvFfRzmn2QP6C0GR8UWtUjsPwmYdtdr_1F_3TujyQ52uTPFI5HnZyATuFVLcza41LEIY-atbVBZQqVUwTBT1XbuLij1iuvkxEDeLhE1JNLpiDFbG95nc9CkXY-AwTB0IRCN5l3SFmdQmwYY4pj02ilxlFv4MRh6g08IbsdWwVJBMv1u3m3YqyI05R5vNNLijFlbqqCR-e9twack2EaNsaL_JmdaNzmBgc1z1pDluf04GSIoWxr41hAXEMX7Tss1PYYenx0" />
            </div>
          </div>
        </div>
      </header>

      {/* 2. INFRASTRUCTURE SIDEBAR */}
      <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarActive : ''}`}>
        <div className={styles.sidebarLogoSection}>
          <div className={styles.logoWrapper}>
            {/* <span className="material-symbols-outlined text-primary">cloud</span> */}
            <span className={styles.sidebarLogoText}>Cloud Base</span>
          </div>
          
          {/* Profile Snippet */}
          <div className={styles.profileSnippet}>
            <div className={styles.profileIconBox}>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>@</span>
            </div>
            <div className={styles.profileInfo}>
              <p className={styles.adminLabel}>System Admin</p>
              <p className={styles.accessLabel}>Root Access</p>
            </div>
          </div>
          <div className={styles.nodeBadge}>Node: US-EAST-1</div>
        </div>

        {/* Navigation Synced with project routes */}
        <nav className={styles.navList}>

       
          <Link href="/dashboard" className={`${styles.navItem} ${pathname === '/dashboard' ? styles.active : ''}`} onClick={closeSidebar}>
            <span>Dashboard</span>
          </Link>
          <Link href="/dashboard/apps" className={`${styles.navItem} ${pathname === '/dashboard/items' ? styles.active : ''}`} onClick={closeSidebar}>
            <span>Apps</span>
          </Link>
          <Link href="/dashboard/users" className={`${styles.navItem} ${pathname === '/dashboard/storage' ? styles.active : ''}`} onClick={closeSidebar}>
            <span>Users</span>
          </Link>
          <Link href="/dashboard/logs" className={`${styles.navItem} ${pathname === '/dashboard/categories' ? styles.active : ''}`} onClick={closeSidebar}>
            <span>Logs</span>
          </Link>

        </nav>

        <div className={styles.navList}>
          <Link href="/dashboard/settings" className={`${styles.navItem} ${pathname === '/dashboard/categories' ? styles.active : ''}`} onClick={closeSidebar}>
            <span>Settings</span>
          </Link>

        </div>
      </aside>

      {/* 3. MAIN CONTENT ROUTE VIEWER */}
      <main className={styles.mainContent}>
        {children}
      </main>

    </div>
  );
}